const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(process.cwd(), 'stakeholder-data.json');
const API_ROOT = 'https://api.github.com';
const DEFAULT_SUMMARY_PATH = process.env.DASHBOARD_SUMMARY_PATH || 'dashboard-summary.json';
const DEFAULT_WORKFLOWS = parseList(process.env.STAKEHOLDER_WORKFLOW_FILES || process.env.STAKEHOLDER_WORKFLOW_FILE || 'playwright.yml');
const WORKFLOW_MAP = parseKeyedList(process.env.STAKEHOLDER_WORKFLOW_MAP);
const DAYS_BACK = Number(process.env.STAKEHOLDER_DAYS_BACK || 400);
const RUNS_PER_PAGE = 100;
const MAX_PAGES = 10;

function parseRepos(raw) {
  return String(raw || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}


function parseList(raw) {
  return String(raw || '')
    .split(/[,\n|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseKeyedList(raw) {
  return String(raw || '')
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      const [key, ...rest] = line.split('=');
      if (!key || !rest.length) return acc;
      acc[key.trim()] = parseList(rest.join('=').trim());
      return acc;
    }, {});
}

function headers(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'playwatch-stakeholder-generator',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function fetchJson(url, token, allowNotFound = false) {
  const res = await fetch(url, { headers: headers(token) });
  if (allowNotFound && res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API failed for ${url}: ${res.status} ${text}`);
  }
  return res.json();
}

function decodeContent(payload) {
  if (!payload?.content) return null;
  return Buffer.from(payload.content, 'base64').toString('utf8');
}

function inferLabel(text, variants, fallback = 'other') {
  const source = String(text || '').toLowerCase();
  return variants.find((value) => source.includes(value)) || fallback;
}

function inferType(text) {
  const value = inferLabel(text, ['smoke', 'sanity', 'regression'], 'regression');
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function inferEnvironment(text) {
  return inferLabel(text, ['qa', 'staging', 'production'], 'staging');
}

function inferFailureSource(text) {
  const source = String(text || '').toLowerCase();
  const automationWords = ['locator', 'selector', 'playwright', 'assertion', 'timeout', 'flaky', 'strict mode'];
  const productWords = ['500', 'api', 'server', 'backend', 'checkout', 'payment', 'crash', 'product'];
  if (automationWords.some((word) => source.includes(word))) return 'automation';
  if (productWords.some((word) => source.includes(word))) return 'product';
  return 'unknown';
}

function computePortfolioStatus(repos) {
  const allRuns = repos.flatMap((repo) => repo.runs || []);
  const total = allRuns.length;
  const passed = allRuns.filter((run) => run.conclusion === 'success').length;
  const failed = allRuns.filter((run) => run.conclusion === 'failure').length;
  const passRate = total ? Math.round((passed / total) * 100) : 0;
  if (failed >= 5 || passRate < 60) {
    return {
      status: 'At risk',
      summary: 'Failure volume is high across the tracked repositories, so release confidence should remain low until the largest issues are resolved.',
    };
  }
  if (failed > 0 || passRate < 85) {
    return {
      status: 'Needs attention',
      summary: 'There are still visible issues across the tracked repositories. Quality is improving, but confidence is not yet comfortably high.',
    };
  }
  return {
    status: 'On track',
    summary: 'Recent quality signals are stable across the tracked repositories, which supports a confident stakeholder review.',
  };
}

async function fetchRepoSummary(ownerRepo, token, ref) {
  const encoded = encodeURIComponent(DEFAULT_SUMMARY_PATH);
  const url = `${API_ROOT}/repos/${ownerRepo}/contents/${encoded}?ref=${encodeURIComponent(ref)}`;
  const payload = await fetchJson(url, token, true);
  if (!payload) return null;
  try {
    return JSON.parse(decodeContent(payload));
  } catch (error) {
    throw new Error(`Could not parse ${DEFAULT_SUMMARY_PATH} for ${ownerRepo}: ${error.message}`);
  }
}

async function fetchLatestRelease(ownerRepo, token) {
  return fetchJson(`${API_ROOT}/repos/${ownerRepo}/releases/latest`, token, true);
}

async function fetchMergedPullRequests(ownerRepo, token, defaultBranch) {
  const cutoffTime = Date.now() - (DAYS_BACK * 86400000);
  const pulls = await fetchJson(
    `${API_ROOT}/repos/${ownerRepo}/pulls?state=closed&base=${encodeURIComponent(defaultBranch)}&sort=updated&direction=desc&per_page=20`,
    token,
    false
  );

  return pulls
    .filter((pull) => pull.merged_at && new Date(pull.merged_at).getTime() >= cutoffTime)
    .slice(0, 5)
    .map((pull) => ({
      number: pull.number,
      title: pull.title,
      url: pull.html_url,
      author: pull.user?.login || 'unknown',
      mergedAt: pull.merged_at,
      base: pull.base?.ref || defaultBranch,
    }));
}

function getWorkflowCandidates(ownerRepo) {
  return WORKFLOW_MAP[ownerRepo] || DEFAULT_WORKFLOWS;
}

function isWithinHistoryWindow(run, cutoffTime) {
  return new Date(run.created_at).getTime() >= cutoffTime;
}

async function fetchRunsForUrl(url, token, cutoffTime) {
  const runs = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const separator = url.includes('?') ? '&' : '?';
    const payload = await fetchJson(`${url}${separator}per_page=${RUNS_PER_PAGE}&page=${page}`, token, true);
    if (!payload?.workflow_runs?.length) break;
    const pageRuns = payload.workflow_runs;
    runs.push(...pageRuns.filter((run) => isWithinHistoryWindow(run, cutoffTime)));
    if (pageRuns.every((run) => !isWithinHistoryWindow(run, cutoffTime))) break;
    if (pageRuns.length < RUNS_PER_PAGE) break;
  }
  return runs;
}

async function fetchWorkflowRuns(ownerRepo, token) {
  const cutoffTime = Date.now() - (DAYS_BACK * 86400000);
  for (const workflow of getWorkflowCandidates(ownerRepo)) {
    const workflowRuns = await fetchRunsForUrl(
      `${API_ROOT}/repos/${ownerRepo}/actions/workflows/${encodeURIComponent(workflow)}/runs`,
      token,
      cutoffTime
    );
    if (workflowRuns.length) {
      console.log(`Using workflow "${workflow}" for ${ownerRepo}; collected ${workflowRuns.length} runs from the last ${DAYS_BACK} days.`);
      return workflowRuns;
    }
  }

  const fallbackRuns = await fetchRunsForUrl(`${API_ROOT}/repos/${ownerRepo}/actions/runs`, token, cutoffTime);
  console.warn(`Falling back to all workflow runs for ${ownerRepo}; none of the configured workflow files returned recent runs.`);
  return fallbackRuns;
}

function normalizeRun(run, summary) {
  const hint = [
    run.name,
    run.display_title,
    run.event,
    run.head_branch,
    run.path,
    run.html_url,
  ].filter(Boolean).join(' ');

  const failureMap = Array.isArray(summary?.recentFailures) ? summary.recentFailures : [];
  const matchedFailure = failureMap.find((item) => item.runId === run.id || item.html_url === run.html_url);

  return {
    created_at: run.created_at,
    updated_at: run.updated_at || run.run_started_at || run.created_at,
    conclusion: run.conclusion || run.status || 'unknown',
    environment: matchedFailure?.environment || inferEnvironment(hint),
    type: (matchedFailure?.type || inferType(hint)).toLowerCase(),
    failureSource: matchedFailure?.failureSource || inferFailureSource(matchedFailure?.message || hint),
  };
}

async function buildRepo(ownerRepo, token) {
  const repo = await fetchJson(`${API_ROOT}/repos/${ownerRepo}`, token, false);
  const summary = await fetchRepoSummary(ownerRepo, token, repo.default_branch);
  const latestRelease = await fetchLatestRelease(ownerRepo, token);
  const mergedPullRequests = await fetchMergedPullRequests(ownerRepo, token, repo.default_branch);
  const runs = (await fetchWorkflowRuns(ownerRepo, token)).map((run) => normalizeRun(run, summary));

  const summaryRepo = summary?.repo || summary?.repository || {};
  const currentBuild = summary?.currentBuild || summary?.current_build || null;
  const testTypes = summaryRepo.testTypes || summaryRepo.test_types || summary?.testTypes || ['Smoke', 'Sanity', 'Regression'];
  const testCaseCount =
    summaryRepo.testCaseCount ||
    summaryRepo.test_case_count ||
    summary?.testCaseCount ||
    summary?.test_case_count ||
    0;
  if (!testCaseCount) {
    console.warn(`No testCaseCount found for ${ownerRepo}. Add it to ${DEFAULT_SUMMARY_PATH} for richer coverage reporting.`);
  }

  return {
    name: repo.name,
    full_name: repo.full_name,
    testCaseCount,
    testTypes,
    currentBuild,
    latestRelease: latestRelease
      ? {
          tag_name: latestRelease.tag_name,
          name: latestRelease.name,
          published_at: latestRelease.published_at,
          body: latestRelease.body,
        }
      : null,
    mergedPullRequests,
    runs,
  };
}

async function main() {
  const token = process.env.GH_DASHBOARD_TOKEN;
  const repos = parseRepos(process.env.STAKEHOLDER_REPOS);

  if (!token) {
    throw new Error('Missing GH_DASHBOARD_TOKEN.');
  }
  if (!repos.length) {
    throw new Error('Missing STAKEHOLDER_REPOS. Add a comma-separated list like owner/repo,owner/repo.');
  }

  const repoData = [];
  for (const repo of repos) {
    console.log(`Fetching stakeholder data for ${repo}...`);
    repoData.push(await buildRepo(repo, token));
  }

  const portfolio = computePortfolioStatus(repoData);
  const payload = {
    generatedAt: new Date().toISOString(),
    portfolioBuild: {
      title: 'Portfolio quality overview',
      status: portfolio.status,
      summary: portfolio.summary,
      updatedAt: new Date().toISOString(),
    },
    repos: repoData,
  };

  fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(process.cwd(), 'stakeholder-data.json');
const API_ROOT = 'https://api.github.com';
const DEFAULT_SUMMARY_PATH = process.env.DASHBOARD_SUMMARY_PATH || 'dashboard-summary.json';
const DEFAULT_WORKFLOW = process.env.STAKEHOLDER_WORKFLOW_FILE || 'playwright.yml';

function parseRepos(raw) {
  return String(raw || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
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
  return inferLabel(text, ['qa', 'staging', 'production'], 'qa');
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

async function fetchWorkflowRuns(ownerRepo, token) {
  let payload = await fetchJson(
    `${API_ROOT}/repos/${ownerRepo}/actions/workflows/${encodeURIComponent(DEFAULT_WORKFLOW)}/runs?per_page=50`,
    token,
    true
  );
  if (!payload) {
    payload = await fetchJson(`${API_ROOT}/repos/${ownerRepo}/actions/runs?per_page=50`, token, false);
  }
  return payload.workflow_runs || [];
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

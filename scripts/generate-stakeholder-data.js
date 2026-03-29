const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(process.cwd(), 'stakeholder-data.json');
const API_ROOT = 'https://api.github.com';
const DEFAULT_WORKFLOWS = parseList(process.env.STAKEHOLDER_WORKFLOW_FILES || process.env.STAKEHOLDER_WORKFLOW_FILE || 'playwright.yml');
const WORKFLOW_MAP = parseKeyedList(process.env.STAKEHOLDER_WORKFLOW_MAP);
const DAYS_BACK = Number(process.env.STAKEHOLDER_DAYS_BACK || 400);
const RUNS_PER_PAGE = 100;
const MAX_PAGES = 10;
const TEST_FILE_PATTERN = /(^|\/)(tests?|e2e|specs?)\/.*\.(spec|test)\.[jt]sx?$|(^|\/).*\.(spec|test)\.[jt]sx?$/i;
const THRESHOLDS = {
  riskFailedRuns: Number(process.env.STAKEHOLDER_RISK_FAILED_RUNS || 5),
  riskPassRate: Number(process.env.STAKEHOLDER_RISK_PASS_RATE || 60),
  attentionPassRate: Number(process.env.STAKEHOLDER_ATTENTION_PASS_RATE || 85),
  buildRiskFailedRuns: Number(process.env.STAKEHOLDER_BUILD_RISK_FAILED_RUNS || 3),
};

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

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

function countTestsFromSource(source) {
  const counts = { smoke: 0, sanity: 0, regression: 0, unlabeled: 0, total: 0 };
  const matcher = /\b(?:test|it)(?:\.(?:only|skip|fixme))?\s*\(\s*(['"`])([\s\S]*?)\1/g;
  const cleanSource = stripComments(source);
  let match;

  while ((match = matcher.exec(cleanSource))) {
    const title = String(match[2] || '').toLowerCase();
    counts.total += 1;
    if (title.includes('@smoke')) counts.smoke += 1;
    else if (title.includes('@sanity')) counts.sanity += 1;
    else if (title.includes('@regression')) counts.regression += 1;
    else counts.unlabeled += 1;
  }

  return counts;
}

function addTypeCounts(target, source) {
  for (const key of Object.keys(target)) {
    target[key] += source[key] || 0;
  }
}

function computePortfolioStatus(repos) {
  const allRuns = repos.flatMap((repo) => repo.runs || []);
  const total = allRuns.length;
  const passed = allRuns.filter((run) => run.conclusion === 'success').length;
  const failed = allRuns.filter((run) => run.conclusion === 'failure').length;
  const passRate = total ? Math.round((passed / total) * 100) : 0;
  if (failed >= THRESHOLDS.riskFailedRuns || passRate < THRESHOLDS.riskPassRate) {
    return {
      status: 'At risk',
      summary: 'Failure volume is high across the tracked repositories, so release confidence should remain low until the largest issues are resolved.',
    };
  }
  if (failed > 0 || passRate < THRESHOLDS.attentionPassRate) {
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

async function fetchLatestRelease(ownerRepo, token) {
  return fetchJson(`${API_ROOT}/repos/${ownerRepo}/releases/latest`, token, true);
}

async function fetchRepoTree(ownerRepo, token, ref) {
  return fetchJson(`${API_ROOT}/repos/${ownerRepo}/git/trees/${encodeURIComponent(ref)}?recursive=1`, token, false);
}

async function fetchBlob(ownerRepo, token, sha) {
  const payload = await fetchJson(`${API_ROOT}/repos/${ownerRepo}/git/blobs/${sha}`, token, false);
  if (!payload?.content) return '';
  return Buffer.from(payload.content, 'base64').toString('utf8');
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

function normalizeRun(run) {
  const hint = [
    run.name,
    run.display_title,
    run.event,
    run.head_branch,
    run.path,
    run.html_url,
  ].filter(Boolean).join(' ');

  return {
    created_at: run.created_at,
    updated_at: run.updated_at || run.run_started_at || run.created_at,
    conclusion: run.conclusion || run.status || 'unknown',
    environment: inferEnvironment(hint),
    type: inferType(hint).toLowerCase(),
    failureSource: inferFailureSource(hint),
  };
}

async function discoverTestInventory(ownerRepo, token, ref) {
  const tree = await fetchRepoTree(ownerRepo, token, ref);
  const files = (tree?.tree || []).filter((item) => item.type === 'blob' && TEST_FILE_PATTERN.test(item.path));
  const totals = { smoke: 0, sanity: 0, regression: 0, unlabeled: 0, total: 0 };

  for (const file of files) {
    try {
      const source = await fetchBlob(ownerRepo, token, file.sha);
      addTypeCounts(totals, countTestsFromSource(source));
    } catch (error) {
      console.warn(`Could not inspect ${ownerRepo}:${file.path} for automated test counting: ${error.message}`);
    }
  }

  const testTypes = uniq([
    totals.smoke > 0 ? 'Smoke' : null,
    totals.sanity > 0 ? 'Sanity' : null,
    totals.regression > 0 ? 'Regression' : null,
    totals.unlabeled > 0 ? 'Unlabeled' : null,
  ]);

  return {
    total: totals.total,
    counts: totals,
    testTypes: testTypes.length ? testTypes : ['Regression'],
  };
}

function deriveCurrentBuild(repo, runs, mergedPullRequests, latestRelease) {
  const latestRun = [...runs].sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())[0] || null;
  const latestPr = mergedPullRequests[0] || null;
  const passed = runs.filter((run) => run.conclusion === 'success').length;
  const failed = runs.filter((run) => run.conclusion === 'failure').length;
  const passRate = runs.length ? Math.round((passed / runs.length) * 100) : 0;

  let status = 'Needs attention';
  if (latestRun?.conclusion === 'success' && passRate >= THRESHOLDS.attentionPassRate) status = 'On track';
  else if (latestRun?.conclusion === 'failure' || failed >= THRESHOLDS.buildRiskFailedRuns || passRate < THRESHOLDS.riskPassRate) status = 'At risk';

  const summaryParts = [];
  if (latestPr) summaryParts.push(`Latest merged change is PR #${latestPr.number}.`);
  if (latestRun) summaryParts.push(`Last run finished ${latestRun.conclusion}.`);
  if (runs.length) summaryParts.push(`${passRate}% of ${runs.length} recent runs passed in the tracked history window.`);

  return {
    title: latestPr?.title || latestRelease?.name || `${repo.name} delivery signal`,
    status,
    summary: summaryParts.join(' ') || 'Automated build summary generated from recent runs and merged pull requests.',
    updatedAt: latestRun?.updated_at || latestPr?.mergedAt || latestRelease?.published_at || new Date().toISOString(),
  };
}

async function buildRepo(ownerRepo, token) {
  const repo = await fetchJson(`${API_ROOT}/repos/${ownerRepo}`, token, false);
  const latestRelease = await fetchLatestRelease(ownerRepo, token);
  const mergedPullRequests = await fetchMergedPullRequests(ownerRepo, token, repo.default_branch);
  const runs = (await fetchWorkflowRuns(ownerRepo, token)).map((run) => normalizeRun(run));
  const discoveredTests = await discoverTestInventory(ownerRepo, token, repo.default_branch);
  const currentBuild = deriveCurrentBuild(repo, runs, mergedPullRequests, latestRelease);
  const runTypes = uniq(
    runs
      .map((run) => String(run.type || '').trim())
      .filter(Boolean)
      .map((type) => type.charAt(0).toUpperCase() + type.slice(1))
  );
  const testTypes = uniq([
    ...discoveredTests.testTypes,
    ...runTypes,
  ]);
  const testCaseCount = discoveredTests.total || 0;
  if (!testCaseCount) {
    console.warn(`No automated test count could be discovered for ${ownerRepo}.`);
  }

  return {
    name: repo.name,
    full_name: repo.full_name,
    testCaseCount,
    testTypes: testTypes.length ? testTypes : ['Regression'],
    testTypeCounts: discoveredTests.counts,
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
    thresholds: THRESHOLDS,
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

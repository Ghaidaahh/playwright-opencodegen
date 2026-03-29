# Playwatch Stakeholder Dashboard

## Purpose

This repository hosts a stakeholder-facing quality dashboard on GitHub Pages.

It is designed for non-technical leadership to review:

- release readiness
- current quality signal
- latest merged change
- latest run timestamp
- pass/fail trends
- repository coverage
- likely failure source split

The browser is static. The data is generated automatically in GitHub Actions.

## Main Files

- Dashboard UI: [stakeholder.html](/Users/ghegazy/Playwright/stakeholder.html)
- Generated dashboard data: [stakeholder-data.json](/Users/ghegazy/Playwright/stakeholder-data.json)
- Data generator: [scripts/generate-stakeholder-data.js](/Users/ghegazy/Playwright/scripts/generate-stakeholder-data.js)
- Dashboard Playwright tests: [tests/stakeholder-dashboard.spec.ts](/Users/ghegazy/Playwright/tests/stakeholder-dashboard.spec.ts)
- Test workflow: [.github/workflows/playwright.yml](/Users/ghegazy/Playwright/.github/workflows/playwright.yml)
- Deploy workflow: [.github/workflows/deploy.yml](/Users/ghegazy/Playwright/.github/workflows/deploy.yml)

## Architecture

### Frontend

- [stakeholder.html](/Users/ghegazy/Playwright/stakeholder.html) is served by GitHub Pages.
- It reads [stakeholder-data.json](/Users/ghegazy/Playwright/stakeholder-data.json).
- Filtering is done in the browser for:
  - repository
  - calendar day
  - calendar week
  - calendar month
  - calendar year
  - test type
- Theme choice is stored in `localStorage`.

### Data Generation

- GitHub Actions runs [scripts/generate-stakeholder-data.js](/Users/ghegazy/Playwright/scripts/generate-stakeholder-data.js).
- The generator reads live GitHub data from the tracked repositories.
- It automatically collects:
  - workflow runs
  - latest release
  - latest merged pull requests
  - discovered Playwright test files
  - test counts by tag where available
- It writes a fresh [stakeholder-data.json](/Users/ghegazy/Playwright/stakeholder-data.json) before deployment.

### Deployment

- Pushes to `main` trigger the deploy workflow.
- The deploy workflow regenerates stakeholder data.
- GitHub Pages publishes the latest repository contents.

## What Is Automated

- Coverage count is generated from real discovered test files.
- Test type counts are generated from tagged tests like `@smoke`, `@sanity`, and `@regression`.
- Current Build is generated from:
  - latest merged PR
  - latest run outcome
  - latest release fallback
- Portfolio status is generated from recent run history.
- Thresholds can be configured through GitHub repository variables.
- Stakeholder dashboard Playwright validation runs in CI.

## What Is Not Fully Automatable On GitHub Pages

- The stakeholder password gate in [stakeholder.html](/Users/ghegazy/Playwright/stakeholder.html) is still client-side.
- That means the password is not truly secure on GitHub Pages alone.
- Real secure authentication would require a backend or serverless function.

## Local Setup

Requirements:

- Node.js
- npm
- Python 3

Install:

```bash
npm ci
npx playwright install --with-deps
```

## Local Run

Start a local server:

```bash
python3 -m http.server 3000
```

Open:

```text
http://127.0.0.1:3000/stakeholder.html
```

## Local Test Run

Run the stakeholder dashboard suite:

```bash
npx playwright test tests/stakeholder-dashboard.spec.ts --project=chromium
```

Run the intentional failing scenario:

```bash
SIMULATE_FAILING_DASHBOARD_TEST=true npx playwright test tests/stakeholder-dashboard.spec.ts --project=chromium
```

## GitHub Actions Setup

### Required Secret

- `GH_DASHBOARD_TOKEN`

Recommended permissions:

- `Actions: Read`
- `Contents: Read`
- `Metadata: Read`
- `Pull requests: Read`

### Required Variable

- `STAKEHOLDER_REPOS`

Example:

```text
Ghaidaahh/playwright-opencodegen,owner/repo-two,owner/repo-three
```

### Optional Variables

- `STAKEHOLDER_WORKFLOW_FILE`
  - single fallback workflow file
- `STAKEHOLDER_WORKFLOW_FILES`
  - comma-separated workflow file fallbacks
- `STAKEHOLDER_WORKFLOW_MAP`
  - per-repo workflow mapping
- `STAKEHOLDER_DAYS_BACK`
  - how much run history to fetch
  - default: `400`
- `STAKEHOLDER_RISK_FAILED_RUNS`
  - default: `5`
- `STAKEHOLDER_RISK_PASS_RATE`
  - default: `60`
- `STAKEHOLDER_ATTENTION_PASS_RATE`
  - default: `85`
- `STAKEHOLDER_BUILD_RISK_FAILED_RUNS`
  - default: `3`

## Current Build Logic

The dashboard derives the Current Build card automatically from:

1. latest merged PR
2. latest run outcome
3. latest release fallback

So to create a new build signal:

1. create a branch
2. make your changes
3. push the branch
4. open a PR to `main`
5. merge the PR
6. let Actions run

## Recommended Day-To-Day Flow

1. Create a branch
2. Make changes
3. Run the stakeholder tests locally
4. Push the branch
5. Open a PR
6. Merge to `main`
7. Let `Playwright Tests` and `Deploy Dashboard` run
8. Refresh the live dashboard

## Known Limitations

- The stakeholder password is still client-side.
- The page does not auto-refresh while already open.
- Failure-source classification is still heuristic unless richer CI metadata is added.
- Browser refresh is still needed to see newly deployed data.

## Recommended Next Improvements

- Move stakeholder auth to a real backend.
- Generate richer failure-source metadata from Playwright JSON results in CI.
- Add in-page auto-refresh or a “new data available” banner.
- Add PR body/merge summary into the Current Build section.


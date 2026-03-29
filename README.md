# Playwatch Stakeholder Dashboard

## Overview

This repository contains a stakeholder-facing quality dashboard built on top of GitHub Pages and Playwright.

It is designed for non-technical leadership to review:

- overall pass/fail health
- environment health
- coverage summary
- failure source split
- current build summary
- latest merged pull request activity

The dashboard is static in the browser, while the data is generated server-side in GitHub Actions.

## What This Project Includes

- A stakeholder dashboard page: [stakeholder.html](/Users/ghegazy/Playwright/stakeholder.html)
- Static stakeholder data file used by the dashboard: [stakeholder-data.json](/Users/ghegazy/Playwright/stakeholder-data.json)
- A generator that collects repo data from GitHub and rewrites the stakeholder JSON: [scripts/generate-stakeholder-data.js](/Users/ghegazy/Playwright/scripts/generate-stakeholder-data.js)
- A sample repo-level current build summary file: [dashboard-summary.json](/Users/ghegazy/Playwright/dashboard-summary.json)
- A Playwright validation suite for the dashboard itself: [tests/stakeholder-dashboard.spec.ts](/Users/ghegazy/Playwright/tests/stakeholder-dashboard.spec.ts)
- GitHub Actions workflows for test execution and dashboard deployment:
  - [.github/workflows/playwright.yml](/Users/ghegazy/Playwright/.github/workflows/playwright.yml)
  - [.github/workflows/deploy.yml](/Users/ghegazy/Playwright/.github/workflows/deploy.yml)

## High-Level Architecture

### 1. Frontend

- The stakeholder dashboard is a static HTML page hosted on GitHub Pages.
- The browser reads from `stakeholder-data.json`.
- Filters are applied client-side for:
  - repository
  - day
  - week
  - month
  - year
  - environment
  - test type

### 2. Data Generation

- GitHub Actions runs [scripts/generate-stakeholder-data.js](/Users/ghegazy/Playwright/scripts/generate-stakeholder-data.js).
- The generator uses a GitHub token stored in repository secrets.
- It fetches:
  - workflow runs
  - latest release
  - recent merged pull requests
  - optional `dashboard-summary.json` from each tracked repo
- It writes a fresh [stakeholder-data.json](/Users/ghegazy/Playwright/stakeholder-data.json).

### 3. Deployment

- GitHub Pages publishes the repository contents.
- The deploy workflow refreshes the data file before publishing.

## Stakeholder Dashboard Features

- Executive status banner
- Pass rate, failures, duration, and total runs
- Trend comparison vs previous matching period
- Test coverage summary
- Failure source split:
  - product
  - automation
  - unknown
- Environment health cards:
  - QA
  - Staging
  - Production
- Pass/fail trend chart
- Result breakdown donut chart
- Repository breakdown cards
- Current build summary
- Latest merged PR shown in Current Build
- Exact latest-run timestamps
- Calendar-based filtering for:
  - day
  - week
  - month
  - year

## Current Build Logic

The `Current Build` section is populated from the following sources in order:

1. `currentBuild` in `dashboard-summary.json`
2. latest merged pull request information
3. latest release fallback

This means the current build card can show:

- build summary title
- build summary status
- summary text
- latest run timestamp
- latest merged PR title
- merged PR timestamp

If you want a new build to appear in the dashboard:

1. create a branch
2. open a PR into `main`
3. merge the PR
4. let Actions run

If you want the current build summary text itself to change, also update [dashboard-summary.json](/Users/ghegazy/Playwright/dashboard-summary.json) before merging.

## Dependencies

### Required Locally

- Node.js 20+ recommended
- npm
- Python 3

### npm Packages

Defined in [package.json](/Users/ghegazy/Playwright/package.json):

- `@playwright/test`
- `@types/node`

### Browser Dependencies

Playwright browsers are installed separately via:

```bash
npx playwright install --with-deps
```

## Local Installation

From the repo root:

```bash
npm ci
npx playwright install --with-deps
```

## Running Locally

### Open the Stakeholder Dashboard

You can serve the project locally with Python:

```bash
python3 -m http.server 3000
```

Then open:

```text
http://127.0.0.1:3000/stakeholder.html
```

### Default Stakeholder Password

The current stakeholder gate is client-side and temporary.

Current default password:

```text
manager123
```

Important:

- this is not secure long-term
- it is currently suitable only as a temporary access gate
- a backend-backed auth flow would be needed for real security

## Running Tests

### Run the Stakeholder Dashboard Suite

```bash
npx playwright test tests/stakeholder-dashboard.spec.ts --project=chromium
```

### Intentionally Create a Failing Test Run

This is supported for dashboard validation:

```bash
SIMULATE_FAILING_DASHBOARD_TEST=true npx playwright test tests/stakeholder-dashboard.spec.ts --project=chromium
```

When this flag is enabled, one test fails on purpose so the dashboard pipeline can be validated against a real failed run.

## GitHub Actions

### 1. Playwright Tests Workflow

File: [.github/workflows/playwright.yml](/Users/ghegazy/Playwright/.github/workflows/playwright.yml)

Purpose:

- runs the stakeholder dashboard Playwright suite
- uploads HTML and JSON test artifacts
- supports manual triggering of an intentional failure

Manual workflow input:

- `simulate_failure`
  - `false` = normal green run
  - `true` = one test fails intentionally

### 2. Deploy Dashboard Workflow

File: [.github/workflows/deploy.yml](/Users/ghegazy/Playwright/.github/workflows/deploy.yml)

Purpose:

- regenerates `stakeholder-data.json`
- deploys the dashboard to GitHub Pages

Triggers:

- push to `main`
- manual run
- scheduled refresh every 6 hours

## Required GitHub Secrets and Variables

### Required Secret

- `GH_DASHBOARD_TOKEN`

This token should have read access to the repos the dashboard needs to inspect.

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
  - single fallback workflow file name
- `STAKEHOLDER_WORKFLOW_FILES`
  - multiple fallback workflow names
  - example: `playwright.yml,ci.yml,e2e.yml`
- `STAKEHOLDER_WORKFLOW_MAP`
  - per-repo workflow mapping
  - example:
  ```text
  Ghaidaahh/playwright-opencodegen=playwright.yml
  owner/repo-two=e2e.yml,qa.yml
  ```
- `STAKEHOLDER_DAYS_BACK`
  - how much history to fetch for the dashboard
  - default: `400`
- `DASHBOARD_SUMMARY_PATH`
  - path to the per-repo summary file
  - default: `dashboard-summary.json`

## Data Generator Behavior

The generator currently:

- supports multiple workflow file names
- supports per-repo workflow mapping
- fetches enough history for longer dashboard date filters
- defaults inferred environment to `staging`
- warns when `testCaseCount` is missing
- pulls recent merged PRs for the Current Build section

## Repo-Level Summary File

Each tracked repo can optionally provide a [dashboard-summary.json](/Users/ghegazy/Playwright/dashboard-summary.json)-style file.

This is the best place to provide:

- `testCaseCount`
- `testTypes`
- `currentBuild`
- curated failure classifications

Example shape:

```json
{
  "repo": {
    "name": "playwright-opencodegen",
    "full_name": "Ghaidaahh/playwright-opencodegen",
    "testCaseCount": 128,
    "testTypes": ["Smoke", "Sanity", "Regression"]
  },
  "currentBuild": {
    "title": "Stakeholder dashboard release readiness",
    "status": "Needs attention",
    "summary": "Smoke and sanity checks are stable, with a smaller set of issues still under review.",
    "updatedAt": "2026-03-29T16:00:00Z"
  }
}
```

## Suggested Day-to-Day Flow

### For Development

1. create a branch
2. make changes
3. run tests locally
4. push the branch
5. open a PR
6. merge into `main`

### For Dashboard Refresh

1. merge changes into `main`
2. let `Playwright Tests` run
3. let `Deploy Dashboard` regenerate `stakeholder-data.json`
4. refresh the dashboard page in the browser

## Known Limitations

- Stakeholder login is currently client-side only
- The page does not live-refresh while already open
- The dashboard filters run client-side on the generated data file
- The generator fetches history server-side, but the page still needs browser refresh to see new data

## Recommended Next Improvements

- move stakeholder auth to a real backend
- auto-refresh dashboard data in the browser every few minutes
- generate `dashboard-summary.json` automatically from test results
- include PR description/body in the Current Build section
- add release readiness scoring across repos

## Quick Commands

### Install

```bash
npm ci
npx playwright install --with-deps
```

### Run tests

```bash
npx playwright test tests/stakeholder-dashboard.spec.ts --project=chromium
```

### Start local server

```bash
python3 -m http.server 3000
```

### Create a branch

```bash
git checkout -b codex/my-next-build
```

### Push a branch

```bash
git push -u origin codex/my-next-build
```

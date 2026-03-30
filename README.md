# Playwatch Dashboards

## Overview

This repository now contains only the active dashboard files and the automation that supports them.

It currently includes:

- the main QA dashboard: [index.html](/Users/ghegazy/Playwright/index.html)
- the stakeholder dashboard: [stakeholder-v1.0.html](/Users/ghegazy/Playwright/stakeholder-v1.0.html)
- a separate stakeholder prototype for review: [stakeholder-v1.1.html](/Users/ghegazy/Playwright/stakeholder-v1.1.html)
- the generated stakeholder data file: [stakeholder-data.json](/Users/ghegazy/Playwright/stakeholder-data.json)
- the data generator: [scripts/generate-stakeholder-data.js](/Users/ghegazy/Playwright/scripts/generate-stakeholder-data.js)
- the stakeholder dashboard Playwright suite: [tests/stakeholder-dashboard.spec.ts](/Users/ghegazy/Playwright/tests/stakeholder-dashboard.spec.ts)
- deployment and test workflows:
  - [.github/workflows/deploy.yml](/Users/ghegazy/Playwright/.github/workflows/deploy.yml)
  - [.github/workflows/playwright.yml](/Users/ghegazy/Playwright/.github/workflows/playwright.yml)

## Current Structure

- [index.html](/Users/ghegazy/Playwright/index.html)
  - main dashboard page
- [stakeholder-v1.0.html](/Users/ghegazy/Playwright/stakeholder-v1.0.html)
  - current stakeholder dashboard
- [stakeholder-v1.1.html](/Users/ghegazy/Playwright/stakeholder-v1.1.html)
  - separate prototype for lead review
- [stakeholder-data.json](/Users/ghegazy/Playwright/stakeholder-data.json)
  - generated data source for stakeholder views
- [scripts/generate-stakeholder-data.js](/Users/ghegazy/Playwright/scripts/generate-stakeholder-data.js)
  - collects workflow runs, PRs, releases, and test inventory
- [tests/stakeholder-dashboard.spec.ts](/Users/ghegazy/Playwright/tests/stakeholder-dashboard.spec.ts)
  - validates the stakeholder dashboard flow
- [playwright.config.ts](/Users/ghegazy/Playwright/playwright.config.ts)
  - Playwright config
- [architecture-options.md](/Users/ghegazy/Playwright/architecture-options.md)
  - S3 vs Supabase comparison charts

## How The Stakeholder Flow Works

1. GitHub Actions runs [scripts/generate-stakeholder-data.js](/Users/ghegazy/Playwright/scripts/generate-stakeholder-data.js).
2. The generator pulls:
   - workflow runs
   - merged pull requests
   - latest release data
   - discovered Playwright test inventory
3. It rewrites [stakeholder-data.json](/Users/ghegazy/Playwright/stakeholder-data.json).
4. [stakeholder-v1.0.html](/Users/ghegazy/Playwright/stakeholder-v1.0.html) and [stakeholder-v1.1.html](/Users/ghegazy/Playwright/stakeholder-v1.1.html) read that file in the browser.

## What Is Automated

- run collection from GitHub Actions history
- merged PR collection
- latest release fallback
- test inventory discovery from repo test files
- coverage counts by test tags where available
- configurable business thresholds from GitHub variables

## What Is Still Not Truly Secure

The stakeholder password in:

- [stakeholder-v1.0.html](/Users/ghegazy/Playwright/stakeholder-v1.0.html)
- [stakeholder-v1.1.html](/Users/ghegazy/Playwright/stakeholder-v1.1.html)

is still client-side because this project is hosted as a static site. A real secure password flow would require a backend.

## Local Setup

Install dependencies:

```bash
npm ci
npx playwright install --with-deps
```

Run a local server:

```bash
python3 -m http.server 3000
```

Then open:

- `http://127.0.0.1:3000/index.html`
- `http://127.0.0.1:3000/stakeholder-v1.0.html`
- `http://127.0.0.1:3000/stakeholder-v1.1.html`

## Running Tests

Run the stakeholder dashboard tests:

```bash
npx playwright test tests/stakeholder-dashboard.spec.ts --project=chromium
```

Run the intentional failing case:

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
- `STAKEHOLDER_WORKFLOW_FILES`
- `STAKEHOLDER_WORKFLOW_MAP`
- `STAKEHOLDER_DAYS_BACK`
- `STAKEHOLDER_RISK_FAILED_RUNS`
- `STAKEHOLDER_RISK_PASS_RATE`
- `STAKEHOLDER_ATTENTION_PASS_RATE`
- `STAKEHOLDER_BUILD_RISK_FAILED_RUNS`

## Current Recommendation

- keep the current stakeholder dashboard stable
- use the prototype as a separate review artifact
- keep generation automated in GitHub Actions
- decide later whether the long-term data backend should move to S3 or Supabase

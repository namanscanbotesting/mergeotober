# How to Submit the 4 Pull Requests to topoteretes/cognee

Follow these steps to submit the connector packages directly to the official Cognee repository:

## Step 1: Fork and Clone topoteretes/cognee
```bash
git clone https://github.com/topoteretes/cognee.git
cd cognee
```

## Step 2: PR 1 — Jira Connector
```bash
git checkout -b feat/connector-jira
cp -r /path/to/devmemory/packages/connector/jira packages/connector/
git add packages/connector/jira
git commit -m "feat(connector): add Atlassian Jira verified DLT source connector"
git push origin feat/connector-jira
# Open PR using upstream_prs/PR_01_JIRA.md
```

## Step 3: PR 2 — Vercel Connector
```bash
git checkout main
git checkout -b feat/connector-vercel
cp -r /path/to/devmemory/packages/connector/vercel packages/connector/
git add packages/connector/vercel
git commit -m "feat(connector): add Vercel deployment declarative DLT REST API source"
git push origin feat/connector-vercel
# Open PR using upstream_prs/PR_02_VERCEL.md
```

## Step 4: PR 3 — Sentry Connector
```bash
git checkout main
git checkout -b feat/connector-sentry
cp -r /path/to/devmemory/packages/connector/sentry packages/connector/
git add packages/connector/sentry
git commit -m "feat(connector): add Sentry declarative DLT REST API source with bounded event sampling"
git push origin feat/connector-sentry
# Open PR using upstream_prs/PR_03_SENTRY.md
```

## Step 5: PR 4 — PostHog Connector
```bash
git checkout main
git checkout -b feat/connector-posthog
cp -r /path/to/devmemory/packages/connector/posthog packages/connector/
git add packages/connector/posthog
git commit -m "feat(connector): add PostHog declarative DLT REST API source"
git push origin feat/connector-posthog
# Open PR using upstream_prs/PR_04_POSTHOG.md
```

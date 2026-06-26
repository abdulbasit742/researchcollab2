# Build Verification Guide

Use this guide to record local and GitHub Actions verification for ResearchCollab releases.

## Required commands

Run these commands from a clean checkout:

```sh
npm ci
npm run lint
npm run build
npm run preview
```

## Expected result

- `npm ci` installs dependencies from `package-lock.json`.
- `npm run lint` completes without release-blocking lint errors.
- `npm run build` creates the Vite production output in `dist`.
- `npm run preview` serves the production build for a local smoke test.

## GitHub Actions check

The workflow at `.github/workflows/build-check.yml` should run for push, pull request, and manual workflow dispatch events.

Before release approval, record:

- workflow run link
- commit SHA
- branch name
- job result
- artifact status

## Manual smoke test

Use `MANUAL_SMOKE_TEST.md` for the full route and UI checklist.

After a successful build, verify:

- landing page loads
- auth pages load
- dashboard route loads for the correct role
- admin health route loads for allowed roles
- project workspace tabs load
- release docs links open from README

## Failure notes

If a command fails, open `.github/ISSUE_TEMPLATE/build_lint_failure.yml` and include:

- command name
- failing commit SHA
- short error summary
- suspected files
- local environment notes

## Release evidence block

Copy this block into release notes when verifying a release:

```text
Commit SHA:
Branch:
npm ci:
npm run lint:
npm run build:
npm run preview:
GitHub Actions Build Check:
Build artifact:
Manual smoke test:
Known blockers:
Owner approval:
```

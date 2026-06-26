# Contributing Guide

Use this guide when making changes to ResearchCollab.

## Local setup

```sh
git clone https://github.com/abdulbasit742/researchcollab2.git
cd researchcollab2
npm ci
cp .env.example .env.local
npm run dev
```

Only browser-safe frontend values should be used in `.env.local`.

## Branch naming

Use short branch names that describe the work:

- `docs/update-release-guide`
- `fix/build-imports`
- `feature/project-workspace-panel`
- `chore/ci-hardening`

## Before opening a PR

Run or review:

```sh
npm run lint
npm run build
npm run preview
```

Then check:

- `BUILD_VERIFICATION.md`
- `MANUAL_SMOKE_TEST.md`
- `SMOKE_TEST_NOTES_TEMPLATE.md`
- `.github/pull_request_template.md`

## Change guidelines

- Keep changes small and easy to review.
- Update docs when release, deployment, build, or smoke-test behavior changes.
- Keep demo-only flows clearly labeled.
- Keep route and UI changes reachable through an existing page or document the path.
- Prefer clear component names and simple configuration files.

## PR notes

Every PR should include:

- summary of what changed
- test or verification notes
- docs updated, if needed
- follow-up work, if any

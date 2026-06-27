# ResearchCollab

ResearchCollab is a Vite + React + TypeScript app for research collaboration, project workspaces, support docs, release checks, and launch notes.

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui
- Supabase client
- GitHub Actions build check

## Local setup

```sh
git clone https://github.com/abdulbasit742/researchcollab2.git
cd researchcollab2
npm ci
cp .env.example .env.local
npm run dev
```

Use `.env.example` for local setup values.

## Quality commands

```sh
npm run lint
npm run build
npm run preview
```

## Release and deployment docs

Use these docs before release:

- `DOCS_INDEX.md` — quick index
- `SUPPORT.md` — support guide
- `SUPPORT_NOTES_TEMPLATE.md` — support note format
- `PROGRESS_150.md` — progress note
- `PROGRESS_170.md` — support governance note
- `PROGRESS_180.md` — latest progress note
- `CHANGELOG.md` — change history
- `CONTRIBUTING.md` — contribution guide
- `RELEASE_CHECKLIST.md` — release checklist
- `RELEASE_NOTES_TEMPLATE.md` — release notes format
- `BUILD_VERIFICATION.md` — build verification guide
- `MANUAL_SMOKE_TEST.md` — smoke-test checklist
- `SMOKE_TEST_NOTES_TEMPLATE.md` — smoke-test notes
- `OPERATIONS_RUNBOOK.md` — operations checklist
- `DEPLOYMENT_GUIDE.md` — deployment guide
- `SEO_DOMAIN_AUDIT.md` — SEO and domain checklist
- `SECURITY.md` — security policy
- `.github/pull_request_template.md` — PR checklist
- `.github/ISSUE_TEMPLATE/build_lint_failure.yml` — build issue template
- `.github/ISSUE_TEMPLATE/manual_smoke_test.yml` — manual smoke-test template
- `.github/ISSUE_TEMPLATE/support_note.yml` — support note template
- `.github/ISSUE_TEMPLATE/seo_domain_audit.yml` — SEO/domain template
- `.github/CODEOWNERS` — owner review rules

## Demo notes

Some launch controls are demo-only until owner approvals are complete.

## Repository owner

Primary owner/reviewer: `@abdulbasit742`

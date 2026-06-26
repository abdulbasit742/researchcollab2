# ResearchCollab

ResearchCollab is a Vite + React + TypeScript platform for research collaboration, FYP/project workspaces, AI-assisted research workflows, researcher services, funding demos, trust previews, and launch hardening.

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

For local development, fill only browser-safe frontend variables in `.env.local`.

## Required frontend environment variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
```

Optional metadata and public-only keys are documented in `.env.example`.

## Quality commands

```sh
npm run lint
npm run build
npm run preview
```

The GitHub Actions workflow at `.github/workflows/build-check.yml` validates dependency install, lint, production build, and build artifact output.

## Release and deployment docs

Use these docs before production launch:

- `DOCS_INDEX.md` — quick index of project docs
- `CONTRIBUTING.md` — contribution guide
- `RELEASE_CHECKLIST.md` — production release checklist
- `RELEASE_NOTES_TEMPLATE.md` — release notes format
- `BUILD_VERIFICATION.md` — build verification guide
- `MANUAL_SMOKE_TEST.md` — manual route and UI smoke-test checklist
- `SMOKE_TEST_NOTES_TEMPLATE.md` — smoke-test notes template
- `OPERATIONS_RUNBOOK.md` — operations checklist
- `DEPLOYMENT_GUIDE.md` — deployment guide
- `SEO_DOMAIN_AUDIT.md` — SEO and domain checklist
- `SECURITY.md` — security policy
- `.github/pull_request_template.md` — PR release verification checklist
- `.github/ISSUE_TEMPLATE/build_lint_failure.yml` — build/lint report template
- `.github/ISSUE_TEMPLATE/manual_smoke_test.yml` — manual smoke-test report template
- `.github/ISSUE_TEMPLATE/seo_domain_audit.yml` — SEO/domain report template
- `.github/CODEOWNERS` — owner review rules

## Demo notes

Some funding, payout, contribution, certificate, moderation, launch, export, and founder actions are intentionally demo-only or locked until production services and owner approvals are complete.

## Deployment summary

Recommended production deployment settings:

- install command: `npm ci`
- build command: `npm run build`
- output directory: `dist`
- Node version: `20`
- source branch: `main`

Before deployment, confirm Supabase redirect URLs, environment variables, canonical URLs, sitemap, structured data, and domain settings match the final production domain.

## Repository owner

Primary owner/reviewer: `@abdulbasit742`

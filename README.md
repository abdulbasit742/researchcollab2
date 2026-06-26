# ResearchCollab

ResearchCollab is a Vite + React + TypeScript platform for research collaboration, FYP/project workspaces, AI-assisted research workflows, researcher services, funding demos, trust/safety previews, and production launch hardening.

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

For local development, fill only browser-safe frontend variables in `.env.local`. Never commit `.env`, `.env.local`, service-role keys, payment secrets, cookies, or private tokens.

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

The GitHub Actions workflow at `.github/workflows/build-check.yml` validates lockfile presence, dependency install, lint, production build, and build artifact output.

## Release and deployment docs

Use these docs before production launch:

- `RELEASE_CHECKLIST.md` — production release checklist
- `DEPLOYMENT_GUIDE.md` — deployment, env vars, Supabase redirects, rollback, and post-deploy checks
- `SECURITY.md` — vulnerability reporting and release security rules
- `.github/pull_request_template.md` — PR release verification checklist
- `.github/ISSUE_TEMPLATE/build_lint_failure.yml` — build/lint failure report template
- `.github/CODEOWNERS` — owner review rules

## Demo and safety notes

Several funding, payout, contribution, certificate, moderation, launch, export, and founder actions are intentionally demo-only or locked. Do not enable real payments, payouts, private attachments, or production launch actions until backend services, provider credentials, audit logging, and owner approvals are complete.

## Deployment summary

Recommended production deployment settings:

- install command: `npm ci`
- build command: `npm run build`
- output directory: `dist`
- Node version: `20`
- source branch: `main`

Before deployment, confirm Supabase production redirect URLs, environment variables, canonical URLs, sitemap, structured data, and domain settings match the final production domain.

## Repository owner

Primary owner/reviewer: `@abdulbasit742`

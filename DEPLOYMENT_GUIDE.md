# Deployment Guide

This guide explains how to prepare and deploy ResearchCollab safely after the post-100 hardening pass.

## 1. Deployment target

Recommended target for the current Vite React app:

- build command: `npm run build`
- install command: `npm ci`
- output directory: `dist`
- Node version: `20`

The app should be deployed from the `main` branch only after the release checklist, SEO domain audit, and security policy are reviewed.

## 2. Required environment variables

Configure these in the deployment provider dashboard. Do not commit them to GitHub.

```bash
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-production-publishable-key
```

Use publishable/browser-safe keys only. Never expose service-role keys, private tokens, payment secrets, SMTP passwords, or provider webhooks in frontend environment variables.

## 3. Supabase setup

Before production release:

- apply reviewed migrations to the correct Supabase project
- configure production site URL
- configure redirect URLs for login, signup, password reset, and OAuth callbacks
- verify RLS policies for profiles, role requests, projects, funding, feedback, moderation, and audit records
- review edge function JWT and secret requirements before enabling functions

## 4. GitHub Actions gate

The `.github/workflows/build-check.yml` workflow should run on:

- pushes to `main`
- pull requests targeting `main`
- manual `workflow_dispatch`

The workflow should validate:

- `package-lock.json` exists
- `npm ci` completes
- `npm run lint` completes
- `npm run build` completes
- `dist` artifact is produced

Do not treat a release as verified until the GitHub Actions run or local build output is reviewed.

## 5. Pre-deploy local checks

Run from a clean checkout:

```bash
npm ci
npm run lint
npm run build
npm run preview
```

Then open the preview URL and smoke-test the main routes before deployment.

## 6. Route smoke test

Verify these areas after deployment:

- public landing pages
- authentication and onboarding
- access denied page
- admin health and diagnostics
- project workspace tabs
- team and funding panels
- Trust Center, Help Center, Feedback Widget, Security Dashboard
- Founder Control Room, Production Launch Gate, and Build/Lint Hardening panels if reachable

## 7. Demo-only safety check

Before production traffic, confirm that these actions are still locked or clearly demo-only unless real backend services are connected:

- campaign funding
- contribution confirmation
- milestone fund release
- researcher payout
- certificate verification
- document export
- admin moderation final actions
- founder launch controls
- feedback attachments
- support escalation

## 8. Domain and SEO setup

Before final launch, review `SEO_DOMAIN_AUDIT.md` and confirm:

- final production domain is owner-approved
- old placeholder, preview, local, or temporary domains are removed from public-facing copy
- canonical URLs use the approved production domain
- sitemap includes only public indexable pages
- robots rules block private, admin, auth, dashboard, checkout, wallet, workroom, moderation, and private workspace routes
- Open Graph and social preview URLs/images use production-safe assets
- structured data does not claim unsupported accreditation, payment, certification, government affiliation, or production-verified demo services
- Supabase Auth site URL and redirect URLs match the approved production/staging domains
- HTTPS is active before production traffic

Do not connect search indexing or submit the sitemap until the SEO domain audit is complete.

## 9. Rollback process

If deployment fails:

1. Identify the last known good commit SHA.
2. Roll back the deployment provider to that commit or previous deployment.
3. Confirm environment variables were not changed incorrectly.
4. Open a Build/Lint Failure issue using the provided template.
5. Attach sanitized logs and suspected files.
6. Record the rollback owner and follow-up fix.

Rollback or pause indexing immediately if canonical URLs point to the wrong domain, private routes appear in sitemap/search results, auth redirects fail, or demo-only finance/payout flows look production-ready.

## 10. Post-deploy monitoring

After launch:

- open the production site in a private browser session
- test auth redirects and protected routes
- check browser console for runtime errors
- review GitHub Actions status
- review deployment provider logs
- review Supabase auth/logs if backend is enabled
- verify canonical URL in page source
- verify sitemap and robots behavior
- verify Open Graph/social previews
- create follow-up issues for non-blocking bugs

## 11. Release approval record

Record the following for every production release:

- release date
- release commit SHA
- GitHub Actions result or local command output
- environment reviewed
- `SEO_DOMAIN_AUDIT.md` reviewed
- owner approval
- rollback commit
- known issues
- follow-up tasks

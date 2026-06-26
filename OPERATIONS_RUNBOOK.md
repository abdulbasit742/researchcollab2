# Operations Runbook

Use this runbook after deployment to keep ResearchCollab stable during demo, staging, pilot, or production operations.

## Operating principles

- Keep finance, payout, certificate, export, moderation, and launch actions demo-only unless production services are approved.
- Keep owner approval visible for releases, rollback decisions, and domain changes.
- Prefer small follow-up issues over undocumented hotfixes.
- Keep evidence sanitized before sharing logs, screenshots, or reports.

## Daily checks

- [ ] Open the active environment in a private browser session.
- [ ] Confirm public pages load.
- [ ] Confirm login and auth redirects behave correctly.
- [ ] Confirm protected routes do not show private screens to logged-out users.
- [ ] Review deployment provider logs for runtime errors.
- [ ] Review GitHub issues for new build, SEO, auth, support, or safety reports.
- [ ] Review Supabase logs if backend features are enabled.

## Weekly checks

- [ ] Review `RELEASE_CHECKLIST.md` for any pending production blockers.
- [ ] Review `SEO_DOMAIN_AUDIT.md` before domain or metadata changes.
- [ ] Review `SECURITY.md` for unresolved security reports.
- [ ] Confirm `.env.example` still matches browser-safe frontend env expectations.
- [ ] Confirm README release docs list is still accurate.
- [ ] Confirm demo-only labels remain visible in finance, funding, payout, certificate, and launch areas.

## Release-day checklist

- [ ] Confirm `npm ci` status is documented.
- [ ] Confirm `npm run lint` status is documented.
- [ ] Confirm `npm run build` status is documented.
- [ ] Confirm GitHub Actions Build Check status is documented.
- [ ] Draft release notes from `RELEASE_NOTES_TEMPLATE.md`.
- [ ] Record release commit SHA and rollback commit SHA.
- [ ] Confirm owner approval before deployment.

## Support triage

Classify new reports as:

- `P0`: site unavailable, auth broken for all users, private route exposure, wrong domain indexing, or unsafe production-looking finance/payout flow
- `P1`: major route broken, release build failing, key dashboard unavailable, Supabase redirect issue, or support path broken
- `P2`: UI bug, unclear copy, non-critical route issue, SEO warning, or documentation gap
- `P3`: polish, wording, future enhancement, or non-blocking improvement

## Escalation path

- Release owner: `@abdulbasit742`
- Code owner: `@abdulbasit742`
- Security/release docs owner: `@abdulbasit742`
- Domain/SEO owner: `@abdulbasit742`

## Rollback triggers

Rollback or pause launch if:

- production route fails after deployment
- auth redirects fail for the target environment
- protected/private routes become visible publicly
- canonical URLs or sitemap point to the wrong domain
- demo-only finance, payout, certificate, or launch actions appear production-ready
- a release commit fails build verification without documented owner approval

## Evidence to collect

Use sanitized evidence only:

- affected route or page name
- environment name
- release commit SHA
- deployment timestamp
- browser and device summary
- screenshot with private data removed
- relevant console or server log excerpt with sensitive values removed
- linked GitHub issue or PR

## Follow-up issue routing

- Build/lint issue: use `.github/ISSUE_TEMPLATE/build_lint_failure.yml`
- SEO/domain issue: use `.github/ISSUE_TEMPLATE/seo_domain_audit.yml`
- Security concern: follow `SECURITY.md`
- Release documentation gap: update `RELEASE_CHECKLIST.md`, `DEPLOYMENT_GUIDE.md`, or `RELEASE_NOTES_TEMPLATE.md`

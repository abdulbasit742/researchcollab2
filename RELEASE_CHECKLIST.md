# Production Release Checklist

Use this checklist before moving ResearchCollab from demo/hardening mode toward production release.

## 1. Code quality gate

- [ ] Review `CONTRIBUTING.md` before changing release-facing files.
- [ ] Review `BUILD_VERIFICATION.md` before recording build evidence.
- [ ] Run `npm ci` from a clean checkout.
- [ ] Run `npm run lint` and resolve unused imports, unused variables, broken exports, and formatting blockers.
- [ ] Run `npm run build` and confirm Vite production build completes.
- [ ] Review GitHub Actions Build Check for the release commit.
- [ ] Confirm any generated artifact is from the expected `dist` output.

## 2. Route and UI smoke test

- [ ] Review `MANUAL_SMOKE_TEST.md` before route and UI validation.
- [ ] Visit the public landing routes.
- [ ] Visit login, signup, onboarding, and access-denied flows.
- [ ] Visit admin health, diagnostics, release checklist, and smoke-test panels.
- [ ] Visit project workspace tabs: overview, milestones, tasks, files, team, funding, and activity.
- [ ] Confirm embedded post-100 launch, build, trust, help, feedback, and founder panels are reachable through the visible UI chain.

## 3. Auth and role safety

- [ ] Confirm protected routes still use role checks.
- [ ] Confirm student, researcher, admin, government_admin, compliance_officer, sponsor_admin, tenant_admin, and super_admin behavior is reviewed.
- [ ] Confirm onboarding-required routes still redirect correctly.
- [ ] Confirm no hidden admin bypass, public role escalation, or unsafe test-only role switch is exposed.

## 4. Demo-only financial safety

- [ ] Confirm funding campaigns, contribution flows, milestone releases, funder dashboard, ledgers, and payout views are clearly marked demo-only.
- [ ] Confirm all payment, payout, contribution, release-funds, invoice, and statement actions remain locked until verified payment providers and audit storage exist.
- [ ] Confirm no real JazzCash, EasyPaisa, card, bank, or payment credentials are committed.

## 5. Trust, support, and privacy

- [ ] Confirm Trust Center, Help Center, Feedback Widget, and Security Dashboard wording is clear.
- [ ] Confirm feedback attachments, contact preferences, abuse reports, moderation queues, and audit logs are privacy-safe placeholders unless backend storage is approved.
- [ ] Confirm no private user data, service-role keys, access tokens, cookies, or secrets are committed.

## 6. Supabase and environment setup

- [ ] Confirm production `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are configured in the deployment environment, not committed.
- [ ] Confirm Supabase redirect URLs match the production domain.
- [ ] Confirm migrations are reviewed and applied in the correct environment.
- [ ] Confirm edge function JWT and secret requirements are reviewed before enabling production functions.

## 7. SEO and domain cleanup

- [ ] Review `SEO_DOMAIN_AUDIT.md` before connecting the final production domain.
- [ ] Confirm canonical URLs, sitemap entries, structured data, and README deployment notes use the final production domain.
- [ ] Remove old Lovable or placeholder domains unless intentionally retained for staging.
- [ ] Confirm robots and metadata match launch expectations.
- [ ] Confirm Open Graph and social preview URLs/images are production-safe.
- [ ] Confirm Supabase Auth site URL and redirect URLs match the final approved domain.

## 8. Release approval

- [ ] Founder/owner approves release.
- [ ] Engineering approves build/lint status.
- [ ] Trust/security owner approves safety wording and protected actions.
- [ ] Support owner approves help and feedback paths.
- [ ] Review `DOCS_INDEX.md` before final approval.
- [ ] Update or review `CHANGELOG.md` before final approval.
- [ ] Release notes are drafted from `RELEASE_NOTES_TEMPLATE.md`.
- [ ] Rollback owner is assigned.

## 9. Rollback plan

- [ ] Record the last known good commit SHA.
- [ ] Record the deployment provider and rollback steps.
- [ ] Record owner contacts and escalation path.
- [ ] Confirm production environment variables can be restored.
- [ ] Confirm release notes and known issues are documented.

## 10. Post-launch checks

- [ ] Open the production site in a private browser window.
- [ ] Verify auth redirects, dashboard loading, and protected route behavior.
- [ ] Verify support and feedback pages load.
- [ ] Verify canonical URL, sitemap, robots, Open Graph, and social preview behavior.
- [ ] Review monitoring, error logs, deployment logs, Supabase logs, and GitHub issues after launch.
- [ ] Update release notes with post-launch findings and follow-up issue links.
- [ ] Create follow-up tickets for any non-blocking issues found.

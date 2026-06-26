# Release Notes Template

Use this template for every production, staging, or demo milestone release of ResearchCollab.

## Release summary

- Release name:
- Release date:
- Release owner:
- Release commit SHA:
- Environment: production / staging / demo
- Deployment provider:
- Rollback commit SHA:

## Highlights

List the most important user-facing changes in simple language.

- 
- 
- 

## Engineering changes

Summarize code, configuration, workflow, route, component, dependency, Supabase, or build changes.

- 
- 
- 

## Safety and trust changes

Document changes that affect auth, roles, privacy, trust, support, moderation, feedback, funding, payments, payouts, certificates, exports, admin actions, or founder controls.

- 
- 
- 

## SEO and domain review

Confirm the release does not introduce domain or indexing risk.

- [ ] `SEO_DOMAIN_AUDIT.md` reviewed.
- [ ] Canonical URLs use the approved domain.
- [ ] Sitemap contains only public indexable pages.
- [ ] Robots/noindex rules protect restricted routes.
- [ ] Structured data claims are production-safe.
- [ ] Open Graph/social preview URLs and images are production-safe.
- [ ] Supabase Auth site URL and redirects match the target environment.

## Verification evidence

Attach or link sanitized evidence only.

```text
npm ci: pending / pass / fail
npm run lint: pending / pass / fail
npm run build: pending / pass / fail
GitHub Actions Build Check: pending / pass / fail / not run
Manual smoke test: pending / pass / fail
```

## Known limitations

List unresolved issues that are safe to ship with owner approval.

- 
- 
- 

## Launch blockers

List anything that blocks release. If none, write `None`.

- 

## Rollback plan

- Last known good commit:
- Rollback owner:
- Rollback method:
- Data or configuration restoration notes:

## Post-launch checks

- [ ] Production site opens in a private browser session.
- [ ] Auth redirects work.
- [ ] Protected routes behave correctly.
- [ ] Support and feedback paths load.
- [ ] Canonical URL, sitemap, robots, and social previews are verified.
- [ ] Deployment provider logs reviewed.
- [ ] Supabase logs reviewed if backend is enabled.
- [ ] Follow-up issues created for non-blocking bugs.

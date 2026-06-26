# Release Notes Template

Use this template for ResearchCollab releases.

## Release summary

- Release name:
- Release date:
- Release owner:
- Release commit SHA:
- Environment:
- Deployment provider:
- Rollback commit SHA:

## Highlights

- 
- 
- 

## Engineering changes

- 
- 
- 

## Safety and trust changes

- 
- 
- 

## SEO and domain review

- [ ] `SEO_DOMAIN_AUDIT.md` reviewed.
- [ ] Canonical URLs use the approved domain.
- [ ] Sitemap contains only public indexable pages.
- [ ] Robots/noindex rules protect restricted routes.
- [ ] Structured data claims are production-safe.
- [ ] Open Graph/social preview URLs and images are production-safe.
- [ ] Supabase Auth site URL and redirects match the target environment.

## Verification evidence

Review `CONTRIBUTING.md`, `BUILD_VERIFICATION.md`, and `MANUAL_SMOKE_TEST.md` before completing this section.

```text
npm ci: pending / pass / fail
npm run lint: pending / pass / fail
npm run build: pending / pass / fail
GitHub Actions Build Check: pending / pass / fail / not run
Manual smoke test: pending / pass / fail
```

## Known limitations

- 
- 
- 

## Launch blockers

- 

## Rollback plan

- Last known good commit:
- Rollback owner:
- Rollback method:
- Notes:

## Post-launch checks

- [ ] Production site opens in a private browser session.
- [ ] Auth redirects work.
- [ ] Protected routes behave correctly.
- [ ] Support and feedback paths load.
- [ ] Canonical URL, sitemap, robots, and social previews are verified.
- [ ] Deployment provider logs reviewed.
- [ ] Supabase logs reviewed if backend is enabled.
- [ ] Follow-up issues created for non-blocking bugs.

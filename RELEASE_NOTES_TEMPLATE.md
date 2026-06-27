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

Review `CHANGELOG.md`, `CONTRIBUTING.md`, `SUPPORT.md`, `SUPPORT_NOTES_TEMPLATE.md`, `PROGRESS_170.md`, `PROGRESS_180.md`, `DOC_NOTE_195.md`, `DOC_NOTE_200.md`, `BUILD_VERIFICATION.md`, and `MANUAL_SMOKE_TEST.md` before completing this section.

```text
npm ci: pending / pass / fail
npm run lint: pending / pass / fail
npm run build: pending / pass / fail
GitHub Actions Build Check: pending / pass / fail / not run
Manual smoke test: pending / pass / fail
Support notes linked: pending / yes / no
Progress 170 reviewed: pending / yes / no
Progress 180 reviewed: pending / yes / no
Doc note 195 reviewed: pending / yes / no
Doc note 200 reviewed: pending / yes / no
```

## Known limitations

- 
- 
- 

## Launch blockers

- 

## Rollback plan

- Last known good commit:
- Rollback command or deployment action:
- Data or migration rollback notes:

## Post-launch checks

- [ ] Public landing page loads on the production domain.
- [ ] Login and signup open correctly.
- [ ] Key dashboards render for expected roles.
- [ ] Support and feedback paths are visible.
- [ ] Review `PROGRESS_180.md` for latest document rollup.
- [ ] Review `DOC_NOTE_195.md` for latest doc note.
- [ ] Review `DOC_NOTE_200.md` for latest doc note.
- [ ] Monitoring, analytics, or manual observation is assigned.

## Summary

Describe what changed and why.

## Release verification checklist

- [ ] I reviewed `CONTRIBUTING.md` for contribution expectations.
- [ ] I updated or reviewed `CHANGELOG.md` for release-facing changes.
- [ ] I reviewed `SUPPORT.md` if this PR touches help, feedback, or support paths.
- [ ] I reviewed `SUPPORT_NOTES_TEMPLATE.md` if this PR needs support or debug notes.
- [ ] I reviewed `.github/ISSUE_TEMPLATE/support_note.yml` if this PR needs support follow-up.
- [ ] I reviewed `PROGRESS_170.md` for support governance notes.
- [ ] I reviewed `BUILD_VERIFICATION.md` for build evidence expectations.
- [ ] I reviewed `MANUAL_SMOKE_TEST.md` for route and UI smoke-test expectations.
- [ ] I reviewed the changed files for unused imports, unused variables, and broken exports.
- [ ] I confirmed `npm run lint` is expected to pass or documented any known lint blockers.
- [ ] I confirmed `npm run build` is expected to pass or documented any known build blockers.
- [ ] I checked that demo-only finance, trust, support, feedback, and launch controls remain clearly labeled.
- [ ] I checked that protected actions remain locked until production services are connected.
- [ ] I checked that no sensitive environment values or personal data were added.
- [ ] I checked that UI changes are reachable through an existing route or documented the integration path.

## SEO and domain gate

- [ ] I reviewed `SEO_DOMAIN_AUDIT.md` for production-domain impact.
- [ ] I checked that canonical URLs, sitemap entries, robots rules, and structured data are unchanged or production-safe.
- [ ] I checked that Open Graph and social preview URLs/images are unchanged or production-safe.
- [ ] I checked that Supabase Auth site URL and redirect URL expectations are documented if this PR touches auth, env, domain, or deployment files.
- [ ] I opened or linked `.github/ISSUE_TEMPLATE/seo_domain_audit.yml` if this PR creates an unresolved SEO/domain launch blocker.

## Testing notes

Add command output, GitHub Actions link, screenshots, or manual smoke-test notes here.

## Risk notes

List any release risks, follow-up tasks, or owner approvals needed before production launch.

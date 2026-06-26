# SEO Domain Audit Checklist

Use this checklist before connecting the final production domain or publishing ResearchCollab outside demo/staging environments.

## 1. Final domain decision

- [ ] Final production domain is approved by the owner.
- [ ] Staging domain is documented separately from production.
- [ ] Old preview, placeholder, or temporary domains are removed from public-facing copy.
- [ ] Supabase Auth site URL matches the production domain.
- [ ] Supabase redirect URLs include only approved production and staging callback URLs.

## 2. Canonical URLs

- [ ] Every public page uses the approved production domain in canonical metadata.
- [ ] No canonical URL points to a Lovable preview, local URL, old staging URL, or placeholder domain.
- [ ] Dynamic pages generate canonical URLs from safe route slugs only.
- [ ] Private or authenticated routes do not advertise public canonical URLs.

## 3. Sitemap

- [ ] Sitemap includes only public indexable pages.
- [ ] Sitemap excludes auth-only dashboards, admin routes, workrooms, funding ledgers, moderation queues, and private project pages.
- [ ] Sitemap uses HTTPS production URLs only.
- [ ] Sitemap is regenerated after route changes.
- [ ] Sitemap is submitted to search tools only after launch approval.

## 4. Robots and indexing

- [ ] `robots.txt` allows production public pages only when launch is approved.
- [ ] Demo/staging domains are blocked from indexing.
- [ ] Admin, dashboard, auth, checkout, wallet, workroom, moderation, and private workspace routes are blocked or noindexed.
- [ ] No private PDFs, attachments, reports, exports, or user uploads are indexable.

## 5. Structured data

- [ ] Organization, website, service, article, and FAQ structured data use the approved production domain.
- [ ] Structured data does not claim unsupported accreditation, payment, certification, or government affiliation.
- [ ] Demo funding, payout, marketplace, certificate, and AI claims are not represented as production-verified services.
- [ ] Social profile URLs are final and owner-approved.

## 6. Open Graph and social sharing

- [ ] `og:url` uses the approved production domain.
- [ ] `og:title` and `og:description` match the current product positioning.
- [ ] Social preview images are production-safe and do not contain private screenshots.
- [ ] Twitter/X card metadata matches Open Graph copy.
- [ ] Old preview-domain images and links are removed.

## 7. Supabase and auth redirects

- [ ] Production site URL is set in Supabase Auth settings.
- [ ] Redirect URLs include the production domain for login, signup, password reset, and OAuth callbacks.
- [ ] Preview and local redirect URLs are limited to development/staging use.
- [ ] Email templates use production URLs only after launch approval.
- [ ] No service-role key or private token is exposed in frontend env vars.

## 8. Release verification

- [ ] `npm ci` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] GitHub Actions Build Check passes or local command output is attached to the release record.
- [ ] `RELEASE_CHECKLIST.md`, `DEPLOYMENT_GUIDE.md`, and `SECURITY.md` are reviewed.

## 9. Post-launch validation

- [ ] Open production site in a private browser window.
- [ ] Verify canonical URL in page source.
- [ ] Verify sitemap URL is reachable.
- [ ] Verify robots rules are correct.
- [ ] Verify public pages render social previews correctly.
- [ ] Check deployment provider logs for routing or rewrite errors.
- [ ] Check Supabase logs for auth redirect issues.

## 10. Rollback triggers

Rollback or pause indexing if:

- production canonical URLs point to the wrong domain
- private routes appear in sitemap or search results
- demo-only finance or payout flows appear production-ready
- auth redirects fail after domain connection
- service-role keys, private tokens, payment secrets, or personal data are exposed
- GitHub Actions or local production build fails

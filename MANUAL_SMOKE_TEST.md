# Manual Smoke Test Guide

Use this guide after `npm run build` and `npm run preview` to verify the most important ResearchCollab routes and UI flows.

## Before testing

- [ ] Build output is available in `dist`.
- [ ] Preview server is running.
- [ ] Browser cache is cleared or private browsing is used.
- [ ] Test environment is identified as local, demo, staging, or production.

## Public routes

- [ ] Landing page loads.
- [ ] Main navigation renders.
- [ ] Public calls to action open the expected page.
- [ ] Footer links render without broken UI.

## Auth routes

- [ ] Login page loads.
- [ ] Signup page loads.
- [ ] Onboarding route loads when expected.
- [ ] Access denied page appears for blocked access.

## Dashboard routes

- [ ] Student dashboard route loads for student access.
- [ ] Researcher dashboard route loads for researcher access.
- [ ] Admin health route loads for allowed admin access.
- [ ] Protected pages do not show dashboard content to logged-out visitors.

## Project workspace

- [ ] Overview tab loads.
- [ ] Milestones tab loads.
- [ ] Tasks tab loads.
- [ ] Files tab loads.
- [ ] Team tab loads.
- [ ] Funding tab loads.
- [ ] Activity tab loads.

## Release docs links

- [ ] `README.md` release docs list is current.
- [ ] `DOCS_INDEX.md` includes the current release docs.
- [ ] `PROGRESS_180.md` is available.
- [ ] `BUILD_VERIFICATION.md` is available.
- [ ] `RELEASE_CHECKLIST.md` is available.
- [ ] `RELEASE_NOTES_TEMPLATE.md` is available.

## Evidence block

```text
Environment:
Commit SHA:
Preview URL:
Browser:
Public routes:
Auth routes:
Dashboard routes:
Project workspace:
Release docs links:
Progress 180:
Notes:
```

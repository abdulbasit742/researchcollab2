# Changelog

All notable ResearchCollab changes should be recorded in this file.

Use the newest release at the top.

## Unreleased

### Added

- Contributing guide for local setup, branch naming, PR checks, and change notes.
- Support guide for setup, document links, help notes, and owner review.
- Support notes template for recording help and debug notes.
- Smoke-test notes template for manual route and UI checks.
- Manual smoke-test issue template for GitHub follow-up reports.

### Changed

- Release checklist, release notes, PR template, README, docs index, and CODEOWNERS now point to the current verification docs.
- PR template, release checklist, release notes template, and build verification guide now include changelog review checks.
- PR template, release checklist, release notes template, and build verification guide now include support guide review checks.
- Build verification evidence now includes `Changelog reviewed` and `Support guide reviewed` fields.

### Verification

Before moving items from Unreleased into a dated release, review:

- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `SUPPORT.md`
- `SUPPORT_NOTES_TEMPLATE.md`
- `BUILD_VERIFICATION.md`
- `MANUAL_SMOKE_TEST.md`
- `SMOKE_TEST_NOTES_TEMPLATE.md`
- `RELEASE_CHECKLIST.md`
- `RELEASE_NOTES_TEMPLATE.md`

## Release entry format

```md
## YYYY-MM-DD - Release name

### Added

- 

### Changed

- 

### Fixed

- 

### Verification

- Build:
- Lint:
- Manual smoke test:
- Support notes linked:
- Changelog reviewed:
- Support guide reviewed:
```

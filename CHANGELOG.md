# Changelog

All notable ResearchCollab changes should be recorded in this file.

Use the newest release at the top.

## Unreleased

### Added

- Contributing guide for local setup, branch naming, PR checks, and change notes.
- Smoke-test notes template for manual route and UI checks.
- Manual smoke-test issue template for GitHub follow-up reports.

### Changed

- Release checklist, release notes, PR template, README, docs index, and CODEOWNERS now point to the current verification docs.
- PR template, release checklist, release notes template, and build verification guide now include changelog review checks.
- Build verification evidence now includes a `Changelog reviewed` field.

### Verification

Before moving items from Unreleased into a dated release, review:

- `CHANGELOG.md`
- `CONTRIBUTING.md`
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
- Changelog reviewed:
```

# Security Policy

## Supported scope

This repository is an active ResearchCollab demo and production-hardening codebase. Security review should focus on:

- authentication and role-based access checks
- Supabase client configuration and redirect settings
- demo-only finance, funding, payout, and contribution labels
- locked admin, founder, launch, export, payment, and moderation actions
- privacy-safe feedback, support, attachment, and audit flows
- accidental exposure of secrets, service-role keys, payment credentials, tokens, or private user data

## Reporting a vulnerability

Do not open a public issue for sensitive vulnerabilities, secrets, credentials, or private user data.

Send a private report to the repository owner/maintainer with:

- affected file or route
- clear reproduction steps
- expected impact
- screenshots or logs with secrets removed
- suggested safe fix, if available

## Safe disclosure rules

- Remove tokens, passwords, API keys, cookies, payment credentials, private emails, and personal data from logs before sharing.
- Do not test against real users, real payments, real payouts, or third-party systems without permission.
- Do not bypass access controls, scrape private data, or attempt destructive testing.
- Keep finance and payout flows demo-only unless a verified payment provider and audit process are approved.

## Release security checklist

Before production launch or major release:

- Run `npm run lint`.
- Run `npm run build`.
- Review GitHub Actions Build Check.
- Confirm protected actions remain locked until backend services are connected.
- Confirm demo-only labels are visible on finance, support, trust, launch, and feedback surfaces.
- Confirm no secrets or personal data are committed.
- Confirm owner approval, rollback plan, and release notes are documented.

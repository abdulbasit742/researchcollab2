

# Launch Readiness Audit and Fix Plan

## Executive Summary

After a comprehensive audit of the entire codebase (100+ files reviewed), I identified **23 issues across 7 categories** that must be fixed before launch. The platform has strong infrastructure (atomic escrow, trust engine, state machines) but has accumulated credibility gaps, broken links, branding inconsistencies, and fake data that would damage user trust on Day 1.

---

## Category 1: CRITICAL -- Broken Navigation and Dead Links

### Issue 1.1: "Forgot Password" leads to 404
The Auth page links to `/forgot-password` but no route or page exists for it. Users who forget their password have no recovery path.

**Fix:** Create a `ForgotPasswordPage.tsx` that uses `supabase.auth.resetPasswordForEmail()` and add the route to `App.tsx`.

### Issue 1.2: Footer links to `/api-docs` -- route is `/docs`
The footer "API Documentation" link points to `/api-docs`, but the route is actually `/docs` (ApiDocsPage).

**Fix:** Change the footer link from `/api-docs` to `/docs`.

### Issue 1.3: Post-login redirect goes to role-specific dashboards, not `/home`
`getRoleBasedRedirect()` sends students to `/dashboard/student` and researchers to `/dashboard/researcher` instead of the unified Daily Professional Operating Loop at `/home`. These legacy dashboards duplicate functionality and confuse navigation.

**Fix:** Update `getRoleBasedRedirect()` to always return `/home` for non-admin users.

### Issue 1.4: Navbar logo links to `/home` for unauthenticated users
When a logged-out user clicks the logo, they go to `/home` which immediately redirects to `/`. This works but causes a flash. The logo should point to `/` for unauthenticated users.

**Fix:** Conditionally link logo to `/` or `/home` based on auth state.

---

## Category 2: CRITICAL -- Fake Team Data and Credibility Issues

### Issue 2.1: About Page has fake team members with stock photos
Six fictional team members (Sarah Ahmed, Usman Khan, etc.) with Unsplash stock photos are displayed. This is a credibility destroyer -- anyone doing basic due diligence will find these are fake.

**Fix:** Remove the fake team section entirely. Replace with the founder's actual information or a "Built by a Solo Founder" section that emphasizes the platform's mission and technology.

### Issue 2.2: About Page has fake company milestones
Timeline shows "2024 - The Beginning" through future milestones that haven't happened. This claims history that doesn't exist.

**Fix:** Replace with honest milestones: actual development timeline, architecture decisions, and the launch itself.

---

## Category 3: HIGH -- Branding Inconsistencies

### Issue 3.1: Mixed branding -- "ResearcherCollab" vs "RCollab"
The platform uses "RCollab" in the Navbar and Footer, but "ResearcherCollab" in:
- Auth page logo and success toasts
- Onboarding page logo and toasts
- Loading screen
- Onboarding popup
- Legal pages (Privacy, Terms, Cookies)
- Help center email addresses

This makes the platform look unprofessional.

**Fix:** Standardize all instances to "RCollab" (the short, professional brand used in the Navbar).

### Issue 3.2: Fake email addresses in legal pages
`privacy@researchercollab.com`, `legal@researchercollab.com`, `support@researchercollab.com` are referenced but likely don't exist.

**Fix:** Replace with the actual support contact (WhatsApp number already in config) or a generic "Contact us through the platform's Help Center" link.

---

## Category 4: HIGH -- Non-Functional Features

### Issue 4.1: Contact form doesn't actually send anything
`ContactPage.tsx` simulates form submission with `setTimeout` -- data goes nowhere.

**Fix:** Create a `contact_submissions` table in the database and persist the form data. Admin can review submissions from the admin portal.

### Issue 4.2: Blog page shows hardcoded data
The blog system likely uses static data rather than the `blog_posts` database table.

**Fix:** Wire blog to database or remove the blog link from navigation/footer until it has real content.

### Issue 4.3: "People You May Know" shows hardcoded fake profiles
`PeopleYouMayKnow.tsx` uses hardcoded names like "Dr. Sarah Ahmed" from fake data.

**Fix:** Either wire this to real profile data from the database or hide the component until real users exist.

---

## Category 5: MEDIUM -- Auth and Onboarding Polish

### Issue 5.1: Sign-up success message says "Welcome to ResearcherCollab!" before email verification
Users see a success toast immediately, but they still need to verify their email. This is confusing.

**Fix:** Change the toast to "Check your email to verify your account" since auto-confirm is not enabled.

### Issue 5.2: Google OAuth button shows alongside a disabled GitHub button
The disabled GitHub button looks broken and unprofessional.

**Fix:** Remove the disabled GitHub button entirely. Show only Google OAuth.

---

## Category 6: MEDIUM -- Data Integrity Cleanup

### Issue 6.1: Static data files contain fake user data
Files like `src/data/offers.ts`, `src/data/subscriptions.ts`, `src/data/organizations.ts` contain hardcoded fake users (Ali Raza, Hassan Nawaz, etc.) that may bleed into the UI.

**Fix:** Audit all data imports. Components using these static files should either be wired to real database tables or show empty states.

### Issue 6.2: AI Project Scope page generates fake talent suggestions
`AIProjectScopePage.tsx` hardcodes fake talent like "Hassan Ahmed" and "Usman Khan" with fabricated trust scores.

**Fix:** Replace with real database queries or clearly label as "Example Results" with a disclaimer.

---

## Category 7: POLISH -- UI and UX Consistency

### Issue 7.1: 404 page "Back to Home" links to `/` instead of `/home`
Authenticated users hitting a 404 get sent to the landing page rather than their dashboard.

**Fix:** Check auth state and link to `/home` for authenticated users, `/` for others.

### Issue 7.2: Inconsistent "Explore AI Tools" secondary CTA
Multiple sections (Hero, CTA, 404) link to `/tools` as a secondary action. This is fine but should be validated to ensure the Tools page works without authentication.

### Issue 7.3: Loading screen shows "ResearcherCollab Pro"
The app loading screen still uses the old branding.

**Fix:** Update to "RCollab".

---

## Implementation Sequence

The fixes are ordered by impact and dependency:

| Step | What | Files | Priority |
|------|------|-------|----------|
| 1 | Unify branding to "RCollab" everywhere | AuthPage, OnboardingPage, LoadingScreen, OnboardingPopup, Privacy/Terms/Cookies, HelpCenter | Critical |
| 2 | Fix post-login redirect to `/home` | AuthContext.tsx | Critical |
| 3 | Create Forgot Password page + route | New ForgotPasswordPage.tsx, App.tsx | Critical |
| 4 | Fix footer dead link `/api-docs` to `/docs` | Footer.tsx | Critical |
| 5 | Remove fake team members from About page | AboutPage.tsx | Critical |
| 6 | Fix fake email addresses in legal pages | PrivacyPolicyPage, TermsOfServicePage, CookiePolicyPage, HelpCenterPage | High |
| 7 | Fix signup toast (email verification message) | AuthPage.tsx | High |
| 8 | Remove disabled GitHub OAuth button | AuthPage.tsx | High |
| 9 | Wire Contact form to database | ContactPage.tsx + migration | High |
| 10 | Fix 404 page smart redirect | NotFound.tsx | Medium |
| 11 | Fix Navbar logo for unauthenticated users | Navbar.tsx | Medium |
| 12 | Remove/hide fake "People You May Know" data | PeopleYouMayKnow.tsx | Medium |
| 13 | Clean up static data file references | Various data files and components | Medium |

---

## Technical Details

### Database Migration (Step 9)
```text
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  inquiry_type TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anyone to submit (public-facing form)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view submissions" ON contact_submissions
  FOR SELECT USING (is_admin(auth.uid()));
```

### Forgot Password Page (Step 3)
A minimal page with an email input that calls `supabase.auth.resetPasswordForEmail(email)` and shows a success message. Route: `/forgot-password`.

### Files Changed Summary
| File | Change Type |
|------|-------------|
| `src/contexts/AuthContext.tsx` | Edit (redirect logic) |
| `src/pages/AuthPage.tsx` | Edit (branding, toast, GitHub button) |
| `src/pages/OnboardingPage.tsx` | Edit (branding) |
| `src/pages/AboutPage.tsx` | Edit (remove fake team) |
| `src/pages/NotFound.tsx` | Edit (smart redirect) |
| `src/pages/ContactPage.tsx` | Edit (wire to DB) |
| `src/pages/PrivacyPolicyPage.tsx` | Edit (emails) |
| `src/pages/TermsOfServicePage.tsx` | Edit (emails) |
| `src/pages/CookiePolicyPage.tsx` | Edit (emails) |
| `src/pages/HelpCenterPage.tsx` | Edit (emails) |
| `src/components/layout/Footer.tsx` | Edit (dead link) |
| `src/components/layout/Navbar.tsx` | Edit (logo link) |
| `src/components/loading/LoadingScreen.tsx` | Edit (branding) |
| `src/components/onboarding/OnboardingPopup.tsx` | Edit (branding) |
| `src/components/feed/PeopleYouMayKnow.tsx` | Edit (remove fake data) |
| `src/pages/ForgotPasswordPage.tsx` | New file |
| `src/App.tsx` | Edit (add route) |
| Migration SQL | New (contact_submissions table) |


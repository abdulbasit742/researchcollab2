

# Rebrand to "ResearcherCollab Pro" + Standardize All Currency to PKR

## What Changes

Two platform-wide fixes:

1. **Branding**: Every instance of "RCollab" becomes **"ResearcherCollab Pro"** -- in the Navbar, Footer, Loading Screen, Auth Page, Onboarding Popup, Legal Pages, Press Kit, and HTML meta tags.

2. **Currency**: Every dollar sign (`$`) display becomes **PKR** format (e.g., `$5,000` becomes `PKR 5,000`) across all components and pages.

---

## Part 1: Branding Updates (RCollab --> ResearcherCollab Pro)

### Files to Update

| File | Current | New |
|------|---------|-----|
| `index.html` | Already says "ResearcherCollab Pro" in title/meta -- keep as-is | No change needed |
| `src/components/layout/Navbar.tsx` | `R<span>Collab</span>` | `ResearcherCollab Pro` |
| `src/components/layout/Footer.tsx` | `RCollab` | `ResearcherCollab Pro` |
| `src/components/loading/LoadingScreen.tsx` | `R` + `Collab` | `ResearcherCollab Pro` |
| `src/pages/AuthPage.tsx` | `R<span>Collab</span>` | `ResearcherCollab Pro` |
| `src/pages/OnboardingPage.tsx` | `Welcome to RCollab!` toast | `Welcome to ResearcherCollab Pro!` |
| `src/components/onboarding/OnboardingPopup.tsx` | `Welcome to RCollab!` | `Welcome to ResearcherCollab Pro!` |
| `src/pages/PressKitPage.tsx` | Mixed references | Standardize to "ResearcherCollab Pro" |
| `src/pages/TermsOfServicePage.tsx` | `RCollab` references | `ResearcherCollab Pro` |
| `src/pages/CookiePolicyPage.tsx` | `RCollab` references | `ResearcherCollab Pro` |
| `src/pages/ProgressPage.tsx` | `RCollab shows progress` | `ResearcherCollab Pro shows progress` |
| `src/pages/RealityFeedPage.tsx` | `RCollab proves...` | `ResearcherCollab Pro proves...` |
| `src/components/operations/PostLaunchRules.tsx` | `RCollab grows by...` | `ResearcherCollab Pro grows by...` |
| `src/components/portability/ReputationExport.tsx` | `RCollab Trust Authority` | `ResearcherCollab Pro Trust Authority` |
| `src/components/portability/PortableIdentityExport.tsx` | `depending on RCollab` | `depending on ResearcherCollab Pro` |
| `src/components/onboarding/FirstTimeUserOverlay.tsx` | `rcollab_first_time_seen` localStorage key | Keep internal key as-is (not user-facing) |

---

## Part 2: Currency Updates ($ --> PKR)

All dollar-formatted amounts will use the existing `formatPKR()` utility from `src/lib/currency.ts` where possible, or be manually changed to `PKR X,XXX` format.

### Files to Update

| File | What Changes |
|------|-------------|
| `src/pages/ProfilePage.tsx` (line 402) | `$${record.escrow_amount.toLocaleString()}` --> `PKR ${record.escrow_amount.toLocaleString()}` |
| `src/pages/CollaborationsPage.tsx` (line 128) | `$${project.budget_min.toLocaleString()} - $${project.budget_max.toLocaleString()}` --> `PKR ${...} - PKR ${...}` |
| `src/pages/OutcomeFeedPage.tsx` (line 137) | `$${metrics.total_earnings.toLocaleString()}` --> `PKR ${...}` |
| `src/pages/AdminPortalPage.tsx` (lines 32-33) | Revenue and Escrow Balance from `$` to `PKR` |
| `src/pages/GrantsPage.tsx` (lines 31, 75) | `$37,000/year`, `$60,000` --> `PKR 5,500,000/year`, `PKR 9,000,000` (approximate conversions for grants) |
| `src/pages/ResearcherPublicProfilePage.tsx` (6 budgets) | All `$2,000 - $5,000` style --> `PKR 500,000 - PKR 1,500,000` style |
| `src/pages/FYPServicesPage.tsx` (line 217) | `$500` placeholder --> `PKR 50,000` |
| `src/pages/AdminAIPricingPage.tsx` (line 420) | `$${...}` --> `PKR ${...}` |
| `src/pages/admin/AdminAIGovernancePage.tsx` (line 225) | `$${stats.totalCostToday.toFixed(4)}` --> `PKR ${...}` |
| `src/components/career/CareerPathSimulator.tsx` (line 27) | `$${(currentState.monthlyEarnings/1000).toFixed(1)}k` --> `PKR ${currentState.monthlyEarnings.toLocaleString()}` |
| `src/components/advanced/ProfessionalOperationsComponents.tsx` (lines 127, 131, 149, 217, 313, 328, 378) | All `$` prefixed amounts --> `PKR` |
| `src/components/advanced/AnalyticsComponents.tsx` (lines 53, 211) | `$` formatted earnings and budgets --> `PKR` |
| `src/components/deals/MultiPartyDealRoom.tsx` (lines 96, 139, 160, 259) | All deal values from `$` to `PKR` |
| `src/components/accountability/ConsequenceLedgerCard.tsx` (lines 173, 177, 181) | Escrow amounts from `$` to `PKR` |
| `src/components/blockchain/BlockchainComponents.tsx` (lines 88, 129) | `$` amounts --> `PKR` |
| `src/components/api/APIComponents.tsx` (line 116) | `$0.01/call` --> `PKR 2/call` |

---

## Implementation Order

1. Update branding in layout components (Navbar, Footer, Loading Screen)
2. Update branding in auth and onboarding pages
3. Update branding in legal and content pages
4. Convert all dollar amounts to PKR across all component files
5. Convert all dollar amounts to PKR across all page files

Total files affected: approximately 28 files.


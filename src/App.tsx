// App entry point — Core Engine Mode
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { RouteProgress } from "@/components/layout/RouteProgress";
import { LoadingScreen } from "@/components/loading";
import { useAppLoading } from "@/hooks/useAppLoading";
import { DemoWalkthroughProvider } from "@/contexts/DemoWalkthroughContext";
import { WalkthroughOverlay } from "@/components/walkthrough/WalkthroughOverlay";
import { TourLaunchButton } from "@/components/walkthrough/TourLaunchButton";

// Static imports for instant first paint
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

// ============================================================
// CORE ENGINE ROUTES — Only what drives the core loop
// Create → Fund → Execute → Complete → Hire
// ============================================================

// Auth & Onboarding
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));

// Dashboard
const HomeDashboard = lazy(() => import("./pages/HomeDashboard"));

// Profile & Identity (minimal)
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProfileSettingsPage = lazy(() => import("./pages/ProfileSettingsPage"));
const UserPublicProfilePage = lazy(() => import("./pages/UserPublicProfilePage"));

// FYP — Core Loop Step 1: Create
const FYPBrowsePage = lazy(() => import("./pages/FYPBrowsePage"));
const FYPSubmitProblemPage = lazy(() => import("./pages/FYPSubmitProblemPage"));
const StudentFYPDashboardPage = lazy(() => import("./pages/StudentFYPDashboardPage"));
const FacultyFYPCommandPage = lazy(() => import("./pages/FacultyFYPCommandPage"));
const SponsorFYPDashboardPage = lazy(() => import("./pages/SponsorFYPDashboardPage"));

// Opportunities — Core Loop Step 2: Match & Fund
const OpportunitiesPage = lazy(() => import("./pages/OpportunitiesPage"));
const OfferRedirectPage = lazy(() => import("./pages/OfferRedirectPage"));

// Deals — Core Loop Step 3-4: Escrow & Execute
const DealsPage = lazy(() => import("./pages/DealsPage"));
const DealDetailPage = lazy(() => import("./pages/DealDetailPage"));
const WorkRoomPage = lazy(() => import("./pages/WorkRoomPage"));

// Wallet — Core Loop Step 5: Payment
const WalletPage = lazy(() => import("./pages/WalletPage"));

// Verification — Trust
const VerificationCenterPage = lazy(() => import("./pages/VerificationCenterPage"));

// Messages — Communication
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const MessageThreadPage = lazy(() => import("./pages/MessageThreadPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

// Search
const SearchPage = lazy(() => import("./pages/SearchPage"));

// Social — Feed, Explore, Reels
const FeedPage = lazy(() => import("./pages/FeedPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const ReelsPage = lazy(() => import("./pages/ReelsPage"));

// Faculty — Supervisor flow
const SupervisorDashboardPage = lazy(() => import("./pages/SupervisorDashboardPage"));
const SupervisorReviewQueuePage = lazy(() => import("./pages/SupervisorReviewQueuePage"));

// Documents — Contract enforcement
const DocumentEditorPage = lazy(() => import("./pages/DocumentEditorPage"));

// Games
const GamesPage = lazy(() => import("./pages/GamesPage"));

// Restored feature pages
const EarnPage = lazy(() => import("./pages/EarnPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const NetworkPage = lazy(() => import("./pages/NetworkPage"));
const CareerPage = lazy(() => import("./pages/CareerPage"));
const PassportPage = lazy(() => import("./pages/PassportPage"));
const ResearchPapersPage = lazy(() => import("./pages/ResearchPapersPage"));
const GrantsPage = lazy(() => import("./pages/GrantsPage"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
const LearningPage = lazy(() => import("./pages/LearningPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const HRPage = lazy(() => import("./pages/HRPage"));
const AutomationPage = lazy(() => import("./pages/AutomationPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogArticlePage = lazy(() => import("./pages/BlogArticlePage"));
const BlogEditorPage = lazy(() => import("./pages/BlogEditorPage"));
const GovernancePage = lazy(() => import("./pages/GovernancePage"));
const SocialFeaturesPage = lazy(() => import("./pages/SocialFeaturesPage"));
const ImpactPage = lazy(() => import("./pages/ImpactPage"));
const EquityDashboardPage = lazy(() => import("./pages/EquityDashboardPage"));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const FeaturesShowcasePage = lazy(() => import("./pages/FeaturesShowcasePage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const PressKitPage = lazy(() => import("./pages/PressKitPage"));
const NotificationSettingsPage = lazy(() => import("./pages/NotificationSettingsPage"));
const ProjectManagementPage = lazy(() => import("./pages/ProjectManagementPage"));

// Public / Marketing (minimal)
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));

// Admin — Keep all admin routes
const AdminPortalPage = lazy(() => import("./pages/AdminPortalPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminToolsPage = lazy(() => import("./pages/admin/AdminToolsPage"));
const AdminProjectsPage = lazy(() => import("./pages/admin/AdminProjectsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminFinancePage = lazy(() => import("./pages/AdminFinancePage"));
const AdminFulfillmentPage = lazy(() => import("./pages/AdminFulfillmentPage"));
const AdminSubscriptionsPage = lazy(() => import("./pages/AdminSubscriptionsPage"));
const AdminAffiliatePage = lazy(() => import("./pages/AdminAffiliatePage"));
const AdminVerificationsPage = lazy(() => import("./pages/AdminVerificationsPage"));
const AdminReportsPage = lazy(() => import("./pages/AdminReportsPage"));
const AdminSupportPage = lazy(() => import("./pages/AdminSupportPage"));
const AdminAuditLogPage = lazy(() => import("./pages/admin/AdminAuditLogPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminFeatureFlagsPage = lazy(() => import("./pages/admin/AdminFeatureFlagsPage"));
const AdminPermissionsPage = lazy(() => import("./pages/admin/AdminPermissionsPage"));
const AdminHealthPage = lazy(() => import("./pages/admin/AdminHealthPage"));
const AdminSecurityPage = lazy(() => import("./pages/admin/AdminSecurityPage"));
const AdminOperationsPage = lazy(() => import("./pages/admin/AdminOperationsPage"));
const AdminFeedModerationPage = lazy(() => import("./pages/admin/AdminFeedModerationPage"));
const AdminGovernancePage = lazy(() => import("./pages/admin/AdminGovernancePage"));
const AdminComplianceDashboardPage = lazy(() => import("./pages/admin/AdminComplianceDashboardPage"));
const AdminSchemaPage = lazy(() => import("./pages/admin/AdminSchemaPage"));
const PilotDashboardPage = lazy(() => import("./pages/admin/PilotDashboardPage"));
const SponsorPipelinePage = lazy(() => import("./pages/admin/SponsorPipelinePage"));
const SponsorROIDashboardPage = lazy(() => import("./pages/admin/SponsorROIDashboardPage"));
const CapitalFlowDashboardPage = lazy(() => import("./pages/admin/CapitalFlowDashboardPage"));
const HiringConversionPage = lazy(() => import("./pages/admin/HiringConversionPage"));
const RefundingTriggersPage = lazy(() => import("./pages/admin/RefundingTriggersPage"));
const FYPVelocityPage = lazy(() => import("./pages/admin/FYPVelocityPage"));
const SponsorIntelligencePage = lazy(() => import("./pages/admin/SponsorIntelligencePage"));
const FinancialIntelligencePage = lazy(() => import("./pages/admin/FinancialIntelligencePage"));
const UniversityImpactDashboardPage = lazy(() => import("./pages/admin/UniversityImpactDashboardPage"));
const SalesDataPackPage = lazy(() => import("./pages/admin/SalesDataPackPage"));
const StudentOutcomePage = lazy(() => import("./pages/StudentOutcomePage"));
const IntelligenceDashboardPage = lazy(() => import("./pages/admin/IntelligenceDashboardPage"));

// Suspense fallback
const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center gradient-hero">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { isLoading, progress, isComplete } = useAppLoading();

  return (
    <>
      <LoadingScreen isLoading={isLoading} progress={progress} isComplete={isComplete} />
      <RouteProgress />
      <ScrollRestoration />
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* ====== PUBLIC / MARKETING ====== */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />

          {/* ====== ONBOARDING ====== */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* ====== CORE ENGINE ====== */}
          <Route path="/home" element={<HomeDashboard />} />

          {/* Social — Feed, Explore, Reels */}
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/reels" element={<ReelsPage />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/settings" element={<ProfileSettingsPage />} />
          <Route path="/u/:id" element={<UserPublicProfilePage />} />

          {/* FYP — Create & Execute */}
          <Route path="/fyp" element={<FYPBrowsePage />} />
          <Route path="/fyp/submit-problem" element={<FYPSubmitProblemPage />} />
          <Route path="/student/fyp" element={<StudentFYPDashboardPage />} />
          <Route path="/faculty/fyp" element={<FacultyFYPCommandPage />} />
          <Route path="/industry/fyp" element={<SponsorFYPDashboardPage />} />

          {/* Opportunities — Match & Fund */}
          <Route path="/offers" element={<OpportunitiesPage />} />
          <Route path="/offers/:id" element={<OfferRedirectPage />} />
          <Route path="/opportunities/:id" element={<OfferRedirectPage />} />

          {/* Deals — Escrow & Milestones */}
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:dealId" element={<DealDetailPage />} />
          <Route path="/workroom/:offerId" element={<WorkRoomPage />} />

          {/* Wallet — Payment */}
          <Route path="/wallet" element={<WalletPage />} />

          {/* Verification — Trust */}
          <Route path="/verification" element={<VerificationCenterPage />} />

          {/* Messages */}
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:threadId" element={<MessageThreadPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Search */}
          <Route path="/search" element={<SearchPage />} />

          {/* Faculty */}
          <Route path="/faculty/supervisor-dashboard" element={<SupervisorDashboardPage />} />
          <Route path="/faculty/review-queue" element={<SupervisorReviewQueuePage />} />

          {/* Documents — Contract enforcement */}
          <Route path="/documents/:id" element={<DocumentEditorPage />} />

          {/* Games */}
          <Route path="/games" element={<GamesPage />} />

          {/* ====== RESTORED FEATURE SECTIONS ====== */}
          <Route path="/earn" element={<EarnPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/passport" element={<PassportPage />} />
          <Route path="/research-papers" element={<ResearchPapersPage />} />
          <Route path="/grants" element={<GrantsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/hr" element={<HRPage />} />
          <Route path="/automation" element={<AutomationPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/new" element={<BlogEditorPage />} />
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/social" element={<SocialFeaturesPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/equity" element={<EquityDashboardPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/features" element={<FeaturesShowcasePage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/press" element={<PressKitPage />} />
          <Route path="/notification-settings" element={<NotificationSettingsPage />} />
          <Route path="/project-management" element={<ProjectManagementPage />} />

          {/* ====== ADMIN ====== */}
          <Route path="/admin" element={<AdminPortalPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/tools" element={<AdminToolsPage />} />
          <Route path="/admin/projects" element={<AdminProjectsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/finance" element={<AdminFinancePage />} />
          <Route path="/admin/fulfillment" element={<AdminFulfillmentPage />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="/admin/affiliates" element={<AdminAffiliatePage />} />
          <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/support" element={<AdminSupportPage />} />
          <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/feature-flags" element={<AdminFeatureFlagsPage />} />
          <Route path="/admin/permissions" element={<AdminPermissionsPage />} />
          <Route path="/admin/health" element={<AdminHealthPage />} />
          <Route path="/admin/security" element={<AdminSecurityPage />} />
          <Route path="/admin/operations" element={<AdminOperationsPage />} />
          <Route path="/admin/feed" element={<AdminFeedModerationPage />} />
          <Route path="/admin/governance" element={<AdminGovernancePage />} />
          <Route path="/admin/compliance" element={<AdminComplianceDashboardPage />} />
          <Route path="/admin/schema" element={<AdminSchemaPage />} />
          <Route path="/admin/pilot" element={<PilotDashboardPage />} />
          <Route path="/admin/sponsor-pipeline" element={<SponsorPipelinePage />} />
          <Route path="/admin/sponsor-roi" element={<SponsorROIDashboardPage />} />
          <Route path="/admin/capital-flow" element={<CapitalFlowDashboardPage />} />
          <Route path="/admin/hiring-conversions" element={<HiringConversionPage />} />
          <Route path="/admin/refunding-triggers" element={<RefundingTriggersPage />} />
          <Route path="/admin/fyp-velocity" element={<FYPVelocityPage />} />
          <Route path="/admin/sponsor-intelligence" element={<SponsorIntelligencePage />} />
          <Route path="/admin/financial-intelligence" element={<FinancialIntelligencePage />} />
          <Route path="/admin/university-impact" element={<UniversityImpactDashboardPage />} />
          <Route path="/admin/sales-data-pack" element={<SalesDataPackPage />} />
          <Route path="/admin/intelligence" element={<IntelligenceDashboardPage />} />
          <Route path="/my-outcomes" element={<StudentOutcomePage />} />

          {/* ====== REDIRECTS — Everything else → Core ====== */}
          {/* Dashboard consolidation */}
          <Route path="/dashboard/*" element={<Navigate to="/home" replace />} />
          <Route path="/my-os" element={<Navigate to="/home" replace />} />
          <Route path="/productivity" element={<Navigate to="/home" replace />} />
          <Route path="/progress" element={<Navigate to="/home" replace />} />

          {/* Profile consolidation */}
          <Route path="/profile/student" element={<Navigate to="/profile" replace />} />
          <Route path="/profile/student/:id" element={<Navigate to="/profile" replace />} />
          <Route path="/profile/researcher" element={<Navigate to="/profile" replace />} />
          <Route path="/profile/researcher/:id" element={<Navigate to="/profile" replace />} />
          <Route path="/researcher/:id" element={<Navigate to="/profile" replace />} />
          <Route path="/profile/performance" element={<Navigate to="/profile" replace />} />
          <Route path="/profile/employability" element={<Navigate to="/profile" replace />} />
          <Route path="/profile/reputation-export" element={<Navigate to="/profile" replace />} />
          <Route path="/identity/*" element={<Navigate to="/profile" replace />} />
          <Route path="/career/*" element={<Navigate to="/profile" replace />} />

          {/* Feed/social consolidation */}
          <Route path="/feed/*" element={<Navigate to="/feed" replace />} />
          <Route path="/reality" element={<Navigate to="/home" replace />} />
          <Route path="/posts/*" element={<Navigate to="/home" replace />} />
          <Route path="/rankings/*" element={<Navigate to="/home" replace />} />

          {/* FYP consolidation */}
          <Route path="/fyp/dashboard" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp-services" element={<Navigate to="/fyp" replace />} />
          <Route path="/faculty/fyp-monitor" element={<Navigate to="/faculty/fyp" replace />} />
          <Route path="/fyp/gtm-strategy" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp/sponsor-strategy" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp/30-day-plan" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp/activation-strategy" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp/sprint-playbook" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp/trust-upgrade" element={<Navigate to="/fyp" replace />} />

          {/* Opportunities consolidation */}
          <Route path="/opportunities" element={<Navigate to="/offers" replace />} />
          <Route path="/opportunities/dashboard" element={<Navigate to="/offers" replace />} />
          <Route path="/matches" element={<Navigate to="/offers" replace />} />
          <Route path="/smart-matching" element={<Navigate to="/offers" replace />} />
          <Route path="/opportunity-intelligence" element={<Navigate to="/offers" replace />} />
          <Route path="/industry/explore" element={<Navigate to="/offers" replace />} />

          {/* Deals consolidation */}
          <Route path="/collaborations" element={<Navigate to="/deals" replace />} />
          <Route path="/projects" element={<Navigate to="/deals" replace />} />
          <Route path="/contracts" element={<Navigate to="/deals" replace />} />
          <Route path="/arbitration/*" element={<Navigate to="/deals" replace />} />

          {/* Finance → wallet */}
          <Route path="/earn/*" element={<Navigate to="/wallet" replace />} />
          <Route path="/finance/*" element={<Navigate to="/wallet" replace />} />
          <Route path="/market-liquidity" element={<Navigate to="/wallet" replace />} />
          <Route path="/market/*" element={<Navigate to="/wallet" replace />} />
          <Route path="/macro-risk" element={<Navigate to="/wallet" replace />} />
          <Route path="/capital/*" element={<Navigate to="/wallet" replace />} />
          <Route path="/investor/*" element={<Navigate to="/wallet" replace />} />

          {/* Verification consolidation */}
          <Route path="/verification/*" element={<Navigate to="/verification" replace />} />

          {/* Settings consolidation */}
          <Route path="/settings/*" element={<Navigate to="/profile/settings" replace />} />

          {/* Research sub-routes → research-papers */}
          <Route path="/research-papers/*" element={<Navigate to="/research-papers" replace />} />
          <Route path="/research/*" element={<Navigate to="/research-papers" replace />} />

          {/* Orgs → home */}
          <Route path="/org" element={<Navigate to="/home" replace />} />
          <Route path="/org/*" element={<Navigate to="/home" replace />} />
          <Route path="/institution/*" element={<Navigate to="/home" replace />} />
          <Route path="/institutions/*" element={<Navigate to="/home" replace />} />

          {/* Tools/productivity → home */}
          <Route path="/ai/*" element={<Navigate to="/home" replace />} />
          <Route path="/ambient" element={<Navigate to="/home" replace />} />
          <Route path="/briefings" element={<Navigate to="/home" replace />} />
          <Route path="/sheets/*" element={<Navigate to="/home" replace />} />
          <Route path="/slides/*" element={<Navigate to="/home" replace />} />

          {/* Affiliate → home */}
          <Route path="/affiliate" element={<Navigate to="/home" replace />} />
          <Route path="/affiliate/*" element={<Navigate to="/home" replace />} />

          {/* Blog sub-routes */}
          <Route path="/blog/*" element={<Navigate to="/blog" replace />} />

          {/* Governance sub-routes */}
          <Route path="/governance/*" element={<Navigate to="/governance" replace />} />

          {/* All removed strategic/visionary/global pages → home */}
          <Route path="/strategy/*" element={<Navigate to="/home" replace />} />
          <Route path="/internal/*" element={<Navigate to="/home" replace />} />
          <Route path="/system/*" element={<Navigate to="/home" replace />} />
          <Route path="/doctrine" element={<Navigate to="/home" replace />} />
          <Route path="/ipo-readiness" element={<Navigate to="/home" replace />} />
          <Route path="/protocol" element={<Navigate to="/home" replace />} />
          <Route path="/foundation/*" element={<Navigate to="/home" replace />} />
          <Route path="/nodes" element={<Navigate to="/home" replace />} />
          <Route path="/intelligence/*" element={<Navigate to="/home" replace />} />
          <Route path="/predictive/*" element={<Navigate to="/home" replace />} />
          <Route path="/planetary/*" element={<Navigate to="/home" replace />} />
          <Route path="/federation/*" element={<Navigate to="/home" replace />} />
          <Route path="/infrastructure/*" element={<Navigate to="/home" replace />} />
          <Route path="/civilization/*" element={<Navigate to="/home" replace />} />
          <Route path="/collective" element={<Navigate to="/home" replace />} />
          <Route path="/corporate/*" element={<Navigate to="/home" replace />} />
          <Route path="/sales/*" element={<Navigate to="/home" replace />} />
          <Route path="/demo/*" element={<Navigate to="/home" replace />} />
          <Route path="/alliance/*" element={<Navigate to="/home" replace />} />
          <Route path="/spinoffs" element={<Navigate to="/home" replace />} />
          <Route path="/ecosystem/*" element={<Navigate to="/home" replace />} />
          <Route path="/government/*" element={<Navigate to="/home" replace />} />
          <Route path="/national/*" element={<Navigate to="/home" replace />} />
          <Route path="/country/*" element={<Navigate to="/home" replace />} />
          <Route path="/global/*" element={<Navigate to="/home" replace />} />
          <Route path="/academic/*" element={<Navigate to="/home" replace />} />
          <Route path="/developer/*" element={<Navigate to="/home" replace />} />
          <Route path="/founder/*" element={<Navigate to="/home" replace />} />

          {/* Removed marketing extras */}
          <Route path="/premium/*" element={<Navigate to="/onboarding" replace />} />
          <Route path="/docs" element={<Navigate to="/help" replace />} />

          {/* Admin extras → admin portal */}
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <DemoWalkthroughProvider>
                  <AppContent />
                  <TourLaunchButton />
                  <WalkthroughOverlay />
                </DemoWalkthroughProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;

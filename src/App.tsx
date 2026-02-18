// App entry point
import { lazy, Suspense } from "react";
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
// CORE USER ROUTES — Essential platform functionality
// ============================================================

// Auth & Onboarding
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));

// Profile & Identity
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProfileSettingsPage = lazy(() => import("./pages/ProfileSettingsPage"));
const UserPublicProfilePage = lazy(() => import("./pages/UserPublicProfilePage"));
const StudentProfilePage = lazy(() => import("./pages/StudentProfilePage"));
const ResearcherProfilePage = lazy(() => import("./pages/ResearcherProfilePage"));
const ResearcherPublicProfilePage = lazy(() => import("./pages/ResearcherPublicProfilePage"));
const PassportPage = lazy(() => import("./pages/PassportPage"));

// Dashboard
const HomeDashboard = lazy(() => import("./pages/HomeDashboard"));

// Feed & Social
const FeedPage = lazy(() => import("./pages/FeedPage"));
const RealityFeedPage = lazy(() => import("./pages/RealityFeedPage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
const NetworkPage = lazy(() => import("./pages/NetworkPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

// Work & Collaboration
const OffersPage = lazy(() => import("./pages/OffersPage"));
const OfferRedirectPage = lazy(() => import("./pages/OfferRedirectPage"));
const WorkRoomPage = lazy(() => import("./pages/WorkRoomPage"));
const CollaborationsPage = lazy(() => import("./pages/CollaborationsPage"));
const DealsPage = lazy(() => import("./pages/DealsPage"));
const DealDetailPage = lazy(() => import("./pages/DealDetailPage"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
const ProjectManagementPage = lazy(() => import("./pages/ProjectManagementPage"));

// Earnings & Finance
const EarnPage = lazy(() => import("./pages/EarnPage"));
const EarnProjectDetailPage = lazy(() => import("./pages/EarnProjectDetailPage"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"));
const GrantsPage = lazy(() => import("./pages/GrantsPage"));
const EquityDashboardPage = lazy(() => import("./pages/EquityDashboardPage"));
const ContractsDashboardPage = lazy(() => import("./pages/ContractsDashboardPage"));
const FinanceDashboardPage = lazy(() => import("./pages/FinanceDashboardPage"));

// Matching & Opportunities
const MatchesPage = lazy(() => import("./pages/MatchesPage"));
const SmartMatchingPage = lazy(() => import("./pages/SmartMatchingPage"));
const OpportunitiesPage = lazy(() => import("./pages/OpportunitiesPage"));
const OpportunityIntelligencePage = lazy(() => import("./pages/OpportunityIntelligencePage"));

// FYP
const FYPServicesPage = lazy(() => import("./pages/FYPServicesPage"));
const FYPDashboardPage = lazy(() => import("./pages/FYPDashboardPage"));
const FYPBrowsePage = lazy(() => import("./pages/FYPBrowsePage"));
const FYPSubmitProblemPage = lazy(() => import("./pages/FYPSubmitProblemPage"));
const StudentFYPDashboardPage = lazy(() => import("./pages/StudentFYPDashboardPage"));
const FacultyFYPCommandPage = lazy(() => import("./pages/FacultyFYPCommandPage"));
const FacultyFYPMonitorPage = lazy(() => import("./pages/FacultyFYPMonitorPage"));
const SponsorFYPDashboardPage = lazy(() => import("./pages/SponsorFYPDashboardPage"));

// Research
const ResearchPapersPage = lazy(() => import("./pages/ResearchPapersPage"));
const PaperReaderPage = lazy(() => import("./pages/PaperReaderPage"));
const ResearchExecutionPage = lazy(() => import("./pages/ResearchExecutionPage"));
const ResearchMatchPage = lazy(() => import("./pages/ResearchMatchPage"));

// Verification
const VerificationCenterPage = lazy(() => import("./pages/VerificationCenterPage"));
const StudentVerificationPage = lazy(() => import("./pages/StudentVerificationPage"));
const ResearcherVerificationPage = lazy(() => import("./pages/ResearcherVerificationPage"));
const PartnerVerificationPage = lazy(() => import("./pages/PartnerVerificationPage"));

// Messaging & Notifications
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const MessageThreadPage = lazy(() => import("./pages/MessageThreadPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NotificationSettingsPage = lazy(() => import("./pages/NotificationSettingsPage"));

// Organizations
const OrganizationsListPage = lazy(() => import("./pages/OrganizationsListPage"));
const OrganizationDashboardPage = lazy(() => import("./pages/OrganizationDashboardPage"));
const OrganizationMembersPage = lazy(() => import("./pages/OrganizationMembersPage"));
const OrganizationToolsPage = lazy(() => import("./pages/OrganizationToolsPage"));
const OrganizationProjectsPage = lazy(() => import("./pages/OrganizationProjectsPage"));
const OrganizationBillingPage = lazy(() => import("./pages/OrganizationBillingPage"));
const OrganizationPage = lazy(() => import("./pages/OrganizationPage"));
const InstitutionalCommandCenterPage = lazy(() => import("./pages/InstitutionalCommandCenterPage"));
const InstitutionApplyPage = lazy(() => import("./pages/InstitutionApplyPage"));
const FacultyMonitorPage = lazy(() => import("./pages/FacultyMonitorPage"));

// Affiliate
const AffiliateDashboardPage = lazy(() => import("./pages/AffiliateDashboardPage"));

// Blog
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogArticlePage = lazy(() => import("./pages/BlogArticlePage"));
const BlogEditorPage = lazy(() => import("./pages/BlogEditorPage"));

// AI & Productivity
const AIProjectScopePage = lazy(() => import("./pages/AIProjectScopePage"));
const AmbientPage = lazy(() => import("./pages/AmbientPage"));
const BriefingsPage = lazy(() => import("./pages/BriefingsPage"));
const ProductivityDashboardPage = lazy(() => import("./pages/ProductivityDashboardPage"));
const DocumentEditorPage = lazy(() => import("./pages/DocumentEditorPage"));
const SpreadsheetEditorPage = lazy(() => import("./pages/SpreadsheetEditorPage"));
const PresentationEditorPage = lazy(() => import("./pages/PresentationEditorPage"));

// Career
const CareerPage = lazy(() => import("./pages/CareerPage"));
const CareerForecastPage = lazy(() => import("./pages/CareerForecastPage"));

// Arbitration
const ArbitrationCourtPage = lazy(() => import("./pages/ArbitrationCourtPage"));

// Governance (user-facing)
const GovernancePage = lazy(() => import("./pages/GovernancePage"));
const GovernanceProposalsPage = lazy(() => import("./pages/GovernanceProposalsPage"));

// Public / Marketing
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const PressKitPage = lazy(() => import("./pages/PressKitPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
const FeaturesShowcasePage = lazy(() => import("./pages/FeaturesShowcasePage"));
const ImpactPage = lazy(() => import("./pages/ImpactPage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const GlobalRankingsPage = lazy(() => import("./pages/GlobalRankingsPage"));

// Faculty
const SupervisorDashboardPage = lazy(() => import("./pages/SupervisorDashboardPage"));
const SupervisorReviewQueuePage = lazy(() => import("./pages/SupervisorReviewQueuePage"));

// ============================================================
// ADMIN ROUTES — Protected by AdminLayout
// ============================================================
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

// Suspense fallback for lazy-loaded routes
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
          {/* ====== PUBLIC ====== */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/press" element={<PressKitPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/features" element={<FeaturesShowcasePage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogArticlePage />} />

          {/* ====== ONBOARDING ====== */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* ====== DASHBOARD ====== */}
          <Route path="/home" element={<HomeDashboard />} />
          <Route path="/dashboard/student" element={<Navigate to="/home" replace />} />
          <Route path="/dashboard/researcher" element={<Navigate to="/home" replace />} />
          <Route path="/dashboard/admin" element={<Navigate to="/admin" replace />} />

          {/* ====== PROFILE ====== */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/settings" element={<ProfileSettingsPage />} />
          <Route path="/profile/student" element={<StudentProfilePage />} />
          <Route path="/profile/student/:id" element={<StudentProfilePage />} />
          <Route path="/profile/researcher" element={<ResearcherProfilePage />} />
          <Route path="/profile/researcher/:id" element={<ResearcherProfilePage />} />
          <Route path="/u/:id" element={<UserPublicProfilePage />} />
          <Route path="/researcher/:id" element={<ResearcherPublicProfilePage />} />
          <Route path="/passport" element={<PassportPage />} />

          {/* ====== FEED & SOCIAL ====== */}
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/reality" element={<RealityFeedPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* ====== WORK & PROJECTS ====== */}
          <Route path="/offers" element={<OpportunitiesPage />} />
          <Route path="/offers/:id" element={<OfferRedirectPage />} />
          <Route path="/opportunities/:id" element={<OfferRedirectPage />} />
          <Route path="/workroom/:offerId" element={<WorkRoomPage />} />
          <Route path="/collaborations" element={<CollaborationsPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:dealId" element={<DealDetailPage />} />
          <Route path="/projects" element={<ProjectManagementPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/contracts" element={<ContractsDashboardPage />} />

          {/* ====== EARNINGS & FINANCE ====== */}
          <Route path="/earn" element={<EarnPage />} />
          <Route path="/earn/projects/:id" element={<EarnProjectDetailPage />} />
          <Route path="/earn/jobs" element={<Navigate to="/offers" replace />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/grants" element={<GrantsPage />} />
          <Route path="/equity" element={<EquityDashboardPage />} />
          <Route path="/finance/dashboard" element={<FinanceDashboardPage />} />
          <Route path="/arbitration/court" element={<ArbitrationCourtPage />} />

          {/* ====== MATCHING ====== */}
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/smart-matching" element={<SmartMatchingPage />} />
          <Route path="/opportunity-intelligence" element={<OpportunityIntelligencePage />} />

          {/* ====== FYP ====== */}
          <Route path="/fyp" element={<FYPBrowsePage />} />
          <Route path="/fyp/dashboard" element={<FYPDashboardPage />} />
          <Route path="/fyp/submit-problem" element={<FYPSubmitProblemPage />} />
          <Route path="/fyp-services" element={<FYPServicesPage />} />
          <Route path="/student/fyp" element={<StudentFYPDashboardPage />} />
          <Route path="/faculty/fyp" element={<FacultyFYPCommandPage />} />
          <Route path="/faculty/fyp-monitor" element={<FacultyFYPMonitorPage />} />
          <Route path="/industry/fyp" element={<SponsorFYPDashboardPage />} />

          {/* ====== RESEARCH ====== */}
          <Route path="/research-papers" element={<ResearchPapersPage />} />
          <Route path="/research-papers/:slug" element={<PaperReaderPage />} />
          <Route path="/research/execute" element={<ResearchExecutionPage />} />
          <Route path="/research/match" element={<ResearchMatchPage />} />

          {/* ====== VERIFICATION ====== */}
          <Route path="/verification" element={<VerificationCenterPage />} />
          <Route path="/verification/student" element={<StudentVerificationPage />} />
          <Route path="/verification/researcher" element={<ResearcherVerificationPage />} />
          <Route path="/verification/partner" element={<PartnerVerificationPage />} />

          {/* ====== MESSAGES ====== */}
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:threadId" element={<MessageThreadPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings/notifications" element={<NotificationSettingsPage />} />

          {/* ====== ORGANIZATIONS ====== */}
          <Route path="/org" element={<OrganizationsListPage />} />
          <Route path="/org/:id" element={<OrganizationPage />} />
          <Route path="/org/:id/dashboard" element={<OrganizationDashboardPage />} />
          <Route path="/org/:id/members" element={<OrganizationMembersPage />} />
          <Route path="/org/:id/tools" element={<OrganizationToolsPage />} />
          <Route path="/org/:id/projects" element={<OrganizationProjectsPage />} />
          <Route path="/org/:id/billing" element={<OrganizationBillingPage />} />
          <Route path="/org/:id/command-center" element={<InstitutionalCommandCenterPage />} />
          <Route path="/org/:id/faculty-monitor" element={<FacultyMonitorPage />} />
          <Route path="/institution/apply" element={<InstitutionApplyPage />} />

          {/* ====== AFFILIATE ====== */}
          <Route path="/affiliate" element={<AffiliateDashboardPage />} />

          {/* ====== BLOG (authenticated) ====== */}
          <Route path="/blog/new" element={<BlogEditorPage />} />
          <Route path="/blog/edit/:postId" element={<BlogEditorPage />} />

          {/* ====== AI & PRODUCTIVITY ====== */}
          <Route path="/ai/project-scope" element={<AIProjectScopePage />} />
          <Route path="/ambient" element={<AmbientPage />} />
          <Route path="/briefings" element={<BriefingsPage />} />
          <Route path="/productivity" element={<ProductivityDashboardPage />} />
          <Route path="/documents/:id" element={<DocumentEditorPage />} />
          <Route path="/sheets/:id" element={<SpreadsheetEditorPage />} />
          <Route path="/slides/:id" element={<PresentationEditorPage />} />

          {/* ====== CAREER ====== */}
          <Route path="/career" element={<CareerPage />} />
          <Route path="/career/forecast" element={<CareerForecastPage />} />

          {/* ====== FACULTY ====== */}
          <Route path="/faculty/supervisor-dashboard" element={<SupervisorDashboardPage />} />
          <Route path="/faculty/review-queue" element={<SupervisorReviewQueuePage />} />

          {/* ====== GOVERNANCE (user) ====== */}
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/governance/proposals" element={<GovernanceProposalsPage />} />

          {/* ====== RANKINGS ====== */}
          <Route path="/rankings/global" element={<GlobalRankingsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* ====== ADMIN ROUTES ====== */}
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

          {/* ====== REDIRECTS — Removed visionary/premature routes ====== */}
          {/* Duplicate dashboards → unified home */}
          <Route path="/opportunities" element={<Navigate to="/offers" replace />} />
          <Route path="/feed/strategic" element={<Navigate to="/feed" replace />} />
          <Route path="/my-os" element={<Navigate to="/home" replace />} />
          <Route path="/opportunities/dashboard" element={<Navigate to="/offers" replace />} />

          {/* Removed strategy/domination pages → home */}
          <Route path="/strategy/*" element={<Navigate to="/home" replace />} />
          <Route path="/internal/*" element={<Navigate to="/home" replace />} />
          <Route path="/system/*" element={<Navigate to="/home" replace />} />
          <Route path="/doctrine" element={<Navigate to="/home" replace />} />
          <Route path="/ipo-readiness" element={<Navigate to="/home" replace />} />
          <Route path="/protocol" element={<Navigate to="/home" replace />} />
          <Route path="/foundation" element={<Navigate to="/home" replace />} />
          <Route path="/foundation/*" element={<Navigate to="/home" replace />} />
          <Route path="/nodes" element={<Navigate to="/home" replace />} />

          {/* Removed intelligence pages → home */}
          <Route path="/intelligence" element={<Navigate to="/home" replace />} />
          <Route path="/intelligence/*" element={<Navigate to="/home" replace />} />
          <Route path="/predictive/*" element={<Navigate to="/home" replace />} />
          <Route path="/planetary/*" element={<Navigate to="/home" replace />} />
          <Route path="/federation/*" element={<Navigate to="/home" replace />} />
          <Route path="/infrastructure/*" element={<Navigate to="/home" replace />} />
          <Route path="/civilization/*" element={<Navigate to="/home" replace />} />
          <Route path="/collective" element={<Navigate to="/home" replace />} />

          {/* Removed market/capital pages → wallet */}
          <Route path="/market-liquidity" element={<Navigate to="/wallet" replace />} />
          <Route path="/market/*" element={<Navigate to="/wallet" replace />} />
          <Route path="/macro-risk" element={<Navigate to="/wallet" replace />} />
          <Route path="/capital/*" element={<Navigate to="/wallet" replace />} />
          <Route path="/investor/*" element={<Navigate to="/wallet" replace />} />

          {/* Removed corporate/sales/demo pages → home */}
          <Route path="/corporate/*" element={<Navigate to="/home" replace />} />
          <Route path="/sales/*" element={<Navigate to="/home" replace />} />
          <Route path="/demo/*" element={<Navigate to="/home" replace />} />
          <Route path="/alliance/*" element={<Navigate to="/home" replace />} />
          <Route path="/spinoffs" element={<Navigate to="/home" replace />} />
          <Route path="/ecosystem/*" element={<Navigate to="/home" replace />} />
          <Route path="/government/*" element={<Navigate to="/home" replace />} />

          {/* Removed duplicate/premature institution pages → org */}
          <Route path="/institutions/*" element={<Navigate to="/org" replace />} />
          <Route path="/national/*" element={<Navigate to="/home" replace />} />
          <Route path="/country/*" element={<Navigate to="/home" replace />} />

          {/* Removed governance extras → governance */}
          <Route path="/governance/transparency" element={<Navigate to="/governance" replace />} />
          <Route path="/governance/constitution" element={<Navigate to="/governance" replace />} />
          <Route path="/governance/decisions" element={<Navigate to="/governance" replace />} />
          <Route path="/constitutional-health" element={<Navigate to="/governance" replace />} />

          {/* Removed analytics extras → home */}
          <Route path="/analytics/*" element={<Navigate to="/home" replace />} />
          <Route path="/academic/*" element={<Navigate to="/home" replace />} />
          <Route path="/global/*" element={<Navigate to="/home" replace />} />
          <Route path="/identity/*" element={<Navigate to="/home" replace />} />

          {/* Removed profile sub-routes → profile */}
          <Route path="/profile/performance" element={<Navigate to="/profile" replace />} />
          <Route path="/profile/employability" element={<Navigate to="/profile" replace />} />
          <Route path="/profile/reputation-export" element={<Navigate to="/profile" replace />} />

          {/* Removed misc pages */}
          <Route path="/social" element={<Navigate to="/feed" replace />} />
          <Route path="/progress" element={<Navigate to="/home" replace />} />
          <Route path="/learning" element={<Navigate to="/home" replace />} />
          <Route path="/events" element={<Navigate to="/home" replace />} />
          <Route path="/hr" element={<Navigate to="/home" replace />} />
          <Route path="/automation" element={<Navigate to="/home" replace />} />
          <Route path="/premium/onboarding" element={<Navigate to="/onboarding" replace />} />
          <Route path="/docs" element={<Navigate to="/help" replace />} />
          <Route path="/developer/*" element={<Navigate to="/home" replace />} />
          <Route path="/research/domination" element={<Navigate to="/research-papers" replace />} />
          <Route path="/research/economic-impact" element={<Navigate to="/research-papers" replace />} />
          <Route path="/industry/explore" element={<Navigate to="/offers" replace />} />
          <Route path="/affiliate/assets" element={<Navigate to="/affiliate" replace />} />
          <Route path="/founder/*" element={<Navigate to="/home" replace />} />

          {/* Removed admin extras → admin portal */}
          <Route path="/admin/enterprise" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/ai-pricing" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/deployment" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/ai-governance" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/reproducibility" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/federation" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/stewardship" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/premium-analytics" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/pricing" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/visibility-analytics" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/global-talent-analytics" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/passport-analytics" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/global-liquidity" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/pod-analytics" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/deal-intelligence" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/systemic-risk" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/governance-oversight" element={<Navigate to="/admin/governance" replace />} />
          <Route path="/admin/constitutional-guardian" element={<Navigate to="/admin/governance" replace />} />
          <Route path="/admin/operational-health" element={<Navigate to="/admin/health" replace />} />
          <Route path="/admin/conversion-metrics" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/institution-intelligence" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/institution-activation" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/revenue-dashboard" element={<Navigate to="/admin/finance" replace />} />
          <Route path="/admin/profit-dashboard" element={<Navigate to="/admin/finance" replace />} />
          <Route path="/admin/pricing-optimizer" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/infrastructure-costs" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/global-expansion" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/power-audit" element={<Navigate to="/admin/audit-log" replace />} />
          <Route path="/admin/feature-governance" element={<Navigate to="/admin/feature-flags" replace />} />
          <Route path="/admin/crisis-mode" element={<Navigate to="/admin/operations" replace />} />
          <Route path="/admin/evolution-simulator" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/revenue-intelligence" element={<Navigate to="/admin/finance" replace />} />
          <Route path="/admin/government" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/national-insights" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/infrastructure" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/resilience" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/knowledge" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/limse-command" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/command-center" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/national-economy" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/partners" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/strategic-brain" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/country/*" element={<Navigate to="/admin" replace />} />

          {/* Removed FYP strategy pages */}
          <Route path="/fyp/gtm-strategy" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp/sponsor-strategy" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp/30-day-plan" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp/activation-strategy" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp/sprint-playbook" element={<Navigate to="/fyp" replace />} />
          <Route path="/fyp/trust-upgrade" element={<Navigate to="/fyp" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
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
);

export default App;

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

// Lazy-loaded page imports
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const StudentDashboard = lazy(() => import("./pages/dashboard/StudentDashboard"));
const ResearcherDashboard = lazy(() => import("./pages/dashboard/ResearcherDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
const CollaborationsPage = lazy(() => import("./pages/CollaborationsPage"));
const EarnPage = lazy(() => import("./pages/EarnPage"));
const EarnProjectDetailPage = lazy(() => import("./pages/EarnProjectDetailPage"));
const FYPServicesPage = lazy(() => import("./pages/FYPServicesPage"));
const GrantsPage = lazy(() => import("./pages/GrantsPage"));
const MatchesPage = lazy(() => import("./pages/MatchesPage"));
const SmartMatchingPage = lazy(() => import("./pages/SmartMatchingPage"));
const StudentProfilePage = lazy(() => import("./pages/StudentProfilePage"));
const ResearcherProfilePage = lazy(() => import("./pages/ResearcherProfilePage"));
const ResearcherPublicProfilePage = lazy(() => import("./pages/ResearcherPublicProfilePage"));
const UserPublicProfilePage = lazy(() => import("./pages/UserPublicProfilePage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogArticlePage = lazy(() => import("./pages/BlogArticlePage"));
const BlogEditorPage = lazy(() => import("./pages/BlogEditorPage"));
const OffersPage = lazy(() => import("./pages/OffersPage"));
const OfferRedirectPage = lazy(() => import("./pages/OfferRedirectPage"));
const WorkRoomPage = lazy(() => import("./pages/WorkRoomPage"));
const OpportunityIntelligencePage = lazy(() => import("./pages/OpportunityIntelligencePage"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"));
const AffiliateDashboardPage = lazy(() => import("./pages/AffiliateDashboardPage"));
const AffiliateAssetsPage = lazy(() => import("./pages/AffiliateAssetsPage"));
const VerificationCenterPage = lazy(() => import("./pages/VerificationCenterPage"));
const StudentVerificationPage = lazy(() => import("./pages/StudentVerificationPage"));
const ResearcherVerificationPage = lazy(() => import("./pages/ResearcherVerificationPage"));
const PartnerVerificationPage = lazy(() => import("./pages/PartnerVerificationPage"));
const OrganizationsListPage = lazy(() => import("./pages/OrganizationsListPage"));
const OrganizationDashboardPage = lazy(() => import("./pages/OrganizationDashboardPage"));
const OrganizationMembersPage = lazy(() => import("./pages/OrganizationMembersPage"));
const OrganizationToolsPage = lazy(() => import("./pages/OrganizationToolsPage"));
const OrganizationProjectsPage = lazy(() => import("./pages/OrganizationProjectsPage"));
const OrganizationBillingPage = lazy(() => import("./pages/OrganizationBillingPage"));
const AIProjectScopePage = lazy(() => import("./pages/AIProjectScopePage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const MessageThreadPage = lazy(() => import("./pages/MessageThreadPage"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const ApiDocsPage = lazy(() => import("./pages/ApiDocsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const HomeDashboard = lazy(() => import("./pages/HomeDashboard"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const RealityFeedPage = lazy(() => import("./pages/RealityFeedPage"));
const OutcomeFeedPage = lazy(() => import("./pages/OutcomeFeedPage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
const NetworkPage = lazy(() => import("./pages/NetworkPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const PressKitPage = lazy(() => import("./pages/PressKitPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
const OpportunitiesPage = lazy(() => import("./pages/OpportunitiesPage"));
const NotificationSettingsPage = lazy(() => import("./pages/NotificationSettingsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const OrganizationPage = lazy(() => import("./pages/OrganizationPage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const DealsPage = lazy(() => import("./pages/DealsPage"));
const DealDetailPage = lazy(() => import("./pages/DealDetailPage"));
const PremiumOnboardingPage = lazy(() => import("./pages/PremiumOnboardingPage"));
const FeaturesShowcasePage = lazy(() => import("./pages/FeaturesShowcasePage"));
const LearningPage = lazy(() => import("./pages/LearningPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const HRPage = lazy(() => import("./pages/HRPage"));
const AutomationPage = lazy(() => import("./pages/AutomationPage"));
const ProjectManagementPage = lazy(() => import("./pages/ProjectManagementPage"));
const SocialFeaturesPage = lazy(() => import("./pages/SocialFeaturesPage"));
const AmbientPage = lazy(() => import("./pages/AmbientPage"));
const CollectiveIntelligencePage = lazy(() => import("./pages/CollectiveIntelligencePage"));
const BriefingsPage = lazy(() => import("./pages/BriefingsPage"));
const ProfileSettingsPage = lazy(() => import("./pages/ProfileSettingsPage"));
const CareerPage = lazy(() => import("./pages/CareerPage"));
const ResearchPapersPage = lazy(() => import("./pages/ResearchPapersPage"));
const PaperReaderPage = lazy(() => import("./pages/PaperReaderPage"));
const InstitutionalCommandCenterPage = lazy(() => import("./pages/InstitutionalCommandCenterPage"));
const PassportPage = lazy(() => import("./pages/PassportPage"));
const MarketLiquidityPage = lazy(() => import("./pages/MarketLiquidityPage"));
const MacroRiskPage = lazy(() => import("./pages/MacroRiskPage"));
const GovernancePage = lazy(() => import("./pages/GovernancePage"));
const ConstitutionalHealthPage = lazy(() => import("./pages/ConstitutionalHealthPage"));
const InstitutionApplyPage = lazy(() => import("./pages/InstitutionApplyPage"));
const InstitutionRankingsPage = lazy(() => import("./pages/InstitutionRankingsPage"));
const FacultyMonitorPage = lazy(() => import("./pages/FacultyMonitorPage"));
const InstitutionContractPage = lazy(() => import("./pages/InstitutionContractPage"));
const GlobalRankingsPage = lazy(() => import("./pages/GlobalRankingsPage"));
const GlobalLiquidityAnalyticsPage = lazy(() => import("./pages/GlobalLiquidityAnalyticsPage"));
const DeveloperApiDashboardPage = lazy(() => import("./pages/DeveloperApiDashboardPage"));
const ReputationExportPage = lazy(() => import("./pages/ReputationExportPage"));
const GovernanceConstitutionPage = lazy(() => import("./pages/GovernanceConstitutionPage"));
const GovernanceDecisionsPage = lazy(() => import("./pages/GovernanceDecisionsPage"));
const EconomicFairnessPage = lazy(() => import("./pages/EconomicFairnessPage"));
const FYPDashboardPage = lazy(() => import("./pages/FYPDashboardPage"));
const SupervisorDashboardPage = lazy(() => import("./pages/SupervisorDashboardPage"));
const AcademicOutputAnalyticsPage = lazy(() => import("./pages/AcademicOutputAnalyticsPage"));
const SupervisorReviewQueuePage = lazy(() => import("./pages/SupervisorReviewQueuePage"));
const StudentPerformancePage = lazy(() => import("./pages/StudentPerformancePage"));
const AcademicTaskMarketplacePage = lazy(() => import("./pages/AcademicTaskMarketplacePage"));
const SupervisorPerformancePage = lazy(() => import("./pages/SupervisorPerformancePage"));
const EmployabilityExportPage = lazy(() => import("./pages/EmployabilityExportPage"));
const AcademicRankingsPage = lazy(() => import("./pages/AcademicRankingsPage"));
const OpportunityDashboardPage = lazy(() => import("./pages/OpportunityDashboardPage"));
const StrategicFeedPage = lazy(() => import("./pages/StrategicFeedPage"));
const MyOSPage = lazy(() => import("./pages/MyOSPage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const ProductivityDashboardPage = lazy(() => import("./pages/ProductivityDashboardPage"));
const DocumentEditorPage = lazy(() => import("./pages/DocumentEditorPage"));
const SpreadsheetEditorPage = lazy(() => import("./pages/SpreadsheetEditorPage"));
const PresentationEditorPage = lazy(() => import("./pages/PresentationEditorPage"));
const InstitutionalAcademicAnalyticsPage = lazy(() => import("./pages/InstitutionalAcademicAnalyticsPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const InstitutionIntelligencePage = lazy(() => import("./pages/InstitutionIntelligencePage"));
const CareerForecastPage = lazy(() => import("./pages/CareerForecastPage"));
const GlobalEconomyPage = lazy(() => import("./pages/GlobalEconomyPage"));
const AdminLIMSECommandCenter = lazy(() => import("./pages/admin/AdminLIMSECommandCenter"));

// Layer 10: Capital & Credit
const CreditProfilePage = lazy(() => import("./pages/CreditProfilePage"));
const CapitalAdvancePage = lazy(() => import("./pages/CapitalAdvancePage"));
const FundingPoolsPage = lazy(() => import("./pages/FundingPoolsPage"));
const CapitalRiskIntelligencePage = lazy(() => import("./pages/CapitalRiskIntelligencePage"));

// Layers 11-15
const GovernanceProposalsPage = lazy(() => import("./pages/GovernanceProposalsPage"));
const GovernanceTransparencyPage = lazy(() => import("./pages/GovernanceTransparencyPage"));
const CivilizationTreasuryPage = lazy(() => import("./pages/CivilizationTreasuryPage"));
const IntelligenceGlobalPage = lazy(() => import("./pages/IntelligenceGlobalPage"));
const PredictiveGlobalPage = lazy(() => import("./pages/PredictiveGlobalPage"));
const SystemHealthPage = lazy(() => import("./pages/SystemHealthPage"));

// Layers 16-19
const FederationIntelligencePage = lazy(() => import("./pages/FederationIntelligencePage"));
const InfrastructureIntelligencePage = lazy(() => import("./pages/InfrastructureIntelligencePage"));
const PlanetaryIntelligencePage = lazy(() => import("./pages/PlanetaryIntelligencePage"));
const CivilizationalDoctrinePage = lazy(() => import("./pages/CivilizationalDoctrinePage"));

// REIOS: Research Execution & Impact
const ResearchExecutionPage = lazy(() => import("./pages/ResearchExecutionPage"));
const ResearchEconomicImpactPage = lazy(() => import("./pages/ResearchEconomicImpactPage"));
const InstitutionResearchIntelligencePage = lazy(() => import("./pages/InstitutionResearchIntelligencePage"));
const ResearchMatchPage = lazy(() => import("./pages/ResearchMatchPage"));

// RLCMA: Research Liquidity & Commercialization Moat
const InstitutionCommercializationPage = lazy(() => import("./pages/InstitutionCommercializationPage"));
const ExecutionProductivityRankingsPage = lazy(() => import("./pages/ExecutionProductivityRankingsPage"));
const IndustryExplorePage = lazy(() => import("./pages/IndustryExplorePage"));
const InstitutionCommercializationDashboardPage = lazy(() => import("./pages/InstitutionCommercializationDashboardPage"));
const InstitutionalROICalculatorPage = lazy(() => import("./pages/InstitutionalROICalculatorPage"));
const PilotAcquisitionKitPage = lazy(() => import("./pages/PilotAcquisitionKitPage"));

// Admin pages - lazy loaded
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
const AdminEnterprisePage = lazy(() => import("./pages/AdminEnterprisePage"));
const AdminAIPricingPage = lazy(() => import("./pages/AdminAIPricingPage"));
const AdminReportsPage = lazy(() => import("./pages/AdminReportsPage"));
const AdminSupportPage = lazy(() => import("./pages/AdminSupportPage"));
const AdminAuditLogPage = lazy(() => import("./pages/admin/AdminAuditLogPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminGovernmentPage = lazy(() => import("./pages/admin/AdminGovernmentPage"));
const AdminNationalInsightsPage = lazy(() => import("./pages/admin/AdminNationalInsightsPage"));
const AdminInfrastructurePage = lazy(() => import("./pages/admin/AdminInfrastructurePage"));
const AdminGovernancePage = lazy(() => import("./pages/admin/AdminGovernancePage"));
const AdminResiliencePage = lazy(() => import("./pages/admin/AdminResiliencePage"));
const AdminKnowledgePage = lazy(() => import("./pages/admin/AdminKnowledgePage"));
const AdminFeedModerationPage = lazy(() => import("./pages/admin/AdminFeedModerationPage"));
const AdminFeatureFlagsPage = lazy(() => import("./pages/admin/AdminFeatureFlagsPage"));
const AdminSchemaPage = lazy(() => import("./pages/admin/AdminSchemaPage"));
const AdminPermissionsPage = lazy(() => import("./pages/admin/AdminPermissionsPage"));
const AdminHealthPage = lazy(() => import("./pages/admin/AdminHealthPage"));
const AdminDeploymentPage = lazy(() => import("./pages/admin/AdminDeploymentPage"));
const AdminSecurityPage = lazy(() => import("./pages/admin/AdminSecurityPage"));
const AdminAIGovernancePage = lazy(() => import("./pages/admin/AdminAIGovernancePage"));
const AdminReproducibilityPage = lazy(() => import("./pages/admin/AdminReproducibilityPage"));
const AdminFederationPage = lazy(() => import("./pages/admin/AdminFederationPage"));
const AdminStewardshipPage = lazy(() => import("./pages/admin/AdminStewardshipPage"));
const AdminOperationsPage = lazy(() => import("./pages/admin/AdminOperationsPage"));
const AdminOperationalHealthPage = lazy(() => import("./pages/admin/AdminOperationalHealthPage"));
const AdminPremiumAnalyticsPage = lazy(() => import("./pages/admin/AdminPremiumAnalyticsPage"));
const AdminPricingPage = lazy(() => import("./pages/admin/AdminPricingPage"));
const AdminVisibilityAnalyticsPage = lazy(() => import("./pages/admin/AdminVisibilityAnalyticsPage"));
const AdminGlobalTalentAnalyticsPage = lazy(() => import("./pages/admin/AdminGlobalTalentAnalyticsPage"));
const AdminPassportAnalyticsPage = lazy(() => import("./pages/admin/AdminPassportAnalyticsPage"));
const AdminGlobalLiquidityPage = lazy(() => import("./pages/admin/AdminGlobalLiquidityPage"));
const AdminPodAnalyticsPage = lazy(() => import("./pages/admin/AdminPodAnalyticsPage"));
const AdminDealIntelligencePage = lazy(() => import("./pages/admin/AdminDealIntelligencePage"));
const AdminSystemicRiskPage = lazy(() => import("./pages/admin/AdminSystemicRiskPage"));
const AdminGovernanceOversightPage = lazy(() => import("./pages/admin/AdminGovernanceOversightPage"));
const AdminConstitutionalGuardianPage = lazy(() => import("./pages/admin/AdminConstitutionalGuardianPage"));
const AdminConversionMetricsPage = lazy(() => import("./pages/admin/AdminConversionMetricsPage"));
const AdminInstitutionIntelligencePage = lazy(() => import("./pages/admin/AdminInstitutionIntelligencePage"));
const AdminInstitutionActivationPage = lazy(() => import("./pages/admin/AdminInstitutionActivationPage"));
const AdminRevenueDashboardPage = lazy(() => import("./pages/admin/AdminRevenueDashboardPage"));
const AdminProfitDashboardPage = lazy(() => import("./pages/admin/AdminProfitDashboardPage"));
const AdminPricingOptimizerPage = lazy(() => import("./pages/admin/AdminPricingOptimizerPage"));
const AdminInfrastructureCostsPage = lazy(() => import("./pages/admin/AdminInfrastructureCostsPage"));
const AdminGlobalExpansionPage = lazy(() => import("./pages/admin/AdminGlobalExpansionPage"));
const AdminPowerAuditPage = lazy(() => import("./pages/admin/AdminPowerAuditPage"));
const AdminFeatureGovernancePage = lazy(() => import("./pages/admin/AdminFeatureGovernancePage"));
const AdminCrisisModePage = lazy(() => import("./pages/admin/AdminCrisisModePage"));
const AdminEvolutionSimulatorPage = lazy(() => import("./pages/admin/AdminEvolutionSimulatorPage"));
const AdminRevenueIntelligencePage = lazy(() => import("./pages/admin/AdminRevenueIntelligencePage"));

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
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<HomeDashboard />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/reality" element={<RealityFeedPage />} />
            <Route path="/opportunities" element={<OutcomeFeedPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/settings" element={<ProfileSettingsPage />} />
            <Route path="/u/:id" element={<UserPublicProfilePage />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/researcher" element={<ResearcherDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/collaborations" element={<CollaborationsPage />} />
            <Route path="/researcher/:id" element={<ResearcherPublicProfilePage />} />
            <Route path="/earn" element={<EarnPage />} />
            <Route path="/earn/projects/:id" element={<EarnProjectDetailPage />} />
            <Route path="/earn/jobs" element={<Navigate to="/offers" replace />} />
            <Route path="/opportunity-intelligence" element={<OpportunityIntelligencePage />} />
            <Route path="/fyp-services" element={<FYPServicesPage />} />
            <Route path="/grants" element={<GrantsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/smart-matching" element={<SmartMatchingPage />} />
            <Route path="/profile/student" element={<StudentProfilePage />} />
            <Route path="/profile/student/:id" element={<StudentProfilePage />} />
            <Route path="/profile/researcher" element={<ResearcherProfilePage />} />
            <Route path="/profile/researcher/:id" element={<ResearcherProfilePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/new" element={<BlogEditorPage />} />
            <Route path="/blog/edit/:postId" element={<BlogEditorPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/offers" element={<OpportunitiesPage />} />
            <Route path="/offers/:id" element={<OfferRedirectPage />} />
            <Route path="/opportunities/:id" element={<OfferRedirectPage />} />
            <Route path="/workroom/:offerId" element={<WorkRoomPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/affiliate" element={<AffiliateDashboardPage />} />
            <Route path="/affiliate/assets" element={<AffiliateAssetsPage />} />
            <Route path="/verification" element={<VerificationCenterPage />} />
            <Route path="/verification/student" element={<StudentVerificationPage />} />
            <Route path="/verification/researcher" element={<ResearcherVerificationPage />} />
            <Route path="/verification/partner" element={<PartnerVerificationPage />} />
            <Route path="/org" element={<OrganizationsListPage />} />
            <Route path="/org/:id/dashboard" element={<OrganizationDashboardPage />} />
            <Route path="/org/:id/members" element={<OrganizationMembersPage />} />
            <Route path="/org/:id/tools" element={<OrganizationToolsPage />} />
            <Route path="/org/:id/projects" element={<OrganizationProjectsPage />} />
            <Route path="/org/:id/billing" element={<OrganizationBillingPage />} />
            <Route path="/ai/project-scope" element={<AIProjectScopePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:threadId" element={<MessageThreadPage />} />
            <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/org/:id" element={<OrganizationPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/deals/:dealId" element={<DealDetailPage />} />
            <Route path="/premium/onboarding" element={<PremiumOnboardingPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/docs" element={<ApiDocsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/press" element={<PressKitPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/features" element={<FeaturesShowcasePage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/hr" element={<HRPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="/projects" element={<ProjectManagementPage />} />
            <Route path="/social" element={<SocialFeaturesPage />} />
            <Route path="/ambient" element={<AmbientPage />} />
            <Route path="/collective" element={<CollectiveIntelligencePage />} />
            <Route path="/briefings" element={<BriefingsPage />} />
            <Route path="/career" element={<CareerPage />} />
            <Route path="/research-papers" element={<ResearchPapersPage />} />
            <Route path="/research-papers/:slug" element={<PaperReaderPage />} />
            {/* Admin Routes */}
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
            <Route path="/admin/enterprise" element={<AdminEnterprisePage />} />
            <Route path="/admin/ai-pricing" element={<AdminAIPricingPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/support" element={<AdminSupportPage />} />
            <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/government" element={<AdminGovernmentPage />} />
            <Route path="/admin/national-insights" element={<AdminNationalInsightsPage />} />
            <Route path="/admin/infrastructure" element={<AdminInfrastructurePage />} />
            <Route path="/admin/governance" element={<AdminGovernancePage />} />
            <Route path="/admin/resilience" element={<AdminResiliencePage />} />
            <Route path="/admin/knowledge" element={<AdminKnowledgePage />} />
            <Route path="/admin/feed" element={<AdminFeedModerationPage />} />
            <Route path="/admin/feature-flags" element={<AdminFeatureFlagsPage />} />
            <Route path="/admin/schema" element={<AdminSchemaPage />} />
            <Route path="/admin/permissions" element={<AdminPermissionsPage />} />
            <Route path="/admin/health" element={<AdminHealthPage />} />
            <Route path="/admin/deployment" element={<AdminDeploymentPage />} />
            <Route path="/admin/security" element={<AdminSecurityPage />} />
            <Route path="/admin/ai-governance" element={<AdminAIGovernancePage />} />
            <Route path="/admin/reproducibility" element={<AdminReproducibilityPage />} />
            <Route path="/admin/federation" element={<AdminFederationPage />} />
            <Route path="/admin/stewardship" element={<AdminStewardshipPage />} />
            <Route path="/admin/premium-analytics" element={<AdminPremiumAnalyticsPage />} />
            <Route path="/admin/pricing" element={<AdminPricingPage />} />
            <Route path="/admin/operations" element={<AdminOperationsPage />} />
            <Route path="/admin/visibility-analytics" element={<AdminVisibilityAnalyticsPage />} />
            <Route path="/admin/global-talent-analytics" element={<AdminGlobalTalentAnalyticsPage />} />
            <Route path="/admin/passport-analytics" element={<AdminPassportAnalyticsPage />} />
            <Route path="/admin/global-liquidity" element={<AdminGlobalLiquidityPage />} />
            <Route path="/admin/pod-analytics" element={<AdminPodAnalyticsPage />} />
            <Route path="/admin/deal-intelligence" element={<AdminDealIntelligencePage />} />
            <Route path="/org/:id/command-center" element={<InstitutionalCommandCenterPage />} />
            <Route path="/passport" element={<PassportPage />} />
            <Route path="/market-liquidity" element={<MarketLiquidityPage />} />
            <Route path="/macro-risk" element={<MacroRiskPage />} />
            <Route path="/admin/systemic-risk" element={<AdminSystemicRiskPage />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/admin/governance-oversight" element={<AdminGovernanceOversightPage />} />
            <Route path="/constitutional-health" element={<ConstitutionalHealthPage />} />
            <Route path="/admin/constitutional-guardian" element={<AdminConstitutionalGuardianPage />} />
            <Route path="/admin/operational-health" element={<AdminOperationalHealthPage />} />
            <Route path="/admin/conversion-metrics" element={<AdminConversionMetricsPage />} />
            <Route path="/admin/institution-intelligence" element={<AdminInstitutionIntelligencePage />} />
            <Route path="/institution/apply" element={<InstitutionApplyPage />} />
            <Route path="/institutions/rankings" element={<InstitutionRankingsPage />} />
            <Route path="/org/:id/faculty-monitor" element={<FacultyMonitorPage />} />
            <Route path="/admin/institution-activation" element={<AdminInstitutionActivationPage />} />
            <Route path="/admin/revenue-dashboard" element={<AdminRevenueDashboardPage />} />
            <Route path="/org/:id/contract" element={<InstitutionContractPage />} />
            <Route path="/admin/profit-dashboard" element={<AdminProfitDashboardPage />} />
            <Route path="/admin/pricing-optimizer" element={<AdminPricingOptimizerPage />} />
            <Route path="/admin/infrastructure-costs" element={<AdminInfrastructureCostsPage />} />
            <Route path="/rankings/global" element={<GlobalRankingsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/market/liquidity" element={<MarketLiquidityPage />} />
            <Route path="/institutions/intelligence" element={<InstitutionIntelligencePage />} />
            <Route path="/career/forecast" element={<CareerForecastPage />} />
            <Route path="/global/economy" element={<GlobalEconomyPage />} />
            <Route path="/admin/limse-command" element={<AdminLIMSECommandCenter />} />
            {/* Layer 10: Capital & Credit */}
            <Route path="/capital/credit-profile" element={<CreditProfilePage />} />
            <Route path="/capital/advance" element={<CapitalAdvancePage />} />
            <Route path="/capital/pools" element={<FundingPoolsPage />} />
            <Route path="/capital/risk-intelligence" element={<CapitalRiskIntelligencePage />} />
            {/* Layers 11-15 */}
            <Route path="/governance/proposals" element={<GovernanceProposalsPage />} />
            <Route path="/governance/transparency" element={<GovernanceTransparencyPage />} />
            <Route path="/civilization/treasury" element={<CivilizationTreasuryPage />} />
            <Route path="/intelligence/global" element={<IntelligenceGlobalPage />} />
            <Route path="/predictive/global" element={<PredictiveGlobalPage />} />
            <Route path="/system/health" element={<SystemHealthPage />} />
            {/* Layers 16-19 */}
            <Route path="/federation/intelligence" element={<FederationIntelligencePage />} />
            <Route path="/infrastructure/intelligence" element={<InfrastructureIntelligencePage />} />
            <Route path="/planetary/intelligence" element={<PlanetaryIntelligencePage />} />
            <Route path="/doctrine" element={<CivilizationalDoctrinePage />} />
            <Route path="/analytics/global-liquidity" element={<GlobalLiquidityAnalyticsPage />} />
            <Route path="/developer/api-dashboard" element={<DeveloperApiDashboardPage />} />
            <Route path="/profile/reputation-export" element={<ReputationExportPage />} />
            <Route path="/admin/global-expansion" element={<AdminGlobalExpansionPage />} />
            <Route path="/governance/constitution" element={<GovernanceConstitutionPage />} />
            <Route path="/governance/decisions" element={<GovernanceDecisionsPage />} />
            <Route path="/analytics/fairness" element={<EconomicFairnessPage />} />
            <Route path="/admin/power-audit" element={<AdminPowerAuditPage />} />
            <Route path="/admin/feature-governance" element={<AdminFeatureGovernancePage />} />
            <Route path="/admin/crisis-mode" element={<AdminCrisisModePage />} />
            <Route path="/admin/evolution-simulator" element={<AdminEvolutionSimulatorPage />} />
            <Route path="/fyp/dashboard" element={<FYPDashboardPage />} />
            <Route path="/faculty/supervisor-dashboard" element={<SupervisorDashboardPage />} />
            <Route path="/analytics/academic-output" element={<AcademicOutputAnalyticsPage />} />
            <Route path="/faculty/review-queue" element={<SupervisorReviewQueuePage />} />
            <Route path="/profile/performance" element={<StudentPerformancePage />} />
            <Route path="/academic/tasks" element={<AcademicTaskMarketplacePage />} />
            <Route path="/faculty/performance" element={<SupervisorPerformancePage />} />
            <Route path="/profile/employability" element={<EmployabilityExportPage />} />
            <Route path="/academic/rankings" element={<AcademicRankingsPage />} />
            <Route path="/opportunities/dashboard" element={<OpportunityDashboardPage />} />
            <Route path="/feed/strategic" element={<StrategicFeedPage />} />
            <Route path="/my-os" element={<MyOSPage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/productivity" element={<ProductivityDashboardPage />} />
            <Route path="/documents/:id" element={<DocumentEditorPage />} />
            <Route path="/sheets/:id" element={<SpreadsheetEditorPage />} />
            <Route path="/slides/:id" element={<PresentationEditorPage />} />
            <Route path="/admin/revenue-intelligence" element={<AdminRevenueIntelligencePage />} />
            <Route path="/org/:id/academic-analytics" element={<InstitutionalAcademicAnalyticsPage />} />
            {/* REIOS */}
            <Route path="/research/execute" element={<ResearchExecutionPage />} />
            <Route path="/research/economic-impact" element={<ResearchEconomicImpactPage />} />
            <Route path="/institutions/research-intelligence" element={<InstitutionResearchIntelligencePage />} />
            <Route path="/research/match" element={<ResearchMatchPage />} />
            {/* RLCMA */}
            <Route path="/institutions/commercialization" element={<InstitutionCommercializationPage />} />
            <Route path="/institutions/epr-rankings" element={<ExecutionProductivityRankingsPage />} />
            <Route path="/industry/explore" element={<IndustryExplorePage />} />
            <Route path="/institutions/:id/commercialization" element={<InstitutionCommercializationDashboardPage />} />
            <Route path="/institutions/roi-calculator" element={<InstitutionalROICalculatorPage />} />
            <Route path="/institutions/pilot-kit" element={<PilotAcquisitionKitPage />} />
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

// App entry point — Core Engine Mode
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/context/RealtimeContext";
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
const ResearchDashboardPage = lazy(() => import("./pages/ResearchDashboardPage"));
const ResearchWorkspacePage = lazy(() => import("./pages/ResearchWorkspacePage"));
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
const AdminSystemHealthPage = lazy(() => import("./pages/admin/AdminSystemHealthPage"));
const AdminIntegrityPage = lazy(() => import("./pages/AdminIntegrityPage"));
const AdminPerformancePage = lazy(() => import("./pages/AdminPerformancePage"));
const AdminSecurityDashboardPage = lazy(() => import("./pages/AdminSecurityDashboardPage"));

// Growth & Engagement
const EngagementAnalyticsPage = lazy(() => import("./pages/EngagementAnalyticsPage"));
const InstitutionEngagementPage = lazy(() => import("./pages/InstitutionEngagementPage"));
const PublicDiscoveryPage = lazy(() => import("./pages/PublicDiscoveryPage"));

// Multi-Tenant
const InstitutionControlPanelPage = lazy(() => import("./pages/InstitutionControlPanelPage"));
const TenantBoundaryTestPage = lazy(() => import("./pages/TenantBoundaryTestPage"));

// Compliance & Governance
const GovernanceOversightPage = lazy(() => import("./pages/GovernanceOversightPage"));
const ComplianceAccessLogPage = lazy(() => import("./pages/ComplianceAccessLogPage"));
const InstitutionPoliciesPage = lazy(() => import("./pages/InstitutionPoliciesPage"));

// Executive Intelligence
const ExecutiveOverviewPage = lazy(() => import("./pages/ExecutiveOverviewPage"));

// Safe Automation
const AutomationControlPanelPage = lazy(() => import("./pages/AutomationControlPanelPage"));

// Adaptive Intelligence
const AdaptiveIntelligencePage = lazy(() => import("./pages/AdaptiveIntelligencePage"));

// Accreditation & Certification
const AccreditationDashboardPage = lazy(() => import("./pages/AccreditationDashboardPage"));
const CertificateVerificationPage = lazy(() => import("./pages/CertificateVerificationPage"));

// Institutional Expansion
const InstitutionOnboardingPage = lazy(() => import("./pages/InstitutionOnboardingPage"));
const AdoptionMetricsPage = lazy(() => import("./pages/AdoptionMetricsPage"));
const DepartmentComparisonPage = lazy(() => import("./pages/DepartmentComparisonPage"));
const InstitutionalToolkitPage = lazy(() => import("./pages/InstitutionalToolkitPage"));

// Monetization & Revenue
const RevenueDashboardPage = lazy(() => import("./pages/RevenueDashboardPage"));
const InstitutionBillingPage = lazy(() => import("./pages/InstitutionBillingPage"));
const EnterpriseSalesIntelligencePage = lazy(() => import("./pages/EnterpriseSalesIntelligencePage"));

// Predictive Modeling
const PredictiveInsightsPage = lazy(() => import("./pages/PredictiveInsightsPage"));
const RiskSimulationPage = lazy(() => import("./pages/RiskSimulationPage"));

// Governance Intelligence
const GovernanceIntelligencePage = lazy(() => import("./pages/GovernanceIntelligencePage"));
const GovernanceRiskMapPage = lazy(() => import("./pages/GovernanceRiskMapPage"));

// AI Orchestration
const OrchestrationDashboardPage = lazy(() => import("./pages/OrchestrationDashboardPage"));
const ExecutionFlowPage = lazy(() => import("./pages/ExecutionFlowPage"));

// Federation
const FederationControlPanelPage = lazy(() => import("./pages/FederationControlPanelPage"));

// Strategic Positioning
const PositioningPage = lazy(() => import("./pages/PositioningPage"));
const CompetitiveIntelligencePage = lazy(() => import("./pages/CompetitiveIntelligencePage"));
const StrategyPanelPage = lazy(() => import("./pages/StrategyPanelPage"));

// National Deployment
const NationalOversightPage = lazy(() => import("./pages/NationalOversightPage"));
const NationalRiskMapPage = lazy(() => import("./pages/NationalRiskMapPage"));
const NationalCertificateVerifyPage = lazy(() => import("./pages/NationalCertificateVerifyPage"));

// Global Federation
const GlobalOverviewPage = lazy(() => import("./pages/GlobalOverviewPage"));
const GlobalGovernanceMapPage = lazy(() => import("./pages/GlobalGovernanceMapPage"));
const GlobalCertVerifyPage = lazy(() => import("./pages/GlobalCertVerifyPage"));

// Capital Coordination
const CapitalIntelligencePage = lazy(() => import("./pages/CapitalIntelligencePage"));
const CapitalSimulationPage = lazy(() => import("./pages/CapitalSimulationPage"));

// Strategic Expansion Modules
const InstitutionalTrustGraphPage = lazy(() => import("./pages/InstitutionalTrustGraphPage"));
const FundingIntelligencePage2 = lazy(() => import("./pages/FundingIntelligencePage"));
const SovereignDashboardPage = lazy(() => import("./pages/SovereignDashboardPage"));
const ResearchAssetsPage = lazy(() => import("./pages/ResearchAssetsPage"));
const ResearchVerificationDashboardPage = lazy(() => import("./pages/ResearchVerificationDashboardPage"));
const InstitutionalIntelligenceDashboardPage = lazy(() => import("./pages/InstitutionalIntelligenceDashboardPage"));
const CapitalRiskRadarPage = lazy(() => import("./pages/CapitalRiskRadarPage"));
const ResearchAssetRegistryPage = lazy(() => import("./pages/ResearchAssetRegistryPage"));
const SovereignNodeDashboardPage2 = lazy(() => import("./pages/SovereignNodeDashboardPage"));
const CrossBorderDashboardPage = lazy(() => import("./pages/CrossBorderDashboardPage"));
const GovernanceHealthDashboardPage = lazy(() => import("./pages/GovernanceHealthDashboardPage"));
const HumanCapitalDashboardPage = lazy(() => import("./pages/HumanCapitalDashboardPage"));
const ExecutionDriftDashboardPage = lazy(() => import("./pages/ExecutionDriftDashboardPage"));
const SystemicRiskDashboardPage = lazy(() => import("./pages/SystemicRiskDashboardPage"));
const CapitalOptimizerDashboardPage = lazy(() => import("./pages/CapitalOptimizerDashboardPage"));
const InstitutionalDriftDashboardPage = lazy(() => import("./pages/InstitutionalDriftDashboardPage"));

// Platform Excellence Modules
const ProjectWorkspacePage = lazy(() => import("./pages/ProjectWorkspacePage"));
const ExecutionTimelinePage = lazy(() => import("./pages/ExecutionTimelinePage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));

// Research Workflow Modules
const MilestoneTasksPage = lazy(() => import("./pages/MilestoneTasksPage"));
const ProjectArtifactsPage = lazy(() => import("./pages/ProjectArtifactsPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const ProjectActivityPage = lazy(() => import("./pages/ProjectActivityPage"));

// Advanced Search & Discovery
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const TrendingPage = lazy(() => import("./pages/TrendingPage"));

// Execution Workspace
const ExecutionWorkspacePage = lazy(() => import("./pages/ExecutionWorkspacePage"));

// Innovation Layers
const GlobalProblemRegistryPage = lazy(() => import("./pages/innovation/GlobalProblemRegistryPage"));
const ResearchOpportunityExplorerPage = lazy(() => import("./pages/innovation/ResearchOpportunityExplorerPage"));
const CapitalIntelligencePanelPage = lazy(() => import("./pages/innovation/CapitalIntelligencePanelPage"));
const GlobalCollaborationMapPage = lazy(() => import("./pages/innovation/GlobalCollaborationMapPage"));
const ResearchLabsPage = lazy(() => import("./pages/innovation/ResearchLabsPage"));
const ReputationMarketplacePage = lazy(() => import("./pages/innovation/ReputationMarketplacePage"));
const PlanetaryTimelinePage = lazy(() => import("./pages/innovation/PlanetaryTimelinePage"));
const MarketSimulatorPage = lazy(() => import("./pages/innovation/MarketSimulatorPage"));
const TalentDiscoveryPage = lazy(() => import("./pages/innovation/TalentDiscoveryPage"));
const ProofOfExecutionPage = lazy(() => import("./pages/innovation/ProofOfExecutionPage"));
const DatasetMarketplacePage = lazy(() => import("./pages/innovation/DatasetMarketplacePage"));
const GlobalExecutionIndexPage = lazy(() => import("./pages/innovation/GlobalExecutionIndexPage"));
const ExecutionEconomyAnalyticsPage = lazy(() => import("./pages/innovation/ExecutionEconomyAnalyticsPage"));
const TalentGraphPage = lazy(() => import("./pages/innovation/TalentGraphPage"));
const InnovationLicensePage = lazy(() => import("./pages/innovation/InnovationLicensePage"));
const ResearchCapitalMarketPage = lazy(() => import("./pages/innovation/ResearchCapitalMarketPage"));
const VentureStudioPage = lazy(() => import("./pages/innovation/VentureStudioPage"));
const IndustryPartnershipPage = lazy(() => import("./pages/innovation/IndustryPartnershipPage"));
const MentorshipEconomyPage = lazy(() => import("./pages/innovation/MentorshipEconomyPage"));
const ResearchSyndicationPage = lazy(() => import("./pages/innovation/ResearchSyndicationPage"));
const InnovationAdvisorPage = lazy(() => import("./pages/innovation/InnovationAdvisorPage"));
const ProcurementExchangePage = lazy(() => import("./pages/innovation/ProcurementExchangePage"));
const ResearchImpactBondsPage = lazy(() => import("./pages/innovation/ResearchImpactBondsPage"));
const KnowledgeExchangePage = lazy(() => import("./pages/innovation/KnowledgeExchangePage"));
const PeerReviewNetworkPage = lazy(() => import("./pages/innovation/PeerReviewNetworkPage"));
const DatasetRegistryPage = lazy(() => import("./pages/innovation/DatasetRegistryPage"));
const DatasetDiscoveryPage = lazy(() => import("./pages/innovation/DatasetDiscoveryPage"));
const DatasetQualityReviewPage = lazy(() => import("./pages/innovation/DatasetQualityReviewPage"));
const VentureFactoryPage = lazy(() => import("./pages/innovation/VentureFactoryPage"));
const InvestorDiscoveryPage = lazy(() => import("./pages/innovation/InvestorDiscoveryPage"));
const IncubationWorkspacePage = lazy(() => import("./pages/innovation/IncubationWorkspacePage"));
const TalentMarketplacePage = lazy(() => import("./pages/innovation/TalentMarketplacePage"));
const OpportunityFeedPage = lazy(() => import("./pages/innovation/OpportunityFeedPage"));
const OrgDashboardPage = lazy(() => import("./pages/innovation/OrgDashboardPage"));
const AIInsightsDashboardPage = lazy(() => import("./pages/intelligence/AIInsightsDashboardPage"));
const PersonalizedFeedPage = lazy(() => import("./pages/intelligence/PersonalizedFeedPage"));
const OperatorAssistantPage = lazy(() => import("./pages/intelligence/OperatorAssistantPage"));
const InstitutionNetworkPage = lazy(() => import("./pages/network/InstitutionNetworkPage"));
const ChallengePortalPage = lazy(() => import("./pages/network/ChallengePortalPage"));
const CrossInstitutionTeamsPage = lazy(() => import("./pages/network/CrossInstitutionTeamsPage"));
const EcosystemDashboardPage = lazy(() => import("./pages/ecosystem/EcosystemDashboardPage"));
const OperatorCommandCenterPage = lazy(() => import("./pages/ecosystem/OperatorCommandCenterPage"));
const EcosystemRevenuePage = lazy(() => import("./pages/ecosystem/EcosystemRevenuePage"));
const RevenueOptimizerPage = lazy(() => import("./pages/revenue/RevenueOptimizerPage"));
const SponsorDiscoveryPage = lazy(() => import("./pages/revenue/SponsorDiscoveryPage"));
const PricingLabPage = lazy(() => import("./pages/revenue/PricingLabPage"));
const InnovationLabPage = lazy(() => import("./pages/innovation/InnovationLabPage"));
const ExpansionRoadmapPage = lazy(() => import("./pages/innovation/ExpansionRoadmapPage"));
const ImpactModelingPage = lazy(() => import("./pages/innovation/ImpactModelingPage"));

// Revenue Intelligence & Problem Marketplace
const RevenueIntelligencePage = lazy(() => import("./pages/RevenueIntelligencePage"));
const ProblemMarketplacePage = lazy(() => import("./pages/ProblemMarketplacePage"));
const ExecutionExchangePage = lazy(() => import("./pages/ExecutionExchangePage"));

// Global Problem → Execution Layer (GPE)
const GPEProblemMarketplacePage = lazy(() => import("./pages/gpe/ProblemMarketplacePage"));
const GPESponsorCommandCenterPage = lazy(() => import("./pages/gpe/SponsorCommandCenterPage"));
const GPEOperatorWorkbenchPage = lazy(() => import("./pages/gpe/OperatorWorkbenchPage"));

// Omnichannel AI Agent Layer
const OmniCommandCenterPage = lazy(() => import("./pages/omnichannel/OmniCommandCenterPage"));
const OmniCRMPage = lazy(() => import("./pages/omnichannel/OmniCRMPage"));
const OmniAnalyticsPage = lazy(() => import("./pages/omnichannel/OmniAnalyticsPage"));
const OmniCampaignsPage = lazy(() => import("./pages/omnichannel/OmniCampaignsPage"));
const OmniMarketingPage = lazy(() => import("./pages/omnichannel/OmniMarketingPage"));
const OmniGrowthPage = lazy(() => import("./pages/omnichannel/OmniGrowthPage"));
const OmniResearchDiscoveryPage = lazy(() => import("./pages/omnichannel/OmniResearchDiscoveryPage"));
const OmniRevenuePage = lazy(() => import("./pages/omnichannel/OmniRevenuePage"));
const OmniUnifiedInboxPage = lazy(() => import("./pages/omnichannel/OmniUnifiedInboxPage"));
const OmniPipelinePage = lazy(() => import("./pages/omnichannel/OmniPipelinePage"));
const OmniSupportPage = lazy(() => import("./pages/omnichannel/OmniSupportPage"));
const OmniTasksPage = lazy(() => import("./pages/omnichannel/OmniTasksPage"));
const OmniExecutiveOverviewPage = lazy(() => import("./pages/omnichannel/OmniExecutiveOverviewPage"));
const OmniKnowledgePage = lazy(() => import("./pages/omnichannel/OmniKnowledgePage"));
const OmniAgentPerformancePage = lazy(() => import("./pages/omnichannel/OmniAgentPerformancePage"));
const GrowthAutomationPage = lazy(() => import("./pages/omnichannel/GrowthAutomationPage"));
const LeadIntelligencePage = lazy(() => import("./pages/omnichannel/LeadIntelligencePage"));
const SponsorIntakePage = lazy(() => import("./pages/omnichannel/SponsorIntakePage"));
const InstitutionOnboardingAgentPage = lazy(() => import("./pages/omnichannel/InstitutionOnboardingAgentPage"));
const OpportunityMatchingPage = lazy(() => import("./pages/omnichannel/OpportunityMatchingPage"));

// Super Admin
const SuperAdminOverviewPage = lazy(() => import("./pages/super-admin/SuperAdminOverviewPage"));
const SuperAdminRiskClustersPage = lazy(() => import("./pages/super-admin/SuperAdminRiskClustersPage"));
const SuperAdminPerformancePage = lazy(() => import("./pages/super-admin/SuperAdminPerformancePage"));
const SuperAdminIntegrityPage = lazy(() => import("./pages/super-admin/SuperAdminIntegrityPage"));
const SuperAdminFederationPage = lazy(() => import("./pages/super-admin/SuperAdminFederationPage"));
const SuperAdminFeaturesPage = lazy(() => import("./pages/super-admin/SuperAdminFeaturesPage"));
const SuperAdminRevenuePage = lazy(() => import("./pages/super-admin/SuperAdminRevenuePage"));
const SuperAdminAuditLogPage = lazy(() => import("./pages/super-admin/SuperAdminAuditLogPage"));
const SuperAdminSLAOverviewPage = lazy(() => import("./pages/super-admin/SuperAdminSLAOverviewPage"));
const SLAMonitoringPage = lazy(() => import("./pages/institution/SLAMonitoringPage"));
const SuperAdminAuditMapPage = lazy(() => import("./pages/super-admin/SuperAdminAuditMapPage"));
const SuperAdminDiagnosticsPage = lazy(() => import("./pages/super-admin/SuperAdminDiagnosticsPage"));
const SuperAdminPerformanceHeatmapPage = lazy(() => import("./pages/super-admin/SuperAdminPerformanceHeatmapPage"));
const SuperAdminEventTracePage = lazy(() => import("./pages/super-admin/SuperAdminEventTracePage"));
const SuperAdminStressSimulationPage = lazy(() => import("./pages/super-admin/SuperAdminStressSimulationPage"));
const SuperAdminAlertThresholdsPage = lazy(() => import("./pages/super-admin/SuperAdminAlertThresholdsPage"));
const SuperAdminIncidentsPage = lazy(() => import("./pages/super-admin/SuperAdminIncidentsPage"));
const SuperAdminIncidentDetailPage = lazy(() => import("./pages/super-admin/SuperAdminIncidentDetailPage"));
const SuperAdminRunbooksPage = lazy(() => import("./pages/super-admin/SuperAdminRunbooksPage"));

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center gradient-hero">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading module…</p>
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
      refetchOnMount: false,
      refetchOnReconnect: true,
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
          <Route path="/home" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />

          {/* Social — Feed, Explore, Reels */}
          <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
          <Route path="/reels" element={<ProtectedRoute><ReelsPage /></ProtectedRoute>} />

          {/* Profile */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/settings" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
          <Route path="/u/:id" element={<UserPublicProfilePage />} />

          {/* FYP — Create & Execute */}
          <Route path="/fyp" element={<FYPBrowsePage />} />
          <Route path="/fyp/submit-problem" element={<ProtectedRoute><FYPSubmitProblemPage /></ProtectedRoute>} />
          <Route path="/student/fyp" element={<ProtectedRoute><StudentFYPDashboardPage /></ProtectedRoute>} />
          <Route path="/faculty/fyp" element={<ProtectedRoute><FacultyFYPCommandPage /></ProtectedRoute>} />
          <Route path="/industry/fyp" element={<ProtectedRoute><SponsorFYPDashboardPage /></ProtectedRoute>} />

          {/* Opportunities — Match & Fund */}
          <Route path="/offers" element={<OpportunitiesPage />} />
          <Route path="/offers/:id" element={<ProtectedRoute><OfferRedirectPage /></ProtectedRoute>} />
          <Route path="/opportunities/:id" element={<ProtectedRoute><OfferRedirectPage /></ProtectedRoute>} />

          {/* Deals — Escrow & Milestones */}
          <Route path="/deals" element={<ProtectedRoute><DealsPage /></ProtectedRoute>} />
          <Route path="/deals/:dealId" element={<ProtectedRoute><DealDetailPage /></ProtectedRoute>} />
          <Route path="/workroom/:offerId" element={<ProtectedRoute><WorkRoomPage /></ProtectedRoute>} />

          {/* Strategic Expansion Modules */}
          <Route path="/institutional-trust" element={<ProtectedRoute><InstitutionalTrustGraphPage /></ProtectedRoute>} />
          <Route path="/funding-intelligence" element={<ProtectedRoute><FundingIntelligencePage2 /></ProtectedRoute>} />
          <Route path="/sovereign" element={<ProtectedRoute><SovereignDashboardPage /></ProtectedRoute>} />
          <Route path="/research-assets" element={<ProtectedRoute><ResearchAssetsPage /></ProtectedRoute>} />
          <Route path="/research-verification" element={<ProtectedRoute><ResearchVerificationDashboardPage /></ProtectedRoute>} />
          <Route path="/institutional-intelligence" element={<ProtectedRoute><InstitutionalIntelligenceDashboardPage /></ProtectedRoute>} />
          <Route path="/capital-risk-radar" element={<ProtectedRoute><CapitalRiskRadarPage /></ProtectedRoute>} />
          <Route path="/research-asset-registry" element={<ProtectedRoute><ResearchAssetRegistryPage /></ProtectedRoute>} />
          <Route path="/sovereign-node" element={<ProtectedRoute><SovereignNodeDashboardPage2 /></ProtectedRoute>} />
          <Route path="/cross-border" element={<ProtectedRoute><CrossBorderDashboardPage /></ProtectedRoute>} />
          <Route path="/governance-health" element={<ProtectedRoute><GovernanceHealthDashboardPage /></ProtectedRoute>} />
          <Route path="/human-capital" element={<ProtectedRoute><HumanCapitalDashboardPage /></ProtectedRoute>} />
          <Route path="/execution-drift" element={<ProtectedRoute><ExecutionDriftDashboardPage /></ProtectedRoute>} />
          <Route path="/systemic-risk" element={<ProtectedRoute><SystemicRiskDashboardPage /></ProtectedRoute>} />
          <Route path="/capital-optimizer" element={<ProtectedRoute><CapitalOptimizerDashboardPage /></ProtectedRoute>} />
          <Route path="/institutional-drift" element={<ProtectedRoute><InstitutionalDriftDashboardPage /></ProtectedRoute>} />

          {/* Platform Excellence Modules */}
          <Route path="/workspace/:projectId" element={<ProtectedRoute><ProjectWorkspacePage /></ProtectedRoute>} />
          <Route path="/project/:id/workspace" element={<ProtectedRoute><ExecutionWorkspacePage /></ProtectedRoute>} />
          <Route path="/execution-timeline/:projectId" element={<ProtectedRoute><ExecutionTimelinePage /></ProtectedRoute>} />
          <Route path="/execution-timeline" element={<ProtectedRoute><ExecutionTimelinePage /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<PublicProfilePage />} />

          {/* Research Workflow Modules */}
          <Route path="/milestone/:milestoneId/tasks" element={<ProtectedRoute><MilestoneTasksPage /></ProtectedRoute>} />
          <Route path="/project/:projectId/artifacts" element={<ProtectedRoute><ProjectArtifactsPage /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
          <Route path="/project/:projectId/activity" element={<ProtectedRoute><ProjectActivityPage /></ProtectedRoute>} />

          {/* Verification — Trust */}
          <Route path="/verification" element={<ProtectedRoute><VerificationCenterPage /></ProtectedRoute>} />

          {/* Messages */}
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/messages/:threadId" element={<ProtectedRoute><MessageThreadPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* Search & Discovery */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
          <Route path="/discover/public" element={<PublicDiscoveryPage />} />
          <Route path="/trending" element={<ProtectedRoute><TrendingPage /></ProtectedRoute>} />

          {/* Faculty */}
          <Route path="/faculty/supervisor-dashboard" element={<ProtectedRoute><SupervisorDashboardPage /></ProtectedRoute>} />
          <Route path="/faculty/review-queue" element={<ProtectedRoute><SupervisorReviewQueuePage /></ProtectedRoute>} />

          {/* Documents — Contract enforcement */}
          <Route path="/documents/:id" element={<ProtectedRoute><DocumentEditorPage /></ProtectedRoute>} />

          {/* Games */}
          <Route path="/games" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />

          {/* ====== RESTORED FEATURE SECTIONS ====== */}
          <Route path="/earn" element={<ProtectedRoute><EarnPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
          <Route path="/career" element={<ProtectedRoute><CareerPage /></ProtectedRoute>} />
          <Route path="/passport" element={<ProtectedRoute><PassportPage /></ProtectedRoute>} />
          <Route path="/research-papers" element={<ProtectedRoute><ResearchPapersPage /></ProtectedRoute>} />
          <Route path="/grants" element={<ProtectedRoute><GrantsPage /></ProtectedRoute>} />
          <Route path="/tools" element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/hr" element={<ProtectedRoute><HRPage /></ProtectedRoute>} />
          <Route path="/automation" element={<ProtectedRoute><AutomationPage /></ProtectedRoute>} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/new" element={<ProtectedRoute><BlogEditorPage /></ProtectedRoute>} />
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
          <Route path="/governance" element={<ProtectedRoute><GovernancePage /></ProtectedRoute>} />
          <Route path="/social" element={<ProtectedRoute><SocialFeaturesPage /></ProtectedRoute>} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/equity" element={<ProtectedRoute><EquityDashboardPage /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/features" element={<FeaturesShowcasePage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/press" element={<PressKitPage />} />
          <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettingsPage /></ProtectedRoute>} />
          <Route path="/project-management" element={<ProtectedRoute><ProjectManagementPage /></ProtectedRoute>} />

          {/* ====== ADMIN (all protected + AdminLayout handles role check) ====== */}
          <Route path="/admin" element={<ProtectedRoute><AdminPortalPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/tools" element={<ProtectedRoute><AdminToolsPage /></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute><AdminProjectsPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} />
          <Route path="/admin/finance" element={<ProtectedRoute><AdminFinancePage /></ProtectedRoute>} />
          <Route path="/admin/fulfillment" element={<ProtectedRoute><AdminFulfillmentPage /></ProtectedRoute>} />
          <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminSubscriptionsPage /></ProtectedRoute>} />
          <Route path="/admin/affiliates" element={<ProtectedRoute><AdminAffiliatePage /></ProtectedRoute>} />
          <Route path="/admin/verifications" element={<ProtectedRoute><AdminVerificationsPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute><AdminSupportPage /></ProtectedRoute>} />
          <Route path="/admin/audit-log" element={<ProtectedRoute><AdminAuditLogPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/feature-flags" element={<ProtectedRoute><AdminFeatureFlagsPage /></ProtectedRoute>} />
          <Route path="/admin/permissions" element={<ProtectedRoute><AdminPermissionsPage /></ProtectedRoute>} />
          <Route path="/admin/health" element={<ProtectedRoute><AdminHealthPage /></ProtectedRoute>} />
          <Route path="/admin/security" element={<ProtectedRoute><AdminSecurityPage /></ProtectedRoute>} />
          <Route path="/admin/operations" element={<ProtectedRoute><AdminOperationsPage /></ProtectedRoute>} />
          <Route path="/admin/feed" element={<ProtectedRoute><AdminFeedModerationPage /></ProtectedRoute>} />
          <Route path="/admin/governance" element={<ProtectedRoute><AdminGovernancePage /></ProtectedRoute>} />
          <Route path="/admin/compliance" element={<ProtectedRoute><AdminComplianceDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/schema" element={<ProtectedRoute><AdminSchemaPage /></ProtectedRoute>} />
          <Route path="/admin/pilot" element={<ProtectedRoute><PilotDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/sponsor-pipeline" element={<ProtectedRoute><SponsorPipelinePage /></ProtectedRoute>} />
          <Route path="/admin/sponsor-roi" element={<ProtectedRoute><SponsorROIDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/capital-flow" element={<ProtectedRoute><CapitalFlowDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/hiring-conversions" element={<ProtectedRoute><HiringConversionPage /></ProtectedRoute>} />
          <Route path="/admin/refunding-triggers" element={<ProtectedRoute><RefundingTriggersPage /></ProtectedRoute>} />
          <Route path="/admin/fyp-velocity" element={<ProtectedRoute><FYPVelocityPage /></ProtectedRoute>} />
          <Route path="/admin/sponsor-intelligence" element={<ProtectedRoute><SponsorIntelligencePage /></ProtectedRoute>} />
          <Route path="/admin/financial-intelligence" element={<ProtectedRoute><FinancialIntelligencePage /></ProtectedRoute>} />
          <Route path="/admin/university-impact" element={<ProtectedRoute><UniversityImpactDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/sales-data-pack" element={<ProtectedRoute><SalesDataPackPage /></ProtectedRoute>} />
          <Route path="/admin/intelligence" element={<ProtectedRoute><IntelligenceDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/system-health" element={<ProtectedRoute><AdminSystemHealthPage /></ProtectedRoute>} />
          <Route path="/admin/integrity" element={<ProtectedRoute><AdminIntegrityPage /></ProtectedRoute>} />
          <Route path="/admin/performance" element={<ProtectedRoute><AdminPerformancePage /></ProtectedRoute>} />
          <Route path="/admin/security-dashboard" element={<ProtectedRoute><AdminSecurityDashboardPage /></ProtectedRoute>} />
          <Route path="/analytics/engagement" element={<ProtectedRoute><EngagementAnalyticsPage /></ProtectedRoute>} />
          <Route path="/institution/engagement" element={<ProtectedRoute><InstitutionEngagementPage /></ProtectedRoute>} />
          <Route path="/institution/control-panel" element={<ProtectedRoute><InstitutionControlPanelPage /></ProtectedRoute>} />
          <Route path="/admin/tenant-boundary-test" element={<ProtectedRoute><TenantBoundaryTestPage /></ProtectedRoute>} />
          <Route path="/institution/governance" element={<ProtectedRoute><GovernanceOversightPage /></ProtectedRoute>} />
          <Route path="/institution/compliance-access-log" element={<ProtectedRoute><ComplianceAccessLogPage /></ProtectedRoute>} />
          <Route path="/institution/policies" element={<ProtectedRoute><InstitutionPoliciesPage /></ProtectedRoute>} />
          <Route path="/institution/executive" element={<ProtectedRoute><ExecutiveOverviewPage /></ProtectedRoute>} />
          <Route path="/institution/automation" element={<ProtectedRoute><AutomationControlPanelPage /></ProtectedRoute>} />
          <Route path="/institution/adaptive-intelligence" element={<ProtectedRoute><AdaptiveIntelligencePage /></ProtectedRoute>} />
          <Route path="/institution/accreditation" element={<ProtectedRoute><AccreditationDashboardPage /></ProtectedRoute>} />
          <Route path="/institution/onboarding" element={<ProtectedRoute><InstitutionOnboardingPage /></ProtectedRoute>} />
          <Route path="/institution/adoption" element={<ProtectedRoute><AdoptionMetricsPage /></ProtectedRoute>} />
          <Route path="/institution/departments" element={<ProtectedRoute><DepartmentComparisonPage /></ProtectedRoute>} />
          <Route path="/institution/toolkit" element={<ProtectedRoute><InstitutionalToolkitPage /></ProtectedRoute>} />
          <Route path="/institution/billing" element={<ProtectedRoute><InstitutionBillingPage /></ProtectedRoute>} />
          <Route path="/institution/governance-risk-map" element={<ProtectedRoute><GovernanceRiskMapPage /></ProtectedRoute>} />
          <Route path="/admin/revenue" element={<ProtectedRoute><RevenueDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/enterprise-intelligence" element={<ProtectedRoute><EnterpriseSalesIntelligencePage /></ProtectedRoute>} />
          <Route path="/admin/predictive-insights" element={<ProtectedRoute><PredictiveInsightsPage /></ProtectedRoute>} />
          <Route path="/admin/simulation" element={<ProtectedRoute><RiskSimulationPage /></ProtectedRoute>} />
          <Route path="/admin/governance-intelligence" element={<ProtectedRoute><GovernanceIntelligencePage /></ProtectedRoute>} />
          <Route path="/admin/orchestration" element={<ProtectedRoute><OrchestrationDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/execution-flow" element={<ProtectedRoute><ExecutionFlowPage /></ProtectedRoute>} />
          <Route path="/admin/federation" element={<ProtectedRoute><FederationControlPanelPage /></ProtectedRoute>} />
          <Route path="/admin/positioning" element={<ProtectedRoute><PositioningPage /></ProtectedRoute>} />
          <Route path="/admin/competitive-intelligence" element={<ProtectedRoute><CompetitiveIntelligencePage /></ProtectedRoute>} />
          <Route path="/admin/strategy" element={<ProtectedRoute><StrategyPanelPage /></ProtectedRoute>} />
          <Route path="/national/oversight" element={<ProtectedRoute><NationalOversightPage /></ProtectedRoute>} />
          <Route path="/national/risk-map" element={<ProtectedRoute><NationalRiskMapPage /></ProtectedRoute>} />
          <Route path="/national/verify/:certificateId" element={<NationalCertificateVerifyPage />} />
          <Route path="/national/verify" element={<NationalCertificateVerifyPage />} />
          <Route path="/global/overview" element={<ProtectedRoute><GlobalOverviewPage /></ProtectedRoute>} />
          <Route path="/global/governance-map" element={<ProtectedRoute><GlobalGovernanceMapPage /></ProtectedRoute>} />
          <Route path="/global/verify/:certHash" element={<GlobalCertVerifyPage />} />
          <Route path="/global/verify" element={<GlobalCertVerifyPage />} />
          <Route path="/institution/capital-intelligence" element={<ProtectedRoute><CapitalIntelligencePage /></ProtectedRoute>} />
          <Route path="/admin/capital-simulation" element={<ProtectedRoute><CapitalSimulationPage /></ProtectedRoute>} />
          <Route path="/verify/:certificateId" element={<CertificateVerificationPage />} />
          <Route path="/verify" element={<CertificateVerificationPage />} />
          <Route path="/my-outcomes" element={<ProtectedRoute><StudentOutcomePage /></ProtectedRoute>} />
          {/* ====== INNOVATION LAYERS ====== */}
          <Route path="/innovation/problems" element={<ProtectedRoute><GlobalProblemRegistryPage /></ProtectedRoute>} />
          <Route path="/innovation/opportunities" element={<ProtectedRoute><ResearchOpportunityExplorerPage /></ProtectedRoute>} />
          <Route path="/innovation/capital-intelligence" element={<ProtectedRoute><CapitalIntelligencePanelPage /></ProtectedRoute>} />
          <Route path="/innovation/collaboration-map" element={<ProtectedRoute><GlobalCollaborationMapPage /></ProtectedRoute>} />
          <Route path="/innovation/labs" element={<ProtectedRoute><ResearchLabsPage /></ProtectedRoute>} />
          <Route path="/innovation/reputation-market" element={<ProtectedRoute><ReputationMarketplacePage /></ProtectedRoute>} />
          <Route path="/innovation/timeline" element={<ProtectedRoute><PlanetaryTimelinePage /></ProtectedRoute>} />
          <Route path="/innovation/simulator" element={<ProtectedRoute><MarketSimulatorPage /></ProtectedRoute>} />
          <Route path="/innovation/talent" element={<ProtectedRoute><TalentDiscoveryPage /></ProtectedRoute>} />
          <Route path="/innovation/proof-of-execution" element={<ProtectedRoute><ProofOfExecutionPage /></ProtectedRoute>} />
          <Route path="/innovation/datasets" element={<ProtectedRoute><DatasetMarketplacePage /></ProtectedRoute>} />
          <Route path="/innovation/execution-index" element={<ProtectedRoute><GlobalExecutionIndexPage /></ProtectedRoute>} />
          <Route path="/innovation/economy-analytics" element={<ProtectedRoute><ExecutionEconomyAnalyticsPage /></ProtectedRoute>} />
          <Route path="/innovation/talent-graph" element={<ProtectedRoute><TalentGraphPage /></ProtectedRoute>} />
          <Route path="/innovation/licensing" element={<ProtectedRoute><InnovationLicensePage /></ProtectedRoute>} />
          <Route path="/innovation/capital-market" element={<ProtectedRoute><ResearchCapitalMarketPage /></ProtectedRoute>} />
          <Route path="/innovation/venture-studio" element={<ProtectedRoute><VentureStudioPage /></ProtectedRoute>} />
          <Route path="/innovation/industry-partnerships" element={<ProtectedRoute><IndustryPartnershipPage /></ProtectedRoute>} />
          <Route path="/innovation/mentorship-economy" element={<ProtectedRoute><MentorshipEconomyPage /></ProtectedRoute>} />
          <Route path="/innovation/research-syndication" element={<ProtectedRoute><ResearchSyndicationPage /></ProtectedRoute>} />
          <Route path="/innovation/innovation-advisor" element={<ProtectedRoute><InnovationAdvisorPage /></ProtectedRoute>} />
          <Route path="/innovation/procurement" element={<ProtectedRoute><ProcurementExchangePage /></ProtectedRoute>} />
          <Route path="/innovation/impact-bonds" element={<ProtectedRoute><ResearchImpactBondsPage /></ProtectedRoute>} />
          <Route path="/innovation/knowledge-exchange" element={<ProtectedRoute><KnowledgeExchangePage /></ProtectedRoute>} />
          <Route path="/innovation/peer-review" element={<ProtectedRoute><PeerReviewNetworkPage /></ProtectedRoute>} />
          <Route path="/innovation/dataset-registry" element={<ProtectedRoute><DatasetRegistryPage /></ProtectedRoute>} />
          <Route path="/innovation/dataset-discovery" element={<ProtectedRoute><DatasetDiscoveryPage /></ProtectedRoute>} />
          <Route path="/innovation/dataset-quality-review" element={<ProtectedRoute><DatasetQualityReviewPage /></ProtectedRoute>} />
          <Route path="/innovation/venture-factory" element={<ProtectedRoute><VentureFactoryPage /></ProtectedRoute>} />
          <Route path="/innovation/investor-discovery" element={<ProtectedRoute><InvestorDiscoveryPage /></ProtectedRoute>} />
          <Route path="/innovation/incubation-workspace" element={<ProtectedRoute><IncubationWorkspacePage /></ProtectedRoute>} />
          <Route path="/innovation/talent-marketplace" element={<ProtectedRoute><TalentMarketplacePage /></ProtectedRoute>} />
          <Route path="/innovation/opportunity-feed" element={<ProtectedRoute><OpportunityFeedPage /></ProtectedRoute>} />
          <Route path="/innovation/org-dashboard" element={<ProtectedRoute><OrgDashboardPage /></ProtectedRoute>} />
          <Route path="/intelligence/ai-insights" element={<ProtectedRoute><AIInsightsDashboardPage /></ProtectedRoute>} />
          <Route path="/intelligence/personalized-feed" element={<ProtectedRoute><PersonalizedFeedPage /></ProtectedRoute>} />
          <Route path="/intelligence/operator-assistant" element={<ProtectedRoute><OperatorAssistantPage /></ProtectedRoute>} />
          <Route path="/network/institution-network" element={<ProtectedRoute><InstitutionNetworkPage /></ProtectedRoute>} />
          <Route path="/network/challenge-portal" element={<ProtectedRoute><ChallengePortalPage /></ProtectedRoute>} />
          <Route path="/network/cross-institution-teams" element={<ProtectedRoute><CrossInstitutionTeamsPage /></ProtectedRoute>} />
          <Route path="/ecosystem/dashboard" element={<ProtectedRoute><EcosystemDashboardPage /></ProtectedRoute>} />
          <Route path="/ecosystem/command-center" element={<ProtectedRoute><OperatorCommandCenterPage /></ProtectedRoute>} />
          <Route path="/ecosystem/revenue" element={<ProtectedRoute><EcosystemRevenuePage /></ProtectedRoute>} />
          <Route path="/revenue/optimizer" element={<ProtectedRoute><RevenueOptimizerPage /></ProtectedRoute>} />
          <Route path="/revenue/sponsor-discovery" element={<ProtectedRoute><SponsorDiscoveryPage /></ProtectedRoute>} />
          <Route path="/revenue/pricing-lab" element={<ProtectedRoute><PricingLabPage /></ProtectedRoute>} />

          {/* ====== REVENUE INTELLIGENCE & PROBLEM MARKETPLACE ====== */}
          <Route path="/revenue-intelligence" element={<ProtectedRoute><RevenueIntelligencePage /></ProtectedRoute>} />
          <Route path="/problem-marketplace" element={<ProtectedRoute><ProblemMarketplacePage /></ProtectedRoute>} />
          <Route path="/execution-exchange" element={<ProtectedRoute><ExecutionExchangePage /></ProtectedRoute>} />

          {/* ====== GLOBAL PROBLEM → EXECUTION LAYER (GPE) ====== */}
          <Route path="/gpe/marketplace" element={<ProtectedRoute><GPEProblemMarketplacePage /></ProtectedRoute>} />
          <Route path="/gpe/sponsor" element={<ProtectedRoute><GPESponsorCommandCenterPage /></ProtectedRoute>} />
          <Route path="/gpe/operator" element={<ProtectedRoute><GPEOperatorWorkbenchPage /></ProtectedRoute>} />

          {/* ====== OMNICHANNEL AI AGENT LAYER ====== */}
          <Route path="/omni/command-center" element={<ProtectedRoute><OmniCommandCenterPage /></ProtectedRoute>} />
          <Route path="/omni/crm" element={<ProtectedRoute><OmniCRMPage /></ProtectedRoute>} />
          <Route path="/omni/analytics" element={<ProtectedRoute><OmniAnalyticsPage /></ProtectedRoute>} />
          <Route path="/omni/campaigns" element={<ProtectedRoute><OmniCampaignsPage /></ProtectedRoute>} />
          <Route path="/omni/marketing" element={<ProtectedRoute><OmniMarketingPage /></ProtectedRoute>} />
          <Route path="/omni/growth" element={<ProtectedRoute><OmniGrowthPage /></ProtectedRoute>} />
          <Route path="/omni/research-discovery" element={<ProtectedRoute><OmniResearchDiscoveryPage /></ProtectedRoute>} />
          <Route path="/omni/revenue" element={<ProtectedRoute><OmniRevenuePage /></ProtectedRoute>} />
          <Route path="/omni/inbox" element={<ProtectedRoute><OmniUnifiedInboxPage /></ProtectedRoute>} />
          <Route path="/omni/pipeline" element={<ProtectedRoute><OmniPipelinePage /></ProtectedRoute>} />
          <Route path="/omni/support" element={<ProtectedRoute><OmniSupportPage /></ProtectedRoute>} />
          <Route path="/omni/tasks" element={<ProtectedRoute><OmniTasksPage /></ProtectedRoute>} />
          <Route path="/omni/executive" element={<ProtectedRoute><OmniExecutiveOverviewPage /></ProtectedRoute>} />
          <Route path="/omni/knowledge" element={<ProtectedRoute><OmniKnowledgePage /></ProtectedRoute>} />
          <Route path="/omni/agent-performance" element={<ProtectedRoute><OmniAgentPerformancePage /></ProtectedRoute>} />
          <Route path="/omni/growth-automation" element={<ProtectedRoute><GrowthAutomationPage /></ProtectedRoute>} />
          <Route path="/omni/lead-intelligence" element={<ProtectedRoute><LeadIntelligencePage /></ProtectedRoute>} />
          <Route path="/omni/sponsor-intake" element={<ProtectedRoute><SponsorIntakePage /></ProtectedRoute>} />
          <Route path="/omni/institution-onboarding-agent" element={<ProtectedRoute><InstitutionOnboardingAgentPage /></ProtectedRoute>} />
          <Route path="/omni/opportunity-matching" element={<ProtectedRoute><OpportunityMatchingPage /></ProtectedRoute>} />

          {/* ====== SUPER ADMIN ====== */}
          <Route path="/super-admin/overview" element={<ProtectedRoute><SuperAdminOverviewPage /></ProtectedRoute>} />
          <Route path="/super-admin/risk-clusters" element={<ProtectedRoute><SuperAdminRiskClustersPage /></ProtectedRoute>} />
          <Route path="/super-admin/performance" element={<ProtectedRoute><SuperAdminPerformancePage /></ProtectedRoute>} />
          <Route path="/super-admin/integrity" element={<ProtectedRoute><SuperAdminIntegrityPage /></ProtectedRoute>} />
          <Route path="/super-admin/federation" element={<ProtectedRoute><SuperAdminFederationPage /></ProtectedRoute>} />
          <Route path="/super-admin/features" element={<ProtectedRoute><SuperAdminFeaturesPage /></ProtectedRoute>} />
          <Route path="/super-admin/revenue" element={<ProtectedRoute><SuperAdminRevenuePage /></ProtectedRoute>} />
          <Route path="/super-admin/audit-log" element={<ProtectedRoute><SuperAdminAuditLogPage /></ProtectedRoute>} />
          <Route path="/super-admin/sla-overview" element={<ProtectedRoute><SuperAdminSLAOverviewPage /></ProtectedRoute>} />
          <Route path="/institution/sla-monitoring" element={<ProtectedRoute><SLAMonitoringPage /></ProtectedRoute>} />
          <Route path="/super-admin/audit-map" element={<ProtectedRoute><SuperAdminAuditMapPage /></ProtectedRoute>} />
          <Route path="/super-admin/diagnostics" element={<ProtectedRoute><SuperAdminDiagnosticsPage /></ProtectedRoute>} />
          <Route path="/super-admin/performance-heatmap" element={<ProtectedRoute><SuperAdminPerformanceHeatmapPage /></ProtectedRoute>} />
          <Route path="/super-admin/event-trace/:traceId?" element={<ProtectedRoute><SuperAdminEventTracePage /></ProtectedRoute>} />
          <Route path="/super-admin/stress-simulation" element={<ProtectedRoute><SuperAdminStressSimulationPage /></ProtectedRoute>} />
          <Route path="/super-admin/alert-thresholds" element={<ProtectedRoute><SuperAdminAlertThresholdsPage /></ProtectedRoute>} />
          <Route path="/super-admin/incidents" element={<ProtectedRoute><SuperAdminIncidentsPage /></ProtectedRoute>} />
          <Route path="/super-admin/incidents/:id" element={<ProtectedRoute><SuperAdminIncidentDetailPage /></ProtectedRoute>} />
          <Route path="/super-admin/runbooks" element={<ProtectedRoute><SuperAdminRunbooksPage /></ProtectedRoute>} />
          {/* ====== REDIRECTS — Everything else → Core ====== */}
          {/* Dashboard consolidation */}
          <Route path="/dashboard/*" element={<Navigate to="/home" replace />} />
          <Route path="/inbox" element={<Navigate to="/notifications" replace />} />
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
          <Route path="/earn/*" element={<Navigate to="/earn" replace />} />
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

          {/* Research sub-routes */}
          <Route path="/research-papers/*" element={<Navigate to="/research-papers" replace />} />
          <Route path="/research" element={<ProtectedRoute><ResearchDashboardPage /></ProtectedRoute>} />
          <Route path="/research/:workspaceId" element={<ProtectedRoute><ResearchWorkspacePage /></ProtectedRoute>} />

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

          {/* Blog edit routes redirect */}
          <Route path="/blog/edit/:id" element={<BlogEditorPage />} />

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
                <RealtimeProvider>
                  <DemoWalkthroughProvider>
                    <AppContent />
                    <TourLaunchButton />
                    <WalkthroughOverlay />
                  </DemoWalkthroughProvider>
                </RealtimeProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;

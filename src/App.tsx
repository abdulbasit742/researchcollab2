// App entry point
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { RouteProgress } from "@/components/layout/RouteProgress";
import { LoadingScreen } from "@/components/loading";
import { useAppLoading } from "@/hooks/useAppLoading";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import ResearcherDashboard from "./pages/dashboard/ResearcherDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ToolsPage from "./pages/ToolsPage";
import CollaborationsPage from "./pages/CollaborationsPage";
import EarnPage from "./pages/EarnPage";
import EarnProjectDetailPage from "./pages/EarnProjectDetailPage";
import FYPServicesPage from "./pages/FYPServicesPage";
import GrantsPage from "./pages/GrantsPage";
import MatchesPage from "./pages/MatchesPage";
import SmartMatchingPage from "./pages/SmartMatchingPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import ResearcherProfilePage from "./pages/ResearcherProfilePage";
import ResearcherPublicProfilePage from "./pages/ResearcherPublicProfilePage";
import UserPublicProfilePage from "./pages/UserPublicProfilePage";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import OffersPage from "./pages/OffersPage";
import OfferDetailPage from "./pages/OfferDetailPage";
import WorkRoomPage from "./pages/WorkRoomPage";
import JobsPage from "./pages/JobsPage";
import WalletPage from "./pages/WalletPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import AffiliateDashboardPage from "./pages/AffiliateDashboardPage";
import AffiliateAssetsPage from "./pages/AffiliateAssetsPage";
import VerificationCenterPage from "./pages/VerificationCenterPage";
import StudentVerificationPage from "./pages/StudentVerificationPage";
import ResearcherVerificationPage from "./pages/ResearcherVerificationPage";
import PartnerVerificationPage from "./pages/PartnerVerificationPage";
import OrganizationsListPage from "./pages/OrganizationsListPage";
import OrganizationDashboardPage from "./pages/OrganizationDashboardPage";
import OrganizationMembersPage from "./pages/OrganizationMembersPage";
import OrganizationToolsPage from "./pages/OrganizationToolsPage";
import OrganizationProjectsPage from "./pages/OrganizationProjectsPage";
import OrganizationBillingPage from "./pages/OrganizationBillingPage";
import AIProjectScopePage from "./pages/AIProjectScopePage";
import MessagesPage from "./pages/MessagesPage";
import MessageThreadPage from "./pages/MessageThreadPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import ApiDocsPage from "./pages/ApiDocsPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import CareersPage from "./pages/CareersPage";
import NotFound from "./pages/NotFound";
// Admin pages
import AdminPortalPage from "./pages/AdminPortalPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminToolsPage from "./pages/admin/AdminToolsPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminFinancePage from "./pages/AdminFinancePage";
import AdminFulfillmentPage from "./pages/AdminFulfillmentPage";
import AdminSubscriptionsPage from "./pages/AdminSubscriptionsPage";
import AdminAffiliatePage from "./pages/AdminAffiliatePage";
import AdminVerificationsPage from "./pages/AdminVerificationsPage";
import AdminEnterprisePage from "./pages/AdminEnterprisePage";
import AdminAIPricingPage from "./pages/AdminAIPricingPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminSupportPage from "./pages/AdminSupportPage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminGovernmentPage from "./pages/admin/AdminGovernmentPage";
import AdminNationalInsightsPage from "./pages/admin/AdminNationalInsightsPage";
import AdminInfrastructurePage from "./pages/admin/AdminInfrastructurePage";
import AdminGovernancePage from "./pages/admin/AdminGovernancePage";
import AdminResiliencePage from "./pages/admin/AdminResiliencePage";
import AdminKnowledgePage from "./pages/admin/AdminKnowledgePage";
import AdminFeedModerationPage from "./pages/admin/AdminFeedModerationPage";
import AdminFeatureFlagsPage from "./pages/admin/AdminFeatureFlagsPage";
import AdminSchemaPage from "./pages/admin/AdminSchemaPage";
import AdminPermissionsPage from "./pages/admin/AdminPermissionsPage";
import AdminHealthPage from "./pages/admin/AdminHealthPage";
import AdminDeploymentPage from "./pages/admin/AdminDeploymentPage";
import AdminSecurityPage from "./pages/admin/AdminSecurityPage";
import AdminAIGovernancePage from "./pages/admin/AdminAIGovernancePage";
import AdminReproducibilityPage from "./pages/admin/AdminReproducibilityPage";
import AdminFederationPage from "./pages/admin/AdminFederationPage";
import FeedPage from "./pages/FeedPage";
import HomeDashboard from "./pages/HomeDashboard";
import PostDetailPage from "./pages/PostDetailPage";
import NetworkPage from "./pages/NetworkPage";
import SearchPage from "./pages/SearchPage";
import OutcomeFeedPage from "./pages/OutcomeFeedPage";
import RealityFeedPage from "./pages/RealityFeedPage";
import AdminStewardshipPage from "./pages/admin/AdminStewardshipPage";
import AdminOperationsPage from "./pages/admin/AdminOperationsPage";
import PressKitPage from "./pages/PressKitPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import OrganizationPage from "./pages/OrganizationPage";
import ProgressPage from "./pages/ProgressPage";
import DealsPage from "./pages/DealsPage";
import DealDetailPage from "./pages/DealDetailPage";
import PremiumOnboardingPage from "./pages/PremiumOnboardingPage";
import AdminPremiumAnalyticsPage from "./pages/admin/AdminPremiumAnalyticsPage";
import AdminPricingPage from "./pages/admin/AdminPricingPage";
import FeaturesShowcasePage from "./pages/FeaturesShowcasePage";
import LearningPage from "./pages/LearningPage";
import EventsPage from "./pages/EventsPage";
import HRPage from "./pages/HRPage";
import AutomationPage from "./pages/AutomationPage";
import ProjectManagementPage from "./pages/ProjectManagementPage";
import SocialFeaturesPage from "./pages/SocialFeaturesPage";
import AmbientPage from "./pages/AmbientPage";
import CollectiveIntelligencePage from "./pages/CollectiveIntelligencePage";
 import BriefingsPage from "./pages/BriefingsPage";
 import ProfileSettingsPage from "./pages/ProfileSettingsPage";
 import CareerPage from "./pages/CareerPage";
const queryClient = new QueryClient();

const AppContent = () => {
  const { isLoading, progress, isComplete } = useAppLoading();

  return (
    <>
      <LoadingScreen isLoading={isLoading} progress={progress} isComplete={isComplete} />
      <RouteProgress />
      <ScrollRestoration />
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
            <Route path="/earn/jobs" element={<JobsPage />} />
            <Route path="/fyp-services" element={<FYPServicesPage />} />
            <Route path="/grants" element={<GrantsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/smart-matching" element={<SmartMatchingPage />} />
            <Route path="/profile/student" element={<StudentProfilePage />} />
            <Route path="/profile/student/:id" element={<StudentProfilePage />} />
            <Route path="/profile/researcher" element={<ResearcherProfilePage />} />
            <Route path="/profile/researcher/:id" element={<ResearcherProfilePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/offers" element={<OpportunitiesPage />} />
            <Route path="/offers/:id" element={<OfferDetailPage />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

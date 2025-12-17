import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ToolsPage from "./pages/ToolsPage";
import CollaborationsPage from "./pages/CollaborationsPage";
import EarnPage from "./pages/EarnPage";
import FYPServicesPage from "./pages/FYPServicesPage";
import GrantsPage from "./pages/GrantsPage";
import MatchesPage from "./pages/MatchesPage";
import SmartMatchingPage from "./pages/SmartMatchingPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import ResearcherProfilePage from "./pages/ResearcherProfilePage";
import BlogPage from "./pages/BlogPage";
import OffersPage from "./pages/OffersPage";
import OfferDetailPage from "./pages/OfferDetailPage";
import WorkRoomPage from "./pages/WorkRoomPage";
import JobsPage from "./pages/JobsPage";
import AdminFinancePage from "./pages/AdminFinancePage";
import WalletPage from "./pages/WalletPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import AdminFulfillmentPage from "./pages/AdminFulfillmentPage";
import AdminSubscriptionsPage from "./pages/AdminSubscriptionsPage";
import AffiliateDashboardPage from "./pages/AffiliateDashboardPage";
import AffiliateAssetsPage from "./pages/AffiliateAssetsPage";
import AdminAffiliatePage from "./pages/AdminAffiliatePage";
import VerificationCenterPage from "./pages/VerificationCenterPage";
import StudentVerificationPage from "./pages/StudentVerificationPage";
import ResearcherVerificationPage from "./pages/ResearcherVerificationPage";
import PartnerVerificationPage from "./pages/PartnerVerificationPage";
import AdminVerificationsPage from "./pages/AdminVerificationsPage";
import OrganizationsListPage from "./pages/OrganizationsListPage";
import OrganizationDashboardPage from "./pages/OrganizationDashboardPage";
import OrganizationMembersPage from "./pages/OrganizationMembersPage";
import OrganizationToolsPage from "./pages/OrganizationToolsPage";
import OrganizationProjectsPage from "./pages/OrganizationProjectsPage";
import OrganizationBillingPage from "./pages/OrganizationBillingPage";
import AIProjectScopePage from "./pages/AIProjectScopePage";
import AdminAIPricingPage from "./pages/AdminAIPricingPage";
import AdminEnterprisePage from "./pages/AdminEnterprisePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/collaborations" element={<CollaborationsPage />} />
            <Route path="/earn" element={<EarnPage />} />
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
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/offers/:id" element={<OfferDetailPage />} />
            <Route path="/workroom/:offerId" element={<WorkRoomPage />} />
            <Route path="/admin/finance" element={<AdminFinancePage />} />
            <Route path="/admin/fulfillment" element={<AdminFulfillmentPage />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="/admin/affiliates" element={<AdminAffiliatePage />} />
            <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
            <Route path="/admin/enterprise" element={<AdminEnterprisePage />} />
            <Route path="/admin/ai-pricing" element={<AdminAIPricingPage />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

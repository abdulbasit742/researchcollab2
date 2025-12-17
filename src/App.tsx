import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
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
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

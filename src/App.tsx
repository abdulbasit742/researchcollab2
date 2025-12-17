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
          <Route path="/fyp-services" element={<FYPServicesPage />} />
          <Route path="/grants" element={<GrantsPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/smart-matching" element={<SmartMatchingPage />} />
          <Route path="/profile/student" element={<StudentProfilePage />} />
          <Route path="/profile/student/:id" element={<StudentProfilePage />} />
          <Route path="/profile/researcher" element={<ResearcherProfilePage />} />
          <Route path="/profile/researcher/:id" element={<ResearcherProfilePage />} />
          <Route path="/blog" element={<BlogPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

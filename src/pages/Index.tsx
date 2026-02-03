import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";
import { OnboardingPopup } from "@/components/onboarding/OnboardingPopup";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { user, isLoading } = useAuth();

  // Redirect authenticated users to the home dashboard
  if (!isLoading && user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <MainLayout>
      <OnboardingPopup />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
    </MainLayout>
  );
};

export default Index;

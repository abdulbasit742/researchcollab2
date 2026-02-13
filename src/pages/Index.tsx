import { forwardRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { ResearchDiscoverySection } from "@/components/home/ResearchDiscoverySection";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { OnboardingPopup } from "@/components/onboarding/OnboardingPopup";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Index = forwardRef<HTMLDivElement>((_props, ref) => {
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
      <ResearchDiscoverySection />
      <WhyChooseSection />
      <TestimonialsSection />
      <CTASection />
    </MainLayout>
  );
});

Index.displayName = "Index";

export default Index;

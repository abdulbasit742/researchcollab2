import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";
import { OnboardingPopup } from "@/components/onboarding/OnboardingPopup";

const Index = () => {
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

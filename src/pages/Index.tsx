import { forwardRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { HeroSection } from "@/components/home/HeroSection";
import { GlobalNetworkMap } from "@/components/home/GlobalNetworkMap";
import { StatsSection } from "@/components/home/StatsSection";
import { TrustedByMarquee } from "@/components/home/TrustedByMarquee";
import { FeaturedToolsCarousel } from "@/components/home/FeaturedToolsCarousel";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
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

  if (!isLoading && user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <MainLayout>
      <SEOHead
        canonicalPath="/"
        keywords="research collaboration, AI tools, academic services, FYP help, thesis writing, student earning, research grants"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "ResearchCollabPro",
          "url": "https://academic-forge-flow.lovable.app",
          "description": "Connect with researchers worldwide, access premium AI tools, earn money with your academic skills.",
          "applicationCategory": "EducationalApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "PKR"
          }
        }}
      />
      <OnboardingPopup />
      <HeroSection />
      <GlobalNetworkMap />
      <StatsSection />
      <TrustedByMarquee />
      <FeaturedToolsCarousel />
      <HowItWorksSection />
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

import { forwardRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustedByMarquee } from "@/components/home/TrustedByMarquee";
import { CoreLoopTimeline } from "@/components/home/CoreLoopTimeline";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { ResearchDiscoverySection } from "@/components/home/ResearchDiscoverySection";
import { FeaturedToolsCarousel } from "@/components/home/FeaturedToolsCarousel";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CompetitorComparisonSection } from "@/components/home/CompetitorComparisonSection";
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
        keywords="FYP funding, escrow payments, trust scores, student projects, sponsor funding, milestone execution"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "RCollab",
          "url": "https://academic-forge-flow.lovable.app",
          "description": "Escrow-backed FYP execution platform. Students create, sponsors fund, milestones execute, trust compounds.",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }}
      />
      <OnboardingPopup />
      <HeroSection />
      <TrustedByMarquee />
      <CoreLoopTimeline />
      <FeaturesSection />
      <WhyChooseSection />
      <ResearchDiscoverySection />
      <FeaturedToolsCarousel />
      <TestimonialsSection />
      <CompetitorComparisonSection />
      <CTASection />
    </MainLayout>
  );
});

Index.displayName = "Index";

export default Index;

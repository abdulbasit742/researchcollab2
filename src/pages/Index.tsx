import { forwardRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { TrustedByMarquee } from "@/components/home/TrustedByMarquee";
import { CompetitorComparisonSection } from "@/components/home/CompetitorComparisonSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { FeaturedToolsCarousel } from "@/components/home/FeaturedToolsCarousel";
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
        keywords="professional collaboration, escrow payments, trust scores, AI matching, verified outcomes, research platform"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "RCollab",
          "url": "https://academic-forge-flow.lovable.app",
          "description": "The world's first escrow-backed professional platform where trust is earned through verified outcomes.",
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
      <StatsSection />
      <CompetitorComparisonSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FeaturedToolsCarousel />
      <WhyChooseSection />
      <TestimonialsSection />
      <CTASection />
    </MainLayout>
  );
});

Index.displayName = "Index";

export default Index;

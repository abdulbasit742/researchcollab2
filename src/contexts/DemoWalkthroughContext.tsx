import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  route?: string;
  category: "trust" | "research" | "deals" | "ai" | "productivity" | "governance" | "social" | "institution";
  icon?: string;
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: "hero",
    title: "Welcome to RCollab",
    description: "A trust-driven academic collaboration platform connecting researchers, students, and institutions worldwide.",
    targetSelector: "[data-tour='hero']",
    route: "/",
    category: "trust",
  },
  {
    id: "stats",
    title: "Platform Impact",
    description: "Real-time metrics showing active researchers, validated projects, and institutional partnerships across the ecosystem.",
    targetSelector: "[data-tour='stats']",
    route: "/",
    category: "trust",
  },
  {
    id: "features",
    title: "Core Features",
    description: "Explore Smart Matching, Deal Rooms, FYP Management, AI-powered research tools, and more — all integrated with the Trust Engine.",
    targetSelector: "[data-tour='features']",
    route: "/",
    category: "research",
  },
  {
    id: "research-discovery",
    title: "Research Discovery",
    description: "AI-powered matching connects you with relevant collaborators, projects, and funding opportunities based on your expertise.",
    targetSelector: "[data-tour='research-discovery']",
    route: "/",
    category: "ai",
  },
  {
    id: "pricing",
    title: "Flexible Plans",
    description: "From free Basic access to full Institution suites — including the Research Productivity Suite with Docs, Sheets, and Slides.",
    targetSelector: "[data-tour='pricing']",
    route: "/pricing",
    category: "deals",
  },
  {
    id: "deals",
    title: "Deal Rooms",
    description: "Structured collaboration spaces with escrow payments, milestone tracking, and accountability records tied to trust scores.",
    targetSelector: "[data-tour='deals']",
    route: "/deals",
    category: "deals",
  },
  {
    id: "productivity",
    title: "Research Productivity Suite",
    description: "Academic-optimized Docs, Sheets, and Slides with citation management, statistical analysis, and AI assistance built in.",
    targetSelector: "[data-tour='productivity']",
    route: "/productivity",
    category: "productivity",
  },
  {
    id: "smart-matching",
    title: "Smart Matching Engine",
    description: "AI-driven matching considers research domains, trust scores, availability, and institutional compatibility for optimal collaboration.",
    targetSelector: "[data-tour='smart-matching']",
    route: "/smart-matching",
    category: "ai",
  },
  {
    id: "governance",
    title: "Platform Governance",
    description: "Democratic governance with constitutional rules, community voting pods, and transparent accountability reports.",
    targetSelector: "[data-tour='governance']",
    route: "/governance",
    category: "governance",
  },
  {
    id: "cta",
    title: "Join the Community",
    description: "Start your research journey with verified credentials, trust-based reputation, and a growing global academic network.",
    targetSelector: "[data-tour='cta']",
    route: "/",
    category: "social",
  },
];

interface DemoWalkthroughContextType {
  isActive: boolean;
  currentStep: number;
  steps: WalkthroughStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

const DemoWalkthroughContext = createContext<DemoWalkthroughContextType | null>(null);

export const useDemoWalkthrough = () => {
  const ctx = useContext(DemoWalkthroughContext);
  if (!ctx) throw new Error("useDemoWalkthrough must be used within DemoWalkthroughProvider");
  return ctx;
};

export const DemoWalkthroughProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToStep = useCallback((step: WalkthroughStep) => {
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
    }
    // Scroll to target after navigation with mobile-aware offset
    setTimeout(() => {
      if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          const isMobileView = window.innerWidth < 768;
          if (isMobileView) {
            // On mobile, scroll so element is near top to avoid tooltip overlap
            const rect = el.getBoundingClientRect();
            const scrollTop = window.scrollY + rect.top - 80;
            window.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    }, 500);
  }, [navigate, location.pathname]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    navigateToStep(WALKTHROUGH_STEPS[0]);
  }, [navigateToStep]);

  // Auto-start from ?demo=true URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true") {
      setTimeout(() => {
        setCurrentStep(0);
        setIsActive(true);
        navigateToStep(WALKTHROUGH_STEPS[0]);
      }, 800);
    }
  }, [navigateToStep]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    const next = currentStep + 1;
    if (next >= WALKTHROUGH_STEPS.length) {
      endTour();
      return;
    }
    setCurrentStep(next);
    navigateToStep(WALKTHROUGH_STEPS[next]);
  }, [currentStep, endTour, navigateToStep]);

  const prevStep = useCallback(() => {
    const prev = Math.max(0, currentStep - 1);
    setCurrentStep(prev);
    navigateToStep(WALKTHROUGH_STEPS[prev]);
  }, [currentStep, navigateToStep]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < WALKTHROUGH_STEPS.length) {
      setCurrentStep(index);
      navigateToStep(WALKTHROUGH_STEPS[index]);
    }
  }, [navigateToStep]);

  return (
    <DemoWalkthroughContext.Provider value={{
      isActive,
      currentStep,
      steps: WALKTHROUGH_STEPS,
      startTour,
      endTour,
      nextStep,
      prevStep,
      goToStep,
    }}>
      {children}
    </DemoWalkthroughContext.Provider>
  );
};

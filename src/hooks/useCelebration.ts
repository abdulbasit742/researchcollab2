import { useState, useCallback } from "react";

interface CelebrationConfig {
  title?: string;
  subtitle?: string;
  icon?: "sparkles" | "party" | "trophy" | "star";
  duration?: number;
}

interface UseCelebrationReturn {
  isActive: boolean;
  config: CelebrationConfig;
  celebrate: (config?: CelebrationConfig) => void;
  stop: () => void;
}

const DEFAULT_CONFIG: CelebrationConfig = {
  title: "Congratulations!",
  subtitle: undefined,
  icon: "party",
  duration: 3000,
};

export function useCelebration(): UseCelebrationReturn {
  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<CelebrationConfig>(DEFAULT_CONFIG);

  const celebrate = useCallback((customConfig?: CelebrationConfig) => {
    const mergedConfig = { ...DEFAULT_CONFIG, ...customConfig };
    setConfig(mergedConfig);
    setIsActive(true);

    // Auto-stop after duration
    setTimeout(() => {
      setIsActive(false);
    }, mergedConfig.duration || 3000);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    config,
    celebrate,
    stop,
  };
}

// Preset celebrations for common actions
export const CELEBRATION_PRESETS = {
  signup: {
    title: "Welcome! 🎉",
    subtitle: "Your account has been created successfully",
    icon: "party" as const,
  },
  onboardingComplete: {
    title: "You're All Set! ✨",
    subtitle: "Your profile is ready. Start exploring!",
    icon: "sparkles" as const,
  },
  firstProject: {
    title: "First Project Complete! 🏆",
    subtitle: "Amazing work! Keep up the momentum",
    icon: "trophy" as const,
  },
  milestone: {
    title: "Milestone Achieved! ⭐",
    subtitle: "Great progress on your project",
    icon: "star" as const,
  },
  verification: {
    title: "Verified! ✅",
    subtitle: "Your credentials have been verified",
    icon: "sparkles" as const,
  },
};

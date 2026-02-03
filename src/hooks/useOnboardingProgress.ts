import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OnboardingProgress {
  user_id: string;
  steps_completed: string[];
  current_step: string | null;
  dismissed_tips: string[];
  first_project_posted: boolean;
  first_bid_placed: boolean;
  first_offer_sent: boolean;
  first_milestone_completed: boolean;
  profile_strength_score: number;
  last_activity_at: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  route?: string;
}

export function useOnboardingProgress() {
  const { user, profile } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProgress(data as OnboardingProgress);
    } catch (err) {
      console.error("Error fetching onboarding progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from("onboarding_progress")
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      await fetchProgress();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating onboarding progress:", err);
      return { success: false, error: err.message };
    }
  };

  const completeStep = async (stepId: string) => {
    if (!progress) return;

    const newSteps = [...(progress.steps_completed || [])];
    if (!newSteps.includes(stepId)) {
      newSteps.push(stepId);
    }

    return updateProgress({ steps_completed: newSteps });
  };

  const dismissTip = async (tipId: string) => {
    if (!progress) return;

    const newDismissed = [...(progress.dismissed_tips || [])];
    if (!newDismissed.includes(tipId)) {
      newDismissed.push(tipId);
    }

    return updateProgress({ dismissed_tips: newDismissed });
  };

  const getStudentChecklist = (): OnboardingStep[] => {
    return [
      {
        id: "complete_profile",
        title: "Complete Your Profile",
        description: "Add your education, interests, and portfolio",
        isCompleted: (progress?.profile_strength_score || 0) >= 60,
        route: "/profile",
      },
      {
        id: "verify_student",
        title: "Verify Student Status",
        description: "Get verified for better opportunities",
        isCompleted: progress?.steps_completed?.includes("verify_student") || false,
        route: "/verification",
      },
      {
        id: "first_bid",
        title: "Place Your First Bid",
        description: "Bid on a project in the Earn Hub",
        isCompleted: progress?.first_bid_placed || false,
        route: "/earn",
      },
      {
        id: "first_project",
        title: "Complete Your First Project",
        description: "Successfully deliver a project",
        isCompleted: progress?.first_milestone_completed || false,
      },
    ];
  };

  const getResearcherChecklist = (): OnboardingStep[] => {
    return [
      {
        id: "complete_profile",
        title: "Complete Your Profile",
        description: "Add your research background and expertise",
        isCompleted: (progress?.profile_strength_score || 0) >= 60,
        route: "/profile",
      },
      {
        id: "verify_researcher",
        title: "Verify Researcher Status",
        description: "Get verified for institutional credibility",
        isCompleted: progress?.steps_completed?.includes("verify_researcher") || false,
        route: "/verification",
      },
      {
        id: "post_project",
        title: "Post Your First Project",
        description: "Create a project in the Earn Hub",
        isCompleted: progress?.first_project_posted || false,
        route: "/earn",
      },
      {
        id: "accept_bid",
        title: "Accept a Bid",
        description: "Review and accept a bid on your project",
        isCompleted: progress?.first_offer_sent || false,
      },
    ];
  };

  const getChecklist = () => {
    const role = profile?.role || "student";
    return role === "researcher" ? getResearcherChecklist() : getStudentChecklist();
  };

  const getCompletionPercentage = () => {
    const checklist = getChecklist();
    const completed = checklist.filter(step => step.isCompleted).length;
    return Math.round((completed / checklist.length) * 100);
  };

  return {
    progress,
    loading,
    refetch: fetchProgress,
    updateProgress,
    completeStep,
    dismissTip,
    getChecklist,
    getCompletionPercentage,
  };
}

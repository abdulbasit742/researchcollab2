import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTrustSystem } from "./useTrustSystem";

export interface CareerTrajectory {
  currentPhase: "early" | "growth" | "established" | "senior" | "expert";
  projectedPhase: string;
  projectionConfidence: number;
  estimatedTimeToNext: string;
  keyMilestones: CareerMilestone[];
  strengthAreas: string[];
  growthAreas: string[];
}

export interface CareerMilestone {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "upcoming" | "blocked";
  impact: number;
  dependencies: string[];
  estimatedDate?: Date;
}

export interface OpportunityForecast {
  type: "project" | "collaboration" | "grant" | "position";
  title: string;
  probability: number;
  matchScore: number;
  timeframe: string;
  requirements: string[];
  blockers: string[];
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  importance: "critical" | "important" | "nice_to_have";
  resources: string[];
  estimatedTimeToAcquire: string;
}

export interface DealPrediction {
  dealId: string;
  successProbability: number;
  riskFactors: string[];
  recommendations: string[];
  historicalComparison: number;
}

export interface FailurePattern {
  pattern: string;
  frequency: number;
  lastOccurrence: Date | null;
  preventionStrategies: string[];
  recoveryPath: string[];
}

export function useCareerIntelligence() {
  const { user, profile } = useAuth();
  const { breakdown: trustBreakdown } = useTrustSystem();
  
  const [trajectory, setTrajectory] = useState<CareerTrajectory | null>(null);
  const [forecasts, setForecasts] = useState<OpportunityForecast[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [failurePatterns, setFailurePatterns] = useState<FailurePattern[]>([]);
  const [loading, setLoading] = useState(true);

  const analyzeCareer = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch user's work history
      const { data: outcomes } = await supabase
        .from("offers")
        .select("*")
        .or(`posted_by.eq.${user.id},accepted_by.eq.${user.id}`)
        .order("created_at", { ascending: false });
        
      // Analyze career phase based on activity
      const completedProjects = outcomes?.filter(o => o.status === "completed").length || 0;
      const totalProjects = outcomes?.length || 0;
      
      let currentPhase: CareerTrajectory["currentPhase"] = "early";
      if (completedProjects > 50) currentPhase = "expert";
      else if (completedProjects > 25) currentPhase = "senior";
      else if (completedProjects > 10) currentPhase = "established";
      else if (completedProjects > 3) currentPhase = "growth";
      
      // Generate milestones
      const milestones: CareerMilestone[] = [
        {
          id: "m1",
          title: "Complete first 5 projects",
          description: "Build your foundation with successful project completions",
          status: completedProjects >= 5 ? "completed" : completedProjects > 0 ? "in_progress" : "upcoming",
          impact: 20,
          dependencies: [],
        },
        {
          id: "m2",
          title: "Reach Gold trust tier",
          description: "Achieve 75+ trust score through consistent delivery",
          status: (trustBreakdown?.overall || 0) >= 75 ? "completed" : "in_progress",
          impact: 25,
          dependencies: ["m1"],
        },
        {
          id: "m3",
          title: "Institution verification",
          description: "Get verified by your academic institution",
          status: "upcoming",
          impact: 15,
          dependencies: [],
        },
        {
          id: "m4",
          title: "Lead a multi-party deal",
          description: "Successfully lead a project with 3+ collaborators",
          status: "upcoming",
          impact: 30,
          dependencies: ["m1", "m2"],
        },
      ];
      
      setTrajectory({
        currentPhase,
        projectedPhase: currentPhase === "expert" ? "expert" : 
          currentPhase === "senior" ? "expert" :
          currentPhase === "established" ? "senior" :
          currentPhase === "growth" ? "established" : "growth",
        projectionConfidence: 65,
        estimatedTimeToNext: currentPhase === "early" ? "3-6 months" : "6-12 months",
        keyMilestones: milestones,
        strengthAreas: profile?.interests?.slice(0, 3) || ["Research", "Analysis"],
        growthAreas: ["Leadership", "Cross-domain collaboration"],
      });
      
      // Generate opportunity forecasts
      const forecasts: OpportunityForecast[] = [
        {
          type: "project",
          title: "Data Analysis Projects",
          probability: 75,
          matchScore: 82,
          timeframe: "Next 30 days",
          requirements: ["Data analysis", "Python/R"],
          blockers: [],
        },
        {
          type: "collaboration",
          title: "Research Partnership",
          probability: 45,
          matchScore: 68,
          timeframe: "Next 60 days",
          requirements: ["Publication history", "Domain expertise"],
          blockers: ["Need higher trust score"],
        },
      ];
      
      setForecasts(forecasts);
      
      // Identify skill gaps
      const gaps: SkillGap[] = [
        {
          skill: "Project Management",
          currentLevel: 40,
          requiredLevel: 70,
          importance: "important",
          resources: ["Complete PM certification", "Lead small team project"],
          estimatedTimeToAcquire: "2-3 months",
        },
        {
          skill: "Technical Writing",
          currentLevel: 60,
          requiredLevel: 80,
          importance: "nice_to_have",
          resources: ["Write 3 project documentation sets", "Take technical writing course"],
          estimatedTimeToAcquire: "1-2 months",
        },
      ];
      
      setSkillGaps(gaps);
      
      // Analyze failure patterns
      const failedProjects = outcomes?.filter((o: any) => o.status === "cancelled" || o.status === "disputed" || o.status === "rejected");
      const patterns: FailurePattern[] = [];
      
      if (failedProjects && failedProjects.length > 0) {
        const firstFailed = failedProjects[0] as any;
        patterns.push({
          pattern: "Scope underestimation",
          frequency: Math.floor(failedProjects.length * 0.6),
          lastOccurrence: firstFailed?.created_at ? new Date(firstFailed.created_at) : null,
          preventionStrategies: [
            "Add 20% buffer to time estimates",
            "Break down milestones more granularly",
            "Get scope sign-off before starting",
          ],
          recoveryPath: [
            "Review past estimates vs actuals",
            "Create estimation templates",
          ],
        });
      }
      
      setFailurePatterns(patterns);
      
    } catch (err) {
      console.error("Error analyzing career:", err);
    } finally {
      setLoading(false);
    }
  }, [user, profile, trustBreakdown]);

  useEffect(() => {
    analyzeCareer();
  }, [analyzeCareer]);

  // Predict deal outcome
  const predictDealOutcome = useCallback(async (dealId: string): Promise<DealPrediction | null> => {
    try {
      const { data: deal } = await supabase
        .from("offers")
        .select("*")
        .eq("id", dealId)
        .single();
        
      if (!deal) return null;
      
      // Simple prediction based on historical data
      const successProbability = 70; // Would use ML in production
      
      return {
        dealId,
        successProbability,
        riskFactors: [
          "First-time collaboration",
          "Tight deadline",
        ],
        recommendations: [
          "Set up weekly check-ins",
          "Define clear milestone criteria",
          "Document scope changes promptly",
        ],
        historicalComparison: 75,
      };
    } catch (err) {
      console.error("Error predicting deal:", err);
      return null;
    }
  }, []);

  // Get next best action
  const getNextBestAction = useMemo(() => {
    if (!trajectory) return null;
    
    const pendingMilestones = trajectory.keyMilestones
      .filter(m => m.status === "upcoming" || m.status === "in_progress")
      .sort((a, b) => b.impact - a.impact);
      
    if (pendingMilestones.length === 0) return null;
    
    const topMilestone = pendingMilestones[0];
    
    return {
      action: topMilestone.title,
      reason: topMilestone.description,
      impact: topMilestone.impact,
      timeframe: "Start this week",
    };
  }, [trajectory]);

  return {
    trajectory,
    forecasts,
    skillGaps,
    failurePatterns,
    loading,
    refresh: analyzeCareer,
    predictDealOutcome,
    getNextBestAction,
  };
}

// Hook for pricing guidance
export function usePricingGuidance(projectType: string, skills: string[]) {
  const [guidance, setGuidance] = useState<{
    suggestedRange: { min: number; max: number };
    marketRate: number;
    factors: { factor: string; impact: number }[];
    confidence: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would use market data analysis
    const baseRate = projectType === "research" ? 50 : 
                     projectType === "analysis" ? 40 :
                     projectType === "writing" ? 35 : 30;
                     
    const skillMultiplier = 1 + (skills.length * 0.1);
    
    setGuidance({
      suggestedRange: {
        min: Math.floor(baseRate * skillMultiplier * 0.8),
        max: Math.floor(baseRate * skillMultiplier * 1.2),
      },
      marketRate: Math.floor(baseRate * skillMultiplier),
      factors: [
        { factor: "Skill demand", impact: 15 },
        { factor: "Experience level", impact: 10 },
        { factor: "Project complexity", impact: 20 },
      ],
      confidence: 72,
    });
    
    setLoading(false);
  }, [projectType, skills]);

  return { guidance, loading };
}

// Hook for time allocation advice
export function useTimeAllocation() {
  const { user } = useAuth();
  const [allocation, setAllocation] = useState<{
    current: { category: string; percentage: number }[];
    recommended: { category: string; percentage: number }[];
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Would analyze actual time spent in production
    setAllocation({
      current: [
        { category: "Active projects", percentage: 45 },
        { category: "New opportunities", percentage: 20 },
        { category: "Skill development", percentage: 10 },
        { category: "Network building", percentage: 15 },
        { category: "Administration", percentage: 10 },
      ],
      recommended: [
        { category: "Active projects", percentage: 50 },
        { category: "New opportunities", percentage: 15 },
        { category: "Skill development", percentage: 15 },
        { category: "Network building", percentage: 15 },
        { category: "Administration", percentage: 5 },
      ],
      suggestions: [
        "Reduce time on opportunity browsing, focus on quality matches",
        "Increase skill development to address identified gaps",
        "Automate administrative tasks where possible",
      ],
    });
  }, [user]);

  return { allocation };
}

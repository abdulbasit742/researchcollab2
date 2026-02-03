import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface CareerScenario {
  id: string;
  name: string;
  description: string;
  actions: ScenarioAction[];
  projectedOutcome: ScenarioOutcome;
  timeframe: string;
  probability: number;
  createdAt: Date;
}

export interface ScenarioAction {
  id: string;
  type: "complete_project" | "gain_skill" | "build_connection" | "change_focus" | "increase_activity";
  description: string;
  effort: "low" | "medium" | "high";
  timeToComplete: string;
  trustImpact: number;
  earningsImpact: number;
}

export interface ScenarioOutcome {
  trustScore: number;
  trustDelta: number;
  trustTier: string;
  projectedEarnings: number;
  earningsDelta: number;
  newSkills: string[];
  networkGrowth: number;
  marketPosition: "emerging" | "established" | "expert" | "leader";
}

export interface CareerGoal {
  id: string;
  type: "trust_tier" | "earnings" | "skill_mastery" | "network_size" | "project_count";
  target: number | string;
  current: number | string;
  estimatedTimeToReach: string;
  requiredActions: string[];
  probability: number;
}

export interface SkillPathway {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  timeToMaster: string;
  learningResources: string[];
  marketDemand: "low" | "medium" | "high" | "very_high";
  earningsMultiplier: number;
}

export function useCareerSimulation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<CareerScenario[]>([]);

  const currentState = useMemo(() => ({
    trustScore: 78,
    trustTier: "gold",
    monthlyEarnings: 8500,
    skills: ["Machine Learning", "Data Analysis", "Python", "Research"],
    networkSize: 127,
    projectsCompleted: 23,
  }), []);

  const goals = useMemo<CareerGoal[]>(() => [
    {
      id: "goal-1",
      type: "trust_tier",
      target: "platinum",
      current: "gold",
      estimatedTimeToReach: "4-6 months",
      requiredActions: ["Complete 5 more projects with 100% on-time delivery", "Maintain financial reliability", "Get 3 institution verifications"],
      probability: 72,
    },
    {
      id: "goal-2",
      type: "earnings",
      target: 15000,
      current: 8500,
      estimatedTimeToReach: "8-12 months",
      requiredActions: ["Increase hourly rate by 30%", "Take on larger projects", "Develop premium skill set"],
      probability: 65,
    },
    {
      id: "goal-3",
      type: "skill_mastery",
      target: "Deep Learning Expert",
      current: "Advanced",
      estimatedTimeToReach: "6-9 months",
      requiredActions: ["Complete 3 deep learning projects", "Publish research paper", "Get peer endorsements"],
      probability: 80,
    },
  ], []);

  const skillPathways = useMemo<SkillPathway[]>(() => [
    {
      skill: "Deep Learning",
      currentLevel: 70,
      targetLevel: 95,
      timeToMaster: "6-9 months",
      learningResources: ["Advanced courses", "Research papers", "Hands-on projects"],
      marketDemand: "very_high",
      earningsMultiplier: 1.4,
    },
    {
      skill: "MLOps",
      currentLevel: 45,
      targetLevel: 80,
      timeToMaster: "4-6 months",
      learningResources: ["Cloud certifications", "DevOps training", "Production deployments"],
      marketDemand: "high",
      earningsMultiplier: 1.25,
    },
    {
      skill: "Research Publication",
      currentLevel: 60,
      targetLevel: 90,
      timeToMaster: "8-12 months",
      learningResources: ["Academic writing workshops", "Peer review participation", "Conference presentations"],
      marketDemand: "medium",
      earningsMultiplier: 1.15,
    },
  ], []);

  const createScenario = useCallback(async (
    name: string,
    actions: Omit<ScenarioAction, "id">[]
  ): Promise<CareerScenario> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Calculate projected outcomes based on actions
    let trustDelta = 0;
    let earningsDelta = 0;
    const newSkills: string[] = [];

    actions.forEach(action => {
      trustDelta += action.trustImpact;
      earningsDelta += action.earningsImpact;
      if (action.type === "gain_skill") {
        newSkills.push(action.description);
      }
    });

    const newTrustScore = Math.min(100, currentState.trustScore + trustDelta);
    const projectedEarnings = currentState.monthlyEarnings * (1 + earningsDelta / 100);

    const scenario: CareerScenario = {
      id: `scenario-${Date.now()}`,
      name,
      description: `What-if scenario with ${actions.length} planned actions`,
      actions: actions.map((a, i) => ({ ...a, id: `action-${i}` })),
      projectedOutcome: {
        trustScore: newTrustScore,
        trustDelta,
        trustTier: newTrustScore >= 90 ? "platinum" : newTrustScore >= 75 ? "gold" : "silver",
        projectedEarnings,
        earningsDelta,
        newSkills,
        networkGrowth: actions.filter(a => a.type === "build_connection").length * 5,
        marketPosition: newTrustScore >= 90 ? "leader" : newTrustScore >= 80 ? "expert" : "established",
      },
      timeframe: "6 months",
      probability: 70 - actions.filter(a => a.effort === "high").length * 10,
      createdAt: new Date(),
    };

    setScenarios(prev => [...prev, scenario]);
    setLoading(false);
    return scenario;
  }, [currentState]);

  const compareScenarios = useCallback((scenarioIds: string[]) => {
    return scenarios
      .filter(s => scenarioIds.includes(s.id))
      .map(s => ({
        id: s.id,
        name: s.name,
        trustDelta: s.projectedOutcome.trustDelta,
        earningsDelta: s.projectedOutcome.earningsDelta,
        effort: s.actions.reduce((acc, a) => acc + (a.effort === "high" ? 3 : a.effort === "medium" ? 2 : 1), 0),
        probability: s.probability,
      }));
  }, [scenarios]);

  const getTimeToGoal = useCallback((goalId: string): {
    estimate: string;
    path: ScenarioAction[];
    alternativePaths: { estimate: string; path: ScenarioAction[] }[];
  } => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { estimate: "Unknown", path: [], alternativePaths: [] };

    // Generate optimal path
    const optimalPath: ScenarioAction[] = [
      { id: "1", type: "complete_project", description: "Complete high-impact project", effort: "high", timeToComplete: "6 weeks", trustImpact: 5, earningsImpact: 10 },
      { id: "2", type: "gain_skill", description: "Master new technology", effort: "medium", timeToComplete: "4 weeks", trustImpact: 3, earningsImpact: 15 },
    ];

    return {
      estimate: goal.estimatedTimeToReach,
      path: optimalPath,
      alternativePaths: [],
    };
  }, [goals]);

  const deleteScenario = useCallback((scenarioId: string) => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
  }, []);

  return {
    currentState,
    goals,
    skillPathways,
    scenarios,
    loading,
    createScenario,
    compareScenarios,
    getTimeToGoal,
    deleteScenario,
  };
}

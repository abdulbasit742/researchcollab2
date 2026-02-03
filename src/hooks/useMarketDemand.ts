import { useState, useMemo, useCallback } from "react";

export interface SkillDemand {
  skill: string;
  category: string;
  demandScore: number; // 0-100
  demandTrend: "rising" | "stable" | "declining";
  supplyScore: number; // 0-100
  marketBalance: "undersupplied" | "balanced" | "oversupplied";
  averageRate: number;
  rateChange30Days: number; // percentage
  openOpportunities: number;
  competitorCount: number;
  growthForecast: "strong" | "moderate" | "weak" | "negative";
}

export interface MarketOpportunity {
  id: string;
  title: string;
  skills: string[];
  demandStrength: "hot" | "warm" | "moderate";
  estimatedValue: number;
  competition: "low" | "medium" | "high";
  timeToCapture: string;
  requiredTrustLevel: number;
  isEmergingArea: boolean;
}

export interface PricingTrend {
  skill: string;
  currentAvgRate: number;
  rate30DaysAgo: number;
  rate90DaysAgo: number;
  projectedRate30Days: number;
  volatility: "low" | "medium" | "high";
  priceDirection: "up" | "stable" | "down";
}

export interface StrategicPosition {
  currentPosition: "leader" | "competitor" | "emerging" | "niche";
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendedActions: string[];
}

const MOCK_SKILL_DEMANDS: SkillDemand[] = [
  {
    skill: "Machine Learning",
    category: "AI & Data",
    demandScore: 92,
    demandTrend: "rising",
    supplyScore: 68,
    marketBalance: "undersupplied",
    averageRate: 175,
    rateChange30Days: 8.5,
    openOpportunities: 342,
    competitorCount: 1240,
    growthForecast: "strong",
  },
  {
    skill: "LLM Fine-tuning",
    category: "AI & Data",
    demandScore: 96,
    demandTrend: "rising",
    supplyScore: 32,
    marketBalance: "undersupplied",
    averageRate: 225,
    rateChange30Days: 15.2,
    openOpportunities: 187,
    competitorCount: 380,
    growthForecast: "strong",
  },
  {
    skill: "Data Analysis",
    category: "AI & Data",
    demandScore: 78,
    demandTrend: "stable",
    supplyScore: 82,
    marketBalance: "balanced",
    averageRate: 120,
    rateChange30Days: 1.2,
    openOpportunities: 523,
    competitorCount: 3420,
    growthForecast: "moderate",
  },
  {
    skill: "Python",
    category: "Programming",
    demandScore: 85,
    demandTrend: "stable",
    supplyScore: 88,
    marketBalance: "balanced",
    averageRate: 110,
    rateChange30Days: -0.5,
    openOpportunities: 892,
    competitorCount: 5670,
    growthForecast: "moderate",
  },
  {
    skill: "Blockchain Development",
    category: "Web3",
    demandScore: 45,
    demandTrend: "declining",
    supplyScore: 55,
    marketBalance: "oversupplied",
    averageRate: 140,
    rateChange30Days: -12.3,
    openOpportunities: 67,
    competitorCount: 890,
    growthForecast: "weak",
  },
  {
    skill: "Cybersecurity",
    category: "Security",
    demandScore: 88,
    demandTrend: "rising",
    supplyScore: 52,
    marketBalance: "undersupplied",
    averageRate: 185,
    rateChange30Days: 6.8,
    openOpportunities: 234,
    competitorCount: 720,
    growthForecast: "strong",
  },
];

const MOCK_OPPORTUNITIES: MarketOpportunity[] = [
  {
    id: "opp-1",
    title: "Enterprise LLM Implementation",
    skills: ["LLM Fine-tuning", "Python", "Machine Learning"],
    demandStrength: "hot",
    estimatedValue: 50000,
    competition: "low",
    timeToCapture: "Now",
    requiredTrustLevel: 80,
    isEmergingArea: true,
  },
  {
    id: "opp-2",
    title: "AI Security Auditing",
    skills: ["Cybersecurity", "Machine Learning", "Risk Assessment"],
    demandStrength: "hot",
    estimatedValue: 35000,
    competition: "low",
    timeToCapture: "2-4 weeks",
    requiredTrustLevel: 85,
    isEmergingArea: true,
  },
  {
    id: "opp-3",
    title: "Data Pipeline Optimization",
    skills: ["Data Analysis", "Python", "Cloud Infrastructure"],
    demandStrength: "warm",
    estimatedValue: 25000,
    competition: "medium",
    timeToCapture: "1-2 weeks",
    requiredTrustLevel: 70,
    isEmergingArea: false,
  },
];

export function useMarketDemand(userSkills?: string[]) {
  const [loading, setLoading] = useState(false);
  const [skillDemands] = useState<SkillDemand[]>(MOCK_SKILL_DEMANDS);
  const [opportunities] = useState<MarketOpportunity[]>(MOCK_OPPORTUNITIES);

  const emergingAreas = useMemo(() => 
    skillDemands
      .filter(s => s.demandTrend === "rising" && s.marketBalance === "undersupplied")
      .sort((a, b) => b.rateChange30Days - a.rateChange30Days),
    [skillDemands]
  );

  const pricingTrends = useMemo<PricingTrend[]>(() => 
    skillDemands.map(s => ({
      skill: s.skill,
      currentAvgRate: s.averageRate,
      rate30DaysAgo: s.averageRate * (1 - s.rateChange30Days / 100),
      rate90DaysAgo: s.averageRate * 0.92,
      projectedRate30Days: s.averageRate * (1 + s.rateChange30Days / 200),
      volatility: Math.abs(s.rateChange30Days) > 10 ? "high" : Math.abs(s.rateChange30Days) > 5 ? "medium" : "low",
      priceDirection: s.rateChange30Days > 2 ? "up" : s.rateChange30Days < -2 ? "down" : "stable",
    })),
    [skillDemands]
  );

  const getStrategicPosition = useCallback((skills: string[]): StrategicPosition => {
    const matchingDemands = skillDemands.filter(d => skills.includes(d.skill));
    const avgDemand = matchingDemands.reduce((acc, d) => acc + d.demandScore, 0) / matchingDemands.length;
    const avgSupply = matchingDemands.reduce((acc, d) => acc + d.supplyScore, 0) / matchingDemands.length;

    const position: StrategicPosition["currentPosition"] = 
      avgDemand > 85 && avgSupply < 50 ? "leader" :
      avgDemand > 70 ? "competitor" :
      avgDemand > 50 ? "emerging" : "niche";

    return {
      currentPosition: position,
      strengths: matchingDemands.filter(d => d.demandTrend === "rising").map(d => d.skill),
      weaknesses: matchingDemands.filter(d => d.marketBalance === "oversupplied").map(d => d.skill),
      opportunities: emergingAreas.filter(d => !skills.includes(d.skill)).map(d => `Learn ${d.skill}`),
      threats: matchingDemands.filter(d => d.demandTrend === "declining").map(d => `${d.skill} demand declining`),
      recommendedActions: [
        "Focus on undersupplied skills",
        "Build expertise in emerging areas",
        "Differentiate through specialization",
      ],
    };
  }, [skillDemands, emergingAreas]);

  const getMatchingOpportunities = useCallback((skills: string[], trustScore: number): MarketOpportunity[] => {
    return opportunities.filter(opp => {
      const skillMatch = opp.skills.some(s => skills.includes(s));
      const trustMatch = trustScore >= opp.requiredTrustLevel;
      return skillMatch && trustMatch;
    });
  }, [opportunities]);

  const getSkillRecommendations = useCallback((currentSkills: string[]): {
    toLearn: SkillDemand[];
    toMaintain: SkillDemand[];
    toDeprioritize: SkillDemand[];
  } => {
    const currentSkillDemands = skillDemands.filter(d => currentSkills.includes(d.skill));
    const otherSkillDemands = skillDemands.filter(d => !currentSkills.includes(d.skill));

    return {
      toLearn: otherSkillDemands.filter(d => d.demandTrend === "rising" && d.marketBalance === "undersupplied"),
      toMaintain: currentSkillDemands.filter(d => d.demandTrend !== "declining"),
      toDeprioritize: currentSkillDemands.filter(d => d.demandTrend === "declining" || d.marketBalance === "oversupplied"),
    };
  }, [skillDemands]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  }, []);

  return {
    skillDemands,
    emergingAreas,
    opportunities,
    pricingTrends,
    loading,
    getStrategicPosition,
    getMatchingOpportunities,
    getSkillRecommendations,
    refreshData,
  };
}

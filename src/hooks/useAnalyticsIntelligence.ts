import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Career Analytics Dashboard
interface CareerMetrics {
  trustScore: number;
  trustTrend: number;
  trustPercentile: number;
  projectsCompleted: number;
  projectSuccessRate: number;
  totalEarnings: number;
  earningsTrend: number;
  averageProjectValue: number;
  networkSize: number;
  networkGrowth: number;
  profileViews: number;
  profileViewsTrend: number;
  responseRate: number;
  averageResponseTime: number;
}

interface PerformanceSnapshot {
  period: "week" | "month" | "quarter" | "year";
  metrics: {
    name: string;
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down" | "stable";
  }[];
}

interface SkillDemand {
  skill: string;
  demandLevel: number;
  demandTrend: "rising" | "stable" | "falling";
  averageRate: number;
  projectCount: number;
  competitorCount: number;
  yourProficiency: number;
}

export function useCareerAnalytics() {
  const [metrics, setMetrics] = useState<CareerMetrics>({
    trustScore: 78,
    trustTrend: 3.5,
    trustPercentile: 82,
    projectsCompleted: 24,
    projectSuccessRate: 92,
    totalEarnings: 145000,
    earningsTrend: 15,
    averageProjectValue: 6040,
    networkSize: 342,
    networkGrowth: 8,
    profileViews: 156,
    profileViewsTrend: 12,
    responseRate: 97,
    averageResponseTime: 2.4,
  });

  const [snapshot, setSnapshot] = useState<PerformanceSnapshot>({
    period: "month",
    metrics: [
      { name: "Trust Score", current: 78, previous: 74, change: 5.4, trend: "up" },
      { name: "Projects", current: 4, previous: 3, change: 33, trend: "up" },
      { name: "Earnings", current: 18500, previous: 15200, change: 21.7, trend: "up" },
      { name: "Network", current: 342, previous: 318, change: 7.5, trend: "up" },
      { name: "Response Rate", current: 97, previous: 94, change: 3.2, trend: "up" },
    ],
  });

  const [skillDemand, setSkillDemand] = useState<SkillDemand[]>([
    { skill: "Machine Learning", demandLevel: 92, demandTrend: "rising", averageRate: 175, projectCount: 1250, competitorCount: 890, yourProficiency: 85 },
    { skill: "Python", demandLevel: 95, demandTrend: "stable", averageRate: 125, projectCount: 3400, competitorCount: 2100, yourProficiency: 92 },
    { skill: "Data Science", demandLevel: 88, demandTrend: "rising", averageRate: 150, projectCount: 980, competitorCount: 720, yourProficiency: 78 },
    { skill: "Deep Learning", demandLevel: 85, demandTrend: "rising", averageRate: 195, projectCount: 560, competitorCount: 340, yourProficiency: 72 },
    { skill: "Cloud (AWS/GCP)", demandLevel: 90, demandTrend: "rising", averageRate: 165, projectCount: 1800, competitorCount: 1200, yourProficiency: 45 },
  ]);

  const topOpportunities = useMemo(() =>
    skillDemand
      .filter(s => s.yourProficiency >= 70)
      .sort((a, b) => b.demandLevel - a.demandLevel)
      .slice(0, 3),
    [skillDemand]
  );

  const skillGaps = useMemo(() =>
    skillDemand
      .filter(s => s.demandLevel > 80 && s.yourProficiency < 60)
      .sort((a, b) => a.yourProficiency - b.yourProficiency),
    [skillDemand]
  );

  return { metrics, snapshot, skillDemand, topOpportunities, skillGaps };
}

// Market Intelligence
interface MarketTrend {
  id: string;
  category: string;
  trend: string;
  direction: "up" | "down" | "stable";
  magnitude: number;
  timeframe: string;
  implications: string[];
  sources: string[];
  confidence: number;
}

interface CompetitorInsight {
  segment: string;
  averageTrustScore: number;
  averageRate: number;
  supplyLevel: "oversupplied" | "balanced" | "undersupplied";
  entryBarrier: "low" | "medium" | "high";
  growthRate: number;
}

interface OpportunityForecast {
  category: string;
  currentVolume: number;
  projectedVolume: number;
  projectedGrowth: number;
  peakSeason: string[];
  averageBudget: number;
  budgetTrend: "increasing" | "stable" | "decreasing";
}

export function useMarketIntelligence() {
  const [trends, setTrends] = useState<MarketTrend[]>([
    {
      id: "1", category: "AI/ML", trend: "Generative AI adoption accelerating",
      direction: "up", magnitude: 45, timeframe: "6 months",
      implications: ["Increased demand for LLM expertise", "Higher rates for GenAI projects", "New skill requirements"],
      sources: ["Industry reports", "Job posting analysis", "Platform data"],
      confidence: 0.89,
    },
    {
      id: "2", category: "Remote Work", trend: "Hybrid collaboration tools demand",
      direction: "up", magnitude: 28, timeframe: "12 months",
      implications: ["More async-first projects", "Global talent competition", "Timezone flexibility premium"],
      sources: ["Platform trends", "User surveys"],
      confidence: 0.82,
    },
    {
      id: "3", category: "Research", trend: "Industry-academic partnerships growing",
      direction: "up", magnitude: 32, timeframe: "12 months",
      implications: ["More applied research opportunities", "Higher project values", "Publication incentives"],
      sources: ["Partnership announcements", "Funding data"],
      confidence: 0.75,
    },
  ]);

  const [competitors, setCompetitors] = useState<CompetitorInsight[]>([
    { segment: "ML Engineers (Senior)", averageTrustScore: 75, averageRate: 185, supplyLevel: "undersupplied", entryBarrier: "high", growthRate: 12 },
    { segment: "Data Scientists", averageTrustScore: 68, averageRate: 145, supplyLevel: "balanced", entryBarrier: "medium", growthRate: 8 },
    { segment: "Research Scientists", averageTrustScore: 82, averageRate: 165, supplyLevel: "undersupplied", entryBarrier: "high", growthRate: 15 },
    { segment: "Full Stack Developers", averageTrustScore: 62, averageRate: 125, supplyLevel: "oversupplied", entryBarrier: "low", growthRate: 5 },
  ]);

  const [forecasts, setForecasts] = useState<OpportunityForecast[]>([
    { category: "AI Research", currentVolume: 450, projectedVolume: 680, projectedGrowth: 51, peakSeason: ["Q1", "Q3"], averageBudget: 25000, budgetTrend: "increasing" },
    { category: "Data Analysis", currentVolume: 890, projectedVolume: 1050, projectedGrowth: 18, peakSeason: ["Q4"], averageBudget: 12000, budgetTrend: "stable" },
    { category: "Consulting", currentVolume: 320, projectedVolume: 380, projectedGrowth: 19, peakSeason: ["Q1", "Q2"], averageBudget: 35000, budgetTrend: "increasing" },
  ]);

  return { trends, competitors, forecasts };
}

// Benchmarking System
interface Benchmark {
  metric: string;
  yourValue: number;
  peerAverage: number;
  topPerformer: number;
  percentile: number;
  trend: "above" | "at" | "below";
  recommendation?: string;
}

interface PeerGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  criteria: string[];
  isSelected: boolean;
}

export function useBenchmarking() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([
    { metric: "Trust Score", yourValue: 78, peerAverage: 72, topPerformer: 95, percentile: 68, trend: "above", recommendation: "Focus on consistency to reach top tier" },
    { metric: "Project Success Rate", yourValue: 92, peerAverage: 85, topPerformer: 99, percentile: 75, trend: "above" },
    { metric: "Response Time (hours)", yourValue: 2.4, peerAverage: 8.2, topPerformer: 0.5, percentile: 82, trend: "above" },
    { metric: "Average Project Value", yourValue: 6040, peerAverage: 8500, topPerformer: 25000, percentile: 45, trend: "below", recommendation: "Target higher-value opportunities" },
    { metric: "Network Size", yourValue: 342, peerAverage: 289, topPerformer: 1200, percentile: 62, trend: "above" },
    { metric: "Profile Completion", yourValue: 85, peerAverage: 72, topPerformer: 100, percentile: 70, trend: "above", recommendation: "Add portfolio items to reach 100%" },
  ]);

  const [peerGroups, setPeerGroups] = useState<PeerGroup[]>([
    { id: "1", name: "ML Engineers (3-5 years)", description: "Machine learning engineers with similar experience", memberCount: 1250, criteria: ["ML skills", "3-5 years experience"], isSelected: true },
    { id: "2", name: "Research Scientists", description: "Professionals in research roles", memberCount: 890, criteria: ["Research background", "Academic publications"], isSelected: false },
    { id: "3", name: "Your Trust Tier", description: "Professionals in the same trust tier", memberCount: 2100, criteria: ["Trust score 70-85"], isSelected: true },
  ]);

  const selectPeerGroup = useCallback((groupId: string) => {
    setPeerGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, isSelected: !g.isSelected } : g
    ));
  }, []);

  const overallPercentile = useMemo(() =>
    Math.round(benchmarks.reduce((sum, b) => sum + b.percentile, 0) / benchmarks.length),
    [benchmarks]
  );

  const strengthAreas = useMemo(() =>
    benchmarks.filter(b => b.trend === "above").map(b => b.metric),
    [benchmarks]
  );

  const improvementAreas = useMemo(() =>
    benchmarks.filter(b => b.trend === "below").map(b => ({ metric: b.metric, recommendation: b.recommendation })),
    [benchmarks]
  );

  return { benchmarks, peerGroups, selectPeerGroup, overallPercentile, strengthAreas, improvementAreas };
}

// Predictive Insights
interface PredictiveInsight {
  id: string;
  type: "opportunity" | "risk" | "milestone" | "trend";
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: "low" | "medium" | "high" | "critical";
  actionable: boolean;
  suggestedActions: string[];
  relatedMetrics: string[];
}

interface ScenarioAnalysis {
  id: string;
  scenario: string;
  probability: number;
  outcomes: {
    metric: string;
    change: number;
    newValue: number;
  }[];
  triggers: string[];
  mitigations?: string[];
}

export function usePredictiveInsights() {
  const [insights, setInsights] = useState<PredictiveInsight[]>([
    {
      id: "1", type: "opportunity",
      title: "Trust Score Breakthrough Imminent",
      description: "Based on your current trajectory, you're likely to reach Gold tier (80+) within 45 days",
      confidence: 0.78, timeframe: "45 days", impact: "high", actionable: true,
      suggestedActions: ["Complete 2 more projects on time", "Maintain response streak", "Request endorsements"],
      relatedMetrics: ["Trust Score", "Completion Rate"],
    },
    {
      id: "2", type: "risk",
      title: "Network Activity Decline",
      description: "Your network engagement has dropped 23% this month, which may impact referrals",
      confidence: 0.85, timeframe: "30 days", impact: "medium", actionable: true,
      suggestedActions: ["Reconnect with dormant contacts", "Attend upcoming events", "Share industry insights"],
      relatedMetrics: ["Network Size", "Referrals"],
    },
    {
      id: "3", type: "trend",
      title: "Skill Demand Surge: LLM Fine-tuning",
      description: "Demand for LLM fine-tuning expertise is projected to grow 85% in your market",
      confidence: 0.72, timeframe: "6 months", impact: "high", actionable: true,
      suggestedActions: ["Complete LLM specialization course", "Build portfolio project", "Update profile skills"],
      relatedMetrics: ["Opportunity Matches", "Earnings Potential"],
    },
    {
      id: "4", type: "milestone",
      title: "50th Project Approaching",
      description: "You're 3 projects away from a major milestone that unlocks premium visibility",
      confidence: 0.95, timeframe: "60 days", impact: "medium", actionable: true,
      suggestedActions: ["Accept suitable pending opportunities", "Focus on quick-win projects"],
      relatedMetrics: ["Projects Completed", "Profile Visibility"],
    },
  ]);

  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([
    {
      id: "1", scenario: "High Performance Quarter",
      probability: 0.35,
      outcomes: [
        { metric: "Trust Score", change: 8, newValue: 86 },
        { metric: "Earnings", change: 35, newValue: 24975 },
        { metric: "Network", change: 15, newValue: 393 },
      ],
      triggers: ["Complete all projects on time", "Receive 5-star reviews", "Active networking"],
    },
    {
      id: "2", scenario: "Steady Progress",
      probability: 0.50,
      outcomes: [
        { metric: "Trust Score", change: 3, newValue: 81 },
        { metric: "Earnings", change: 15, newValue: 21275 },
        { metric: "Network", change: 5, newValue: 359 },
      ],
      triggers: ["Maintain current pace", "No major disruptions"],
    },
    {
      id: "3", scenario: "Challenging Quarter",
      probability: 0.15,
      outcomes: [
        { metric: "Trust Score", change: -2, newValue: 76 },
        { metric: "Earnings", change: -10, newValue: 16650 },
        { metric: "Network", change: -3, newValue: 332 },
      ],
      triggers: ["Missed deadlines", "Negative reviews", "Low availability"],
      mitigations: ["Set realistic commitments", "Communicate proactively", "Maintain quality standards"],
    },
  ]);

  const criticalInsights = useMemo(() =>
    insights.filter(i => i.impact === "critical" || i.impact === "high"),
    [insights]
  );

  return { insights, scenarios, criticalInsights };
}

// Goal Tracking
interface Goal {
  id: string;
  title: string;
  description: string;
  category: "trust" | "earnings" | "skills" | "network" | "projects";
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  status: "on_track" | "at_risk" | "behind" | "completed";
  milestones: GoalMilestone[];
  createdAt: Date;
}

interface GoalMilestone {
  id: string;
  title: string;
  targetValue: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export function useGoalTracking() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1", title: "Reach Gold Trust Tier", description: "Achieve trust score of 80+",
      category: "trust", targetValue: 80, currentValue: 78, unit: "points",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), status: "on_track",
      milestones: [
        { id: "m1", title: "Reach 75 points", targetValue: 75, isCompleted: true, completedAt: new Date() },
        { id: "m2", title: "Reach 78 points", targetValue: 78, isCompleted: true, completedAt: new Date() },
        { id: "m3", title: "Reach 80 points", targetValue: 80, isCompleted: false },
      ],
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "2", title: "Q2 Earnings Target", description: "Earn $25,000 in Q2",
      category: "earnings", targetValue: 25000, currentValue: 18500, unit: "USD",
      deadline: new Date("2024-06-30"), status: "on_track",
      milestones: [
        { id: "m4", title: "First $5,000", targetValue: 5000, isCompleted: true },
        { id: "m5", title: "Reach $15,000", targetValue: 15000, isCompleted: true },
        { id: "m6", title: "Reach $25,000", targetValue: 25000, isCompleted: false },
      ],
      createdAt: new Date("2024-04-01"),
    },
    {
      id: "3", title: "Build 500-Person Network", description: "Expand professional network",
      category: "network", targetValue: 500, currentValue: 342, unit: "connections",
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), status: "at_risk",
      milestones: [
        { id: "m7", title: "250 connections", targetValue: 250, isCompleted: true },
        { id: "m8", title: "400 connections", targetValue: 400, isCompleted: false },
        { id: "m9", title: "500 connections", targetValue: 500, isCompleted: false },
      ],
      createdAt: new Date("2024-01-01"),
    },
  ]);

  const createGoal = useCallback((goal: Omit<Goal, "id" | "createdAt" | "status">) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      status: "on_track",
      createdAt: new Date(),
    };
    setGoals(prev => [newGoal, ...prev]);
    return newGoal;
  }, []);

  const updateProgress = useCallback((goalId: string, newValue: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const progress = newValue / g.targetValue;
      const daysRemaining = (g.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      const expectedProgress = 1 - (daysRemaining / 90); // Assumes 90-day goals
      
      let status: Goal["status"] = "on_track";
      if (progress >= 1) status = "completed";
      else if (progress < expectedProgress - 0.15) status = "behind";
      else if (progress < expectedProgress - 0.05) status = "at_risk";
      
      return { ...g, currentValue: newValue, status };
    }));
  }, []);

  const overallProgress = useMemo(() => {
    const activeGoals = goals.filter(g => g.status !== "completed");
    if (activeGoals.length === 0) return 100;
    return Math.round(activeGoals.reduce((sum, g) => sum + (g.currentValue / g.targetValue) * 100, 0) / activeGoals.length);
  }, [goals]);

  return { goals, createGoal, updateProgress, overallProgress };
}

// Activity Heatmap
interface ActivityData {
  date: string;
  count: number;
  types: { type: string; count: number }[];
}

interface ActivitySummary {
  totalActivities: number;
  averageDaily: number;
  streakCurrent: number;
  streakLongest: number;
  mostActiveDay: string;
  mostActiveType: string;
}

export function useActivityHeatmap() {
  const [activityData, setActivityData] = useState<ActivityData[]>(() => {
    // Generate mock data for last 365 days
    const data: ActivityData[] = [];
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const count = Math.floor(Math.random() * 10);
      data.push({
        date: date.toISOString().split("T")[0],
        count,
        types: [
          { type: "messages", count: Math.floor(count * 0.4) },
          { type: "projects", count: Math.floor(count * 0.3) },
          { type: "network", count: Math.floor(count * 0.2) },
          { type: "other", count: Math.floor(count * 0.1) },
        ],
      });
    }
    return data;
  });

  const summary = useMemo<ActivitySummary>(() => {
    const total = activityData.reduce((sum, d) => sum + d.count, 0);
    const average = total / activityData.length;
    
    // Calculate current streak
    let streak = 0;
    for (let i = activityData.length - 1; i >= 0; i--) {
      if (activityData[i].count > 0) streak++;
      else break;
    }
    
    // Find most active day
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    activityData.forEach(d => {
      const day = new Date(d.date).getDay();
      dayTotals[day] += d.count;
    });
    const mostActiveIndex = dayTotals.indexOf(Math.max(...dayTotals));
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    return {
      totalActivities: total,
      averageDaily: Math.round(average * 10) / 10,
      streakCurrent: streak,
      streakLongest: 45, // Mock value
      mostActiveDay: days[mostActiveIndex],
      mostActiveType: "messages",
    };
  }, [activityData]);

  return { activityData, summary };
}

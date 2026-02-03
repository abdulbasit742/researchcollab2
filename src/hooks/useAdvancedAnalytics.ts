import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

// =====================================================
// ADVANCED ANALYTICS & INSIGHTS (Features 66-75)
// =====================================================

// Feature 66: Productivity Analytics
export interface ProductivityAnalytics {
  time_period: 'daily' | 'weekly' | 'monthly';
  metrics: {
    deep_work_hours: number;
    meetings_hours: number;
    admin_hours: number;
    learning_hours: number;
    output_units: number;
  };
  productivity_score: number;
  peak_hours: number[];
  low_energy_patterns: string[];
  improvement_suggestions: string[];
}

// Feature 67: Comparative Performance Analysis
export interface PerformanceComparison {
  user_id: string;
  comparison_group: 'peers' | 'field' | 'institution';
  metrics: {
    metric: string;
    your_value: number;
    group_average: number;
    percentile: number;
  }[];
  strengths: string[];
  improvement_areas: string[];
}

// Feature 68: Predictive Career Analytics
export interface CareerPrediction {
  scenario: string;
  probability: number;
  timeline: string;
  key_factors: string[];
  recommended_actions: string[];
  risk_factors: string[];
}

// Feature 69: Network Value Analytics
export interface NetworkValueAnalytics {
  total_network_value: number;
  value_by_connection_type: { type: string; value: number }[];
  most_valuable_connections: { id: string; name: string; value: number }[];
  underutilized_connections: { id: string; potential_value: number }[];
  network_growth_rate: number;
}

// Feature 70: Opportunity Funnel Analytics
export interface OpportunityFunnel {
  stages: {
    stage: 'discovered' | 'evaluated' | 'applied' | 'interviewed' | 'offered' | 'accepted';
    count: number;
    conversion_rate: number;
    avg_time_in_stage_days: number;
  }[];
  bottleneck_stage: string;
  overall_conversion: number;
  improvement_recommendations: string[];
}

// Feature 71: Skill Utilization Analytics
export interface SkillUtilization {
  skill: string;
  proficiency_level: number;
  utilization_rate: number;
  demand_in_market: number;
  earning_potential: number;
  growth_trend: 'rising' | 'stable' | 'declining';
  recommendation: 'leverage' | 'develop' | 'maintain' | 'consider_pivoting';
}

// Feature 72: Time Investment ROI
export interface TimeInvestmentROI {
  category: string;
  hours_invested: number;
  returns: {
    type: 'income' | 'opportunity' | 'skill' | 'network';
    value: number;
  }[];
  total_return: number;
  roi_ratio: number;
  should_increase: boolean;
}

// Feature 73: Engagement Quality Score
export interface EngagementQuality {
  interaction_type: 'messaging' | 'collaboration' | 'mentoring' | 'presenting';
  quality_score: number;
  response_rate: number;
  depth_of_engagement: number;
  outcomes_generated: number;
  satisfaction_received: number;
}

// Feature 74: Goal Achievement Analytics
export interface GoalAchievementAnalytics {
  goals_set: number;
  goals_achieved: number;
  goals_in_progress: number;
  goals_abandoned: number;
  average_completion_time: number;
  success_rate: number;
  common_blockers: string[];
  best_performing_categories: string[];
}

// Feature 75: Risk Exposure Dashboard
export interface RiskExposure {
  risk_category: 'client_concentration' | 'skill_obsolescence' | 'market_dependency' | 'reputation';
  current_exposure: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  mitigation_actions: string[];
  projected_exposure_6mo: number;
}

export function useAdvancedAnalytics() {
  const { user } = useAuth();
  const [productivityData, setProductivityData] = useState<ProductivityAnalytics | null>(null);
  const [careerPredictions, setCareerPredictions] = useState<CareerPrediction[]>([]);
  const [skillUtilization, setSkillUtilization] = useState<SkillUtilization[]>([]);
  const [riskExposures, setRiskExposures] = useState<RiskExposure[]>([]);

  // Feature 66: Calculate Productivity Score
  const calculateProductivity = useCallback((
    activities: { type: string; hours: number; output: number }[]
  ): ProductivityAnalytics => {
    const deepWork = activities.filter(a => a.type === 'deep_work').reduce((sum, a) => sum + a.hours, 0);
    const meetings = activities.filter(a => a.type === 'meetings').reduce((sum, a) => sum + a.hours, 0);
    const admin = activities.filter(a => a.type === 'admin').reduce((sum, a) => sum + a.hours, 0);
    const learning = activities.filter(a => a.type === 'learning').reduce((sum, a) => sum + a.hours, 0);
    const output = activities.reduce((sum, a) => sum + a.output, 0);

    const totalHours = deepWork + meetings + admin + learning;
    const productivityScore = totalHours > 0 
      ? (deepWork / totalHours * 50) + (output / Math.max(totalHours, 1) * 50)
      : 0;

    return {
      time_period: 'weekly',
      metrics: {
        deep_work_hours: deepWork,
        meetings_hours: meetings,
        admin_hours: admin,
        learning_hours: learning,
        output_units: output
      },
      productivity_score: Math.min(100, productivityScore),
      peak_hours: [9, 10, 11, 14, 15],
      low_energy_patterns: meetings > deepWork ? ['Too many meetings'] : [],
      improvement_suggestions: [
        deepWork < 20 ? 'Increase focused work time' : 'Maintain deep work habits',
        admin > 10 ? 'Automate administrative tasks' : 'Admin time is well-managed'
      ]
    };
  }, []);

  // Feature 70: Analyze Opportunity Funnel
  const analyzeOpportunityFunnel = useCallback((
    opportunities: { stage: string; entered_at: string; exited_at?: string }[]
  ): OpportunityFunnel => {
    const stages: OpportunityFunnel['stages'] = [
      'discovered', 'evaluated', 'applied', 'interviewed', 'offered', 'accepted'
    ].map((stage, index, arr) => {
      const atStage = opportunities.filter(o => o.stage === stage).length;
      const nextStage = arr[index + 1];
      const advanced = nextStage ? opportunities.filter(o => o.stage === nextStage).length : 0;
      
      return {
        stage: stage as any,
        count: atStage,
        conversion_rate: atStage > 0 ? (advanced / atStage) * 100 : 0,
        avg_time_in_stage_days: 7 + index * 3
      };
    });

    const bottleneck = stages.reduce((min, s) => 
      s.conversion_rate < min.conversion_rate ? s : min, stages[0]);

    return {
      stages,
      bottleneck_stage: bottleneck.stage,
      overall_conversion: stages[0].count > 0 
        ? (stages[stages.length - 1].count / stages[0].count) * 100 
        : 0,
      improvement_recommendations: [
        `Focus on improving ${bottleneck.stage} stage conversion`,
        'Follow up within 48 hours of each interaction'
      ]
    };
  }, []);

  // Feature 71: Analyze Skill Utilization
  const analyzeSkillUtilization = useCallback((
    skills: { skill: string; level: number; projects_used: number; market_demand: number; hourly_rate: number }[]
  ): SkillUtilization[] => {
    return skills.map(s => {
      const utilization = (s.projects_used / 10) * 100; // Assuming 10 projects is full utilization
      const shouldLeverage = s.level > 70 && s.market_demand > 70 && utilization < 50;
      const shouldDevelop = s.level < 50 && s.market_demand > 80;
      const shouldPivot = s.market_demand < 30 && s.level > 50;

      return {
        skill: s.skill,
        proficiency_level: s.level,
        utilization_rate: Math.min(100, utilization),
        demand_in_market: s.market_demand,
        earning_potential: s.hourly_rate * 160, // Monthly
        growth_trend: s.market_demand > 60 ? 'rising' : s.market_demand < 40 ? 'declining' : 'stable',
        recommendation: shouldLeverage ? 'leverage' : shouldDevelop ? 'develop' : shouldPivot ? 'consider_pivoting' : 'maintain'
      };
    });
  }, []);

  // Feature 75: Assess Risk Exposure
  const assessRiskExposure = useCallback((
    clientConcentration: number,
    skillAge: number,
    marketDependency: number,
    reputationScore: number
  ): RiskExposure[] => {
    return [
      {
        risk_category: 'client_concentration',
        current_exposure: clientConcentration,
        trend: clientConcentration > 50 ? 'increasing' : 'stable',
        mitigation_actions: ['Diversify client base', 'Develop new market segments'],
        projected_exposure_6mo: Math.max(0, clientConcentration - 10)
      },
      {
        risk_category: 'skill_obsolescence',
        current_exposure: skillAge > 5 ? skillAge * 10 : 20,
        trend: skillAge > 3 ? 'increasing' : 'stable',
        mitigation_actions: ['Invest in learning new technologies', 'Attend industry conferences'],
        projected_exposure_6mo: skillAge * 12
      },
      {
        risk_category: 'market_dependency',
        current_exposure: marketDependency,
        trend: 'stable',
        mitigation_actions: ['Explore adjacent markets', 'Build transferable skills'],
        projected_exposure_6mo: marketDependency
      },
      {
        risk_category: 'reputation',
        current_exposure: 100 - reputationScore,
        trend: reputationScore > 80 ? 'decreasing' : 'stable',
        mitigation_actions: ['Maintain quality standards', 'Gather testimonials'],
        projected_exposure_6mo: 100 - reputationScore - 5
      }
    ];
  }, []);

  return {
    productivityData,
    careerPredictions,
    skillUtilization,
    riskExposures,
    calculateProductivity,
    analyzeOpportunityFunnel,
    analyzeSkillUtilization,
    assessRiskExposure,
    setProductivityData,
    setCareerPredictions
  };
}

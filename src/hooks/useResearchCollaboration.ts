import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// RESEARCH & ACADEMIC COLLABORATION (Features 1-10)
// =====================================================

// Feature 1: Research Project Matching
export interface ResearchMatch {
  project_id: string;
  title: string;
  domain: string;
  methodology_fit: number;
  expertise_overlap: number;
  timeline_compatibility: number;
  funding_status: 'funded' | 'seeking' | 'self-funded';
  collaboration_type: 'co-author' | 'advisor' | 'data-provider' | 'reviewer';
  institution_reputation: number;
  overall_fit_score: number;
}

// Feature 2: Methodology Compatibility Matrix
export interface MethodologyCompatibility {
  user_methods: string[];
  project_methods: string[];
  overlap_score: number;
  complementary_methods: string[];
  learning_opportunities: string[];
}

// Feature 3: Research Timeline Sync
export interface ResearchTimeline {
  project_id: string;
  phases: {
    phase: string;
    start_date: string;
    end_date: string;
    status: 'pending' | 'active' | 'completed' | 'delayed';
    dependencies: string[];
  }[];
  critical_path: string[];
  buffer_days: number;
}

// Feature 4: Co-Authorship Contribution Tracking
export interface ContributionRecord {
  publication_id: string;
  contributor_id: string;
  contribution_type: 'conceptualization' | 'methodology' | 'data_collection' | 'analysis' | 'writing' | 'review' | 'supervision';
  percentage: number;
  verified_by: string[];
  timestamp: string;
}

// Feature 5: Peer Review Quality Metrics
export interface ReviewQuality {
  reviewer_id: string;
  reviews_completed: number;
  average_turnaround_days: number;
  constructiveness_score: number;
  accuracy_score: number;
  author_satisfaction: number;
  domain_expertise_verified: boolean;
}

// Feature 6: Dataset Sharing Protocol
export interface DatasetShare {
  dataset_id: string;
  owner_id: string;
  access_level: 'public' | 'restricted' | 'private';
  license_type: 'CC-BY' | 'CC-BY-NC' | 'proprietary' | 'custom';
  usage_tracking: boolean;
  citation_required: boolean;
  access_requests: {
    requester_id: string;
    purpose: string;
    status: 'pending' | 'approved' | 'denied';
  }[];
}

// Feature 7: Lab Resource Coordination
export interface LabResource {
  resource_id: string;
  resource_type: 'equipment' | 'facility' | 'software' | 'personnel';
  availability_schedule: { day: string; slots: string[] }[];
  booking_priority: 'first-come' | 'seniority' | 'project-priority';
  usage_cost: number;
  maintenance_schedule: string[];
}

// Feature 8: Research Ethics Compliance
export interface EthicsCompliance {
  project_id: string;
  irb_status: 'not_required' | 'pending' | 'approved' | 'expired';
  consent_protocols: string[];
  data_handling_plan: string;
  risk_assessment: 'minimal' | 'moderate' | 'significant';
  compliance_officer: string;
}

// Feature 9: Grant Alignment Scoring
export interface GrantAlignment {
  grant_id: string;
  project_id: string;
  theme_alignment: number;
  methodology_fit: number;
  budget_compatibility: number;
  timeline_fit: number;
  eligibility_met: boolean;
  missing_requirements: string[];
  overall_score: number;
}

// Feature 10: Research Output Tracking
export interface ResearchOutput {
  project_id: string;
  outputs: {
    type: 'paper' | 'patent' | 'dataset' | 'software' | 'presentation';
    title: string;
    status: 'draft' | 'submitted' | 'published';
    impact_score: number;
    citations: number;
  }[];
  output_velocity: number;
  quality_index: number;
}

export function useResearchCollaboration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [researchMatches, setResearchMatches] = useState<ResearchMatch[]>([]);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [ethicsStatus, setEthicsStatus] = useState<EthicsCompliance | null>(null);

  // Feature 1: Calculate Research Match Score
  const calculateResearchMatchScore = useCallback((
    userExpertise: string[],
    projectRequirements: string[],
    userMethodologies: string[],
    projectMethodologies: string[]
  ): number => {
    const expertiseOverlap = userExpertise.filter(e => projectRequirements.includes(e)).length;
    const methodOverlap = userMethodologies.filter(m => projectMethodologies.includes(m)).length;
    
    const expertiseScore = (expertiseOverlap / Math.max(projectRequirements.length, 1)) * 50;
    const methodScore = (methodOverlap / Math.max(projectMethodologies.length, 1)) * 30;
    const baseScore = 20;
    
    return Math.min(100, expertiseScore + methodScore + baseScore);
  }, []);

  // Feature 4: Record Contribution
  const recordContribution = useCallback(async (
    publicationId: string,
    contributionType: ContributionRecord['contribution_type'],
    percentage: number
  ) => {
    if (!user) return;

    const contribution: ContributionRecord = {
      publication_id: publicationId,
      contributor_id: user.id,
      contribution_type: contributionType,
      percentage,
      verified_by: [],
      timestamp: new Date().toISOString()
    };

    setContributions(prev => [...prev, contribution]);
    toast({ title: "Contribution Recorded", description: "Your contribution has been logged for verification" });
  }, [user, toast]);

  // Feature 5: Calculate Review Quality Score
  const calculateReviewQuality = useCallback((
    turnaroundDays: number,
    authorRatings: number[],
    accuracyRatings: number[]
  ): ReviewQuality => {
    const avgSatisfaction = authorRatings.reduce((a, b) => a + b, 0) / Math.max(authorRatings.length, 1);
    const avgAccuracy = accuracyRatings.reduce((a, b) => a + b, 0) / Math.max(accuracyRatings.length, 1);
    
    return {
      reviewer_id: user?.id || '',
      reviews_completed: authorRatings.length,
      average_turnaround_days: turnaroundDays,
      constructiveness_score: avgSatisfaction * 20,
      accuracy_score: avgAccuracy * 20,
      author_satisfaction: avgSatisfaction,
      domain_expertise_verified: avgAccuracy > 4
    };
  }, [user]);

  // Feature 9: Calculate Grant Alignment
  const calculateGrantAlignment = useCallback((
    grantThemes: string[],
    projectThemes: string[],
    grantBudget: number,
    projectBudget: number,
    grantDeadline: string,
    projectEnd: string
  ): number => {
    const themeOverlap = grantThemes.filter(t => projectThemes.includes(t)).length / Math.max(grantThemes.length, 1);
    const budgetFit = Math.min(grantBudget, projectBudget) / Math.max(grantBudget, projectBudget);
    const timelineFit = new Date(grantDeadline) >= new Date(projectEnd) ? 1 : 0.5;
    
    return Math.round((themeOverlap * 40 + budgetFit * 30 + timelineFit * 30));
  }, []);

  return {
    researchMatches,
    contributions,
    ethicsStatus,
    calculateResearchMatchScore,
    recordContribution,
    calculateReviewQuality,
    calculateGrantAlignment,
    setEthicsStatus
  };
}

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// KNOWLEDGE MANAGEMENT SYSTEM (Features 11-20)
// =====================================================

// Feature 11: Personal Knowledge Graph
export interface KnowledgeNode {
  id: string;
  type: 'concept' | 'skill' | 'project' | 'person' | 'resource';
  label: string;
  strength: number; // 0-100
  last_accessed: string;
  connections: { target_id: string; relationship: string; weight: number }[];
}

// Feature 12: Expertise Evolution Tracking
export interface ExpertiseEvolution {
  skill: string;
  timeline: {
    date: string;
    level: 'novice' | 'intermediate' | 'advanced' | 'expert';
    evidence: string;
  }[];
  current_level: string;
  growth_rate: number;
  predicted_mastery_date: string;
}

// Feature 13: Learning Path Recommendations
export interface LearningPath {
  goal: string;
  current_level: number;
  target_level: number;
  steps: {
    step: number;
    resource_type: 'course' | 'project' | 'mentorship' | 'practice';
    title: string;
    estimated_hours: number;
    prerequisites: string[];
  }[];
  estimated_completion: string;
  success_probability: number;
}

// Feature 14: Knowledge Gap Analysis
export interface KnowledgeGap {
  domain: string;
  required_for: string[];
  current_coverage: number;
  gap_severity: 'minor' | 'moderate' | 'critical';
  recommended_actions: string[];
  peer_comparison: number;
}

// Feature 15: Insight Capture System
export interface CapturedInsight {
  id: string;
  content: string;
  source_type: 'reading' | 'conversation' | 'experience' | 'reflection';
  source_reference: string;
  tags: string[];
  linked_projects: string[];
  captured_at: string;
  revisit_count: number;
  usefulness_rating: number;
}

// Feature 16: Cross-Domain Connection Detection
export interface CrossDomainConnection {
  domain_a: string;
  domain_b: string;
  connection_type: 'methodology' | 'theory' | 'application' | 'data';
  strength: number;
  discovered_at: string;
  exploitation_opportunities: string[];
}

// Feature 17: Knowledge Decay Prevention
export interface DecayPrevention {
  skill: string;
  last_used: string;
  decay_rate: number;
  current_retention: number;
  refresh_needed_by: string;
  refresh_activities: string[];
}

// Feature 18: Collaborative Knowledge Building
export interface CollaborativeKnowledge {
  topic_id: string;
  contributors: { user_id: string; contribution_count: number }[];
  total_entries: number;
  quality_score: number;
  growth_rate: number;
  most_active_period: string;
}

// Feature 19: Knowledge Impact Tracking
export interface KnowledgeImpact {
  knowledge_id: string;
  applications: {
    project_id: string;
    outcome: 'success' | 'partial' | 'failure';
    value_generated: number;
  }[];
  total_impact_score: number;
  roi: number;
}

// Feature 20: Expertise Certification Pathway
export interface CertificationPath {
  domain: string;
  levels: {
    level: string;
    requirements: { type: string; count: number; current: number }[];
    verified: boolean;
    verified_at?: string;
  }[];
  current_progress: number;
  next_milestone: string;
}

export function useKnowledgeManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeNode[]>([]);
  const [expertiseEvolution, setExpertiseEvolution] = useState<ExpertiseEvolution[]>([]);
  const [insights, setInsights] = useState<CapturedInsight[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  // Feature 11: Build Knowledge Graph
  const buildKnowledgeGraph = useCallback((
    skills: string[],
    projects: { id: string; skills: string[] }[],
    connections: { id: string; expertise: string[] }[]
  ): KnowledgeNode[] => {
    const nodes: KnowledgeNode[] = [];
    
    // Add skill nodes
    skills.forEach(skill => {
      const relatedProjects = projects.filter(p => p.skills.includes(skill));
      nodes.push({
        id: `skill-${skill}`,
        type: 'skill',
        label: skill,
        strength: Math.min(100, relatedProjects.length * 20),
        last_accessed: new Date().toISOString(),
        connections: relatedProjects.map(p => ({
          target_id: `project-${p.id}`,
          relationship: 'applied_in',
          weight: 0.8
        }))
      });
    });

    return nodes;
  }, []);

  // Feature 14: Analyze Knowledge Gaps
  const analyzeKnowledgeGaps = useCallback((
    currentSkills: { skill: string; level: number }[],
    targetRole: { required_skills: { skill: string; min_level: number }[] }
  ): KnowledgeGap[] => {
    const gaps: KnowledgeGap[] = [];
    
    targetRole.required_skills.forEach(req => {
      const current = currentSkills.find(s => s.skill === req.skill);
      const coverage = current ? (current.level / req.min_level) * 100 : 0;
      
      if (coverage < 100) {
        gaps.push({
          domain: req.skill,
          required_for: [targetRole.required_skills[0].skill],
          current_coverage: coverage,
          gap_severity: coverage < 30 ? 'critical' : coverage < 70 ? 'moderate' : 'minor',
          recommended_actions: [
            `Complete ${req.skill} certification`,
            `Work on project requiring ${req.skill}`,
            `Find mentor with ${req.skill} expertise`
          ],
          peer_comparison: 50 // Placeholder
        });
      }
    });

    return gaps;
  }, []);

  // Feature 15: Capture Insight
  const captureInsight = useCallback((
    content: string,
    sourceType: CapturedInsight['source_type'],
    sourceReference: string,
    tags: string[]
  ) => {
    const insight: CapturedInsight = {
      id: crypto.randomUUID(),
      content,
      source_type: sourceType,
      source_reference: sourceReference,
      tags,
      linked_projects: [],
      captured_at: new Date().toISOString(),
      revisit_count: 0,
      usefulness_rating: 0
    };

    setInsights(prev => [...prev, insight]);
    toast({ title: "Insight Captured", description: "Your insight has been saved" });
    return insight;
  }, [toast]);

  // Feature 17: Check Decay Status
  const checkDecayStatus = useCallback((
    skill: string,
    lastUsed: string,
    baseRetention: number
  ): DecayPrevention => {
    const daysSinceUse = Math.floor(
      (Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24)
    );
    const decayRate = 0.5; // 0.5% per day
    const currentRetention = Math.max(0, baseRetention - (daysSinceUse * decayRate));
    
    return {
      skill,
      last_used: lastUsed,
      decay_rate: decayRate,
      current_retention: currentRetention,
      refresh_needed_by: new Date(Date.now() + (currentRetention / decayRate) * 24 * 60 * 60 * 1000).toISOString(),
      refresh_activities: [
        'Review documentation',
        'Complete a small project',
        'Teach someone else'
      ]
    };
  }, []);

  // Feature 13: Generate Learning Path
  const generateLearningPath = useCallback((
    goal: string,
    currentLevel: number,
    targetLevel: number
  ): LearningPath => {
    const levelGap = targetLevel - currentLevel;
    const steps = [];
    
    for (let i = 0; i < Math.ceil(levelGap * 2); i++) {
      steps.push({
        step: i + 1,
        resource_type: i % 2 === 0 ? 'course' : 'project' as const,
        title: `${goal} - Step ${i + 1}`,
        estimated_hours: 10 + (i * 5),
        prerequisites: i > 0 ? [`Step ${i}`] : []
      });
    }

    return {
      goal,
      current_level: currentLevel,
      target_level: targetLevel,
      steps,
      estimated_completion: new Date(Date.now() + steps.length * 7 * 24 * 60 * 60 * 1000).toISOString(),
      success_probability: Math.max(50, 90 - levelGap * 10)
    };
  }, []);

  return {
    knowledgeGraph,
    expertiseEvolution,
    insights,
    learningPaths,
    buildKnowledgeGraph,
    analyzeKnowledgeGaps,
    captureInsight,
    checkDecayStatus,
    generateLearningPath,
    setKnowledgeGraph
  };
}

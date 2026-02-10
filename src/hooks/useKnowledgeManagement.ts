import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUniversalAI } from "@/hooks/useUniversalAI";

// =====================================================
// KNOWLEDGE MANAGEMENT SYSTEM (Features 11-20)
// =====================================================

// Feature 11: Personal Knowledge Graph
export interface KnowledgeNode {
  id: string;
  type: 'concept' | 'skill' | 'project' | 'person' | 'resource';
  label: string;
  strength: number;
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
  const { ask, loading: aiLoading } = useUniversalAI();
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeNode[]>([]);
  const [expertiseEvolution, setExpertiseEvolution] = useState<ExpertiseEvolution[]>([]);
  const [insights, setInsights] = useState<CapturedInsight[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  // Feature 11: Build Knowledge Graph (local, fast)
  const buildKnowledgeGraph = useCallback((
    skills: string[],
    projects: { id: string; skills: string[] }[],
    connections: { id: string; expertise: string[] }[]
  ): KnowledgeNode[] => {
    const nodes: KnowledgeNode[] = [];
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

  // Feature 14: AI-powered Knowledge Gap Analysis
  const analyzeKnowledgeGaps = useCallback(async (
    currentSkills: { skill: string; level: number }[],
    targetRole: { required_skills: { skill: string; min_level: number }[] }
  ): Promise<KnowledgeGap[]> => {
    const result = await ask<{ gaps: any[] }>("knowledge", "analyze-gaps", {
      current_skills: currentSkills,
      target_role: targetRole,
    });

    if (result?.gaps) {
      return result.gaps.map((g: any) => ({
        domain: g.domain,
        required_for: [targetRole.required_skills[0]?.skill || "target role"],
        current_coverage: g.current_coverage ?? 0,
        gap_severity: g.gap_severity || "moderate",
        recommended_actions: g.recommended_actions || [],
        peer_comparison: 50,
      }));
    }

    // Fallback to local logic
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
          recommended_actions: [`Complete ${req.skill} certification`, `Work on project requiring ${req.skill}`],
          peer_comparison: 50,
        });
      }
    });
    return gaps;
  }, [ask]);

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

  // Feature 17: AI-powered Decay Check
  const checkDecayStatus = useCallback(async (
    skill: string,
    lastUsed: string,
    baseRetention: number
  ): Promise<DecayPrevention> => {
    const result = await ask<any>("knowledge", "check-decay", {
      skill,
      last_used: lastUsed,
      base_retention: baseRetention,
    });

    if (result?.current_retention !== undefined) {
      return {
        skill,
        last_used: lastUsed,
        decay_rate: result.decay_rate_per_day ?? 0.5,
        current_retention: result.current_retention,
        refresh_needed_by: result.refresh_needed_by || new Date(Date.now() + 30 * 86400000).toISOString(),
        refresh_activities: (result.refresh_activities || []).map((a: any) => typeof a === "string" ? a : a.activity),
      };
    }

    // Fallback
    const daysSinceUse = Math.floor((Date.now() - new Date(lastUsed).getTime()) / 86400000);
    const decayRate = 0.5;
    const currentRetention = Math.max(0, baseRetention - daysSinceUse * decayRate);
    return {
      skill, last_used: lastUsed, decay_rate: decayRate, current_retention: currentRetention,
      refresh_needed_by: new Date(Date.now() + (currentRetention / decayRate) * 86400000).toISOString(),
      refresh_activities: ['Review documentation', 'Complete a small project', 'Teach someone else'],
    };
  }, [ask]);

  // Feature 13: AI-powered Learning Path
  const generateLearningPath = useCallback(async (
    goal: string,
    currentLevel: number,
    targetLevel: number
  ): Promise<LearningPath> => {
    const result = await ask<any>("knowledge", "generate-learning-path", {
      goal, current_level: currentLevel, target_level: targetLevel,
    });

    if (result?.steps) {
      const path: LearningPath = {
        goal,
        current_level: currentLevel,
        target_level: targetLevel,
        steps: result.steps.map((s: any, i: number) => ({
          step: s.step ?? i + 1,
          resource_type: s.resource_type || "course",
          title: s.title || `Step ${i + 1}`,
          estimated_hours: s.estimated_hours ?? 10,
          prerequisites: s.prerequisites || [],
        })),
        estimated_completion: new Date(Date.now() + (result.estimated_completion_weeks || 8) * 7 * 86400000).toISOString(),
        success_probability: result.success_probability ?? 75,
      };
      setLearningPaths(prev => [...prev, path]);
      return path;
    }

    // Fallback
    const levelGap = targetLevel - currentLevel;
    const steps = [];
    for (let i = 0; i < Math.ceil(levelGap * 2); i++) {
      steps.push({
        step: i + 1,
        resource_type: i % 2 === 0 ? 'course' : 'project' as const,
        title: `${goal} - Step ${i + 1}`,
        estimated_hours: 10 + i * 5,
        prerequisites: i > 0 ? [`Step ${i}`] : [],
      });
    }
    const path: LearningPath = {
      goal, current_level: currentLevel, target_level: targetLevel, steps,
      estimated_completion: new Date(Date.now() + steps.length * 7 * 86400000).toISOString(),
      success_probability: Math.max(50, 90 - levelGap * 10),
    };
    setLearningPaths(prev => [...prev, path]);
    return path;
  }, [ask]);

  return {
    knowledgeGraph, expertiseEvolution, insights, learningPaths,
    buildKnowledgeGraph, analyzeKnowledgeGaps, captureInsight,
    checkDecayStatus, generateLearningPath, setKnowledgeGraph,
    aiLoading,
  };
}

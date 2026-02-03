import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// PORTFOLIO & PROJECT SHOWCASE (Features 76-80)
// =====================================================

// Feature 76: Dynamic Portfolio Builder
export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  role: string;
  skills_demonstrated: string[];
  outcomes: { metric: string; value: string }[];
  media: { type: 'image' | 'video' | 'document' | 'link'; url: string }[];
  collaborators: string[];
  date_completed: string;
  visibility: 'public' | 'network' | 'private';
  featured: boolean;
  verification_status: 'unverified' | 'peer_verified' | 'client_verified' | 'institution_verified';
}

// Feature 77: Case Study Generator
export interface CaseStudy {
  id: string;
  project_id: string;
  challenge: string;
  approach: string;
  solution: string;
  results: { metric: string; before: string; after: string; improvement: string }[];
  lessons_learned: string[];
  testimonial?: { author: string; role: string; quote: string };
  generated_at: string;
}

// Feature 78: Skill Evidence Mapping
export interface SkillEvidence {
  skill: string;
  evidence_items: {
    type: 'project' | 'certification' | 'endorsement' | 'publication' | 'award';
    title: string;
    date: string;
    strength: 'strong' | 'moderate' | 'supporting';
    verifiable: boolean;
  }[];
  total_evidence_strength: number;
  gaps: string[];
}

// Feature 79: Portfolio Analytics
export interface PortfolioAnalytics {
  total_views: number;
  unique_viewers: number;
  most_viewed_projects: { id: string; title: string; views: number }[];
  viewer_demographics: { category: string; percentage: number }[];
  engagement_rate: number;
  inquiry_rate: number;
  best_performing_skills: string[];
}

// Feature 80: Exportable Portfolio Formats
export interface PortfolioExport {
  format: 'pdf' | 'website' | 'slide_deck' | 'video_reel';
  customization: {
    theme: string;
    sections_included: string[];
    branding: { logo?: string; colors?: string[] };
  };
  generated_url?: string;
  last_generated: string;
}

export function usePortfolioShowcase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<PortfolioAnalytics | null>(null);

  // Feature 76: Add Portfolio Project
  const addPortfolioProject = useCallback((
    project: Omit<PortfolioProject, 'id' | 'verification_status'>
  ): PortfolioProject => {
    const newProject: PortfolioProject = {
      ...project,
      id: crypto.randomUUID(),
      verification_status: 'unverified'
    };

    setPortfolioProjects(prev => [...prev, newProject]);
    toast({ title: "Project Added", description: "Your project has been added to your portfolio" });
    return newProject;
  }, [toast]);

  // Feature 77: Generate Case Study
  const generateCaseStudy = useCallback((
    projectId: string,
    challenge: string,
    approach: string,
    solution: string,
    results: CaseStudy['results']
  ): CaseStudy => {
    const caseStudy: CaseStudy = {
      id: crypto.randomUUID(),
      project_id: projectId,
      challenge,
      approach,
      solution,
      results,
      lessons_learned: [
        'Document decisions early',
        'Stakeholder communication is key',
        'Iterate based on feedback'
      ],
      generated_at: new Date().toISOString()
    };

    setCaseStudies(prev => [...prev, caseStudy]);
    toast({ title: "Case Study Generated", description: "Your case study is ready" });
    return caseStudy;
  }, [toast]);

  // Feature 78: Map Skill Evidence
  const mapSkillEvidence = useCallback((
    skill: string,
    projects: PortfolioProject[],
    certifications: { title: string; date: string }[],
    endorsements: { endorser: string; date: string }[]
  ): SkillEvidence => {
    const evidence: SkillEvidence['evidence_items'] = [];

    // Add project evidence
    projects.filter(p => p.skills_demonstrated.includes(skill)).forEach(p => {
      evidence.push({
        type: 'project',
        title: p.title,
        date: p.date_completed,
        strength: p.verification_status !== 'unverified' ? 'strong' : 'moderate',
        verifiable: p.verification_status !== 'unverified'
      });
    });

    // Add certification evidence
    certifications.forEach(c => {
      evidence.push({
        type: 'certification',
        title: c.title,
        date: c.date,
        strength: 'strong',
        verifiable: true
      });
    });

    // Add endorsement evidence
    endorsements.forEach(e => {
      evidence.push({
        type: 'endorsement',
        title: `Endorsed by ${e.endorser}`,
        date: e.date,
        strength: 'supporting',
        verifiable: false
      });
    });

    const strengthScore = evidence.reduce((score, e) => {
      return score + (e.strength === 'strong' ? 30 : e.strength === 'moderate' ? 20 : 10);
    }, 0);

    return {
      skill,
      evidence_items: evidence,
      total_evidence_strength: Math.min(100, strengthScore),
      gaps: evidence.length < 3 ? ['Add more verified projects', 'Get professional certification'] : []
    };
  }, []);

  return {
    portfolioProjects,
    caseStudies,
    portfolioAnalytics,
    addPortfolioProject,
    generateCaseStudy,
    mapSkillEvidence,
    setPortfolioProjects,
    setPortfolioAnalytics
  };
}

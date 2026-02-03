import { useState, useCallback, useMemo } from "react";

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  duration: string;
  deliverables: string[];
  dependencies: string[];
  order: number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  domain: "research" | "development" | "consulting" | "training" | "design" | "analysis";
  description: string;
  complexity: "simple" | "moderate" | "complex";
  estimatedDuration: string;
  estimatedBudget: { min: number; max: number };
  milestones: ProjectMilestone[];
  requiredSkills: string[];
  teamSizeRange: { min: number; max: number };
  successRate: number;
  usageCount: number;
  rating: number;
  tags: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: Date;
}

export interface ProjectFromTemplate {
  templateId: string;
  title: string;
  description: string;
  startDate: Date;
  totalBudget: number;
  teamMembers: string[];
  customMilestones?: ProjectMilestone[];
}

const DEFAULT_PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "pt-research",
    name: "Academic Research Project",
    domain: "research",
    description: "Structured template for literature review, methodology development, data collection, and publication",
    complexity: "complex",
    estimatedDuration: "6-12 months",
    estimatedBudget: { min: 15000, max: 75000 },
    milestones: [
      { id: "m1", title: "Literature Review", description: "Comprehensive review of existing research", duration: "4 weeks", deliverables: ["Literature review document", "Research gaps analysis"], dependencies: [], order: 1 },
      { id: "m2", title: "Methodology Design", description: "Define research methodology and approach", duration: "3 weeks", deliverables: ["Methodology document", "Research protocol"], dependencies: ["m1"], order: 2 },
      { id: "m3", title: "Data Collection", description: "Execute data collection plan", duration: "8 weeks", deliverables: ["Raw data", "Collection notes"], dependencies: ["m2"], order: 3 },
      { id: "m4", title: "Analysis & Findings", description: "Analyze data and document findings", duration: "6 weeks", deliverables: ["Analysis results", "Preliminary findings"], dependencies: ["m3"], order: 4 },
      { id: "m5", title: "Publication Preparation", description: "Prepare manuscript for publication", duration: "4 weeks", deliverables: ["Draft manuscript", "Supplementary materials"], dependencies: ["m4"], order: 5 },
    ],
    requiredSkills: ["Research methodology", "Data analysis", "Academic writing"],
    teamSizeRange: { min: 2, max: 6 },
    successRate: 84,
    usageCount: 234,
    rating: 4.6,
    tags: ["academic", "publication", "data-driven"],
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 365),
  },
  {
    id: "pt-mvp",
    name: "MVP Development Sprint",
    domain: "development",
    description: "Fast-paced template for building minimum viable products with rapid iteration cycles",
    complexity: "moderate",
    estimatedDuration: "2-3 months",
    estimatedBudget: { min: 25000, max: 100000 },
    milestones: [
      { id: "m1", title: "Discovery & Planning", description: "Define scope, user stories, and technical requirements", duration: "1 week", deliverables: ["PRD", "Technical spec", "User stories"], dependencies: [], order: 1 },
      { id: "m2", title: "Design Sprint", description: "UI/UX design and prototyping", duration: "2 weeks", deliverables: ["Wireframes", "Design system", "Prototype"], dependencies: ["m1"], order: 2 },
      { id: "m3", title: "Core Development", description: "Build core functionality", duration: "4 weeks", deliverables: ["Working backend", "Core features", "API documentation"], dependencies: ["m2"], order: 3 },
      { id: "m4", title: "Testing & Refinement", description: "QA testing and bug fixes", duration: "2 weeks", deliverables: ["Test results", "Bug fixes", "Performance report"], dependencies: ["m3"], order: 4 },
      { id: "m5", title: "Launch Preparation", description: "Final preparations for launch", duration: "1 week", deliverables: ["Deployed MVP", "Launch checklist", "Monitoring setup"], dependencies: ["m4"], order: 5 },
    ],
    requiredSkills: ["Full-stack development", "UI/UX design", "Project management"],
    teamSizeRange: { min: 3, max: 8 },
    successRate: 79,
    usageCount: 567,
    rating: 4.4,
    tags: ["startup", "agile", "rapid"],
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 180),
  },
  {
    id: "pt-strategy",
    name: "Strategic Consulting Engagement",
    domain: "consulting",
    description: "Template for structured strategy consulting with clear phases from assessment to implementation",
    complexity: "moderate",
    estimatedDuration: "2-4 months",
    estimatedBudget: { min: 30000, max: 150000 },
    milestones: [
      { id: "m1", title: "Stakeholder Discovery", description: "Interview stakeholders and understand current state", duration: "2 weeks", deliverables: ["Interview notes", "Current state assessment"], dependencies: [], order: 1 },
      { id: "m2", title: "Analysis & Diagnosis", description: "Analyze findings and identify opportunities", duration: "3 weeks", deliverables: ["Analysis report", "Opportunity map"], dependencies: ["m1"], order: 2 },
      { id: "m3", title: "Strategy Development", description: "Develop strategic recommendations", duration: "3 weeks", deliverables: ["Strategy document", "Roadmap"], dependencies: ["m2"], order: 3 },
      { id: "m4", title: "Presentation & Alignment", description: "Present to leadership and align on direction", duration: "1 week", deliverables: ["Executive presentation", "Decision matrix"], dependencies: ["m3"], order: 4 },
      { id: "m5", title: "Implementation Support", description: "Guide initial implementation", duration: "4 weeks", deliverables: ["Implementation guide", "Progress reports"], dependencies: ["m4"], order: 5 },
    ],
    requiredSkills: ["Strategic thinking", "Stakeholder management", "Business analysis"],
    teamSizeRange: { min: 2, max: 5 },
    successRate: 88,
    usageCount: 189,
    rating: 4.7,
    tags: ["strategy", "executive", "transformation"],
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 270),
  },
  {
    id: "pt-workshop",
    name: "Training Workshop Series",
    domain: "training",
    description: "Template for designing and delivering professional training workshops",
    complexity: "simple",
    estimatedDuration: "1-2 months",
    estimatedBudget: { min: 5000, max: 25000 },
    milestones: [
      { id: "m1", title: "Needs Assessment", description: "Assess training needs and learning objectives", duration: "1 week", deliverables: ["Needs assessment", "Learning objectives"], dependencies: [], order: 1 },
      { id: "m2", title: "Curriculum Design", description: "Design training curriculum and materials", duration: "2 weeks", deliverables: ["Curriculum outline", "Training materials"], dependencies: ["m1"], order: 2 },
      { id: "m3", title: "Workshop Delivery", description: "Conduct training sessions", duration: "Variable", deliverables: ["Session recordings", "Participant materials"], dependencies: ["m2"], order: 3 },
      { id: "m4", title: "Evaluation & Follow-up", description: "Evaluate outcomes and provide follow-up support", duration: "1 week", deliverables: ["Evaluation report", "Improvement recommendations"], dependencies: ["m3"], order: 4 },
    ],
    requiredSkills: ["Instructional design", "Facilitation", "Subject matter expertise"],
    teamSizeRange: { min: 1, max: 3 },
    successRate: 92,
    usageCount: 423,
    rating: 4.8,
    tags: ["education", "skills", "corporate"],
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 120),
  },
];

export function useProjectTemplates() {
  const [templates] = useState<ProjectTemplate[]>(DEFAULT_PROJECT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  const templatesByDomain = useMemo(() => {
    const grouped: Record<string, ProjectTemplate[]> = {};
    templates.forEach(t => {
      if (!grouped[t.domain]) grouped[t.domain] = [];
      grouped[t.domain].push(t);
    });
    return grouped;
  }, [templates]);

  const getRecommendedTemplates = useCallback((
    skills: string[],
    preferredDomain?: string,
    budgetRange?: { min: number; max: number }
  ): ProjectTemplate[] => {
    return templates
      .filter(t => {
        if (preferredDomain && t.domain !== preferredDomain) return false;
        if (budgetRange && (t.estimatedBudget.min > budgetRange.max || t.estimatedBudget.max < budgetRange.min)) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by skill match and rating
        const aSkillMatch = a.requiredSkills.filter(s => skills.includes(s)).length;
        const bSkillMatch = b.requiredSkills.filter(s => skills.includes(s)).length;
        if (aSkillMatch !== bSkillMatch) return bSkillMatch - aSkillMatch;
        return b.rating - a.rating;
      })
      .slice(0, 5);
  }, [templates]);

  const createProjectFromTemplate = useCallback(async (project: ProjectFromTemplate) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log("Creating project from template:", project);
    setLoading(false);
    return { success: true, projectId: `project-${Date.now()}` };
  }, []);

  const estimateBudget = useCallback((
    templateId: string,
    teamSize: number,
    durationWeeks: number
  ): { estimate: number; breakdown: Record<string, number> } => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return { estimate: 0, breakdown: {} };

    const baseRate = 150; // hourly rate assumption
    const hoursPerWeek = 20;
    const estimate = teamSize * durationWeeks * hoursPerWeek * baseRate;

    return {
      estimate,
      breakdown: {
        labor: estimate * 0.75,
        tools: estimate * 0.1,
        contingency: estimate * 0.15,
      },
    };
  }, [templates]);

  return {
    templates,
    templatesByDomain,
    selectedTemplate,
    setSelectedTemplate,
    loading,
    getRecommendedTemplates,
    createProjectFromTemplate,
    estimateBudget,
  };
}

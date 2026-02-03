import { useState, useCallback, useMemo } from "react";

export interface MilestoneTemplate {
  id: string;
  title: string;
  description: string;
  percentageOfTotal: number;
  suggestedDuration: string;
  deliverables: string[];
}

export interface ContractTemplate {
  id: string;
  name: string;
  category: "research" | "consulting" | "mentorship" | "grant" | "development" | "training";
  description: string;
  suggestedDuration: string;
  escrowPercentage: number;
  milestones: MilestoneTemplate[];
  paymentSchedule: "milestone" | "monthly" | "upfront" | "completion";
  riskLevel: "low" | "medium" | "high";
  successRate: number;
  usageCount: number;
  rating: number;
  tags: string[];
  isVerified: boolean;
  createdBy?: string;
  createdAt: Date;
}

export interface TemplateCustomization {
  templateId: string;
  customMilestones: MilestoneTemplate[];
  customEscrow: number;
  customDuration: string;
  customPaymentSchedule: ContractTemplate["paymentSchedule"];
  additionalTerms: string[];
}

const DEFAULT_TEMPLATES: ContractTemplate[] = [
  {
    id: "template-research",
    name: "Research Collaboration",
    category: "research",
    description: "Standard template for academic or industry research partnerships with shared deliverables",
    suggestedDuration: "6-12 months",
    escrowPercentage: 20,
    milestones: [
      { id: "m1", title: "Research Proposal", description: "Define scope and methodology", percentageOfTotal: 15, suggestedDuration: "2 weeks", deliverables: ["Proposal document", "Literature review"] },
      { id: "m2", title: "Data Collection", description: "Gather and validate data", percentageOfTotal: 25, suggestedDuration: "6 weeks", deliverables: ["Raw data", "Collection methodology"] },
      { id: "m3", title: "Analysis & Results", description: "Analyze data and document findings", percentageOfTotal: 35, suggestedDuration: "8 weeks", deliverables: ["Analysis report", "Statistical results"] },
      { id: "m4", title: "Final Report", description: "Complete deliverable with recommendations", percentageOfTotal: 25, suggestedDuration: "4 weeks", deliverables: ["Final report", "Presentation"] },
    ],
    paymentSchedule: "milestone",
    riskLevel: "medium",
    successRate: 87,
    usageCount: 342,
    rating: 4.6,
    tags: ["academic", "data-driven", "collaborative"],
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 365),
  },
  {
    id: "template-consulting",
    name: "Professional Consulting",
    category: "consulting",
    description: "Flexible template for expert consulting engagements with clear deliverables",
    suggestedDuration: "1-3 months",
    escrowPercentage: 30,
    milestones: [
      { id: "m1", title: "Discovery & Assessment", description: "Understand client needs and current state", percentageOfTotal: 20, suggestedDuration: "1 week", deliverables: ["Assessment report", "Stakeholder interviews"] },
      { id: "m2", title: "Strategy Development", description: "Create actionable recommendations", percentageOfTotal: 40, suggestedDuration: "2 weeks", deliverables: ["Strategy document", "Implementation roadmap"] },
      { id: "m3", title: "Implementation Support", description: "Guide execution of recommendations", percentageOfTotal: 40, suggestedDuration: "4 weeks", deliverables: ["Progress reports", "Final deliverables"] },
    ],
    paymentSchedule: "milestone",
    riskLevel: "low",
    successRate: 92,
    usageCount: 1205,
    rating: 4.8,
    tags: ["professional", "strategy", "advisory"],
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 180),
  },
  {
    id: "template-mentorship",
    name: "Mentorship Program",
    category: "mentorship",
    description: "Structured mentorship with defined goals and regular check-ins",
    suggestedDuration: "3-6 months",
    escrowPercentage: 10,
    milestones: [
      { id: "m1", title: "Goal Setting", description: "Define mentee objectives and success metrics", percentageOfTotal: 15, suggestedDuration: "1 week", deliverables: ["Goal document", "Learning plan"] },
      { id: "m2", title: "Regular Sessions", description: "Bi-weekly mentorship sessions", percentageOfTotal: 60, suggestedDuration: "12 weeks", deliverables: ["Session notes", "Progress tracking"] },
      { id: "m3", title: "Final Assessment", description: "Evaluate progress and next steps", percentageOfTotal: 25, suggestedDuration: "1 week", deliverables: ["Assessment report", "Recommendations"] },
    ],
    paymentSchedule: "monthly",
    riskLevel: "low",
    successRate: 94,
    usageCount: 567,
    rating: 4.9,
    tags: ["mentorship", "development", "guidance"],
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 90),
  },
  {
    id: "template-grant",
    name: "Grant-Funded Project",
    category: "grant",
    description: "Template aligned with common grant reporting requirements and timelines",
    suggestedDuration: "12-24 months",
    escrowPercentage: 15,
    milestones: [
      { id: "m1", title: "Project Initiation", description: "Setup and initial planning", percentageOfTotal: 10, suggestedDuration: "1 month", deliverables: ["Project plan", "Team assignments"] },
      { id: "m2", title: "Phase 1 Deliverables", description: "First major research phase", percentageOfTotal: 30, suggestedDuration: "4 months", deliverables: ["Interim report", "Data collection"] },
      { id: "m3", title: "Phase 2 Deliverables", description: "Second major research phase", percentageOfTotal: 35, suggestedDuration: "4 months", deliverables: ["Analysis results", "Draft findings"] },
      { id: "m4", title: "Final Reporting", description: "Complete grant deliverables", percentageOfTotal: 25, suggestedDuration: "2 months", deliverables: ["Final report", "Publications", "Presentation"] },
    ],
    paymentSchedule: "milestone",
    riskLevel: "medium",
    successRate: 85,
    usageCount: 189,
    rating: 4.5,
    tags: ["grant", "academic", "long-term"],
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 270),
  },
];

export function useContractTemplates() {
  const [templates] = useState<ContractTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [customization, setCustomization] = useState<TemplateCustomization | null>(null);
  const [loading, setLoading] = useState(false);

  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, ContractTemplate[]> = {};
    templates.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = [];
      grouped[t.category].push(t);
    });
    return grouped;
  }, [templates]);

  const getRecommendedTemplate = useCallback((
    projectType: string,
    duration: string,
    budget: number
  ): ContractTemplate | null => {
    // Simple matching logic
    const matches = templates.filter(t => 
      t.category === projectType || t.tags.includes(projectType.toLowerCase())
    );
    return matches.sort((a, b) => b.rating - a.rating)[0] || templates[0];
  }, [templates]);

  const customizeTemplate = useCallback((
    templateId: string,
    changes: Partial<TemplateCustomization>
  ) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setCustomization(prev => ({
      templateId,
      customMilestones: changes.customMilestones || prev?.customMilestones || template.milestones,
      customEscrow: changes.customEscrow ?? prev?.customEscrow ?? template.escrowPercentage,
      customDuration: changes.customDuration || prev?.customDuration || template.suggestedDuration,
      customPaymentSchedule: changes.customPaymentSchedule || prev?.customPaymentSchedule || template.paymentSchedule,
      additionalTerms: changes.additionalTerms || prev?.additionalTerms || [],
    }));
  }, [templates]);

  const createContractFromTemplate = useCallback(async (
    templateId: string,
    dealDetails: {
      title: string;
      parties: string[];
      totalValue: number;
      startDate: Date;
    }
  ) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log("Creating contract from template:", templateId, dealDetails);
    setLoading(false);
    return { success: true, contractId: `contract-${Date.now()}` };
  }, []);

  return {
    templates,
    templatesByCategory,
    selectedTemplate,
    setSelectedTemplate,
    customization,
    customizeTemplate,
    getRecommendedTemplate,
    createContractFromTemplate,
    loading,
  };
}

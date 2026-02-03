import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// COMPLIANCE & ETHICS GOVERNANCE (Features 61-65)
// =====================================================

// Feature 61: Ethics Review Workflow
export interface EthicsReview {
  review_id: string;
  project_id: string;
  review_type: 'irb' | 'iacuc' | 'biosafety' | 'data_privacy' | 'export_control';
  status: 'not_started' | 'in_preparation' | 'submitted' | 'under_review' | 'approved' | 'revision_required' | 'rejected';
  submission_date?: string;
  decision_date?: string;
  expiry_date?: string;
  reviewer_comments: string[];
  required_modifications: string[];
}

// Feature 62: Conflict of Interest Declaration
export interface ConflictOfInterest {
  declaration_id: string;
  user_id: string;
  declaration_type: 'financial' | 'personal' | 'intellectual' | 'institutional';
  related_entity: string;
  nature_of_conflict: string;
  potential_impact: 'high' | 'medium' | 'low';
  mitigation_plan: string;
  disclosed_at: string;
  reviewed_by?: string;
  status: 'pending' | 'acknowledged' | 'mitigated' | 'requires_action';
}

// Feature 63: Research Integrity Checklist
export interface IntegrityChecklist {
  project_id: string;
  items: {
    category: 'data_management' | 'authorship' | 'methodology' | 'disclosure' | 'consent';
    item: string;
    compliant: boolean;
    evidence?: string;
    reviewer_notes?: string;
  }[];
  overall_compliance: number;
  last_reviewed: string;
  next_review_due: string;
}

// Feature 64: Regulatory Compliance Tracker
export interface RegulatoryCompliance {
  regulation: string;
  jurisdiction: string;
  applicable_to: string[];
  requirements: {
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable';
    evidence_document?: string;
    deadline?: string;
  }[];
  overall_status: 'compliant' | 'at_risk' | 'non_compliant';
  last_audit: string;
}

// Feature 65: Whistleblower & Reporting System
export interface IntegrityReport {
  report_id: string;
  category: 'misconduct' | 'safety' | 'ethics' | 'compliance' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  anonymous: boolean;
  submitted_at: string;
  status: 'submitted' | 'under_investigation' | 'resolved' | 'dismissed';
  resolution?: string;
}

export function useComplianceEthics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ethicsReviews, setEthicsReviews] = useState<EthicsReview[]>([]);
  const [conflicts, setConflicts] = useState<ConflictOfInterest[]>([]);
  const [integrityChecklists, setIntegrityChecklists] = useState<Map<string, IntegrityChecklist>>(new Map());

  // Feature 61: Start Ethics Review
  const startEthicsReview = useCallback((
    projectId: string,
    reviewType: EthicsReview['review_type']
  ): EthicsReview => {
    const review: EthicsReview = {
      review_id: crypto.randomUUID(),
      project_id: projectId,
      review_type: reviewType,
      status: 'in_preparation',
      reviewer_comments: [],
      required_modifications: []
    };

    setEthicsReviews(prev => [...prev, review]);
    toast({ title: "Ethics Review Started", description: `${reviewType.toUpperCase()} review initiated` });
    return review;
  }, [toast]);

  // Feature 62: Declare Conflict of Interest
  const declareConflict = useCallback((
    declarationType: ConflictOfInterest['declaration_type'],
    relatedEntity: string,
    natureOfConflict: string,
    potentialImpact: ConflictOfInterest['potential_impact'],
    mitigationPlan: string
  ): ConflictOfInterest => {
    const declaration: ConflictOfInterest = {
      declaration_id: crypto.randomUUID(),
      user_id: user?.id || '',
      declaration_type: declarationType,
      related_entity: relatedEntity,
      nature_of_conflict: natureOfConflict,
      potential_impact: potentialImpact,
      mitigation_plan: mitigationPlan,
      disclosed_at: new Date().toISOString(),
      status: 'pending'
    };

    setConflicts(prev => [...prev, declaration]);
    toast({ title: "Conflict Declared", description: "Your disclosure has been recorded" });
    return declaration;
  }, [user, toast]);

  // Feature 63: Generate Integrity Checklist
  const generateIntegrityChecklist = useCallback((projectId: string): IntegrityChecklist => {
    const checklist: IntegrityChecklist = {
      project_id: projectId,
      items: [
        { category: 'data_management', item: 'Data backup procedures in place', compliant: false },
        { category: 'data_management', item: 'Data retention policy documented', compliant: false },
        { category: 'authorship', item: 'Authorship criteria discussed with all contributors', compliant: false },
        { category: 'authorship', item: 'Contribution roles documented', compliant: false },
        { category: 'methodology', item: 'Methods pre-registered where applicable', compliant: false },
        { category: 'methodology', item: 'Analysis plan documented before data collection', compliant: false },
        { category: 'disclosure', item: 'All funding sources disclosed', compliant: false },
        { category: 'disclosure', item: 'Conflicts of interest declared', compliant: false },
        { category: 'consent', item: 'Informed consent obtained where required', compliant: false },
        { category: 'consent', item: 'Data use agreements in place', compliant: false }
      ],
      overall_compliance: 0,
      last_reviewed: new Date().toISOString(),
      next_review_due: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    };

    setIntegrityChecklists(prev => new Map(prev).set(projectId, checklist));
    return checklist;
  }, []);

  return {
    ethicsReviews,
    conflicts,
    integrityChecklists,
    startEthicsReview,
    declareConflict,
    generateIntegrityChecklist,
    setEthicsReviews
  };
}

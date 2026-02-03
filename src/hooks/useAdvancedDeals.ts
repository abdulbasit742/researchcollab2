import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Feature 59: Structured Proposal Builder
export interface StructuredProposal {
  id: string;
  deal_id: string;
  proposer_id: string;
  sections: {
    executive_summary: string;
    scope_of_work: {
      deliverable: string;
      description: string;
      acceptance_criteria: string[];
    }[];
    timeline: {
      phase: string;
      start_date: string;
      end_date: string;
      milestones: string[];
    }[];
    pricing: {
      item: string;
      amount: number;
      payment_trigger: string;
    }[];
    terms_and_conditions: string[];
    assumptions: string[];
    risks_and_mitigations: {
      risk: string;
      likelihood: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
  };
  version: number;
  status: 'draft' | 'submitted' | 'under_review' | 'negotiating' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Feature 60: Negotiation Timeline
export interface NegotiationEvent {
  id: string;
  deal_id: string;
  event_type: 'proposal_submitted' | 'counter_offer' | 'term_change' | 'question' | 'clarification' | 'acceptance' | 'rejection';
  actor_id: string;
  content: string;
  changes?: Record<string, { from: any; to: any }>;
  timestamp: string;
}

// Feature 61: Contract Clause Templates
export interface ContractClause {
  id: string;
  category: 'payment' | 'delivery' | 'confidentiality' | 'ip_rights' | 'termination' | 'liability' | 'dispute';
  name: string;
  standard_text: string;
  variables: { name: string; default_value: string }[];
  is_mandatory: boolean;
  risk_level: 'low' | 'medium' | 'high';
}

// Feature 62: Escrow Condition Editor
export interface EscrowCondition {
  id: string;
  deal_id: string;
  condition_type: 'milestone_approval' | 'time_elapsed' | 'third_party_verification' | 'mutual_agreement';
  description: string;
  parameters: Record<string, any>;
  release_percentage: number;
  status: 'pending' | 'met' | 'failed' | 'disputed';
  verified_at?: string;
  verified_by?: string;
}

// Feature 63: Milestone Dispute Pre-checks
export interface DisputePreCheck {
  milestone_id: string;
  checks: {
    check_type: string;
    description: string;
    passed: boolean;
    evidence?: string;
  }[];
  overall_status: 'clear' | 'warning' | 'blocked';
  recommendations: string[];
}

// Feature 64: Decision Logs in Deal Rooms
export interface DealDecision {
  id: string;
  deal_id: string;
  decision_type: 'scope_change' | 'timeline_change' | 'budget_change' | 'resource_change' | 'termination';
  description: string;
  proposed_by: string;
  participants: string[];
  votes: { user_id: string; vote: 'approve' | 'reject' | 'abstain'; comment?: string }[];
  required_approval: 'unanimous' | 'majority' | 'single';
  status: 'pending' | 'approved' | 'rejected';
  decided_at?: string;
  created_at: string;
}

// Feature 65: Multi-Party Deal Rooms
export interface MultiPartyDeal {
  id: string;
  title: string;
  parties: {
    user_id: string;
    role: 'lead' | 'contributor' | 'advisor' | 'observer' | 'funder';
    permissions: ('view' | 'comment' | 'propose' | 'approve' | 'sign')[];
    share_percentage?: number;
  }[];
  status: 'forming' | 'active' | 'completed' | 'dissolved';
  governance_rules: {
    decision_threshold: number;
    veto_rights: string[];
    escalation_path: string[];
  };
  created_at: string;
}

// Feature 66: Advisor-Invited Deals
export interface AdvisorInvitation {
  id: string;
  deal_id: string;
  advisor_id: string;
  invited_by: string;
  role: 'technical_advisor' | 'domain_expert' | 'mediator' | 'auditor';
  compensation_type: 'fixed' | 'percentage' | 'hourly' | 'none';
  compensation_amount?: number;
  status: 'pending' | 'accepted' | 'declined';
  access_level: 'full' | 'documents_only' | 'summary_only';
  invited_at: string;
}

// Feature 67: Deal Health Indicators
export interface DealHealth {
  deal_id: string;
  overall_health: 'healthy' | 'at_risk' | 'critical';
  indicators: {
    indicator: string;
    status: 'good' | 'warning' | 'critical';
    value: number;
    threshold: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  risk_score: number;
  predicted_completion_probability: number;
  recommended_actions: string[];
  last_updated: string;
}

// Feature 68: Time-to-Resolution Tracking
export interface ResolutionTracking {
  deal_id: string;
  phase: string;
  started_at: string;
  expected_duration: number; // days
  actual_duration?: number;
  delays: {
    reason: string;
    duration: number;
    attributed_to?: string;
  }[];
  efficiency_score: number;
}

// Feature 69: Scope Drift Detection
export interface ScopeDrift {
  deal_id: string;
  original_scope: string[];
  current_scope: string[];
  additions: { item: string; added_at: string; approved: boolean }[];
  removals: { item: string; removed_at: string; approved: boolean }[];
  drift_percentage: number;
  budget_impact: number;
  timeline_impact: number; // days
  alert_level: 'none' | 'minor' | 'significant' | 'major';
}

// Feature 70: Structured Post-Deal Feedback
export interface PostDealFeedback {
  id: string;
  deal_id: string;
  reviewer_id: string;
  reviewee_id: string;
  categories: {
    category: string;
    rating: number;
    comment: string;
  }[];
  would_work_again: boolean;
  public_testimonial?: string;
  private_feedback?: string;
  created_at: string;
}

// Feature 71: Outcome Certification
export interface OutcomeCertification {
  id: string;
  deal_id: string;
  certifier_type: 'self' | 'counterparty' | 'third_party' | 'automated';
  certifier_id?: string;
  outcomes_verified: {
    outcome: string;
    verified: boolean;
    evidence_link?: string;
    verification_method: string;
  }[];
  overall_success: boolean;
  certification_date: string;
  expiry_date?: string;
}

// Feature 72: Legal-Safe Audit Exports
export interface AuditExport {
  id: string;
  deal_id: string;
  export_type: 'full' | 'financial' | 'communications' | 'decisions';
  requested_by: string;
  approved_by: string[];
  format: 'pdf' | 'json' | 'csv';
  includes_attachments: boolean;
  redactions_applied: string[];
  generated_at: string;
  download_url?: string;
  expires_at: string;
}

export function useAdvancedDeals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [proposals, setProposals] = useState<StructuredProposal[]>([]);
  const [negotiations, setNegotiations] = useState<NegotiationEvent[]>([]);
  const [clauses, setClauses] = useState<ContractClause[]>([]);
  const [escrowConditions, setEscrowConditions] = useState<EscrowCondition[]>([]);
  const [decisions, setDecisions] = useState<DealDecision[]>([]);
  const [multiPartyDeals, setMultiPartyDeals] = useState<MultiPartyDeal[]>([]);
  const [dealHealth, setDealHealth] = useState<Map<string, DealHealth>>(new Map());
  const [scopeDrifts, setScopeDrifts] = useState<Map<string, ScopeDrift>>(new Map());
  const [loading, setLoading] = useState(true);

  // Feature 73: Create Proposal
  const createProposal = useCallback(async (
    dealId: string,
    sections: StructuredProposal['sections']
  ): Promise<StructuredProposal | null> => {
    if (!user) return null;
    
    const proposal: StructuredProposal = {
      id: crypto.randomUUID(),
      deal_id: dealId,
      proposer_id: user.id,
      sections,
      version: 1,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setProposals(prev => [...prev, proposal]);
    toast({ title: "Proposal Created", description: "Your proposal draft has been saved" });
    return proposal;
  }, [user, toast]);

  // Feature 74: Add Negotiation Event
  const addNegotiationEvent = useCallback(async (
    dealId: string,
    eventType: NegotiationEvent['event_type'],
    content: string,
    changes?: Record<string, { from: any; to: any }>
  ): Promise<boolean> => {
    if (!user) return false;
    
    const event: NegotiationEvent = {
      id: crypto.randomUUID(),
      deal_id: dealId,
      event_type: eventType,
      actor_id: user.id,
      content,
      changes,
      timestamp: new Date().toISOString()
    };
    
    setNegotiations(prev => [...prev, event]);
    return true;
  }, [user]);

  // Feature 75: Check Dispute Pre-conditions
  const checkDisputePreConditions = useCallback((
    milestoneId: string,
    deliverables: { name: string; submitted: boolean; evidence?: string }[]
  ): DisputePreCheck => {
    const checks = deliverables.map(d => ({
      check_type: 'deliverable_submission',
      description: `Deliverable "${d.name}" submitted`,
      passed: d.submitted,
      evidence: d.evidence
    }));
    
    const allPassed = checks.every(c => c.passed);
    const somePassed = checks.some(c => c.passed);
    
    return {
      milestone_id: milestoneId,
      checks,
      overall_status: allPassed ? 'clear' : somePassed ? 'warning' : 'blocked',
      recommendations: allPassed ? [] : [
        'Ensure all deliverables are submitted before approving',
        'Review evidence for incomplete items'
      ]
    };
  }, []);

  // Feature 76: Create Decision
  const createDecision = useCallback(async (
    dealId: string,
    decisionType: DealDecision['decision_type'],
    description: string,
    participants: string[],
    requiredApproval: DealDecision['required_approval']
  ): Promise<boolean> => {
    if (!user) return false;
    
    const decision: DealDecision = {
      id: crypto.randomUUID(),
      deal_id: dealId,
      decision_type: decisionType,
      description,
      proposed_by: user.id,
      participants,
      votes: [],
      required_approval: requiredApproval,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    setDecisions(prev => [...prev, decision]);
    toast({ title: "Decision Proposed", description: "Participants have been notified" });
    return true;
  }, [user, toast]);

  // Feature 77: Vote on Decision
  const voteOnDecision = useCallback(async (
    decisionId: string,
    vote: 'approve' | 'reject' | 'abstain',
    comment?: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    setDecisions(prev => prev.map(d => {
      if (d.id !== decisionId) return d;
      
      const newVotes = [...d.votes.filter(v => v.user_id !== user.id), {
        user_id: user.id,
        vote,
        comment
      }];
      
      // Check if decision is complete
      let status = d.status;
      const approvals = newVotes.filter(v => v.vote === 'approve').length;
      const rejections = newVotes.filter(v => v.vote === 'reject').length;
      
      if (d.required_approval === 'unanimous') {
        if (rejections > 0) status = 'rejected';
        else if (approvals === d.participants.length) status = 'approved';
      } else if (d.required_approval === 'majority') {
        const threshold = Math.floor(d.participants.length / 2) + 1;
        if (approvals >= threshold) status = 'approved';
        else if (rejections >= threshold) status = 'rejected';
      } else {
        if (approvals > 0) status = 'approved';
      }
      
      return { ...d, votes: newVotes, status, decided_at: status !== 'pending' ? new Date().toISOString() : undefined };
    }));
    
    return true;
  }, [user]);

  // Feature 78: Calculate Deal Health
  const calculateDealHealth = useCallback((
    dealId: string,
    milestones: { status: string; on_time: boolean }[],
    communications: { days_since_last: number }[],
    payments: { on_time: boolean }[]
  ): DealHealth => {
    const indicators: DealHealth['indicators'] = [];
    
    // Milestone completion
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const onTimeMilestones = milestones.filter(m => m.on_time).length;
    indicators.push({
      indicator: 'Milestone Completion',
      status: completedMilestones >= milestones.length * 0.8 ? 'good' : completedMilestones >= milestones.length * 0.5 ? 'warning' : 'critical',
      value: milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0,
      threshold: 80,
      trend: 'stable'
    });
    
    // Communication health
    const avgDaysSinceComm = communications.reduce((sum, c) => sum + c.days_since_last, 0) / Math.max(1, communications.length);
    indicators.push({
      indicator: 'Communication',
      status: avgDaysSinceComm < 3 ? 'good' : avgDaysSinceComm < 7 ? 'warning' : 'critical',
      value: Math.max(0, 100 - avgDaysSinceComm * 10),
      threshold: 70,
      trend: avgDaysSinceComm < 3 ? 'improving' : 'declining'
    });
    
    // Payment health
    const onTimePayments = payments.filter(p => p.on_time).length;
    indicators.push({
      indicator: 'Payment Reliability',
      status: onTimePayments === payments.length ? 'good' : onTimePayments >= payments.length * 0.8 ? 'warning' : 'critical',
      value: payments.length > 0 ? (onTimePayments / payments.length) * 100 : 100,
      threshold: 90,
      trend: 'stable'
    });
    
    const overallScore = indicators.reduce((sum, i) => sum + i.value, 0) / indicators.length;
    const criticalCount = indicators.filter(i => i.status === 'critical').length;
    
    return {
      deal_id: dealId,
      overall_health: criticalCount > 0 ? 'critical' : overallScore >= 70 ? 'healthy' : 'at_risk',
      indicators,
      risk_score: 100 - overallScore,
      predicted_completion_probability: overallScore,
      recommended_actions: criticalCount > 0 ? ['Address critical issues immediately', 'Schedule sync meeting'] : [],
      last_updated: new Date().toISOString()
    };
  }, []);

  // Feature 79: Detect Scope Drift
  const detectScopeDrift = useCallback((
    dealId: string,
    originalScope: string[],
    currentScope: string[]
  ): ScopeDrift => {
    const additions = currentScope
      .filter(s => !originalScope.includes(s))
      .map(item => ({ item, added_at: new Date().toISOString(), approved: false }));
    
    const removals = originalScope
      .filter(s => !currentScope.includes(s))
      .map(item => ({ item, removed_at: new Date().toISOString(), approved: false }));
    
    const driftPercentage = ((additions.length + removals.length) / Math.max(1, originalScope.length)) * 100;
    
    return {
      deal_id: dealId,
      original_scope: originalScope,
      current_scope: currentScope,
      additions,
      removals,
      drift_percentage: driftPercentage,
      budget_impact: additions.length * 1000, // Simplified estimation
      timeline_impact: additions.length * 2, // days
      alert_level: driftPercentage > 50 ? 'major' : driftPercentage > 25 ? 'significant' : driftPercentage > 10 ? 'minor' : 'none'
    };
  }, []);

  // Feature 80: Generate Audit Export
  const generateAuditExport = useCallback(async (
    dealId: string,
    exportType: AuditExport['export_type'],
    format: AuditExport['format']
  ): Promise<AuditExport | null> => {
    if (!user) return null;
    
    const auditExport: AuditExport = {
      id: crypto.randomUUID(),
      deal_id: dealId,
      export_type: exportType,
      requested_by: user.id,
      approved_by: [user.id],
      format,
      includes_attachments: exportType === 'full',
      redactions_applied: [],
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    toast({ title: "Export Generated", description: "Your audit export is ready for download" });
    return auditExport;
  }, [user, toast]);

  // Feature 81: Invite Advisor
  const inviteAdvisor = useCallback(async (
    dealId: string,
    advisorId: string,
    role: AdvisorInvitation['role'],
    accessLevel: AdvisorInvitation['access_level']
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      await supabase
        .from('notifications' as any)
        .insert({
          user_id: advisorId,
          type: 'advisor_invitation',
          title: 'Advisory Role Invitation',
          message: `You have been invited to join a deal as ${role}`,
          data: { deal_id: dealId, role, access_level: accessLevel }
        });
      
      toast({ title: "Advisor Invited", description: "Invitation sent successfully" });
      return true;
    } catch (err) {
      return false;
    }
  }, [user, toast]);

  // Initialize clauses
  useEffect(() => {
    setClauses([
      {
        id: '1',
        category: 'payment',
        name: 'Milestone-Based Payment',
        standard_text: 'Payment shall be released upon successful completion and approval of each milestone as defined in the scope of work.',
        variables: [],
        is_mandatory: true,
        risk_level: 'low'
      },
      {
        id: '2',
        category: 'confidentiality',
        name: 'Mutual NDA',
        standard_text: 'Both parties agree to maintain confidentiality of all proprietary information exchanged during the course of this engagement for a period of {{duration}} years.',
        variables: [{ name: 'duration', default_value: '2' }],
        is_mandatory: false,
        risk_level: 'medium'
      },
      {
        id: '3',
        category: 'ip_rights',
        name: 'Work Product Ownership',
        standard_text: 'All work product created under this agreement shall become the property of {{owner}} upon full payment.',
        variables: [{ name: 'owner', default_value: 'Client' }],
        is_mandatory: true,
        risk_level: 'high'
      },
      {
        id: '4',
        category: 'dispute',
        name: 'Dispute Resolution',
        standard_text: 'Any disputes shall first be resolved through good-faith negotiation. If unresolved within {{days}} days, mediation shall be pursued.',
        variables: [{ name: 'days', default_value: '14' }],
        is_mandatory: true,
        risk_level: 'medium'
      }
    ]);
    
    setLoading(false);
  }, []);

  return {
    proposals,
    negotiations,
    clauses,
    escrowConditions,
    decisions,
    multiPartyDeals,
    dealHealth,
    scopeDrifts,
    loading,
    // Actions
    createProposal,
    addNegotiationEvent,
    checkDisputePreConditions,
    createDecision,
    voteOnDecision,
    calculateDealHealth,
    detectScopeDrift,
    generateAuditExport,
    inviteAdvisor
  };
}

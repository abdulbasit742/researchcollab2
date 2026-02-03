import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DealMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "in_progress" | "submitted" | "approved" | "disputed";
  deliverables: string[];
  completedAt?: Date;
  submittedEvidence?: string[];
}

export interface DealParticipant {
  id: string;
  userId: string;
  role: "owner" | "executor" | "advisor" | "observer";
  permissions: ("view" | "edit" | "approve" | "dispute")[];
  joinedAt: Date;
}

export interface DealDecision {
  id: string;
  type: "scope_change" | "deadline_extension" | "milestone_approval" | "dispute_resolution";
  description: string;
  proposedBy: string;
  status: "pending" | "approved" | "rejected";
  votes: { userId: string; vote: "approve" | "reject"; comment?: string }[];
  createdAt: Date;
  resolvedAt?: Date;
}

export interface DealHealth {
  score: number;
  status: "healthy" | "at_risk" | "critical";
  risks: { type: string; severity: "low" | "medium" | "high"; description: string }[];
  scopeDriftScore: number;
  timelineAdherence: number;
  communicationScore: number;
}

export interface ContractClause {
  id: string;
  type: "payment" | "delivery" | "confidentiality" | "ip" | "dispute" | "termination";
  title: string;
  content: string;
  isStandard: boolean;
  isRequired: boolean;
}

export function useDealExecution(dealId: string) {
  const { user } = useAuth();
  const [deal, setDeal] = useState<any>(null);
  const [milestones, setMilestones] = useState<DealMilestone[]>([]);
  const [participants, setParticipants] = useState<DealParticipant[]>([]);
  const [decisions, setDecisions] = useState<DealDecision[]>([]);
  const [health, setHealth] = useState<DealHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDealData = useCallback(async () => {
    if (!dealId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch deal from projects table (which exists in schema)
      const { data: dealData, error: dealError } = await supabase
        .from("projects" as any)
        .select("*")
        .eq("id", dealId)
        .maybeSingle();
        
      if (dealError) throw dealError;
      
      // If not found in projects, try offers
      let finalDeal = dealData;
      if (!finalDeal) {
        const { data: offerData } = await supabase
          .from("offers" as any)
          .select("*")
          .eq("id", dealId)
          .maybeSingle();
        finalDeal = offerData;
      }
      
      if (!finalDeal) throw new Error("Deal not found");
      setDeal(finalDeal);
      
      // Mock milestones (would come from actual milestones table)
      const mockMilestones: DealMilestone[] = [
        {
          id: "m1",
          title: "Project Kickoff",
          description: "Initial setup and requirements gathering",
          amount: 500,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "pending",
          deliverables: ["Requirements document", "Project plan"],
          submittedEvidence: [],
        },
        {
          id: "m2",
          title: "First Deliverable",
          description: "Core functionality implementation",
          amount: 1000,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          status: "pending",
          deliverables: ["Working prototype", "Documentation"],
          submittedEvidence: [],
        },
      ];
      
      setMilestones(mockMilestones);
      
      // Mock participants
      const mockParticipants: DealParticipant[] = [
        {
          id: "p1",
          userId: (finalDeal as any).owner_id || (finalDeal as any).posted_by || (finalDeal as any).sender_id || user?.id || "",
          role: "owner",
          permissions: ["view", "edit", "approve", "dispute"],
          joinedAt: new Date((finalDeal as any).created_at),
        },
      ];
      
      const acceptedBy = (finalDeal as any).accepted_by || (finalDeal as any).recipient_id;
      if (acceptedBy) {
        mockParticipants.push({
          id: "p2",
          userId: acceptedBy,
          role: "executor",
          permissions: ["view", "edit"],
          joinedAt: new Date((finalDeal as any).created_at),
        });
      }
      
      setParticipants(mockParticipants);
      
      // Calculate deal health
      const completedMilestones = milestones.filter(m => m.status === "approved").length;
      const overdueMilestones = milestones.filter(m => 
        m.dueDate < new Date() && m.status !== "approved"
      ).length;
      
      const healthScore = Math.max(0, 100 - (overdueMilestones * 20));
      
      setHealth({
        score: healthScore,
        status: healthScore > 70 ? "healthy" : healthScore > 40 ? "at_risk" : "critical",
        risks: overdueMilestones > 0 ? [
          {
            type: "deadline",
            severity: overdueMilestones > 2 ? "high" : "medium",
            description: `${overdueMilestones} milestone(s) overdue`,
          }
        ] : [],
        scopeDriftScore: 15,
        timelineAdherence: healthScore,
        communicationScore: 80,
      });
      
    } catch (err: any) {
      console.error("Error fetching deal:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchDealData();
  }, [fetchDealData]);

  // Submit milestone for approval
  const submitMilestone = useCallback(async (
    milestoneId: string,
    evidence: string[]
  ): Promise<boolean> => {
    try {
      // Update local state for now (would update DB in production)
      setMilestones(prev => prev.map(m => 
        m.id === milestoneId 
          ? { ...m, status: "submitted" as const, submittedEvidence: evidence }
          : m
      ));
      return true;
    } catch (err) {
      console.error("Error submitting milestone:", err);
      return false;
    }
  }, []);

  // Approve milestone
  const approveMilestone = useCallback(async (milestoneId: string): Promise<boolean> => {
    try {
      setMilestones(prev => prev.map(m => 
        m.id === milestoneId 
          ? { ...m, status: "approved" as const, completedAt: new Date() }
          : m
      ));
      return true;
    } catch (err) {
      console.error("Error approving milestone:", err);
      return false;
    }
  }, []);

  // Dispute milestone
  const disputeMilestone = useCallback(async (
    milestoneId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      setMilestones(prev => prev.map(m => 
        m.id === milestoneId 
          ? { ...m, status: "disputed" as const }
          : m
      ));
      console.log("Dispute reason:", reason);
      return true;
    } catch (err) {
      console.error("Error disputing milestone:", err);
      return false;
    }
  }, []);

  // Propose decision
  const proposeDecision = useCallback(async (
    type: DealDecision["type"],
    description: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    const newDecision: DealDecision = {
      id: `decision-${Date.now()}`,
      type,
      description,
      proposedBy: user.id,
      status: "pending",
      votes: [],
      createdAt: new Date(),
    };
    
    setDecisions(prev => [newDecision, ...prev]);
    return true;
  }, [user]);

  // Vote on decision
  const voteOnDecision = useCallback(async (
    decisionId: string,
    vote: "approve" | "reject",
    comment?: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    setDecisions(prev => prev.map(d => {
      if (d.id !== decisionId) return d;
      
      const newVotes = [...d.votes, { userId: user.id, vote, comment }];
      const approvals = newVotes.filter(v => v.vote === "approve").length;
      const rejections = newVotes.filter(v => v.vote === "reject").length;
      
      // Auto-resolve if majority reached
      const threshold = Math.ceil(participants.length / 2);
      let newStatus = d.status;
      let resolvedAt: Date | undefined;
      
      if (approvals >= threshold) {
        newStatus = "approved";
        resolvedAt = new Date();
      } else if (rejections >= threshold) {
        newStatus = "rejected";
        resolvedAt = new Date();
      }
      
      return { ...d, votes: newVotes, status: newStatus, resolvedAt };
    }));
    
    return true;
  }, [user, participants]);

  // Add participant
  const addParticipant = useCallback(async (
    userId: string,
    role: DealParticipant["role"]
  ): Promise<boolean> => {
    const permissions: DealParticipant["permissions"] = 
      role === "observer" ? ["view"] :
      role === "advisor" ? ["view"] :
      role === "executor" ? ["view", "edit"] :
      ["view", "edit", "approve", "dispute"];
    
    setParticipants(prev => [...prev, {
      id: `participant-${Date.now()}`,
      userId,
      role,
      permissions,
      joinedAt: new Date(),
    }]);
    
    return true;
  }, []);

  return {
    deal,
    milestones,
    participants,
    decisions,
    health,
    loading,
    error,
    refresh: fetchDealData,
    submitMilestone,
    approveMilestone,
    disputeMilestone,
    proposeDecision,
    voteOnDecision,
    addParticipant,
  };
}

// Standard contract clauses
export const STANDARD_CLAUSES: ContractClause[] = [
  {
    id: "payment-1",
    type: "payment",
    title: "Milestone-Based Payment",
    content: "Payment will be released upon successful completion and approval of each milestone as defined in the project scope.",
    isStandard: true,
    isRequired: true,
  },
  {
    id: "delivery-1",
    type: "delivery",
    title: "Delivery Standards",
    content: "All deliverables must meet the specifications outlined in the project scope and be submitted before the milestone due date.",
    isStandard: true,
    isRequired: true,
  },
  {
    id: "confidentiality-1",
    type: "confidentiality",
    title: "Confidentiality",
    content: "Both parties agree to maintain confidentiality of all project-related information unless explicitly permitted otherwise.",
    isStandard: true,
    isRequired: false,
  },
  {
    id: "ip-1",
    type: "ip",
    title: "Intellectual Property",
    content: "All work product created during this engagement shall be owned by the project owner upon full payment.",
    isStandard: true,
    isRequired: false,
  },
  {
    id: "dispute-1",
    type: "dispute",
    title: "Dispute Resolution",
    content: "In case of disputes, parties agree to first attempt resolution through platform mediation before escalating to arbitration.",
    isStandard: true,
    isRequired: true,
  },
  {
    id: "termination-1",
    type: "termination",
    title: "Termination",
    content: "Either party may terminate with 7 days written notice. Completed milestones will be paid; incomplete work pro-rated based on progress.",
    isStandard: true,
    isRequired: true,
  },
];

// Hook for proposal building
export function useProposalBuilder() {
  const { user, profile } = useAuth();
  const [proposal, setProposal] = useState({
    introduction: "",
    approach: "",
    timeline: "",
    pricing: 0,
    milestones: [] as { title: string; amount: number; deliverables: string[] }[],
    clauses: STANDARD_CLAUSES.filter(c => c.isRequired),
  });

  const updateProposal = useCallback((updates: Partial<typeof proposal>) => {
    setProposal(prev => ({ ...prev, ...updates }));
  }, []);

  const addMilestone = useCallback((milestone: typeof proposal.milestones[0]) => {
    setProposal(prev => ({
      ...prev,
      milestones: [...prev.milestones, milestone],
    }));
  }, []);

  const removeMilestone = useCallback((index: number) => {
    setProposal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  }, []);

  const toggleClause = useCallback((clauseId: string) => {
    setProposal(prev => {
      const exists = prev.clauses.some(c => c.id === clauseId);
      if (exists) {
        return {
          ...prev,
          clauses: prev.clauses.filter(c => c.id !== clauseId || c.isRequired),
        };
      } else {
        const clause = STANDARD_CLAUSES.find(c => c.id === clauseId);
        return clause ? { ...prev, clauses: [...prev.clauses, clause] } : prev;
      }
    });
  }, []);

  const generateTemplate = useCallback(() => {
    return `
## Proposal for Project

### Introduction
${proposal.introduction || "[Your introduction here]"}

### Approach
${proposal.approach || "[Your approach here]"}

### Timeline
${proposal.timeline || "[Your timeline here]"}

### Milestones & Pricing
Total: $${proposal.pricing}

${proposal.milestones.map((m, i) => `
**Milestone ${i + 1}: ${m.title}** - $${m.amount}
Deliverables:
${m.deliverables.map(d => `- ${d}`).join("\n")}
`).join("\n")}

### Terms
${proposal.clauses.map(c => `- **${c.title}**: ${c.content}`).join("\n")}
    `.trim();
  }, [proposal]);

  return {
    proposal,
    updateProposal,
    addMilestone,
    removeMilestone,
    toggleClause,
    generateTemplate,
    availableClauses: STANDARD_CLAUSES,
  };
}

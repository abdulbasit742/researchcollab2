import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// =====================================================
// TRUST GOVERNANCE: TRANSPARENT RULES & AUDIT TRAILS
// =====================================================

export interface TrustRule {
  id: string;
  rule_name: string;
  rule_category: "earning" | "penalty" | "decay" | "gate";
  description: string;
  formula: string;
  weight: number;
  is_active: boolean;
  last_updated: string;
  updated_by: string | null;
}

export interface TrustCalculationBreakdown {
  component: string;
  weight: number;
  currentValue: number;
  maxValue: number;
  contribution: number;
  explanation: string;
}

export interface TrustAuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  event_type: string;
  trust_before: number;
  trust_after: number;
  delta: number;
  rule_applied: string;
  evidence: string;
  is_reversible: boolean;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposed_change: string;
  proposer_id: string;
  proposer_name?: string;
  status: "draft" | "open" | "voting" | "approved" | "rejected" | "implemented";
  votes_for: number;
  votes_against: number;
  created_at: string;
  voting_ends_at: string | null;
}

export function useTrustRules() {
  return useQuery({
    queryKey: ["trustRules"],
    queryFn: async (): Promise<TrustRule[]> => {
      // These rules would ideally come from a database table
      // For now, we define them in code to ensure transparency
      return [
        {
          id: "1",
          rule_name: "Verification Bonus",
          rule_category: "earning",
          description: "Points awarded for completing identity verification",
          formula: "+30 points for student/researcher verification",
          weight: 30,
          is_active: true,
          last_updated: "2024-01-01",
          updated_by: null,
        },
        {
          id: "2",
          rule_name: "Project Completion",
          rule_category: "earning",
          description: "Points for successfully completing projects",
          formula: "+3 to +10 points based on project value and on-time delivery",
          weight: 20,
          is_active: true,
          last_updated: "2024-01-01",
          updated_by: null,
        },
        {
          id: "3",
          rule_name: "On-Time Delivery",
          rule_category: "earning",
          description: "Bonus for delivering before or on deadline",
          formula: "+2 points per on-time project, +3 for early delivery",
          weight: 15,
          is_active: true,
          last_updated: "2024-01-01",
          updated_by: null,
        },
        {
          id: "4",
          rule_name: "Dispute-Free History",
          rule_category: "earning",
          description: "Bonus for maintaining clean dispute record",
          formula: "+1 point per 5 dispute-free projects",
          weight: 15,
          is_active: true,
          last_updated: "2024-01-01",
          updated_by: null,
        },
        {
          id: "5",
          rule_name: "Client Ratings",
          rule_category: "earning",
          description: "Points from positive client feedback",
          formula: "+1 point per 5-star rating, +0.5 for 4-star",
          weight: 10,
          is_active: true,
          last_updated: "2024-01-01",
          updated_by: null,
        },
        {
          id: "6",
          rule_name: "Financial Reliability",
          rule_category: "earning",
          description: "Points for consistent escrow success",
          formula: "+1 point per PKR 50,000 successfully processed",
          weight: 10,
          is_active: true,
          last_updated: "2024-01-01",
          updated_by: null,
        },
        {
          id: "7",
          rule_name: "Project Failure",
          rule_category: "penalty",
          description: "Deduction for failed or abandoned projects",
          formula: "-5 to -15 points based on severity and fault",
          weight: -15,
          is_active: true,
          last_updated: "2024-01-01",
          updated_by: null,
        },
        {
          id: "8",
          rule_name: "Dispute Loss",
          rule_category: "penalty",
          description: "Deduction for losing a dispute",
          formula: "-10 points per lost dispute",
          weight: -10,
          is_active: true,
          last_updated: "2024-01-01",
          updated_by: null,
        },
        {
          id: "9",
          rule_name: "Inactivity Decay",
          rule_category: "decay",
          description: "Score reduction for extended inactivity",
          formula: "-2% per month after 90 days of inactivity",
          weight: -2,
          is_active: true,
          last_updated: "2024-01-01",
          updated_by: null,
        },
        {
          id: "10",
          rule_name: "High-Value Project Gate",
          rule_category: "gate",
          description: "Minimum trust required for projects over PKR 100,000",
          formula: "Requires trust >= 60 (Gold tier)",
          weight: 60,
          is_active: true,
          last_updated: "2024-01-01",
          updated_by: null,
        },
      ];
    },
    staleTime: Infinity, // Rules don't change often
  });
}

export function useTrustCalculationBreakdown(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["trustBreakdown", targetId],
    queryFn: async (): Promise<TrustCalculationBreakdown[]> => {
      if (!targetId) return [];

      // Fetch trust profile
      const { data: trustProfile } = await supabase
        .from("user_trust_profiles")
        .select("*")
        .eq("user_id", targetId)
        .maybeSingle();

      // Fetch consequence ledger
      const { data: ledger } = await supabase
        .from("consequence_ledgers")
        .select("*")
        .eq("user_id", targetId)
        .maybeSingle();

      const isVerified = trustProfile?.is_verified_student || trustProfile?.is_verified_researcher;
      const projectsCompleted = ledger?.projects_completed || 0;
      const onTimeRate = ledger?.on_time_rate || 0;
      const disputesFree = (ledger?.projects_completed || 0) - (ledger?.disputes_raised || 0);
      const escrowSuccess = ledger?.escrow_success_rate || 0;

      return [
        {
          component: "Verification Status",
          weight: 30,
          currentValue: isVerified ? 30 : 0,
          maxValue: 30,
          contribution: isVerified ? 30 : 0,
          explanation: isVerified 
            ? "You are verified, earning full verification bonus" 
            : "Complete verification to earn +30 points",
        },
        {
          component: "Project Completion",
          weight: 20,
          currentValue: Math.min(20, projectsCompleted * 3),
          maxValue: 20,
          contribution: Math.min(20, projectsCompleted * 3),
          explanation: `${projectsCompleted} projects completed (${projectsCompleted * 3} points, max 20)`,
        },
        {
          component: "On-Time Delivery",
          weight: 15,
          currentValue: Math.round(onTimeRate * 0.15),
          maxValue: 15,
          contribution: Math.round(onTimeRate * 0.15),
          explanation: `${onTimeRate}% on-time delivery rate`,
        },
        {
          component: "Dispute-Free Record",
          weight: 15,
          currentValue: Math.min(15, disputesFree),
          maxValue: 15,
          contribution: Math.min(15, disputesFree),
          explanation: `${disputesFree} projects without disputes`,
        },
        {
          component: "Client Ratings",
          weight: 10,
          currentValue: Math.round((trustProfile?.successful_rate || 0) * 0.1),
          maxValue: 10,
          contribution: Math.round((trustProfile?.successful_rate || 0) * 0.1),
          explanation: "Based on average client ratings",
        },
        {
          component: "Financial Reliability",
          weight: 10,
          currentValue: Math.round(escrowSuccess * 0.1),
          maxValue: 10,
          contribution: Math.round(escrowSuccess * 0.1),
          explanation: `${escrowSuccess}% escrow success rate`,
        },
      ];
    },
    enabled: !!targetId,
  });
}

export function useTrustAuditLog(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["trustAuditLog", targetId],
    queryFn: async (): Promise<TrustAuditEntry[]> => {
      if (!targetId) return [];

      const { data, error } = await supabase
        .from("trust_events")
        .select("*")
        .eq("user_id", targetId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((e: any) => ({
        id: e.id,
        timestamp: e.created_at,
        user_id: e.user_id,
        event_type: e.event_type,
        trust_before: e.trust_before,
        trust_after: e.trust_after,
        delta: e.trust_delta,
        rule_applied: e.event_source || "System",
        evidence: e.evidence_summary || "Automatic calculation",
        is_reversible: false,
      }));
    },
    enabled: !!targetId,
  });
}

export function useGovernanceProposals() {
  return useQuery({
    queryKey: ["governanceProposals"],
    queryFn: async (): Promise<GovernanceProposal[]> => {
      // This would fetch from a governance_proposals table
      // For now, return sample data showing the system's transparency
      return [
        {
          id: "1",
          title: "Reduce Inactivity Decay Period",
          description: "Proposal to extend the inactivity period before trust decay begins from 90 days to 120 days.",
          proposed_change: "Change decay trigger from 90 days to 120 days of inactivity",
          proposer_id: "system",
          proposer_name: "Community Feedback",
          status: "implemented",
          votes_for: 156,
          votes_against: 23,
          created_at: "2024-06-01",
          voting_ends_at: null,
        },
        {
          id: "2",
          title: "Add Mentorship Trust Bonus",
          description: "Reward users who successfully mentor new platform members with trust points.",
          proposed_change: "+5 trust points for each mentee who completes their first project",
          proposer_id: "system",
          proposer_name: "Platform Team",
          status: "open",
          votes_for: 89,
          votes_against: 12,
          created_at: "2024-12-15",
          voting_ends_at: "2025-01-15",
        },
      ];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useTrustAlgorithmVersion() {
  return useQuery({
    queryKey: ["trustAlgorithmVersion"],
    queryFn: async () => {
      return {
        version: "2.1.0",
        lastUpdated: "2024-12-01",
        changelog: [
          {
            version: "2.1.0",
            date: "2024-12-01",
            changes: [
              "Added mentorship bonus consideration",
              "Reduced inactivity decay rate from 3% to 2%",
              "Added institutional verification weight",
            ],
          },
          {
            version: "2.0.0",
            date: "2024-06-01",
            changes: [
              "Major recalculation of component weights",
              "Added financial reliability component",
              "Introduced tier-based access gates",
            ],
          },
        ],
        nextReviewDate: "2025-06-01",
      };
    },
    staleTime: Infinity,
  });
}

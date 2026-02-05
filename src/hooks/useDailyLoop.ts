import { useMemo } from "react";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useConsequenceLedger } from "@/hooks/useAccountability";
import { useOpportunityEngine } from "@/hooks/useOpportunityEngine";
import { useAuth } from "@/contexts/AuthContext";

interface TodayItem {
  id: string;
  type: 'milestone' | 'message' | 'opportunity' | 'action';
  title: string;
  subtitle?: string;
  urgent?: boolean;
  href: string;
}

interface ChangeItem {
  type: 'trust' | 'earnings' | 'completion' | 'general';
  value: string;
  positive?: boolean;
}

/**
 * System 71: One Daily Loop (Mandatory)
 * Aggregates all data needed for the daily professional loop
 */
export function useDailyLoop() {
  const { profile } = useAuth();
  const { trustProfile, loading: trustLoading } = useMyTrustProfile();
  const { data: ledger, isLoading: ledgerLoading } = useConsequenceLedger();
  const { data: opportunities = [], isLoading: oppsLoading } = useOpportunityEngine({
    sortBy: "relevance",
  });

  // Step 1: Current State
  const currentState = useMemo(() => ({
    trustScore: trustProfile?.trust_score ?? 0,
    activeDeals: (ledger?.projects_attempted || 0) - 
                 (ledger?.projects_completed || 0) - 
                 (ledger?.projects_failed || 0) - 
                 (ledger?.projects_abandoned || 0),
    pendingActions: 0, // TODO: Connect to real pending actions
  }), [trustProfile, ledger]);

  // Step 2: What Matters Today
  const todayItems = useMemo((): TodayItem[] => {
    const items: TodayItem[] = [];

    // Add top matched opportunities
    opportunities.slice(0, 3).forEach((opp, index) => {
      items.push({
        id: `opp-${opp.id}`,
        type: 'opportunity',
        title: opp.title || 'New Opportunity',
        subtitle: 'Match score: High',
        urgent: index === 0,
        href: `/opportunities/${opp.id}`,
      });
    });

    // TODO: Add real milestones, messages, actions from backend

    return items;
  }, [opportunities]);

  // Step 3: Next Best Action (derived from todayItems)
  const nextAction = useMemo(() => {
    if (todayItems.length === 0) return null;
    const urgent = todayItems.find(i => i.urgent);
    return urgent || todayItems[0];
  }, [todayItems]);

  // Step 4: What Changed
  const recentChanges = useMemo((): ChangeItem[] => {
    const changes: ChangeItem[] = [];

    // Trust change (mock for now - would come from trust history)
    if (trustProfile?.trust_score && trustProfile.trust_score > 50) {
      changes.push({
        type: 'trust',
        value: '+2 trust',
        positive: true,
      });
    }

    // Earnings from ledger
    if (ledger?.total_escrow_released && ledger.total_escrow_released > 0) {
      changes.push({
        type: 'earnings',
        value: `$${ledger.total_escrow_released.toLocaleString()} released`,
        positive: true,
      });
    }

    // Completions
    if (ledger?.projects_completed && ledger.projects_completed > 0) {
      changes.push({
        type: 'completion',
        value: `${ledger.projects_completed} deals closed`,
        positive: true,
      });
    }

    return changes;
  }, [trustProfile, ledger]);

  return {
    // State
    currentState,
    todayItems,
    nextAction,
    recentChanges,
    
    // Loading states
    loading: trustLoading || ledgerLoading || oppsLoading,
    
    // Profile
    userName: profile?.full_name?.split(" ")[0] || null,
    isVerified: trustProfile?.is_verified_student || trustProfile?.is_verified_researcher || false,
  };
}

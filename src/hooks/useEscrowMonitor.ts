import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ═══════════════════════════════════════════════════════════
// ESCROW MONITOR: Real-time escrow & money flow tracking
// ═══════════════════════════════════════════════════════════

export interface EscrowPosition {
  deal_id: string;
  deal_title: string;
  counterparty_name: string;
  role: "buyer" | "seller";
  total_amount: number;
  locked_amount: number;
  released_amount: number;
  pending_release: number;
  status: string;
  milestones_total: number;
  milestones_released: number;
  milestones_pending: number;
  created_at: string;
  last_activity: string;
}

export interface MoneyFlowEntry {
  id: string;
  timestamp: string;
  type: "escrow_lock" | "milestone_release" | "platform_fee" | "refund" | "deposit" | "withdrawal";
  amount: number;
  from_label: string;
  to_label: string;
  deal_title?: string;
  milestone_title?: string;
  description: string;
}

export interface EscrowSummary {
  total_available: number;
  total_in_escrow: number;
  total_pending: number;
  total_earned_lifetime: number;
  total_spent_lifetime: number;
  total_fees_paid: number;
  active_deals: number;
  net_flow_30d: number;
  positions: EscrowPosition[];
  recent_flows: MoneyFlowEntry[];
}

export function useEscrowMonitor() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dealRooms, setDealRooms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch wallet, transactions, and deal rooms in parallel
      const [walletRes, txnRes, dealsRes] = await Promise.all([
        supabase
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("wallet_transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("deal_rooms")
          .select("*")
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order("created_at", { ascending: false }),
      ]);

      if (walletRes.error) throw walletRes.error;
      setWallet(walletRes.data);

      // Filter transactions to user's wallet
      if (txnRes.data && walletRes.data) {
        const userTxns = txnRes.data.filter(
          (t: any) => t.wallet_id === walletRes.data.id
        );
        setTransactions(userTxns);
      }

      setDealRooms(dealsRes.data || []);
    } catch (err: any) {
      console.error("EscrowMonitor fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time wallet changes
  useEffect(() => {
    if (!wallet?.id) return;

    const channel = supabase
      .channel(`escrow-monitor-${wallet.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallets",
          filter: `id=eq.${wallet.id}`,
        },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wallet_transactions",
          filter: `wallet_id=eq.${wallet.id}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [wallet?.id, fetchData]);

  // Compute escrow positions from deal rooms
  const positions = useMemo<EscrowPosition[]>(() => {
    if (!user) return [];

    return dealRooms
      .filter((d: any) => ["in_progress", "negotiating", "agreed", "disputed"].includes(d.status))
      .map((deal: any) => {
        const isBuyer = deal.buyer_id === user.id;
        const milestones = (deal.milestones as any[]) || [];
        const releasedMs = milestones.filter((m: any) => m.status === "released");
        const pendingMs = milestones.filter((m: any) =>
          ["approved", "submitted"].includes(m.status)
        );

        return {
          deal_id: deal.id,
          deal_title: deal.title || "Untitled Deal",
          counterparty_name: "Counterparty",
          role: isBuyer ? "buyer" : "seller",
          total_amount: deal.agreed_amount || 0,
          locked_amount: deal.escrow_amount || 0,
          released_amount: releasedMs.reduce((s: number, m: any) => s + (m.amount || 0), 0),
          pending_release: pendingMs.reduce((s: number, m: any) => s + (m.amount || 0), 0),
          status: deal.status,
          milestones_total: milestones.length,
          milestones_released: releasedMs.length,
          milestones_pending: pendingMs.length,
          created_at: deal.created_at,
          last_activity: deal.updated_at,
        } as EscrowPosition;
      });
  }, [dealRooms, user]);

  // Build money flow timeline from transactions
  const recentFlows = useMemo<MoneyFlowEntry[]>(() => {
    return transactions.slice(0, 30).map((txn: any) => {
      const typeMap: Record<string, MoneyFlowEntry["type"]> = {
        escrow_deposit: "escrow_lock",
        escrow_release: "milestone_release",
        milestone_release: "milestone_release",
        commission_deduction: "platform_fee",
        refund: "refund",
        deposit: "deposit",
        credit: "deposit",
        withdrawal: "withdrawal",
      };

      const fromTo = getFlowLabels(txn.type, txn.amount);

      return {
        id: txn.id,
        timestamp: txn.created_at,
        type: typeMap[txn.type] || "deposit",
        amount: Math.abs(txn.amount),
        from_label: fromTo.from,
        to_label: fromTo.to,
        description: txn.description || txn.type,
      } as MoneyFlowEntry;
    });
  }, [transactions]);

  // Compute summary
  const summary = useMemo<EscrowSummary>(() => {
    const feesPaid = transactions
      .filter((t: any) => t.type === "commission_deduction")
      .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTxns = transactions.filter(
      (t: any) => new Date(t.created_at) >= thirtyDaysAgo
    );
    const netFlow30d = recentTxns.reduce((s: number, t: any) => s + t.amount, 0);

    return {
      total_available: wallet?.available_balance || 0,
      total_in_escrow: wallet?.escrow_balance || 0,
      total_pending: wallet?.pending_balance || 0,
      total_earned_lifetime: wallet?.total_earned || 0,
      total_spent_lifetime: wallet?.total_spent || 0,
      total_fees_paid: feesPaid,
      active_deals: positions.length,
      net_flow_30d: netFlow30d,
      positions,
      recent_flows: recentFlows,
    };
  }, [wallet, transactions, positions, recentFlows]);

  return {
    summary,
    loading,
    error,
    refetch: fetchData,
  };
}

function getFlowLabels(type: string, amount: number): { from: string; to: string } {
  switch (type) {
    case "escrow_deposit":
      return { from: "Your Wallet", to: "Escrow" };
    case "escrow_release":
      return { from: "Escrow", to: "Provider" };
    case "milestone_release":
      return { from: "Escrow", to: "Your Wallet" };
    case "commission_deduction":
      return { from: "Transaction", to: "Platform" };
    case "refund":
      return { from: "Escrow", to: "Your Wallet" };
    case "deposit":
    case "credit":
      return { from: "External", to: "Your Wallet" };
    case "withdrawal":
      return { from: "Your Wallet", to: "Bank Account" };
    default:
      return { from: "Unknown", to: "Unknown" };
  }
}

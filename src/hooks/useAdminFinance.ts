import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Transaction {
  id: string;
  user_id: string;
  tool_id: string;
  amount: number;
  status: string;
  currency: string;
  created_at: string;
  // Joined data
  user_name?: string;
  tool_name?: string;
}

export interface Dispute {
  id: string;
  milestone_id: string;
  initiated_by: string;
  resolved_by: string | null;
  reason: string;
  status: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
  // Joined data
  milestone_title?: string;
  milestone_amount?: number;
  initiator_name?: string;
}

export function useAdminFinance() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [walletStats, setWalletStats] = useState({
    totalEscrow: 0,
    totalAvailable: 0,
    totalPending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTransactions(),
        fetchDisputes(),
        fetchWalletStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("tool_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles and tools
      const userIds = [...new Set(data?.map(t => t.user_id) || [])];
      const toolIds = [...new Set(data?.map(t => t.tool_id) || [])];

      const [profilesRes, toolsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", userIds),
        supabase.from("tools").select("id, name").in("id", toolIds)
      ]);

      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p.full_name]) || []);
      const toolMap = new Map(toolsRes.data?.map(t => [t.id, t.name]) || []);

      const enriched = (data || []).map(txn => ({
        ...txn,
        user_name: profileMap.get(txn.user_id) || "Unknown",
        tool_name: toolMap.get(txn.tool_id) || "Unknown Tool",
      }));

      setTransactions(enriched);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch milestone and user details
      const disputesWithDetails = await Promise.all(
        (data || []).map(async (dispute) => {
          const [milestoneRes, profileRes] = await Promise.all([
            supabase
              .from("milestones")
              .select("title, amount")
              .eq("id", dispute.milestone_id)
              .maybeSingle(),
            supabase
              .from("profiles")
              .select("full_name")
              .eq("id", dispute.initiated_by)
              .maybeSingle()
          ]);

          return {
            ...dispute,
            milestone_title: milestoneRes.data?.title || "Unknown Milestone",
            milestone_amount: milestoneRes.data?.amount || 0,
            initiator_name: profileRes.data?.full_name || "Unknown",
          };
        })
      );

      setDisputes(disputesWithDetails);
    } catch (err) {
      console.error("Error fetching disputes:", err);
    }
  };

  const fetchWalletStats = async () => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("available_balance, escrow_balance, pending_balance");

      if (error) throw error;

      const stats = (data || []).reduce(
        (acc, wallet) => ({
          totalEscrow: acc.totalEscrow + Number(wallet.escrow_balance || 0),
          totalAvailable: acc.totalAvailable + Number(wallet.available_balance || 0),
          totalPending: acc.totalPending + Number(wallet.pending_balance || 0),
        }),
        { totalEscrow: 0, totalAvailable: 0, totalPending: 0 }
      );

      setWalletStats(stats);
    } catch (err) {
      console.error("Error fetching wallet stats:", err);
    }
  };

  const getStats = () => {
    const completedTransactions = transactions.filter(t => t.status === "completed" || t.status === "delivered");
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const commissionRate = 0.1; // 10%
    const totalCommission = totalRevenue * commissionRate;
    const totalPayout = totalRevenue - totalCommission;
    const openDisputes = disputes.filter(d => d.status === "open" || d.status === "under_review").length;

    // Monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = completedTransactions
      .filter(t => new Date(t.created_at) >= startOfMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalRevenue,
      totalCommission,
      totalPayout,
      monthlyRevenue,
      openDisputes,
      ...walletStats,
    };
  };

  const resolveDispute = async (
    disputeId: string,
    resolution: string,
    action: "release" | "refund"
  ) => {
    try {
      const { error } = await supabase
        .from("disputes")
        .update({
          status: "resolved",
          resolution,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", disputeId);

      if (error) throw error;

      toast({
        title: "Dispute Resolved",
        description: `Funds have been ${action === "release" ? "released to seller" : "refunded to buyer"}`,
      });

      await fetchDisputes();
      return { success: true };
    } catch (err: any) {
      toast({ title: "Failed to resolve dispute", variant: "destructive" });
      return { success: false, error: err.message };
    }
  };

  return {
    transactions,
    disputes,
    loading,
    stats: getStats(),
    refetch: fetchFinanceData,
    resolveDispute,
  };
}

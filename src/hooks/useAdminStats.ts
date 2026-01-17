import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  pendingVerifications: number;
  revenueThisMonth: number;
  totalEscrowBalance: number;
  openDisputes: number;
  activeProjects: number;
  totalTools: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    pendingVerifications: 0,
    revenueThisMonth: 0,
    totalEscrowBalance: 0,
    openDisputes: 0,
    activeProjects: 0,
    totalTools: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Active subscriptions
      const { count: subCount } = await supabase
        .from("tool_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Pending verifications
      const { count: verifyCount } = await supabase
        .from("verification_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Revenue this month (from tool orders)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyOrders } = await supabase
        .from("tool_orders")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", startOfMonth.toISOString());

      const revenueThisMonth = (monthlyOrders || []).reduce(
        (sum, order) => sum + Number(order.amount),
        0
      );

      // Total escrow balance
      const { data: wallets } = await supabase
        .from("wallets")
        .select("escrow_balance");

      const totalEscrow = (wallets || []).reduce(
        (sum, wallet) => sum + Number(wallet.escrow_balance),
        0
      );

      // Open disputes
      const { count: disputeCount } = await supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "under_review"]);

      // Active projects
      const { count: projectCount } = await supabase
        .from("earning_projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      // Total active tools
      const { count: toolCount } = await supabase
        .from("tools")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      setStats({
        totalUsers: userCount || 0,
        activeSubscriptions: subCount || 0,
        pendingVerifications: verifyCount || 0,
        revenueThisMonth,
        totalEscrowBalance: totalEscrow,
        openDisputes: disputeCount || 0,
        activeProjects: projectCount || 0,
        totalTools: toolCount || 0,
      });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}

export function useAdminFinance() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      // Fetch recent tool orders
      const { data: ordersData } = await supabase
        .from("tool_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      setTransactions(ordersData || []);

      // Fetch disputes with milestone info
      const { data: disputesData } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false });

      // Get milestone details for each dispute
      const disputesWithDetails = await Promise.all(
        (disputesData || []).map(async (dispute) => {
          const { data: milestone } = await supabase
            .from("milestones")
            .select("title, amount, offer_id")
            .eq("id", dispute.milestone_id)
            .maybeSingle();

          return {
            ...dispute,
            milestone_title: milestone?.title,
            milestone_amount: milestone?.amount,
          };
        })
      );

      setDisputes(disputesWithDetails);
    } catch (err) {
      console.error("Error fetching finance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (disputeId: string, resolution: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("disputes")
        .update({
          status: "resolved",
          resolution,
          resolved_by: userId,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", disputeId);

      if (error) throw error;
      await fetchFinanceData();
      return { success: true };
    } catch (err: any) {
      console.error("Error resolving dispute:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    transactions,
    disputes,
    loading,
    refetch: fetchFinanceData,
    resolveDispute,
  };
}

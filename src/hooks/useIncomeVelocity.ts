import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface MonthlyEarning {
  month: string;
  amount: number;
}

export interface SkillEarning {
  skill: string;
  amount: number;
  projects: number;
}

export interface IncomeVelocityData {
  monthlyEarnings: MonthlyEarning[];
  pipelineValue: number;
  activeDealCount: number;
  avgDealCycleDays: number;
  totalEarned: number;
  skillEarnings: SkillEarning[];
}

export function useIncomeVelocity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["income-velocity", user?.id],
    queryFn: async (): Promise<IncomeVelocityData> => {
      if (!user?.id) throw new Error("Not authenticated");

      const [walletRes, activeDealsRes, proofRes] = await Promise.all([
        // Get wallet transactions for earnings trend
        supabase
          .from("wallet_transactions")
          .select("amount, created_at, type, description")
          .eq("user_id", user.id)
          .in("type", ["milestone_release", "credit"])
          .order("created_at", { ascending: true })
          .limit(500),
        // Active deals in progress (pipeline)
        supabase
          .from("offers")
          .select("id, amount, created_at, status")
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq("status", "accepted")
          .limit(50),
        // Proof metrics for total earnings
        supabase
          .from("profile_proof_metrics")
          .select("total_earnings")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const transactions = walletRes.data || [];
      const activeDeals = activeDealsRes.data || [];

      // Build monthly earnings (last 6 months)
      const now = new Date();
      const monthlyMap: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthlyMap[key] = 0;
      }
      transactions.forEach((tx: any) => {
        if (tx.amount > 0) {
          const d = new Date(tx.created_at);
          const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          if (monthlyMap[key] !== undefined) {
            monthlyMap[key] += Number(tx.amount);
          }
        }
      });

      const monthlyEarnings = Object.entries(monthlyMap).map(([month, amount]) => ({
        month,
        amount,
      }));

      // Pipeline value
      const pipelineValue = activeDeals.reduce(
        (sum: number, d: any) => sum + (Number(d.amount) || 0),
        0
      );

      // Average deal cycle (approximate from accepted deals)
      const cycleDays =
        activeDeals.length > 0
          ? activeDeals.reduce((sum: number, d: any) => {
              const created = new Date(d.created_at);
              const days = Math.floor(
                (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
              );
              return sum + days;
            }, 0) / activeDeals.length
          : 0;

      return {
        monthlyEarnings,
        pipelineValue,
        activeDealCount: activeDeals.length,
        avgDealCycleDays: Math.round(cycleDays),
        totalEarned: Number(proofRes.data?.total_earnings) || 0,
        skillEarnings: [], // Would require more complex joins; placeholder
      };
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });
}

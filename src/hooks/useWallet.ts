import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Wallet {
  id: string;
  user_id: string;
  available_balance: number;
  escrow_balance: number;
  pending_balance: number;
  total_earned: number;
  total_spent: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  reference_type: string | null;
  status: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  offer_id: string;
  title: string;
  description: string | null;
  amount: number;
  order_index: number;
  status: string;
  expected_delivery: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  released_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  id: string;
  milestone_id: string;
  initiated_by: string;
  reason: string;
  status: string;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWallet();
    } else {
      setWallet(null);
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWallet = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch or create wallet
      let { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (walletError) throw walletError;

      // If no wallet exists, create one
      if (!walletData) {
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (createError) throw createError;
        walletData = newWallet;
      }

      setWallet(walletData as Wallet);

      // Fetch transactions
      if (walletData) {
        const { data: txnData, error: txnError } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (txnError) throw txnError;
        setTransactions(txnData as WalletTransaction[]);
      }
    } catch (err: any) {
      console.error("Error fetching wallet:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestWithdrawal = async (amount: number) => {
    if (!wallet) return { success: false, error: "No wallet found" };

    if (amount > wallet.available_balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough available balance for this withdrawal.",
        variant: "destructive",
      });
      return { success: false, error: "Insufficient funds" };
    }

    try {
      // Create a pending withdrawal transaction
      const { error: txnError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          type: "withdrawal",
          amount: -amount,
          balance_after: wallet.available_balance - amount,
          description: "Withdrawal request",
          status: "pending",
        });

      if (txnError) throw txnError;

      // Update wallet balance
      const { error: updateError } = await supabase
        .from("wallets")
        .update({
          available_balance: wallet.available_balance - amount,
          pending_balance: wallet.pending_balance + amount,
        })
        .eq("id", wallet.id);

      if (updateError) throw updateError;

      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal request is being processed. Funds will arrive in 2-3 business days.",
      });

      // Refresh wallet data
      await fetchWallet();
      return { success: true };
    } catch (err: any) {
      console.error("Error requesting withdrawal:", err);
      toast({
        title: "Withdrawal Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  return {
    wallet,
    transactions,
    loading,
    error,
    refetch: fetchWallet,
    requestWithdrawal,
  };
}

export function useMilestones(offerId?: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (offerId) {
      fetchMilestones();
    }
  }, [offerId]);

  const fetchMilestones = async () => {
    if (!offerId) return;

    try {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("offer_id", offerId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setMilestones(data as Milestone[]);
    } catch (err) {
      console.error("Error fetching milestones:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      // Use atomic server functions for submit/approve — no client-side balance mutation
      if (status === "submitted") {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");
        const { error } = await supabase.rpc('submit_milestone_atomic' as any, {
          p_milestone_id: milestoneId,
          p_executor_id: userData.user.id,
        });
        if (error) throw error;
      } else if (status === "approved") {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");
        const { error } = await supabase.rpc('approve_milestone_atomic' as any, {
          p_milestone_id: milestoneId,
          p_sponsor_id: userData.user.id,
        });
        if (error) throw error;
      } else {
        // Fallback for other status changes
        const { error } = await supabase
          .from("milestones")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", milestoneId);
        if (error) throw error;
      }

      await fetchMilestones();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating milestone:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    milestones,
    loading,
    refetch: fetchMilestones,
    updateMilestoneStatus,
  };
}

export function useDisputes() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDisputes();
    }
  }, [user]);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDisputes(data as Dispute[]);
    } catch (err) {
      console.error("Error fetching disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  const createDispute = async (milestoneId: string, reason: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("disputes")
        .insert({
          milestone_id: milestoneId,
          initiated_by: user.id,
          reason,
        });

      if (error) throw error;
      await fetchDisputes();
      return { success: true };
    } catch (err: any) {
      console.error("Error creating dispute:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    disputes,
    loading,
    refetch: fetchDisputes,
    createDispute,
  };
}

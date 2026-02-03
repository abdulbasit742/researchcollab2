import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionTier {
  id: string;
  name: "Free" | "Pro" | "Elite";
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_projects_month: number | null;
  max_bids_month: number | null;
  priority_support: boolean;
  featured_profile: boolean;
  ai_credits_included: number;
  badge_name: string | null;
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier_id: string;
  status: "active" | "cancelled" | "expired" | "pending";
  billing_cycle: "monthly" | "yearly";
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  auto_renew: boolean;
}

export interface AICreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus_credits: number;
  is_active: boolean;
}

export interface UserAICredits {
  user_id: string;
  balance: number;
  lifetime_used: number;
  last_refill_at: string | null;
}

export function useSubscriptionTiers() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_tiers")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      setTiers(data as SubscriptionTier[]);
    } catch (err) {
      console.error("Error fetching subscription tiers:", err);
    } finally {
      setLoading(false);
    }
  };

  return { tiers, loading, refetch: fetchTiers };
}

export function useUserSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_tiers (*)
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSubscription(data as UserSubscription);
        setCurrentTier((data as any).subscription_tiers as SubscriptionTier);
      } else {
        // Default to Free tier
        const { data: freeTier } = await supabase
          .from("subscription_tiers")
          .select("*")
          .eq("name", "Free")
          .single();
        
        if (freeTier) {
          setCurrentTier(freeTier as SubscriptionTier);
        }
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (tierId: string, billingCycle: "monthly" | "yearly") => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      // Cancel any existing subscription
      if (subscription) {
        await supabase
          .from("user_subscriptions")
          .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
          .eq("id", subscription.id);
      }

      // Create new subscription
      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          tier_id: tierId,
          billing_cycle: billingCycle,
          expires_at: new Date(Date.now() + (billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Subscription Activated",
        description: "Your subscription has been activated successfully!",
      });

      await fetchSubscription();
      return { success: true };
    } catch (err: any) {
      console.error("Error subscribing:", err);
      toast({
        title: "Subscription Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return { success: false, error: "No active subscription" };

    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ 
          auto_renew: false,
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end of the billing period.",
      });

      await fetchSubscription();
      return { success: true };
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    subscription,
    currentTier,
    loading,
    refetch: fetchSubscription,
    subscribe,
    cancelSubscription,
  };
}

export function useAICredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserAICredits | null>(null);
  const [packs, setPacks] = useState<AICreditPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCredits();
      fetchPacks();
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_ai_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setCredits(data as UserAICredits);
    } catch (err) {
      console.error("Error fetching AI credits:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPacks = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_credit_packs")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      setPacks(data as AICreditPack[]);
    } catch (err) {
      console.error("Error fetching AI credit packs:", err);
    }
  };

  const useCredits = async (amount: number) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc("use_ai_credits", { p_user_id: user.id, p_amount: amount });

      if (error) throw error;
      
      if (data) {
        await fetchCredits();
      }
      
      return data as boolean;
    } catch (err) {
      console.error("Error using AI credits:", err);
      return false;
    }
  };

  return {
    credits,
    packs,
    loading,
    refetch: fetchCredits,
    useCredits,
  };
}

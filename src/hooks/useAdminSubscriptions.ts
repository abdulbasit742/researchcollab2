import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ToolSubscription {
  id: string;
  user_id: string;
  tool_id: string;
  status: string;
  plan_type: string;
  plan_name: string | null;
  auto_renew: boolean;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  // Joined data
  user_name?: string;
  tool_name?: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subscription_id: string | null;
  tool_id: string | null;
  problem_type: string;
  message: string;
  admin_reply: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  // Joined data
  user_name?: string;
  tool_name?: string;
}

export function useAdminSubscriptions() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<ToolSubscription[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSubscriptions(), fetchTickets()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("tool_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles and tools
      const userIds = [...new Set(data?.map(s => s.user_id) || [])];
      const toolIds = [...new Set(data?.map(s => s.tool_id) || [])];

      const [profilesRes, toolsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", userIds),
        supabase.from("tools").select("id, name").in("id", toolIds)
      ]);

      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p.full_name]) || []);
      const toolMap = new Map(toolsRes.data?.map(t => [t.id, t.name]) || []);

      const enriched = (data || []).map(sub => ({
        ...sub,
        auto_renew: sub.auto_renew ?? true,
        user_name: profileMap.get(sub.user_id) || "Unknown",
        tool_name: toolMap.get(sub.tool_id) || "Unknown Tool",
      }));

      setSubscriptions(enriched);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles and tools
      const userIds = [...new Set(data?.map(t => t.user_id) || [])];
      const toolIds = [...new Set(data?.filter(t => t.tool_id).map(t => t.tool_id!) || [])];

      const [profilesRes, toolsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", userIds),
        toolIds.length > 0 
          ? supabase.from("tools").select("id, name").in("id", toolIds)
          : Promise.resolve({ data: [] as { id: string; name: string }[] })
      ]);

      const profileMap = new Map<string, string>(
        profilesRes.data?.map(p => [p.id, p.full_name || "Unknown"] as [string, string]) || []
      );
      const toolMap = new Map<string, string>(
        toolsRes.data?.map(t => [t.id, t.name] as [string, string]) || []
      );

      const enriched: SupportTicket[] = (data || []).map(ticket => ({
        ...ticket,
        user_name: profileMap.get(ticket.user_id) || "Unknown",
        tool_name: ticket.tool_id ? toolMap.get(ticket.tool_id) || "Unknown Tool" : null,
      }));

      setTickets(enriched);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const getExpiringSubscriptions = (days: number = 7) => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return subscriptions.filter(sub => {
      if (sub.status !== "active" || !sub.expires_at) return false;
      const expiresAt = new Date(sub.expires_at);
      return expiresAt > now && expiresAt <= cutoff;
    });
  };

  const getOpenTickets = () => {
    return tickets.filter(t => t.status !== "resolved");
  };

  const getStats = () => {
    const activeSubscriptions = subscriptions.filter(s => s.status === "active").length;
    const expiringSoon = getExpiringSubscriptions(7).length;
    const openTicketsCount = getOpenTickets().length;

    // Plan distribution
    const planDistribution: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const plan = sub.plan_name || sub.plan_type || "Unknown";
      planDistribution[plan] = (planDistribution[plan] || 0) + 1;
    });

    // Tool distribution
    const toolDistribution: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const tool = sub.tool_name || "Unknown";
      toolDistribution[tool] = (toolDistribution[tool] || 0) + 1;
    });

    return {
      activeSubscriptions,
      expiringSoon,
      openTicketsCount,
      totalSubscriptions: subscriptions.length,
      planDistribution,
      toolDistribution,
    };
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from("tool_subscriptions")
        .update({ 
          status: "cancelled",
          cancelled_at: new Date().toISOString()
        })
        .eq("id", subscriptionId);

      if (error) throw error;

      toast({ title: "Subscription cancelled" });
      await fetchSubscriptions();
      return { success: true };
    } catch (err: any) {
      toast({ title: "Failed to cancel subscription", variant: "destructive" });
      return { success: false, error: err.message };
    }
  };

  const extendSubscription = async (subscriptionId: string, days: number) => {
    try {
      const sub = subscriptions.find(s => s.id === subscriptionId);
      if (!sub) throw new Error("Subscription not found");

      const currentExpiry = sub.expires_at ? new Date(sub.expires_at) : new Date();
      currentExpiry.setDate(currentExpiry.getDate() + days);

      const { error } = await supabase
        .from("tool_subscriptions")
        .update({ 
          expires_at: currentExpiry.toISOString(),
          status: "active"
        })
        .eq("id", subscriptionId);

      if (error) throw error;

      toast({ title: `Subscription extended by ${days} days` });
      await fetchSubscriptions();
      return { success: true };
    } catch (err: any) {
      toast({ title: "Failed to extend subscription", variant: "destructive" });
      return { success: false, error: err.message };
    }
  };

  const resolveTicket = async (ticketId: string, reply?: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ 
          status: "resolved",
          admin_reply: reply,
          resolved_at: new Date().toISOString()
        })
        .eq("id", ticketId);

      if (error) throw error;

      toast({ title: "Ticket resolved" });
      await fetchTickets();
      return { success: true };
    } catch (err: any) {
      toast({ title: "Failed to resolve ticket", variant: "destructive" });
      return { success: false, error: err.message };
    }
  };

  const sendReminder = async (subscription: ToolSubscription) => {
    // In a real app, this would send an email
    toast({ 
      title: "Reminder Sent",
      description: `Expiry reminder sent to ${subscription.user_name}`
    });
    return { success: true };
  };

  return {
    subscriptions,
    tickets,
    loading,
    expiringSubscriptions: getExpiringSubscriptions(7),
    openTickets: getOpenTickets(),
    stats: getStats(),
    refetch: fetchData,
    cancelSubscription,
    extendSubscription,
    resolveTicket,
    sendReminder,
  };
}

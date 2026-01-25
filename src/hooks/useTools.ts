import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Tool {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  category: string;
  icon: string | null;
  features: string[];
  pricing: {
    price?: number;
    original_price?: number;
    currency?: string;
    plans?: string[];
  };
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToolSubscription {
  id: string;
  user_id: string;
  tool_id: string;
  plan_type: string;
  plan_name: string | null;
  auto_renew: boolean | null;
  status: string;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  // Joined data
  tool?: Tool;
}

export interface ToolOrder {
  id: string;
  user_id: string;
  tool_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  created_at: string;
}

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse features and pricing from JSONB
      const parsedTools = (data || []).map(tool => ({
        ...tool,
        features: Array.isArray(tool.features) ? tool.features : [],
        pricing: typeof tool.pricing === 'object' ? tool.pricing : {},
      }));
      
      setTools(parsedTools as Tool[]);
    } catch (err: any) {
      console.error("Error fetching tools:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    tools,
    loading,
    error,
    refetch: fetchTools,
  };
}

export function useMySubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<ToolSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else {
      setSubscriptions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tool_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch tool details for each subscription
      const subsWithTools = await Promise.all(
        (data || []).map(async (sub) => {
          const { data: tool } = await supabase
            .from("tools")
            .select("*")
            .eq("id", sub.tool_id)
            .maybeSingle();

          return {
            ...sub,
            tool: tool as Tool,
          };
        })
      );

      setSubscriptions(subsWithTools as ToolSubscription[]);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscriptions,
    loading,
    refetch: fetchSubscriptions,
  };
}

export function useSubscribeTool() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscribing, setSubscribing] = useState(false);

  const subscribe = async (
    toolId: string,
    planType: string,
    amount: number,
    durationMonths: number = 1
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe.",
        variant: "destructive",
      });
      return { success: false, error: "Not authenticated" };
    }

    setSubscribing(true);
    try {
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

      // Create subscription
      const { data: subscription, error: subError } = await supabase
        .from("tool_subscriptions")
        .insert({
          user_id: user.id,
          tool_id: toolId,
          plan_type: planType,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (subError) throw subError;

      // Create order
      const { error: orderError } = await supabase
        .from("tool_orders")
        .insert({
          user_id: user.id,
          tool_id: toolId,
          subscription_id: subscription.id,
          amount: amount * durationMonths,
          status: "completed",
        });

      if (orderError) throw orderError;

      toast({
        title: "Subscription Successful!",
        description: "You now have access to this tool.",
      });

      return { success: true, subscription };
    } catch (err: any) {
      console.error("Error subscribing to tool:", err);
      toast({
        title: "Subscription Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setSubscribing(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("tool_subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled.",
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      toast({
        title: "Cancellation Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  return {
    subscribe,
    cancelSubscription,
    subscribing,
  };
}

export function useAdminTools() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createTool = async (tool: Omit<Tool, "id" | "created_at" | "updated_at">) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tools")
        .insert(tool)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tool Created",
        description: "The tool has been added successfully.",
      });

      return { success: true, tool: data };
    } catch (err: any) {
      console.error("Error creating tool:", err);
      toast({
        title: "Creation Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateTool = async (id: string, updates: Partial<Tool>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("tools")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Tool Updated",
        description: "The tool has been updated successfully.",
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error updating tool:", err);
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteTool = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("tools")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Tool Deleted",
        description: "The tool has been deactivated.",
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error deleting tool:", err);
      toast({
        title: "Deletion Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    createTool,
    updateTool,
    deleteTool,
    loading,
  };
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ToolOrder {
  id: string;
  user_id: string;
  tool_id: string;
  subscription_id: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  currency: string;
  delivery_details: Record<string, any> | null;
  plan_id: string | null;
  plan_name: string | null;
  duration_months: number;
  created_at: string;
  // Joined data
  user_name?: string;
  user_email?: string;
  tool_name?: string;
}

export function useAdminFulfillment() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<ToolOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tool_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles and tools
      const userIds = [...new Set(data?.map(o => o.user_id) || [])];
      const toolIds = [...new Set(data?.map(o => o.tool_id) || [])];

      const [profilesRes, toolsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", userIds),
        supabase.from("tools").select("id, name").in("id", toolIds)
      ]);

      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p.full_name]) || []);
      const toolMap = new Map(toolsRes.data?.map(t => [t.id, t.name]) || []);

      const enrichedOrders = (data || []).map(order => ({
        ...order,
        delivery_details: order.delivery_details as Record<string, any> | null,
        user_name: profileMap.get(order.user_id) || "Unknown",
        tool_name: toolMap.get(order.tool_id) || "Unknown Tool",
      }));

      setOrders(enrichedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPendingOrders = () => {
    return orders.filter(o => o.status === "paid" || o.status === "in_fulfillment");
  };

  const markAsPaid = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("tool_orders")
        .update({ status: "paid" })
        .eq("id", orderId);

      if (error) throw error;

      toast({ title: "Order marked as paid" });
      await fetchOrders();
      return { success: true };
    } catch (err: any) {
      toast({ title: "Failed to update order", variant: "destructive" });
      return { success: false, error: err.message };
    }
  };

  const startFulfillment = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("tool_orders")
        .update({ status: "in_fulfillment" })
        .eq("id", orderId);

      if (error) throw error;

      toast({ title: "Fulfillment started" });
      await fetchOrders();
      return { success: true };
    } catch (err: any) {
      toast({ title: "Failed to start fulfillment", variant: "destructive" });
      return { success: false, error: err.message };
    }
  };

  const completeDelivery = async (
    orderId: string,
    deliveryDetails: Record<string, any>
  ) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error("Order not found");

      // Update order status and delivery details
      const { error: orderError } = await supabase
        .from("tool_orders")
        .update({
          status: "delivered",
          delivery_details: deliveryDetails,
        })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Create or update subscription
      if (!order.subscription_id) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (order.duration_months || 1));

        const { data: subscription, error: subError } = await supabase
          .from("tool_subscriptions")
          .insert({
            user_id: order.user_id,
            tool_id: order.tool_id,
            status: "active",
            plan_type: "monthly",
            plan_name: order.plan_name,
            started_at: startDate.toISOString(),
            expires_at: endDate.toISOString(),
          })
          .select()
          .single();

        if (subError) throw subError;

        // Link subscription to order
        await supabase
          .from("tool_orders")
          .update({ subscription_id: subscription.id })
          .eq("id", orderId);
      }

      toast({ 
        title: "Delivery completed!",
        description: `${order.tool_name} has been delivered successfully.`
      });
      await fetchOrders();
      return { success: true };
    } catch (err: any) {
      console.error("Error completing delivery:", err);
      toast({ title: "Delivery failed", description: err.message, variant: "destructive" });
      return { success: false, error: err.message };
    }
  };

  return {
    orders,
    loading,
    pendingOrders: getPendingOrders(),
    refetch: fetchOrders,
    markAsPaid,
    startFulfillment,
    completeDelivery,
  };
}

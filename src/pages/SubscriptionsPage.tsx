import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  ShoppingCart,
  MessageSquare
} from "lucide-react";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { SupportTicketModal } from "@/components/subscriptions/SupportTicketModal";
import { useMySubscriptions, ToolSubscription } from "@/hooks/useTools";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface SupportTicket {
  id: string;
  tool_id: string | null;
  subscription_id: string | null;
  problem_type: string;
  message: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
  resolved_at: string | null;
  toolName?: string;
}

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscriptions, loading: subsLoading, refetch } = useMySubscriptions();
  const [selectedSubscription, setSelectedSubscription] = useState<ToolSubscription | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;

    setTicketsLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const activeSubscriptions = subscriptions.filter(s => 
    s.status === "active" && (!s.expires_at || new Date(s.expires_at) > new Date())
  );
  
  const expiringSubscriptions = subscriptions.filter(s => {
    if (!s.expires_at) return false;
    const expiresIn = new Date(s.expires_at).getTime() - Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return s.status === "active" && expiresIn < sevenDays && expiresIn > 0;
  });

  const expiredSubscriptions = subscriptions.filter(s => 
    s.status === "cancelled" || s.status === "expired" || 
    (s.expires_at && new Date(s.expires_at) < new Date())
  );

  const handleRenew = (subscription: ToolSubscription) => {
    toast({
      title: "Renewal Started",
      description: `Redirecting to renew ${subscription.tool?.name || "subscription"}...`,
    });
  };

  const handleCancel = async (subscription: ToolSubscription) => {
    try {
      const { error } = await supabase
        .from("tool_subscriptions")
        .update({ 
          status: "cancelled", 
          cancelled_at: new Date().toISOString() 
        })
        .eq("id", subscription.id);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end date.",
      });

      refetch();
    } catch (err: any) {
      toast({
        title: "Cancellation Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleReportIssue = (subscription: ToolSubscription) => {
    setSelectedSubscription(subscription);
    setShowTicketModal(true);
  };

  // Transform subscriptions for SubscriptionCard
  const transformSubscription = (sub: ToolSubscription) => ({
    id: sub.id,
    toolId: sub.tool_id,
    toolName: sub.tool?.name || "Unknown Tool",
    toolIcon: sub.tool?.icon || "Package",
    planType: sub.plan_type,
    planName: sub.plan_name || sub.plan_type,
    status: sub.status as "active" | "expiring" | "expired" | "cancelled",
    startDate: sub.started_at,
    endDate: sub.expires_at || "",
    autoRenew: sub.auto_renew ?? true,
    credentials: undefined,
    userId: sub.user_id,
    createdAt: sub.created_at,
  });

  return (
    <MainLayout>
      <div className="gradient-hero py-12 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4">
              <Package className="h-3 w-3 mr-1" />
              My Subscriptions
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl">
              Manage Your{" "}
              <span className="text-gradient">AI Tools</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              View credentials, renew subscriptions, and get support
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-xl font-bold">{activeSubscriptions.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className={expiringSubscriptions.length > 0 ? "border-amber-500/50" : ""}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
                <p className="text-xl font-bold">{expiringSubscriptions.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expired</p>
                <p className="text-xl font-bold">{expiredSubscriptions.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Open Tickets</p>
                <p className="text-xl font-bold">
                  {tickets.filter(t => t.status !== "resolved").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active ({activeSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="gap-2">
              <Clock className="h-4 w-4" />
              Past ({expiredSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Support ({tickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {subsLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activeSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Subscriptions</h3>
                  <p className="text-muted-foreground mb-6">
                    Browse our AI tools marketplace to get started
                  </p>
                  <Link to="/tools">
                    <Button className="gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Explore Tools
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {activeSubscriptions.map((subscription) => (
                  <motion.div
                    key={subscription.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SubscriptionCard
                      subscription={transformSubscription(subscription)}
                      onRenew={() => handleRenew(subscription)}
                      onCancel={() => handleCancel(subscription)}
                      onReportIssue={() => handleReportIssue(subscription)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-6">
            {expiredSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Past Subscriptions</h3>
                  <p className="text-muted-foreground">
                    Your expired and cancelled subscriptions will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {expiredSubscriptions.map((subscription) => (
                  <motion.div
                    key={subscription.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SubscriptionCard
                      subscription={transformSubscription(subscription)}
                      onRenew={() => handleRenew(subscription)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            {ticketsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 space-y-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Support Tickets</h3>
                  <p className="text-muted-foreground">
                    Create a ticket from any active subscription if you need help
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">Support Ticket</CardTitle>
                          <CardDescription>
                            {ticket.problem_type.replace("_", " ").toUpperCase()} • {new Date(ticket.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={
                          ticket.status === "resolved" ? "default" :
                          ticket.status === "in_progress" ? "secondary" : "outline"
                        }>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm">{ticket.message}</p>
                      </div>
                      {ticket.admin_reply && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-xs text-primary font-medium mb-1">Admin Reply:</p>
                          <p className="text-sm">{ticket.admin_reply}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedSubscription && (
        <SupportTicketModal
          open={showTicketModal}
          onOpenChange={setShowTicketModal}
          subscription={transformSubscription(selectedSubscription)}
        />
      )}
    </MainLayout>
  );
}

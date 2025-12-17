import { useState } from "react";
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
import { 
  dummySubscriptions, 
  dummySupportTickets,
  Subscription,
  getExpiringSubscriptions 
} from "@/data/subscriptions";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Filter subscriptions (simulating current user = student-1)
  const userSubscriptions = dummySubscriptions.filter(s => 
    s.userId === "student-1" || s.userId === "student-2"
  );
  
  const activeSubscriptions = userSubscriptions.filter(s => 
    s.status === "active" || s.status === "expiring"
  );
  const expiredSubscriptions = userSubscriptions.filter(s => 
    s.status === "expired" || s.status === "cancelled"
  );
  const expiringCount = userSubscriptions.filter(s => s.status === "expiring").length;

  // User tickets
  const userTickets = dummySupportTickets.filter(t => 
    t.userId === "student-1" || t.userId === "student-2"
  );

  const handleRenew = (subscription: Subscription) => {
    toast({
      title: "Renewal Started",
      description: `Redirecting to renew ${subscription.toolName}...`,
    });
  };

  const handleCancel = (subscription: Subscription) => {
    toast({
      title: "Cancellation Requested",
      description: "Your subscription will remain active until the end date.",
    });
  };

  const handleReportIssue = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowTicketModal(true);
  };

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
          
          <Card className={expiringCount > 0 ? "border-amber-500/50" : ""}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
                <p className="text-xl font-bold">{expiringCount}</p>
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
                  {userTickets.filter(t => t.status !== "resolved").length}
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
              Support ({userTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeSubscriptions.length === 0 ? (
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
                      subscription={subscription}
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
                      subscription={subscription}
                      onRenew={() => handleRenew(subscription)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            {userTickets.length === 0 ? (
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
                {userTickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">{ticket.toolName}</CardTitle>
                          <CardDescription>
                            {ticket.problemType.replace("_", " ").toUpperCase()} • {new Date(ticket.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={
                          ticket.status === "resolved" ? "success" :
                          ticket.status === "in_progress" ? "warning" : "secondary"
                        }>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm">{ticket.message}</p>
                      </div>
                      {ticket.adminReply && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-xs text-primary font-medium mb-1">Admin Reply:</p>
                          <p className="text-sm">{ticket.adminReply}</p>
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
          subscription={selectedSubscription}
        />
      )}
    </MainLayout>
  );
}

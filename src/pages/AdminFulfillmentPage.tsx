import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Eye,
  EyeOff,
  Copy,
  Key,
  User,
  AlertTriangle,
} from "lucide-react";
import { 
  dummyOrders, 
  getPendingFulfillmentOrders,
  Order,
  toolPlans
} from "@/data/subscriptions";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<Order["status"], {
  label: string;
  variant: "default" | "secondary" | "success" | "warning" | "destructive";
}> = {
  pending_payment: { label: "Pending Payment", variant: "secondary" },
  paid: { label: "Paid - Awaiting Fulfillment", variant: "warning" },
  in_fulfillment: { label: "In Fulfillment", variant: "warning" },
  delivered: { label: "Delivered", variant: "success" },
  active: { label: "Active", variant: "success" },
  expired: { label: "Expired", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  refunded: { label: "Refunded", variant: "destructive" },
};

export default function AdminFulfillmentPage() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  
  // Delivery form state
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [deliveryPassword, setDeliveryPassword] = useState("");
  const [deliveryRecovery, setDeliveryRecovery] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const pendingOrders = getPendingFulfillmentOrders();
  const allOrders = dummyOrders;

  const getPlan = (planId: string) => toolPlans.find(p => p.id === planId);

  const handleMarkPaid = (order: Order) => {
    toast({
      title: "Order Marked as Paid",
      description: `Order ${order.id} is now ready for fulfillment`,
    });
  };

  const handleStartFulfillment = (order: Order) => {
    setSelectedOrder(order);
    
    // Reset form
    setDeliveryEmail("");
    setDeliveryPassword("");
    setDeliveryRecovery("");
    setDeliveryNotes("");
    setInviteUrl("");
    
    setShowDeliveryModal(true);
  };

  const handleCompleteDelivery = () => {
    if (!selectedOrder) return;

    const plan = getPlan(selectedOrder.planId);
    
    if (plan?.deliveryMethod === "account_provided" && (!deliveryEmail || !deliveryPassword)) {
      toast({
        title: "Missing Credentials",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    if (plan?.deliveryMethod === "invite_link" && !inviteUrl) {
      toast({
        title: "Missing Invite Link",
        description: "Please enter the invite URL",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Delivery Completed!",
      description: `${selectedOrder.toolName} has been delivered to ${selectedOrder.userName}`,
    });

    setShowDeliveryModal(false);
    setSelectedOrder(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  const renderOrderRow = (order: Order) => {
    const status = statusConfig[order.status];
    
    return (
      <tr key={order.id} className="border-b hover:bg-muted/50">
        <td className="py-3 px-4">
          <p className="font-medium">{order.id}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </td>
        <td className="py-3 px-4">
          <p className="font-medium">{order.userName}</p>
          <p className="text-xs text-muted-foreground">{order.userEmail}</p>
        </td>
        <td className="py-3 px-4">
          <p className="font-medium">{order.toolName}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">{order.planName}</Badge>
            <span className="text-xs text-muted-foreground">{order.duration}mo</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <p className="font-bold">${order.price}</p>
        </td>
        <td className="py-3 px-4">
          <Badge variant={status.variant}>{status.label}</Badge>
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-2">
            {order.status === "pending_payment" && (
              <Button size="sm" onClick={() => handleMarkPaid(order)}>
                Mark Paid
              </Button>
            )}
            {(order.status === "paid" || order.status === "in_fulfillment") && (
              <Button size="sm" onClick={() => handleStartFulfillment(order)}>
                {order.status === "paid" ? "Start Delivery" : "Complete Delivery"}
              </Button>
            )}
            {order.status === "delivered" || order.status === "active" ? (
              <Button size="sm" variant="outline" onClick={() => handleStartFulfillment(order)}>
                View / Edit
              </Button>
            ) : null}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Order Fulfillment</h1>
          <p className="text-muted-foreground">Process orders and deliver tool credentials</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={pendingOrders.length > 0 ? "border-amber-500/50" : ""}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Fulfillment</p>
                <p className="text-xl font-bold">{pendingOrders.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivered Today</p>
                <p className="text-xl font-bold">5</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold">{allOrders.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Fulfillment</p>
                <p className="text-xl font-bold">4.2h</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Package className="h-4 w-4" />
              All Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Fulfillment</CardTitle>
                <CardDescription>Orders waiting for credential delivery</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                    <p>All orders fulfilled!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Order</th>
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Tool / Plan</th>
                          <th className="text-left py-3 px-4 font-medium">Price</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingOrders.map(renderOrderRow)}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>Complete order history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Order</th>
                        <th className="text-left py-3 px-4 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 font-medium">Tool / Plan</th>
                        <th className="text-left py-3 px-4 font-medium">Price</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.map(renderOrderRow)}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delivery Modal */}
      <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Deliver Credentials
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && `${selectedOrder.toolName} - ${selectedOrder.planName} for ${selectedOrder.userName}`}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Customer Info */}
              <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedOrder.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.userEmail}</p>
                </div>
              </div>

              {(() => {
                const plan = getPlan(selectedOrder.planId);
                
                if (plan?.deliveryMethod === "invite_link") {
                  return (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Invite URL *</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://workspace.google.com/invite/..."
                            value={inviteUrl}
                            onChange={(e) => setInviteUrl(e.target.value)}
                          />
                          <Button 
                            variant="secondary" 
                            size="icon"
                            onClick={() => copyToClipboard(inviteUrl, "URL")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (plan?.deliveryMethod === "byo") {
                  return (
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                        <p className="font-medium text-blue-600">BYO Account</p>
                        <p className="text-muted-foreground">Customer will use their own account</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Customer's Email</Label>
                        <Input
                          value={selectedOrder.userEmail}
                          disabled
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="access-granted" />
                        <Label htmlFor="access-granted">Access has been granted</Label>
                      </div>
                    </div>
                  );
                }

                // Default: account_provided
                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email / Username *</Label>
                      <Input
                        placeholder="account@service.com"
                        value={deliveryEmail}
                        onChange={(e) => setDeliveryEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <div className="flex gap-2">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          value={deliveryPassword}
                          onChange={(e) => setDeliveryPassword(e.target.value)}
                        />
                        <Button 
                          variant="secondary" 
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon"
                          onClick={() => copyToClipboard(deliveryPassword, "Password")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Recovery Info (Optional)</Label>
                      <Input
                        placeholder="backup@email.com"
                        value={deliveryRecovery}
                        onChange={(e) => setDeliveryRecovery(e.target.value)}
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-2">
                <Label>Delivery Notes</Label>
                <Textarea
                  placeholder="Any additional instructions..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDeliveryModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCompleteDelivery} className="flex-1">
                  Complete Delivery
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
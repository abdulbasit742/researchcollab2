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
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAdminFulfillment, ToolOrder } from "@/hooks/useAdminFulfillment";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pending_payment: { label: "Pending Payment", variant: "secondary" },
  paid: { label: "Paid - Awaiting Fulfillment", variant: "default" },
  in_fulfillment: { label: "In Fulfillment", variant: "default" },
  delivered: { label: "Delivered", variant: "default" },
  completed: { label: "Completed", variant: "default" },
  active: { label: "Active", variant: "default" },
  expired: { label: "Expired", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  refunded: { label: "Refunded", variant: "destructive" },
};

export default function AdminFulfillmentPage() {
  const { toast } = useToast();
  const { orders, pendingOrders, loading, markAsPaid, startFulfillment, completeDelivery } = useAdminFulfillment();
  const [selectedOrder, setSelectedOrder] = useState<ToolOrder | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  
  // Delivery form state
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [deliveryPassword, setDeliveryPassword] = useState("");
  const [deliveryRecovery, setDeliveryRecovery] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleMarkPaid = async (order: ToolOrder) => {
    await markAsPaid(order.id);
  };

  const handleStartFulfillment = (order: ToolOrder) => {
    setSelectedOrder(order);
    setDeliveryEmail("");
    setDeliveryPassword("");
    setDeliveryRecovery("");
    setDeliveryNotes("");
    setInviteUrl("");
    setShowDeliveryModal(true);
  };

  const handleCompleteDelivery = async () => {
    if (!selectedOrder) return;

    if (!deliveryEmail || !deliveryPassword) {
      toast({
        title: "Missing Credentials",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    const deliveryDetails = {
      email: deliveryEmail,
      password: deliveryPassword,
      recovery: deliveryRecovery,
      notes: deliveryNotes,
      inviteUrl,
      deliveredAt: new Date().toISOString(),
    };

    const result = await completeDelivery(selectedOrder.id, deliveryDetails);
    if (result.success) {
      setShowDeliveryModal(false);
      setSelectedOrder(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  const renderOrderRow = (order: ToolOrder) => {
    const status = statusConfig[order.status] || { label: order.status, variant: "secondary" as const };
    
    return (
      <tr key={order.id} className="border-b hover:bg-muted/50">
        <td className="py-3 px-4">
          <p className="font-medium truncate max-w-[100px]">{order.id.slice(0, 8)}...</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </td>
        <td className="py-3 px-4">
          <p className="font-medium">{order.user_name}</p>
        </td>
        <td className="py-3 px-4">
          <p className="font-medium">{order.tool_name}</p>
          <div className="flex items-center gap-2 mt-1">
            {order.plan_name && (
              <Badge variant="secondary" className="text-xs">{order.plan_name}</Badge>
            )}
            <span className="text-xs text-muted-foreground">{order.duration_months || 1}mo</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <p className="font-bold">{order.currency} {Number(order.amount).toLocaleString()}</p>
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
            {(order.status === "delivered" || order.status === "active" || order.status === "completed") && (
              <Button size="sm" variant="outline" onClick={() => handleStartFulfillment(order)}>
                View / Edit
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Order Fulfillment</h1>
            <p className="text-muted-foreground">Process orders and deliver tool credentials</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  const deliveredToday = orders.filter(o => {
    if (o.status !== "delivered" && o.status !== "completed") return false;
    const today = new Date();
    const orderDate = new Date(o.created_at);
    return orderDate.toDateString() === today.toDateString();
  }).length;

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
                <p className="text-xl font-bold">{deliveredToday}</p>
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
                <p className="text-xl font-bold">{orders.length}</p>
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
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-2" />
                    <p>No orders yet</p>
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
                        {orders.map(renderOrderRow)}
                      </tbody>
                    </table>
                  </div>
                )}
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
              {selectedOrder && `${selectedOrder.tool_name} for ${selectedOrder.user_name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Customer Info */}
              <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedOrder.user_name}</p>
                  <p className="text-sm text-muted-foreground">Order: {selectedOrder.id.slice(0, 8)}...</p>
                </div>
              </div>

              {/* Credentials Form */}
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

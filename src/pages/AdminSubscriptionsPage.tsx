import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  TrendingUp,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { 
  dummySubscriptions, 
  dummySupportTickets,
  getExpiringSubscriptions,
  getToolSubscriptionStats,
  Subscription,
  SupportTicket
} from "@/data/subscriptions";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<Subscription["status"], {
  label: string;
  variant: "default" | "secondary" | "success" | "warning" | "destructive";
}> = {
  active: { label: "Active", variant: "success" },
  expiring: { label: "Expiring", variant: "warning" },
  expired: { label: "Expired", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

const ticketStatusConfig: Record<SupportTicket["status"], {
  label: string;
  variant: "default" | "secondary" | "success" | "warning";
}> = {
  open: { label: "Open", variant: "warning" },
  in_progress: { label: "In Progress", variant: "default" },
  resolved: { label: "Resolved", variant: "success" },
};

export default function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const stats = getToolSubscriptionStats();
  const expiringSubscriptions = getExpiringSubscriptions(7);
  const openTickets = dummySupportTickets.filter(t => t.status !== "resolved");

  const filteredSubscriptions = dummySubscriptions.filter(sub => {
    const matchesSearch = sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.toolName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReminder = (subscription: Subscription) => {
    toast({
      title: "Reminder Sent",
      description: `Expiry reminder sent to ${subscription.userName}`,
    });
  };

  const handleResolveTicket = (ticket: SupportTicket) => {
    toast({
      title: "Ticket Resolved",
      description: `Ticket ${ticket.id} marked as resolved`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Monitor subscriptions, handle tickets, and track renewals</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-xl font-bold">{stats.activeSubscriptions}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={stats.expiringSoon > 0 ? "border-amber-500/50" : ""}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expiring (7d)</p>
                <p className="text-xl font-bold">{stats.expiringSoon}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-xl font-bold">${stats.totalRevenue}</p>
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
                <p className="text-xl font-bold">{openTickets.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Best Seller</p>
                <p className="text-sm font-bold truncate">ChatGPT</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="expiring" className="space-y-6">
          <TabsList>
            <TabsTrigger value="expiring" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Expiring Soon ({expiringSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Package className="h-4 w-4" />
              All Subscriptions
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Support Tickets ({openTickets.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expiring">
            <Card>
              <CardHeader>
                <CardTitle>Expiring Subscriptions</CardTitle>
                <CardDescription>Subscriptions expiring in the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {expiringSubscriptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                    <p>No subscriptions expiring soon</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expiringSubscriptions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
                        <div>
                          <p className="font-medium">{sub.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {sub.toolName} - {sub.planName}
                          </p>
                          <p className="text-xs text-amber-600">
                            Expires: {new Date(sub.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => handleSendReminder(sub)}>
                          Send Reminder
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <CardTitle>All Subscriptions</CardTitle>
                    <CardDescription>Complete subscription list</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        className="pl-10 w-48"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expiring">Expiring</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Tool</th>
                        <th className="text-left py-3 px-4 font-medium">Plan</th>
                        <th className="text-left py-3 px-4 font-medium">Period</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Auto Renew</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <p className="font-medium">{sub.userName}</p>
                          </td>
                          <td className="py-3 px-4">{sub.toolName}</td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className="text-xs">
                              {sub.planName}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={statusConfig[sub.status].variant}>
                              {statusConfig[sub.status].label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={sub.autoRenew ? "success" : "secondary"}>
                              {sub.autoRenew ? "Yes" : "No"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage customer support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dummySupportTickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{ticket.userName}</p>
                            <Badge variant={ticketStatusConfig[ticket.status].variant}>
                              {ticketStatusConfig[ticket.status].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {ticket.toolName} • {ticket.problemType.replace("_", " ")} • {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {ticket.status !== "resolved" && (
                          <Button size="sm" onClick={() => handleResolveTicket(ticket)}>
                            Resolve
                          </Button>
                        )}
                      </div>
                      <p className="mt-3 text-sm p-3 rounded bg-muted/50">{ticket.message}</p>
                      {ticket.adminReply && (
                        <p className="mt-2 text-sm p-3 rounded bg-primary/5 border border-primary/20">
                          <span className="text-xs text-primary font-medium">Reply: </span>
                          {ticket.adminReply}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(stats.planDistribution).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between">
                      <span className="capitalize">{plan.replace("-", " ")}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(count / dummySubscriptions.length) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tool Popularity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(stats.toolDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([tool, count], index) => (
                      <div key={tool} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="flex-1">{tool}</span>
                        <span className="font-bold">{count} orders</span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
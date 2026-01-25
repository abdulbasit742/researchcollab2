import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Percent,
  PieChart,
  ArrowUpRight,
  Shield,
  AlertTriangle,
  Download,
} from "lucide-react";
import { useAdminFinance } from "@/hooks/useAdminFinance";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, transactionColumns } from "@/lib/csvExport";
import { logAdminAction } from "@/hooks/useAdminAuditLog";

export default function AdminFinancePage() {
  const { toast } = useToast();
  const { transactions, disputes, loading, stats, resolveDispute } = useAdminFinance();
  const [commissionPercent, setCommissionPercent] = useState("10");

  const handleSaveCommission = () => {
    const percent = parseFloat(commissionPercent);
    if (isNaN(percent) || percent < 0 || percent > 50) {
      toast({
        title: "Invalid Commission",
        description: "Commission must be between 0% and 50%",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Commission Updated",
      description: `Commission rate set to ${percent}%`,
    });
  };

  const handleResolveDispute = async (disputeId: string, action: "release" | "refund") => {
    const resolution = action === "release" ? "Released to seller" : "Refunded to buyer";
    await resolveDispute(disputeId, resolution, action);
    logAdminAction("dispute_resolved", "dispute", disputeId, { action, resolution });
  };

  const handleExportTransactions = () => {
    exportToCSV(transactions, "transactions-export", transactionColumns);
    toast({ title: "Transactions exported to CSV" });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Financial Overview</h1>
            <p className="text-muted-foreground">Track platform earnings, escrow, commissions, and disputes</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Financial Overview</h1>
            <p className="text-muted-foreground">Track platform earnings, escrow, commissions, and disputes</p>
          </div>
          <Button variant="outline" onClick={handleExportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold">PKR {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Commission</p>
                  <p className="text-xl font-bold text-emerald-500">
                    PKR {stats.totalCommission.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">In Escrow</p>
                  <p className="text-xl font-bold">PKR {stats.totalEscrow.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-xl font-bold">PKR {stats.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={stats.openDisputes > 0 ? "border-destructive/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  stats.openDisputes > 0 ? "bg-destructive/10" : "bg-muted"
                }`}>
                  <AlertTriangle className={`h-5 w-5 ${
                    stats.openDisputes > 0 ? "text-destructive" : "text-muted-foreground"
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Disputes</p>
                  <p className={`text-xl font-bold ${
                    stats.openDisputes > 0 ? "text-destructive" : ""
                  }`}>
                    {stats.openDisputes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="disputes">Disputes ({stats.openDisputes})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Revenue Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Revenue</span>
                    <span className="font-semibold">PKR {stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Platform Commission (10%)</span>
                    <span className="font-semibold text-emerald-500">PKR {stats.totalCommission.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paid to Providers</span>
                    <span className="font-semibold">PKR {stats.totalPayout.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Escrow Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-500" />
                    Escrow Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                      <p className="text-2xl font-bold text-amber-500">PKR {stats.totalEscrow.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">In Escrow</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                      <p className="text-2xl font-bold text-emerald-500">PKR {stats.totalAvailable.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                    <p className="text-xl font-bold text-blue-500">PKR {stats.totalPending.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Pending Withdrawal</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Transactions</span>
                    <span className="font-semibold">{transactions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed Orders</span>
                    <span className="font-semibold">
                      {transactions.filter(t => t.status === "completed" || t.status === "delivered").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Open Disputes</span>
                    <span className={`font-semibold ${stats.openDisputes > 0 ? "text-destructive" : ""}`}>
                      {stats.openDisputes}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  All tool orders and their payment details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-10 w-10 mx-auto mb-2" />
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Order ID</th>
                          <th className="text-left py-3 px-4 font-medium">User</th>
                          <th className="text-left py-3 px-4 font-medium">Tool</th>
                          <th className="text-right py-3 px-4 font-medium">Amount</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 20).map((txn) => (
                          <tr key={txn.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <p className="font-medium text-sm truncate max-w-[100px]">
                                {txn.id.slice(0, 8)}...
                              </p>
                            </td>
                            <td className="py-3 px-4 text-sm">{txn.user_name}</td>
                            <td className="py-3 px-4 text-sm">{txn.tool_name}</td>
                            <td className="py-3 px-4 text-right font-medium">
                              {txn.currency} {Number(txn.amount).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={txn.status === "completed" || txn.status === "delivered" ? "default" : "secondary"}>
                                {txn.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {new Date(txn.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Active Disputes
                </CardTitle>
                <CardDescription>
                  Review and resolve milestone disputes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {disputes.filter(d => d.status === "open" || d.status === "under_review").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                    <p>No active disputes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {disputes
                      .filter(d => d.status === "open" || d.status === "under_review")
                      .map((dispute) => (
                        <div key={dispute.id} className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Badge variant="destructive" className="mb-2">
                                {dispute.status.replace("_", " ")}
                              </Badge>
                              <h4 className="font-medium">{dispute.milestone_title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {dispute.reason}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Amount: PKR {Number(dispute.milestone_amount).toLocaleString()} • 
                                Opened: {new Date(dispute.created_at).toLocaleDateString()} •
                                By: {dispute.initiator_name}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleResolveDispute(dispute.id, "release")}
                              >
                                Release
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleResolveDispute(dispute.id, "refund")}
                              >
                                Refund
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Commission Settings
                </CardTitle>
                <CardDescription>
                  Configure platform commission rate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="space-y-2">
                    <Label>Commission Rate</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={commissionPercent}
                        onChange={(e) => setCommissionPercent(e.target.value)}
                        className="w-24"
                        min="0"
                        max="50"
                      />
                      <span className="text-lg font-medium">%</span>
                    </div>
                  </div>
                  <Button onClick={handleSaveCommission}>
                    Save Changes
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This commission is automatically deducted from each completed transaction before payout to service providers.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Percent,
  PieChart,
  ArrowUpRight,
  Shield,
  AlertTriangle,
  Wrench,
  FileText,
} from "lucide-react";
import { dummyTransactions, adminSettings, dummyToolEvents } from "@/data/offers";
import { 
  adminWallet, 
  calculateEscrowTotal, 
  calculatePendingDisputes,
  dummyMilestones,
  dummyDisputes 
} from "@/data/wallet";
import { useToast } from "@/hooks/use-toast";

export default function AdminFinancePage() {
  const { toast } = useToast();
  const [commissionPercent, setCommissionPercent] = useState(adminSettings.commissionPercent.toString());

  // Calculate stats
  const totalGross = dummyTransactions.reduce((sum, t) => sum + t.grossAmount, 0);
  const totalCommission = dummyTransactions.reduce((sum, t) => sum + t.commissionAmount, 0);
  const totalPayout = dummyTransactions.reduce((sum, t) => sum + t.netPayout, 0);

  // Escrow stats
  const escrowTotal = calculateEscrowTotal();
  const pendingDisputes = calculatePendingDisputes();
  const releasedMilestones = dummyMilestones.filter(m => m.status === "released").length;
  const pendingMilestones = dummyMilestones.filter(m => m.status === "pending" || m.status === "submitted").length;

  // Category breakdown
  const categoryStats = dummyTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.commissionAmount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Tool events stats
  const toolEventsByType = dummyToolEvents.reduce((acc, e) => {
    acc[e.eventType] = (acc[e.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Revenue sources
  const revenueSources = [
    { name: "Offer Commissions", amount: totalCommission, icon: FileText },
    { name: "Tool Sales", amount: 2450, icon: Wrench },
    { name: "Milestone Fees", amount: 890, icon: CheckCircle2 },
  ];

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

  const handleResolveDispute = (action: string) => {
    toast({
      title: "Dispute Resolved",
      description: `Funds have been ${action}`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Financial Overview</h1>
          <p className="text-muted-foreground">Track platform earnings, escrow, commissions, and disputes</p>
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
                  <p className="text-xl font-bold">${totalGross.toLocaleString()}</p>
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
                    ${totalCommission.toLocaleString()}
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
                  <p className="text-xl font-bold">${escrowTotal.toLocaleString()}</p>
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
                  <p className="text-xs text-muted-foreground">Released</p>
                  <p className="text-xl font-bold">${totalPayout.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={pendingDisputes > 0 ? "border-destructive/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  pendingDisputes > 0 ? "bg-destructive/10" : "bg-muted"
                }`}>
                  <AlertTriangle className={`h-5 w-5 ${
                    pendingDisputes > 0 ? "text-destructive" : "text-muted-foreground"
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Disputes</p>
                  <p className={`text-xl font-bold ${
                    pendingDisputes > 0 ? "text-destructive" : ""
                  }`}>
                    {pendingDisputes}
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
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Revenue Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {revenueSources.map((source) => (
                    <div key={source.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <source.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{source.name}</span>
                      </div>
                      <span className="font-semibold">${source.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Milestone Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-500" />
                    Escrow Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                      <p className="text-2xl font-bold text-emerald-500">{releasedMilestones}</p>
                      <p className="text-xs text-muted-foreground">Released</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                      <p className="text-2xl font-bold text-amber-500">{pendingMilestones}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total milestones: {dummyMilestones.length}
                  </p>
                </CardContent>
              </Card>

              {/* Tool Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tool Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <p className="text-lg font-bold">{toolEventsByType.viewed || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Views</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <p className="text-lg font-bold">{toolEventsByType.clicked_buy || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Clicks</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <p className="text-lg font-bold">{toolEventsByType.bundle_interest || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Bundles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Top Categories by Commission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {sortedCategories.map(([category, amount], index) => (
                    <div key={category} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{category}</p>
                        <p className="font-bold text-primary">${amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  All completed offers and their commission details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Project</th>
                        <th className="text-left py-3 px-4 font-medium">Category</th>
                        <th className="text-left py-3 px-4 font-medium">Provider</th>
                        <th className="text-right py-3 px-4 font-medium">Gross</th>
                        <th className="text-right py-3 px-4 font-medium">Commission</th>
                        <th className="text-right py-3 px-4 font-medium">Net</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dummyTransactions.map((txn) => (
                        <tr key={txn.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-sm">{txn.offerTitle}</p>
                            <p className="text-xs text-muted-foreground">{txn.clientName}</p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className="text-xs">
                              {txn.category}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">{txn.providerName}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            ${txn.grossAmount}
                          </td>
                          <td className="py-3 px-4 text-right text-emerald-500 font-medium">
                            ${txn.commissionAmount}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            ${txn.netPayout}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(txn.completedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                {dummyDisputes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                    <p>No active disputes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dummyDisputes.map((dispute) => {
                      const milestone = dummyMilestones.find(m => m.id === dispute.milestoneId);
                      return (
                        <div key={dispute.id} className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Badge variant="destructive" className="mb-2">
                                {dispute.status.replace("_", " ")}
                              </Badge>
                              <h4 className="font-medium">{milestone?.title || "Unknown Milestone"}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {dispute.reason}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Opened: {new Date(dispute.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleResolveDispute("released to seller")}>
                                Release
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleResolveDispute("refunded to buyer")}>
                                Refund
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                    <Label htmlFor="commission">Commission Rate (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(e.target.value)}
                      className="w-32"
                    />
                  </div>
                  <Button onClick={handleSaveCommission}>
                    Save Changes
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This commission is applied to all completed transactions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
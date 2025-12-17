import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
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
  Settings
} from "lucide-react";
import { dummyTransactions, adminSettings, dummyToolEvents } from "@/data/offers";
import { useToast } from "@/hooks/use-toast";

export default function AdminFinancePage() {
  const { toast } = useToast();
  const [commissionPercent, setCommissionPercent] = useState(adminSettings.commissionPercent.toString());

  // Calculate stats
  const totalGross = dummyTransactions.reduce((sum, t) => sum + t.grossAmount, 0);
  const totalCommission = dummyTransactions.reduce((sum, t) => sum + t.commissionAmount, 0);
  const totalPayout = dummyTransactions.reduce((sum, t) => sum + t.netPayout, 0);
  const completedOffers = dummyTransactions.length;

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
              <Settings className="h-3 w-3 mr-1" />
              Admin Dashboard
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl">
              Financial{" "}
              <span className="text-gradient">Overview</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track platform earnings, commissions, and transactions
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${totalGross.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Commission Earned</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      ${totalCommission.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <ArrowUpRight className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payouts</p>
                    <p className="text-2xl font-bold">${totalPayout.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{completedOffers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Top Categories by Commission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sortedCategories.map(([category, amount], index) => (
                    <div key={category} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm text-primary font-bold">${amount}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(amount / totalCommission) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tool Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Tool Engagement</CardTitle>
                  <CardDescription>User interactions with AI tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold">{toolEventsByType.viewed || 0}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold">{toolEventsByType.clicked_buy || 0}</p>
                      <p className="text-xs text-muted-foreground">Buy Clicks</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold">{toolEventsByType.bundle_interest || 0}</p>
                      <p className="text-xs text-muted-foreground">Bundle Interest</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track user engagement with AI tools to optimize recommendations and increase sales.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary" />
                  Commission Settings
                </CardTitle>
                <CardDescription>
                  Configure platform commission rate for completed projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-sm space-y-2">
                  <Label htmlFor="commission">Commission Rate (%)</Label>
                  <div className="flex gap-3">
                    <Input
                      id="commission"
                      type="number"
                      min="0"
                      max="50"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(e.target.value)}
                      className="w-32"
                    />
                    <Button onClick={handleSaveCommission}>
                      Save Changes
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current rate: {adminSettings.commissionPercent}% • Recommended: 10-15%
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

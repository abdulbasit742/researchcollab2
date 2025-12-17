import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Link, Copy, Users, DollarSign, TrendingUp, MousePointer, 
  UserPlus, ShoppingCart, Wallet, ArrowUpRight, ExternalLink,
  Share2, Gift, Clock, CheckCircle, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { 
  dummyAffiliates, 
  dummyConversions, 
  affiliateTransactions,
  generateReferralLink,
  commissionRules
} from "@/data/affiliates";
import { tools, toolBundles } from "@/data/tools";

export default function AffiliateDashboardPage() {
  // Simulate current user as affiliate-1 (Alex Chen)
  const affiliate = dummyAffiliates[0];
  const conversions = dummyConversions.filter(c => c.affiliateId === affiliate.id);
  const transactions = affiliateTransactions.filter(t => t.affiliateId === affiliate.id);

  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const generalLink = generateReferralLink(affiliate.referralCode);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "released": return "bg-green-500/10 text-green-500";
      case "approved": return "bg-blue-500/10 text-blue-500";
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      case "reversed": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "commission_tool": 
      case "commission_bundle":
      case "commission_offer":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "reversal":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "withdrawal":
        return <Wallet className="h-4 w-4 text-blue-500" />;
      case "bonus":
        return <Gift className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Affiliate Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Earn by sharing tools and services with your network
                </p>
              </div>
              <Badge variant={affiliate.status === "active" ? "default" : "secondary"} className="capitalize">
                {affiliate.role} Affiliate
              </Badge>
            </div>
          </div>

          {/* Referral Link Section */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Your Referral Link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={generalLink} 
                      readOnly 
                      className="bg-background font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generalLink, "Referral link")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Code: <span className="font-mono font-semibold">{affiliate.referralCode}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button className="gap-2" asChild>
                    <a href="/affiliate/assets">
                      <ExternalLink className="h-4 w-4" />
                      Promo Assets
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <MousePointer className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{affiliate.totalClicks}</p>
                    <p className="text-xs text-muted-foreground">Total Clicks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <UserPlus className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{affiliate.totalSignups}</p>
                    <p className="text-xs text-muted-foreground">Signups</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <ShoppingCart className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{affiliate.totalConversions}</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${affiliate.pendingCommission.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Wallet className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${affiliate.availableCommission.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${affiliate.lifetimeEarnings.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Lifetime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commission Rates Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Commission Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {commissionRules.map(rule => (
                  <div key={rule.id} className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">{rule.name}</p>
                    <p className="text-2xl font-bold text-primary">{rule.commissionRate}%</p>
                    {rule.firstPurchaseBonus > 0 && (
                      <p className="text-xs text-green-500">+${rule.firstPurchaseBonus} first purchase</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Links, Earnings, Transactions */}
          <Tabs defaultValue="links" className="space-y-4">
            <TabsList>
              <TabsTrigger value="links">Tool Links</TabsTrigger>
              <TabsTrigger value="earnings">Recent Earnings</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="links">
              <Card>
                <CardHeader>
                  <CardTitle>Tool-Specific Referral Links</CardTitle>
                  <CardDescription>Share these links to earn commission on specific tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {tools.slice(0, 6).map(tool => {
                      const toolLink = generateReferralLink(affiliate.referralCode, "tool", tool.id);
                      return (
                        <div key={tool.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white`}>
                              <tool.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{tool.name}</p>
                              <p className="text-sm text-muted-foreground">${tool.price}/mo • 15% commission</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input 
                              value={toolLink} 
                              readOnly 
                              className="w-64 text-xs font-mono hidden md:block"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(toolLink, tool.name)}
                              className="gap-2"
                            >
                              <Copy className="h-3 w-3" />
                              {copiedLink === tool.name ? "Copied!" : "Copy"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-t pt-4 mt-2">
                      <h4 className="font-semibold mb-4">Bundle Links (20% Commission)</h4>
                      {toolBundles.slice(0, 2).map(bundle => {
                        const bundleLink = `${window.location.origin}/tools?bundle=${bundle.id}&ref=${affiliate.referralCode}`;
                        return (
                          <div key={bundle.id} className="flex items-center justify-between p-4 rounded-lg border mb-3">
                            <div>
                              <p className="font-medium">{bundle.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ${bundle.price} • {bundle.discount}% off • 20% commission
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(bundleLink, bundle.name)}
                              className="gap-2"
                            >
                              <Copy className="h-3 w-3" />
                              {copiedLink === bundle.name ? "Copied!" : "Copy Link"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="earnings">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Earnings</CardTitle>
                  <CardDescription>Your latest commission earnings from referrals</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Sale Amount</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversions.slice(0, 10).map(conv => (
                        <TableRow key={conv.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(conv.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="capitalize">
                            {conv.transactionType.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell>${conv.grossAmount.toFixed(2)}</TableCell>
                          <TableCell className="font-medium text-green-500">
                            +${conv.commissionAmount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(conv.status)}>
                              {conv.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>All affiliate account transactions</CardDescription>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Wallet className="h-4 w-4" />
                    Withdraw (${affiliate.availableCommission.toFixed(2)})
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map(txn => (
                        <TableRow key={txn.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(txn.type)}
                              <span className="capitalize text-sm">
                                {txn.type.replace(/_/g, " ")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {txn.description}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            txn.amount >= 0 ? "text-green-500" : "text-red-500"
                          }`}>
                            {txn.amount >= 0 ? "+" : ""}${txn.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={txn.status === "completed" ? "default" : "secondary"}>
                              {txn.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Conversion Funnel */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Clicks → Signups</span>
                    <span className="text-sm font-medium">
                      {((affiliate.totalSignups / affiliate.totalClicks) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={(affiliate.totalSignups / affiliate.totalClicks) * 100} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Signups → Conversions</span>
                    <span className="text-sm font-medium">
                      {((affiliate.totalConversions / affiliate.totalSignups) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={(affiliate.totalConversions / affiliate.totalSignups) * 100} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Link as LinkIcon, Copy, Users, DollarSign, TrendingUp, MousePointer, 
  UserPlus, ShoppingCart, Wallet, ExternalLink,
  Share2, Gift, Clock, XCircle, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useMyAffiliate } from "@/hooks/useMyAffiliate";
import { useAuth } from "@/contexts/AuthContext";
import { formatPKR } from "@/lib/currency";
import { tools, toolBundles } from "@/data/tools";
import { commissionRules } from "@/data/affiliates";
import { formatDistanceToNow } from "date-fns";

export default function AffiliateDashboardPage() {
  const { user } = useAuth();
  const { affiliate, conversions, loading, error, generateReferralLink } = useMyAffiliate();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "released": 
      case "approved": return "bg-green-500/10 text-green-500";
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      case "reversed": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "tool_subscription": 
      case "bundle":
      case "offer":
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

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96 mb-8" />
            <Skeleton className="h-32 w-full mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <Gift className="h-16 w-16 mx-auto text-primary mb-6" />
            <h1 className="text-3xl font-bold mb-4">Join Our Affiliate Program</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to access your affiliate dashboard and start earning commissions by sharing tools and services.
            </p>
            <Link to="/auth?tab=signup">
              <Button size="lg">
                Sign In to Get Started
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // No affiliate profile yet
  if (!affiliate) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <Gift className="h-16 w-16 mx-auto text-primary mb-6" />
            <h1 className="text-3xl font-bold mb-4">Become an Affiliate</h1>
            <p className="text-muted-foreground mb-4">
              You don't have an affiliate account yet. Join our affiliate program to earn commissions by sharing tools and services with your network.
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-3">What you'll get:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Up to 20% commission on referrals
                </li>
                <li className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  Unique referral links and promo codes
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Real-time earnings tracking
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Easy withdrawals to your wallet
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Contact support to apply for the affiliate program.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const generalLink = generateReferralLink(affiliate.referral_code);

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
                {affiliate.status || "Pending"} Affiliate
              </Badge>
            </div>
          </div>

          {/* Referral Link Section */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
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
                    Code: <span className="font-mono font-semibold">{affiliate.referral_code}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button className="gap-2" asChild>
                    <Link to="/affiliate/assets">
                      <ExternalLink className="h-4 w-4" />
                      Promo Assets
                    </Link>
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
                    <p className="text-2xl font-bold">{affiliate.total_clicks || 0}</p>
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
                    <p className="text-2xl font-bold">{affiliate.total_signups || 0}</p>
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
                    <p className="text-2xl font-bold">{affiliate.total_conversions || 0}</p>
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
                    <p className="text-2xl font-bold">{formatPKR(affiliate.pending_earnings || 0)}</p>
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
                    <p className="text-2xl font-bold">{formatPKR(affiliate.available_earnings || 0)}</p>
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
                    <p className="text-2xl font-bold">{formatPKR(affiliate.lifetime_earnings || 0)}</p>
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
                    <p className="text-2xl font-bold text-primary">
                      {affiliate.custom_commission_rate || rule.commissionRate}%
                    </p>
                    {rule.firstPurchaseBonus > 0 && (
                      <p className="text-xs text-green-500">+PKR {(rule.firstPurchaseBonus * 280).toLocaleString()} first purchase</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Links, Earnings */}
          <Tabs defaultValue="links" className="space-y-4">
            <TabsList>
              <TabsTrigger value="links">Tool Links</TabsTrigger>
              <TabsTrigger value="earnings">Recent Earnings</TabsTrigger>
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
                      const toolLink = generateReferralLink(affiliate.referral_code, "tool", tool.id);
                      return (
                        <div key={tool.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white`}>
                              <tool.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{tool.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatPKR(tool.price * 280)}/mo • {affiliate.custom_commission_rate || affiliate.commission_rate || 15}% commission
                              </p>
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
                        const bundleLink = `${window.location.origin}/tools?bundle=${bundle.id}&ref=${affiliate.referral_code}`;
                        return (
                          <div key={bundle.id} className="flex items-center justify-between p-4 rounded-lg border mb-3">
                            <div>
                              <p className="font-medium">{bundle.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatPKR(bundle.price * 280)} • {bundle.discount}% off • 20% commission
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Earnings</CardTitle>
                    <CardDescription>Your latest commission earnings from referrals</CardDescription>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Wallet className="h-4 w-4" />
                    Withdraw ({formatPKR(affiliate.available_earnings || 0)})
                  </Button>
                </CardHeader>
                <CardContent>
                  {conversions.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No Earnings Yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Share your referral link to start earning commissions.
                      </p>
                    </div>
                  ) : (
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
                              {formatDistanceToNow(new Date(conv.created_at || Date.now()), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(conv.transaction_type)}
                                <span className="capitalize text-sm">
                                  {conv.transaction_type.replace(/_/g, " ")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{formatPKR(conv.transaction_amount)}</TableCell>
                            <TableCell className="font-medium text-green-500">
                              +{formatPKR(conv.commission_amount)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(conv.status || "pending")}>
                                {conv.status || "pending"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}

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
  Share2, Gift, Clock, XCircle, RefreshCw, Shield, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useMyAffiliate } from "@/hooks/useMyAffiliate";
import { useAffiliateStatus } from "@/hooks/useAffiliateApplication";
import { useAuth } from "@/contexts/AuthContext";
import { formatPKR } from "@/lib/currency";
import { tools, toolBundles } from "@/data/tools";
import { commissionRules } from "@/data/affiliates";
import { formatDistanceToNow } from "date-fns";
import { AffiliateApplicationForm } from "@/components/affiliate/AffiliateApplicationForm";
import { EligibilityStatus } from "@/components/affiliate/EligibilityStatus";
import { ApplicationStatus } from "@/components/affiliate/ApplicationStatus";
import { AffiliateStatusBanner, AffiliateStatusIndicator } from "@/components/affiliate/AffiliateStatusBanner";
import { TrustCommissionCard } from "@/components/affiliate/TrustCommissionCard";

export default function AffiliateDashboardPage() {
  const { user } = useAuth();
  const { affiliate, conversions, outcomes, violations, loading, error, generateReferralLink, getFunnelStats } = useMyAffiliate();
  const { status: affiliateStatus, eligibility, application, isLoading: statusLoading } = useAffiliateStatus();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

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
  if (loading || statusLoading) {
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
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Join Our Affiliate Program</h1>
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

  // No affiliate profile yet - show application flow
  if (!affiliate) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Affiliate Program</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Become a trusted partner and earn by recommending our platform to your network. 
                This is not marketing — it's extending trust.
              </p>
            </div>

            {/* Status Badge */}
            {affiliateStatus && (
              <div className="flex justify-center mb-8">
                <Badge 
                  variant={affiliateStatus.canApply ? "default" : "secondary"} 
                  className="text-sm px-4 py-1"
                >
                  {affiliateStatus.statusLabel}
                </Badge>
              </div>
            )}

            {/* Application Already Submitted */}
            {application && (
              <div className="mb-8">
                <ApplicationStatus application={application} />
              </div>
            )}

            {/* Eligibility Status (when no application yet or rejected) */}
            {(!application || application.status === "rejected") && eligibility && (
              <div className="mb-8">
                <EligibilityStatus eligibility={eligibility} isLoading={statusLoading} />
              </div>
            )}

            {/* Application Form (only if eligible and not already applied/approved) */}
            {affiliateStatus?.canApply && !application && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Apply to Become an Affiliate
                  </CardTitle>
                  <CardDescription>
                    Complete this application to join our trusted affiliate network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showApplicationForm ? (
                    <AffiliateApplicationForm 
                      onSuccess={() => setShowApplicationForm(false)} 
                    />
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        You meet all eligibility requirements. Ready to apply?
                      </p>
                      <Button size="lg" onClick={() => setShowApplicationForm(true)}>
                        Start Application
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Program Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Become an Affiliate?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Trust-Weighted Commissions</h4>
                      <p className="text-sm text-muted-foreground">
                        Higher trust scores unlock better commission rates (up to 20%)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Outcome-Based Earnings</h4>
                      <p className="text-sm text-muted-foreground">
                        Earn when referrals complete real actions, not just clicks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <LinkIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Professional Tools</h4>
                      <p className="text-sm text-muted-foreground">
                        Unique referral links, promo codes, and tracking dashboard
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Reputation Protection</h4>
                      <p className="text-sm text-muted-foreground">
                        Anti-spam policies ensure only quality referrals
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Anti-Spam Notice */}
            <div className="mt-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-700 dark:text-amber-400">
                    This is Not a Marketing Program
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Affiliates are trusted partners who extend our platform's credibility. 
                    Spam, cold outreach, and deceptive practices result in immediate revocation 
                    and trust score penalties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const generalLink = generateReferralLink(affiliate.referral_code);
  const lifecycleStatus = affiliate.lifecycle_status || affiliate.status || "active";
  const isRestricted = lifecycleStatus === "paused" || lifecycleStatus === "revoked" || lifecycleStatus === "suspended";

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Affiliate Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  {isRestricted 
                    ? "Your affiliate account has restrictions" 
                    : "Earn by sharing tools and services with your network"
                  }
                </p>
              </div>
              <AffiliateStatusIndicator status={lifecycleStatus} />
            </div>
          </div>

          {/* Status Banner for paused/revoked */}
          <AffiliateStatusBanner affiliate={affiliate} />

          {/* Referral Link Section - disabled when restricted */}
          <Card className={`mb-8 ${isRestricted ? "border-muted bg-muted/30 opacity-75" : "border-primary/20 bg-primary/5"}`}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className={`h-5 w-5 ${isRestricted ? "text-muted-foreground" : "text-primary"}`} />
                    <span className="font-semibold">Your Referral Link</span>
                    {isRestricted && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={isRestricted ? "Link deactivated - account restricted" : generalLink}
                      readOnly 
                      className="bg-background font-mono text-sm"
                      disabled={isRestricted}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generalLink, "Referral link")}
                      disabled={isRestricted}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Code: <span className="font-mono font-semibold">{affiliate.referral_code}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" disabled={isRestricted}>
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button className="gap-2" asChild disabled={isRestricted}>
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

          {/* Trust-Weighted Commission Card */}
          <div className="mb-8">
            <TrustCommissionCard affiliate={affiliate} />
          </div>

          {/* Trust Status & Violations Warning */}
          {violations.length > 0 && (
            <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  Active Violations ({violations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {violations.slice(0, 3).map(violation => (
                    <div key={violation.id} className="flex items-start justify-between p-3 rounded-lg bg-background/50 border">
                      <div>
                        <p className="font-medium text-sm">{violation.violation_type}</p>
                        <p className="text-xs text-muted-foreground">{violation.description}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        -{violation.trust_penalty} trust
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Violations affect your commission rate and may result in account suspension.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Links, Outcomes, Earnings */}
          <Tabs defaultValue="outcomes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="outcomes">Conversion Funnel</TabsTrigger>
              <TabsTrigger value="links">Referral Links</TabsTrigger>
              <TabsTrigger value="earnings">Earnings History</TabsTrigger>
            </TabsList>

            {/* Conversion Funnel Tab */}
            <TabsContent value="outcomes">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Funnel Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Referral Quality</CardTitle>
                    <CardDescription>
                      Outcomes that count toward your commission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm">Signups</span>
                        <span className="font-bold">{getFunnelStats().totalReferrals}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm">Completed Onboarding</span>
                        <span className="font-bold">{getFunnelStats().onboardedReferrals}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                        <span className="text-sm font-medium">Real Conversions</span>
                        <span className="font-bold text-primary">{getFunnelStats().convertedReferrals}</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Onboarding Rate</span>
                          <span>{getFunnelStats().onboardingRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Conversion Rate</span>
                          <span className="font-medium text-primary">{getFunnelStats().conversionRate}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Outcomes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Outcomes</CardTitle>
                    <CardDescription>
                      Actions by your referrals that earned commission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {outcomes.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No outcomes yet</p>
                        <p className="text-xs">Share your links to start earning</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {outcomes.slice(0, 10).map(outcome => (
                          <div key={outcome.id} className="flex items-center justify-between p-2 rounded border">
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {outcome.outcome_type.replace(/_/g, " ")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(outcome.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <Badge variant={outcome.commission_status === "released" ? "default" : "secondary"}>
                              {formatPKR(outcome.commission_earned)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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

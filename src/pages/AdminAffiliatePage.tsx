import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Users, DollarSign, TrendingUp, Search, Shield, Ban, 
  CheckCircle, Settings, AlertTriangle, BarChart3, Eye,
  Percent, Award, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { 
  dummyAffiliates, 
  dummyConversions, 
  commissionRules,
  calculateTotalAffiliateRevenue,
  calculateTotalCommissionsPaid,
  getTopAffiliates,
  Affiliate
} from "@/data/affiliates";
import { tools } from "@/data/tools";

export default function AdminAffiliatePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [editingCommission, setEditingCommission] = useState<number | null>(null);
  const [rules, setRules] = useState(commissionRules);

  const totalRevenue = calculateTotalAffiliateRevenue();
  const totalCommissions = calculateTotalCommissionsPaid();
  const topAffiliates = getTopAffiliates(5);

  const filteredAffiliates = dummyAffiliates.filter(aff => {
    const matchesSearch = aff.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aff.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || aff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500";
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      case "suspended": return "bg-orange-500/10 text-orange-500";
      case "blocked": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "partner": return "bg-purple-500/10 text-purple-500";
      case "researcher": return "bg-blue-500/10 text-blue-500";
      case "student": return "bg-green-500/10 text-green-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleApprove = (affiliate: Affiliate) => {
    toast.success(`${affiliate.userName} approved as affiliate`);
  };

  const handleSuspend = (affiliate: Affiliate) => {
    toast.warning(`${affiliate.userName} suspended`);
  };

  const handleBlock = (affiliate: Affiliate) => {
    toast.error(`${affiliate.userName} blocked`);
  };

  const handleUpdateCommission = () => {
    if (selectedAffiliate && editingCommission !== null) {
      toast.success(`Commission rate updated to ${editingCommission}% for ${selectedAffiliate.userName}`);
      setSelectedAffiliate(null);
      setEditingCommission(null);
    }
  };

  const handleUpdateRule = (ruleId: string, newRate: number) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, commissionRate: newRate } : r));
    toast.success("Commission rule updated");
  };

  // Calculate tool performance
  const toolSalesByAffiliate = dummyConversions
    .filter(c => c.transactionType === "tool_subscription" || c.transactionType === "tool_bundle")
    .reduce((acc, c) => {
      const key = c.transactionType === "tool_subscription" ? "tools" : "bundles";
      acc[key] = (acc[key] || 0) + c.grossAmount;
      return acc;
    }, {} as Record<string, number>);

  const conversionRate = dummyAffiliates.reduce((sum, a) => sum + a.totalConversions, 0) / 
    Math.max(dummyAffiliates.reduce((sum, a) => sum + a.totalSignups, 0), 1) * 100;

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Affiliate Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor affiliates, manage commissions, and track performance
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${totalRevenue.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Revenue via Affiliates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Percent className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${totalCommissions.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Commissions Paid</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dummyAffiliates.filter(a => a.status === "active").length}</p>
                    <p className="text-xs text-muted-foreground">Active Affiliates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Conversion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="affiliates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="affiliates">All Affiliates</TabsTrigger>
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              <TabsTrigger value="settings">Commission Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* All Affiliates */}
            <TabsContent value="affiliates">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Affiliate Directory</CardTitle>
                      <CardDescription>Manage all platform affiliates</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search affiliates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-64"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Affiliate</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">Conversions</TableHead>
                        <TableHead className="text-right">Earnings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAffiliates.map(aff => (
                        <TableRow key={aff.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{aff.userName}</p>
                              <p className="text-xs text-muted-foreground">Since {aff.createdAt}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(aff.role)}>
                              {aff.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{aff.referralCode}</TableCell>
                          <TableCell className="text-right">{aff.totalClicks}</TableCell>
                          <TableCell className="text-right">{aff.totalConversions}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${aff.lifetimeEarnings.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(aff.status)}>
                              {aff.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setSelectedAffiliate(aff);
                                      setEditingCommission(aff.customCommissionRate || 15);
                                    }}
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Commission Rate</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div>
                                      <Label>Affiliate: {selectedAffiliate?.userName}</Label>
                                    </div>
                                    <div>
                                      <Label>Custom Commission Rate (%)</Label>
                                      <Input
                                        type="number"
                                        value={editingCommission || ""}
                                        onChange={(e) => setEditingCommission(Number(e.target.value))}
                                        className="mt-2"
                                      />
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Leave blank to use default rates
                                      </p>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button onClick={handleUpdateCommission}>Save Changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              {aff.status === "active" && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleSuspend(aff)}
                                >
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                </Button>
                              )}
                              {aff.status !== "blocked" && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleBlock(aff)}
                                >
                                  <Ban className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pending Approval */}
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Partner Applications</CardTitle>
                  <CardDescription>Review and approve partner affiliate applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {dummyAffiliates.filter(a => a.status === "pending").length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending applications
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dummyAffiliates.filter(a => a.status === "pending").map(aff => (
                        <div key={aff.id} className="p-4 rounded-lg border flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{aff.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                Applied as {aff.role} • Code: {aff.referralCode}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Applied on {aff.createdAt}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApprove(aff)}
                              className="gap-2"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleBlock(aff)}
                              className="gap-2"
                            >
                              <Ban className="h-4 w-4 text-red-500" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commission Settings */}
            <TabsContent value="settings">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      Commission Rates
                    </CardTitle>
                    <CardDescription>Set default commission rates by category</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {rules.map(rule => (
                      <div key={rule.id} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{rule.name}</span>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">Rate (%)</Label>
                            <Input
                              type="number"
                              value={rule.commissionRate}
                              onChange={(e) => handleUpdateRule(rule.id, Number(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">First Purchase Bonus</Label>
                            <Input
                              type="number"
                              value={rule.firstPurchaseBonus}
                              className="mt-1"
                              readOnly
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Attribution window: {rule.attributionWindowDays} days • Min payout: ${rule.minPayout}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Fraud Detection
                    </CardTitle>
                    <CardDescription>Potential fraud signals (UI demonstration)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-sm">Suspicious Activity</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Affiliate "DAVID2024" - High clicks (850) but low conversions (2). 
                          Multiple signups from same IP detected.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Review
                        </Button>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-sm text-muted-foreground">
                          No other fraud signals detected
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top Affiliates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topAffiliates.map((aff, idx) => (
                        <div key={aff.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                              idx === 1 ? "bg-gray-400/20 text-gray-500" :
                              idx === 2 ? "bg-orange-500/20 text-orange-500" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{aff.userName}</p>
                              <p className="text-xs text-muted-foreground">{aff.totalConversions} conversions</p>
                            </div>
                          </div>
                          <span className="font-semibold text-green-500">
                            ${aff.lifetimeEarnings.toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Revenue by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Tool Subscriptions</span>
                          <span className="text-sm font-medium">${toolSalesByAffiliate.tools?.toFixed(0) || 0}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "65%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Tool Bundles</span>
                          <span className="text-sm font-medium">${toolSalesByAffiliate.bundles?.toFixed(0) || 0}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: "25%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Offers & Services</span>
                          <span className="text-sm font-medium">$186</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: "10%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-semibold text-sm mb-3">Top Performing Tools</h4>
                      {tools.slice(0, 3).map(tool => (
                        <div key={tool.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded bg-gradient-to-br ${tool.color} text-white`}>
                              <tool.icon className="h-3 w-3" />
                            </div>
                            <span className="text-sm">{tool.name}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
  Users, DollarSign, TrendingUp, Search, Ban, 
  CheckCircle, Settings, AlertTriangle, Percent
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

  const conversionRate = dummyAffiliates.reduce((sum, a) => sum + a.totalConversions, 0) / 
    Math.max(dummyAffiliates.reduce((sum, a) => sum + a.totalSignups, 0), 1) * 100;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Affiliate Management</h1>
          <p className="text-muted-foreground">Monitor affiliates, manage commissions, and track performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    Default Commission Rates
                  </CardTitle>
                  <CardDescription>Configure commission rates by transaction type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{rule.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={rule.commissionRate}
                          onChange={(e) => setRules(prev => prev.map(r => 
                            r.id === rule.id ? { ...r, commissionRate: Number(e.target.value) } : r
                          ))}
                          className="w-20"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fraud Detection</CardTitle>
                  <CardDescription>Monitor for suspicious affiliate activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                    <p>No suspicious activity detected</p>
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
                  <CardTitle>Top Affiliates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topAffiliates.map((aff, index) => (
                    <div key={aff.id} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium">{aff.userName}</p>
                        <p className="text-sm text-muted-foreground">{aff.totalConversions} conversions</p>
                      </div>
                      <span className="font-semibold">${aff.lifetimeEarnings.toFixed(0)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dummyConversions
                    .reduce((acc, c) => {
                      acc[c.transactionType] = (acc[c.transactionType] || 0) + c.grossAmount;
                      return acc;
                    }, {} as Record<string, number>)
                    && Object.entries(
                      dummyConversions.reduce((acc, c) => {
                        acc[c.transactionType] = (acc[c.transactionType] || 0) + c.grossAmount;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, amount]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type.replace("_", " ")}</span>
                        <span className="font-semibold">${amount.toFixed(0)}</span>
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
import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, DollarSign, TrendingUp, Search, Ban, 
  CheckCircle, Settings, AlertTriangle, Percent, Download
} from "lucide-react";
import { toast } from "sonner";
import { useAdminAffiliates, Affiliate } from "@/hooks/useAdminAffiliates";
import { exportToCSV } from "@/lib/csvExport";

export default function AdminAffiliatePage() {
  const { 
    affiliates, 
    loading, 
    refetch, 
    approveAffiliate, 
    suspendAffiliate, 
    blockAffiliate, 
    updateCommissionRate,
    getStats 
  } = useAdminAffiliates();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [editingCommission, setEditingCommission] = useState<number | null>(null);

  const stats = getStats();

  const filteredAffiliates = affiliates.filter(aff => {
    const matchesSearch = (aff.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      aff.referral_code.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleApprove = async (affiliate: Affiliate) => {
    const { error } = await approveAffiliate(affiliate.id);
    if (!error) {
      toast.success(`${affiliate.user_name} approved as affiliate`);
    } else {
      toast.error("Failed to approve affiliate");
    }
  };

  const handleSuspend = async (affiliate: Affiliate) => {
    const { error } = await suspendAffiliate(affiliate.id);
    if (!error) {
      toast.warning(`${affiliate.user_name} suspended`);
    }
  };

  const handleBlock = async (affiliate: Affiliate) => {
    const { error } = await blockAffiliate(affiliate.id);
    if (!error) {
      toast.error(`${affiliate.user_name} blocked`);
    }
  };

  const handleUpdateCommission = async () => {
    if (selectedAffiliate && editingCommission !== null) {
      const { error } = await updateCommissionRate(selectedAffiliate.id, editingCommission);
      if (!error) {
        toast.success(`Commission rate updated to ${editingCommission}% for ${selectedAffiliate.user_name}`);
        setSelectedAffiliate(null);
        setEditingCommission(null);
      }
    }
  };

  const handleExport = () => {
    exportToCSV(filteredAffiliates, "affiliates.csv", [
      { key: "user_name", header: "Name" },
      { key: "referral_code", header: "Code" },
      { key: "status", header: "Status" },
      { key: "total_clicks", header: "Clicks" },
      { key: "total_conversions", header: "Conversions" },
      { key: "lifetime_earnings", header: "Lifetime Earnings" },
      { key: "commission_rate", header: "Commission %" },
    ]);
  };

  const conversionRate = stats.totalConversions > 0 
    ? ((stats.totalConversions / (affiliates.reduce((sum, a) => sum + a.total_signups, 0) || 1)) * 100).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Affiliate Management</h1>
            <p className="text-muted-foreground">Monitor affiliates, manage commissions, and track performance</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
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
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
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
                  <p className="text-2xl font-bold">${stats.pendingCommissions.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Pending Commissions</p>
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
                  <p className="text-2xl font-bold">{stats.activeAffiliates}</p>
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
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="affiliates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="affiliates">All Affiliates ({affiliates.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pendingApproval})</TabsTrigger>
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
                      <SelectContent className="bg-background border">
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
                {filteredAffiliates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {affiliates.length === 0 ? "No affiliates registered yet" : "No affiliates match your search"}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Affiliate</TableHead>
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
                                <p className="font-medium">{aff.user_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">
                                  Since {new Date(aff.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{aff.referral_code}</TableCell>
                            <TableCell className="text-right">{aff.total_clicks}</TableCell>
                            <TableCell className="text-right">{aff.total_conversions}</TableCell>
                            <TableCell className="text-right font-medium">
                              ${(aff.lifetime_earnings || 0).toFixed(2)}
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
                                        setEditingCommission(aff.custom_commission_rate || aff.commission_rate);
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
                                        <Label>Affiliate: {selectedAffiliate?.user_name}</Label>
                                      </div>
                                      <div>
                                        <Label>Custom Commission Rate (%)</Label>
                                        <Input
                                          type="number"
                                          value={editingCommission || ""}
                                          onChange={(e) => setEditingCommission(Number(e.target.value))}
                                          className="mt-2"
                                        />
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Approval */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Affiliate Applications</CardTitle>
                <CardDescription>Review and approve affiliate applications</CardDescription>
              </CardHeader>
              <CardContent>
                {affiliates.filter(a => a.status === "pending").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending applications
                  </div>
                ) : (
                  <div className="space-y-4">
                    {affiliates.filter(a => a.status === "pending").map(aff => (
                      <div key={aff.id} className="p-4 rounded-lg border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{aff.user_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">
                              Code: {aff.referral_code}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Applied on {new Date(aff.created_at).toLocaleDateString()}
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

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Affiliates</CardTitle>
                  <CardDescription>By lifetime earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {affiliates
                      .filter(a => a.status === "active")
                      .sort((a, b) => (b.lifetime_earnings || 0) - (a.lifetime_earnings || 0))
                      .slice(0, 5)
                      .map((aff, index) => (
                        <div key={aff.id} className="flex items-center gap-4">
                          <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                          <div className="flex-1">
                            <p className="font-medium">{aff.user_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {aff.total_conversions} conversions
                            </p>
                          </div>
                          <span className="font-semibold">${(aff.lifetime_earnings || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    {affiliates.filter(a => a.status === "active").length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No active affiliates yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Affiliate Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between p-3 border rounded-lg">
                      <span>Total Affiliates</span>
                      <span className="font-bold">{stats.totalAffiliates}</span>
                    </div>
                    <div className="flex justify-between p-3 border rounded-lg">
                      <span>Active</span>
                      <span className="font-bold text-green-500">{stats.activeAffiliates}</span>
                    </div>
                    <div className="flex justify-between p-3 border rounded-lg">
                      <span>Pending Approval</span>
                      <span className="font-bold text-yellow-500">{stats.pendingApproval}</span>
                    </div>
                    <div className="flex justify-between p-3 border rounded-lg">
                      <span>Total Conversions</span>
                      <span className="font-bold">{stats.totalConversions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

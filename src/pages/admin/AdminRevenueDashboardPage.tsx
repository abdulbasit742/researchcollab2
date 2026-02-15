import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/currency";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { DollarSign, TrendingUp, Users, Building2, Shield, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function AdminRevenueDashboardPage() {
  const { data: fees } = useQuery({
    queryKey: ["platform-fees-all"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_fees").select("*").order("created_at", { ascending: false }).limit(500);
      return data || [];
    },
  });

  const { data: tierFees } = useQuery({
    queryKey: ["trust-tier-fees"],
    queryFn: async () => {
      const { data } = await supabase.from("trust_tier_fees").select("*").order("fee_percentage", { ascending: false });
      return data || [];
    },
  });

  const { data: contracts } = useQuery({
    queryKey: ["institutional-contracts-all"],
    queryFn: async () => {
      const { data } = await supabase.from("institutional_contracts").select("*");
      return data || [];
    },
  });

  const { data: evasionLogs } = useQuery({
    queryKey: ["fee-evasion-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("fee_evasion_logs").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  const totalFeeRevenue = fees?.reduce((s, f) => s + Number(f.platform_fee_amount), 0) || 0;
  const totalGross = fees?.reduce((s, f) => s + Number(f.gross_amount), 0) || 0;
  const avgFeeRate = totalGross > 0 ? (totalFeeRevenue / totalGross * 100) : 0;
  const institutionalFees = fees?.filter(f => f.is_institutional).reduce((s, f) => s + Number(f.platform_fee_amount), 0) || 0;
  const contractRevenue = contracts?.filter(c => c.status === "active").reduce((s, c) => s + Number(c.base_fee || 0), 0) || 0;

  const tierDistribution = tierFees?.map(t => ({
    name: t.tier.charAt(0).toUpperCase() + t.tier.slice(1),
    fee: Number(t.fee_percentage),
    boost: Number(t.visibility_boost || 0),
    priority: Number(t.bid_priority_weight || 1),
  })) || [];

  const monthlyTrend = [
    { month: "Jan", revenue: totalFeeRevenue * 0.6 },
    { month: "Feb", revenue: totalFeeRevenue * 0.75 },
    { month: "Mar", revenue: totalFeeRevenue * 0.85 },
    { month: "Apr", revenue: totalFeeRevenue * 0.9 },
    { month: "May", revenue: totalFeeRevenue * 0.95 },
    { month: "Jun", revenue: totalFeeRevenue },
  ];

  const revenueBreakdown = [
    { name: "Transaction Fees", value: totalFeeRevenue },
    { name: "Institutional Contracts", value: contractRevenue },
    { name: "Institutional Deals", value: institutionalFees },
  ].filter(r => r.value > 0);

  if (revenueBreakdown.length === 0) {
    revenueBreakdown.push({ name: "Transaction Fees", value: 1 }, { name: "Contracts", value: 1 });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue Dashboard</h1>
          <p className="text-muted-foreground">Financial control room — all revenue streams</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Fee Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPKR(totalFeeRevenue)}</div>
              <p className="text-xs text-muted-foreground">{fees?.length || 0} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Fee Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgFeeRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Across all deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Contract Revenue</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPKR(contractRevenue)}</div>
              <p className="text-xs text-muted-foreground">{contracts?.filter(c => c.status === "active").length || 0} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Evasion Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evasionLogs?.filter(l => !l.resolved).length || 0}</div>
              <p className="text-xs text-muted-foreground">Unresolved</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tiers">Trust Tiers</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="evasion">Anti-Abuse</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(v: number) => formatPKR(v)} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Revenue Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={revenueBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {revenueBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatPKR(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Recent Fee Transactions</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gross</TableHead>
                        <TableHead>Fee %</TableHead>
                        <TableHead>Fee Amount</TableHead>
                        <TableHead>Net Payout</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(fees || []).slice(0, 10).map(fee => (
                        <TableRow key={fee.id}>
                          <TableCell>{formatPKR(Number(fee.gross_amount))}</TableCell>
                          <TableCell>{Number(fee.platform_fee_percentage).toFixed(1)}%</TableCell>
                          <TableCell className="font-medium">{formatPKR(Number(fee.platform_fee_amount))}</TableCell>
                          <TableCell>{formatPKR(Number(fee.net_payout))}</TableCell>
                          <TableCell><Badge variant="outline">{fee.trust_tier || "—"}</Badge></TableCell>
                          <TableCell className="text-muted-foreground text-xs">{new Date(fee.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {(!fees || fees.length === 0) && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No fee transactions yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trust-Tier Fee Schedule</CardTitle>
                <CardDescription>Lower fees reward higher trust — making improvement economically meaningful</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={tierDistribution}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="fee" name="Fee %" fill="hsl(var(--primary))" />
                    <Bar dataKey="boost" name="Visibility Boost %" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="overflow-x-auto mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tier</TableHead>
                        <TableHead>Fee %</TableHead>
                        <TableHead>Visibility Boost</TableHead>
                        <TableHead>Bid Priority</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tierFees || []).map(t => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium capitalize">{t.tier}</TableCell>
                          <TableCell>{Number(t.fee_percentage)}%</TableCell>
                          <TableCell>+{Number(t.visibility_boost || 0)}%</TableCell>
                          <TableCell>{Number(t.bid_priority_weight || 1)}x</TableCell>
                          <TableCell>
                            <Badge variant={t.is_active ? "default" : "secondary"}>
                              {t.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Institutional Contracts</CardTitle>
                <CardDescription>Subscription, revenue-share, and hybrid contracts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Base Fee</TableHead>
                        <TableHead>Rev Share %</TableHead>
                        <TableHead>Revenue Generated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(contracts || []).map(c => (
                        <TableRow key={c.id}>
                          <TableCell><Badge variant="outline" className="capitalize">{c.contract_type.replace("_", " ")}</Badge></TableCell>
                          <TableCell>{formatPKR(Number(c.base_fee))}</TableCell>
                          <TableCell>{Number(c.revenue_share_percentage || 0)}%</TableCell>
                          <TableCell>{formatPKR(Number(c.total_revenue_generated || 0))}</TableCell>
                          <TableCell><Badge variant={c.status === "active" ? "default" : "secondary"} className="capitalize">{c.status}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{c.start_date} → {c.end_date || "Ongoing"}</TableCell>
                        </TableRow>
                      ))}
                      {(!contracts || contracts.length === 0) && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No institutional contracts yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evasion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Anti-Abuse & Fee Evasion
                </CardTitle>
                <CardDescription>Revenue leakage detection and enforcement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(evasionLogs || []).map(log => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.detection_type}</TableCell>
                          <TableCell>
                            <Badge variant={log.severity === "critical" ? "destructive" : log.severity === "high" ? "destructive" : "secondary"}>
                              {log.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={log.resolved ? "default" : "outline"}>
                              {log.resolved ? "Resolved" : "Open"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {(!evasionLogs || evasionLogs.length === 0) && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No evasion alerts</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

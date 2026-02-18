import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PieChart, TrendingUp, Users, FileText, Shield, ArrowRightLeft, Calendar } from "lucide-react";

function useEquityAllocations(startupId?: string) {
  return useQuery({
    queryKey: ["equity-allocations", startupId],
    queryFn: async () => {
      let q = supabase.from("equity_allocations").select("*").order("created_at", { ascending: false });
      if (startupId) q = q.eq("startup_id", startupId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

function useFundingRounds(startupId?: string) {
  return useQuery({
    queryKey: ["funding-rounds", startupId],
    queryFn: async () => {
      let q = supabase.from("funding_rounds").select("*").order("created_at", { ascending: false });
      if (startupId) q = q.eq("startup_id", startupId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

function useVestingSchedules(startupId?: string) {
  return useQuery({
    queryKey: ["vesting-schedules", startupId],
    queryFn: async () => {
      let q = supabase.from("vesting_schedules").select("*").order("start_date", { ascending: false });
      if (startupId) q = q.eq("startup_id", startupId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

function useEquityTransactions(startupId?: string) {
  return useQuery({
    queryKey: ["equity-transactions", startupId],
    queryFn: async () => {
      let q = supabase.from("equity_transaction_logs").select("*").order("created_at", { ascending: false }).limit(50);
      if (startupId) q = q.eq("startup_id", startupId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

const holderTypeColors: Record<string, string> = {
  founder: "bg-primary/10 text-primary",
  investor: "bg-chart-2/20 text-chart-2",
  university: "bg-chart-3/20 text-chart-3",
  platform: "bg-chart-4/20 text-chart-4",
  employee: "bg-chart-5/20 text-chart-5",
};

const roundTypeLabels: Record<string, string> = {
  "pre-seed": "Pre-Seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  internal: "Internal",
  grant: "Grant",
};

export default function EquityDashboardPage() {
  const { user } = useAuth();
  const { data: allocations = [], isLoading: loadingAlloc } = useEquityAllocations();
  const { data: rounds = [], isLoading: loadingRounds } = useFundingRounds();
  const { data: vesting = [], isLoading: loadingVesting } = useVestingSchedules();
  const { data: transactions = [] } = useEquityTransactions();

  const totalShares = allocations.reduce((s, a) => s + Number(a.shares || 0), 0);
  const totalRaised = rounds.reduce((s, r) => s + Number(r.investment_amount || 0), 0);
  const activeRounds = rounds.filter((r) => r.status === "open").length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equity & Cap Table</h1>
          <p className="text-muted-foreground mt-1">Ownership tracking, funding rounds, vesting & dilution management</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><PieChart className="h-4 w-4" /> Allocations</div>
              <p className="text-2xl font-bold text-foreground">{allocations.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><TrendingUp className="h-4 w-4" /> Total Raised</div>
              <p className="text-2xl font-bold text-foreground">PKR {totalRaised.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Users className="h-4 w-4" /> Active Rounds</div>
              <p className="text-2xl font-bold text-foreground">{activeRounds}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Calendar className="h-4 w-4" /> Vesting Schedules</div>
              <p className="text-2xl font-bold text-foreground">{vesting.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cap-table">
          <TabsList>
            <TabsTrigger value="cap-table">Cap Table</TabsTrigger>
            <TabsTrigger value="rounds">Funding Rounds</TabsTrigger>
            <TabsTrigger value="vesting">Vesting</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Log</TabsTrigger>
          </TabsList>

          {/* Cap Table */}
          <TabsContent value="cap-table" className="mt-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><PieChart className="h-4 w-4" /> Equity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {allocations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No equity allocations recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {allocations.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
                        <div className="flex items-center gap-3">
                          <Badge className={holderTypeColors[a.holder_type] || ""}>{a.holder_type}</Badge>
                          <div>
                            <p className="text-sm font-medium text-foreground">{a.role || a.holder_id?.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">{Number(a.shares).toLocaleString()} shares</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{Number(a.percentage).toFixed(2)}%</p>
                          {a.linked_contract_id && (
                            <Badge variant="outline" className="text-xs"><FileText className="h-3 w-3 mr-1" />Contract linked</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {/* Total bar */}
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex mt-4">
                      {allocations.map((a, i) => (
                        <div key={a.id} className="h-full" style={{ width: `${Number(a.percentage)}%`, backgroundColor: `hsl(var(--chart-${(i % 5) + 1}))` }} />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Funding Rounds */}
          <TabsContent value="rounds" className="mt-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Funding Rounds</CardTitle>
              </CardHeader>
              <CardContent>
                {rounds.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No funding rounds recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {rounds.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">{roundTypeLabels[r.round_type] || r.round_type}</p>
                            <Badge variant={r.status === "open" ? "default" : r.status === "closed" ? "secondary" : "outline"}>{r.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Valuation: PKR {Number(r.valuation || 0).toLocaleString()} → Post-money: PKR {Number(r.post_money_valuation || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">PKR {Number(r.investment_amount || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{Number(r.equity_issued || 0).toLocaleString()} shares issued</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vesting */}
          <TabsContent value="vesting" className="mt-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-4 w-4" /> Vesting Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                {vesting.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No vesting schedules configured.</p>
                ) : (
                  <div className="space-y-3">
                    {vesting.map((v) => {
                      const vestPct = v.total_shares > 0 ? (Number(v.shares_vested || 0) / Number(v.total_shares)) * 100 : 0;
                      return (
                        <div key={v.id} className="p-3 rounded-lg border border-border/50 bg-card">
                          <div className="flex justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">{v.holder_id?.slice(0, 8)}</p>
                              <p className="text-xs text-muted-foreground">
                                Cliff: {v.cliff_period}mo · Duration: {v.vesting_duration}mo · {v.vesting_interval}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">{Number(v.shares_vested || 0).toLocaleString()} / {Number(v.total_shares).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Start: {v.start_date}</p>
                            </div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${vestPct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction Log */}
          <TabsContent value="transactions" className="mt-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><ArrowRightLeft className="h-4 w-4" /> Equity Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No equity transactions logged.</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">{t.action_type}</Badge>
                          <p className="text-xs text-muted-foreground">{t.reason || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{Number(t.shares).toLocaleString()} shares</p>
                          <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

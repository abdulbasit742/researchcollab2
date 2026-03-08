import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Landmark, TrendingUp, DollarSign, Building2, Plus } from "lucide-react";
import { getResearchFunds, FUND_TYPES } from "@/lib/innovation/researchCapitalMarket";
import { toast } from "sonner";

export default function ResearchCapitalMarketPage() {
  const [funds, setFunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFunds(); }, []);

  async function loadFunds() {
    setLoading(true);
    try { setFunds(await getResearchFunds("open")); }
    catch { toast.error("Failed to load funds"); }
    finally { setLoading(false); }
  }

  const totalCapital = funds.reduce((s, f) => s + (f.total_size || 0), 0);
  const totalAllocated = funds.reduce((s, f) => s + (f.allocated_amount || 0), 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Landmark className="h-8 w-8 text-primary" /> Research Capital Market
          </h1>
          <p className="text-muted-foreground mt-1">Global research funding coordination • 2% management + 1% success fee</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1" /> Create Fund</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Capital", value: `$${(totalCapital / 1000000).toFixed(1)}M`, icon: DollarSign },
          { label: "Allocated", value: `$${(totalAllocated / 1000000).toFixed(1)}M`, icon: TrendingUp },
          { label: "Active Funds", value: funds.length, icon: Landmark },
          { label: "Institutions", value: funds.reduce((s, f) => s + (f.participating_institutions || 0), 0), icon: Building2 },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 flex items-center gap-3">
              <m.icon className="h-8 w-8 text-primary" />
              <div><p className="text-2xl font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="animate-pulse h-32" />)}</div>
      ) : funds.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Landmark className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No research funds created yet. Launch the first global research fund.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {funds.map(f => {
            const pct = f.total_size > 0 ? (f.allocated_amount / f.total_size) * 100 : 0;
            return (
              <Card key={f.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{f.fund_name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{f.description || "No description"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge>{f.fund_type?.replace("_", " ")}</Badge>
                      {f.domain && <Badge variant="secondary">{f.domain}</Badge>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Allocated: ${(f.allocated_amount || 0).toLocaleString()}</span>
                      <span>Total: ${(f.total_size || 0).toLocaleString()}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{f.participating_institutions || 0} institutions</span>
                    <span>{f.active_projects || 0} active projects</span>
                    <span>Mgmt Fee: {f.management_fee_pct}% • Success: {f.success_fee_pct}%</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <DollarSign className="h-4 w-4 mr-1" /> Contribute to Fund
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

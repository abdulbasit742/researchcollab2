import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, TrendingUp, FlaskConical, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { getGrowthMetrics, getGrowthExperiments, METRIC_TYPES } from "@/lib/omnichannel/growthService";
import { toast } from "sonner";

export default function OmniGrowthPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("metrics");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [m, e] = await Promise.all([getGrowthMetrics(), getGrowthExperiments()]);
      setMetrics(m);
      setExperiments(e);
    } catch { toast.error("Failed to load growth data"); }
    finally { setLoading(false); }
  }

  const latestByType = METRIC_TYPES.map(type => {
    const latest = metrics.find(m => m.metric_type === type);
    return { type, ...latest };
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Rocket className="h-7 w-7 text-primary" /> AI Growth Engine
          </h1>
          <p className="text-sm text-muted-foreground">Growth optimization, acquisition analysis, and experimentation</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="metrics"><TrendingUp className="h-3 w-3 mr-1" /> Metrics</TabsTrigger>
          <TabsTrigger value="experiments"><FlaskConical className="h-3 w-3 mr-1" /> Experiments</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-4">
          {loading ? (
            <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i => <Card key={i} className="animate-pulse h-24" />)}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {latestByType.map(m => {
                  const isUp = (m.change_pct || 0) > 0;
                  return (
                    <Card key={m.type}>
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground capitalize">{m.type.replace("_", " ")}</p>
                        <p className="text-2xl font-bold mt-1">{m.value != null ? m.value.toLocaleString() : "—"}</p>
                        {m.change_pct != null && (
                          <div className={`flex items-center gap-1 text-xs mt-1 ${isUp ? "text-green-600" : "text-red-500"}`}>
                            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(m.change_pct).toFixed(1)}%
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {metrics.length === 0 && (
                <Card className="mt-4"><CardContent className="py-12 text-center text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>No growth metrics recorded yet. Data populates as the platform grows.</p>
                </CardContent></Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="experiments" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button><Plus className="h-4 w-4 mr-1" /> New Experiment</Button>
          </div>

          {experiments.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <FlaskConical className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No growth experiments yet. Create A/B tests for channels and campaigns.</p>
            </CardContent></Card>
          ) : (
            experiments.map(e => (
              <Card key={e.id} className="hover:shadow transition-shadow">
                <CardContent className="pt-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{e.experiment_name}</p>
                    <p className="text-sm text-muted-foreground">{e.hypothesis || "No hypothesis"}</p>
                    <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                      {e.channel && <Badge variant="outline" className="text-[10px]">{e.channel}</Badge>}
                      {e.variant_a && <span>A: {e.variant_a}</span>}
                      {e.variant_b && <span>B: {e.variant_b}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={e.status === "running" ? "default" : e.status === "completed" ? "secondary" : "outline"}>{e.status}</Badge>
                    {e.winner && <Badge className="bg-green-600 text-[10px]">Winner: {e.winner}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

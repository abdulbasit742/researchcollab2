import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, TrendingUp, Target } from "lucide-react";
import { getExecutionRankings, ENTITY_TYPES } from "@/lib/innovation/globalExecutionIndex";
import { toast } from "sonner";

export default function GlobalExecutionIndexPage() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState("researcher");

  useEffect(() => { loadRankings(); }, [entityType]);

  async function loadRankings() {
    setLoading(true);
    try { setRankings(await getExecutionRankings({ entity_type: entityType })); }
    catch { toast.error("Failed to load rankings"); }
    finally { setLoading(false); }
  }

  const medalColor = (i: number) => i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground";

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" /> Global Execution Index
          </h1>
          <p className="text-muted-foreground mt-1">Verified execution rankings • Trust-weighted scoring</p>
        </div>
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Ranked", value: rankings.length, icon: Trophy },
          { label: "Avg Score", value: rankings.length ? (rankings.reduce((s,r) => s + (r.composite_rank_score || 0), 0) / rankings.length).toFixed(1) : "0", icon: Target },
          { label: "Top Score", value: rankings[0]?.composite_rank_score?.toFixed(1) || "N/A", icon: Medal },
          { label: "Domains", value: new Set(rankings.map(r => r.domain).filter(Boolean)).size, icon: TrendingUp },
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
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="animate-pulse h-16" />)}</div>
      ) : rankings.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No rankings computed yet.</p>
        </CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Leaderboard — {entityType}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rankings.map((r, i) => (
                <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition">
                  <span className={`text-xl font-bold w-8 text-center ${medalColor(i)}`}>
                    {i < 3 ? <Medal className="h-5 w-5 inline" /> : `#${i + 1}`}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{r.entity_name}</p>
                    <div className="flex gap-2 mt-1 text-xs">
                      {r.domain && <Badge variant="secondary">{r.domain}</Badge>}
                      {r.region && <Badge variant="outline">{r.region}</Badge>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center text-xs">
                    <div><p className="font-bold">{r.milestone_reliability?.toFixed(0)}</p><p className="text-muted-foreground">Milestones</p></div>
                    <div><p className="font-bold">{r.research_impact?.toFixed(0)}</p><p className="text-muted-foreground">Research</p></div>
                    <div><p className="font-bold">{r.funding_reliability?.toFixed(0)}</p><p className="text-muted-foreground">Funding</p></div>
                    <div><p className="font-bold">{r.collaboration_success?.toFixed(0)}</p><p className="text-muted-foreground">Collab</p></div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{r.composite_rank_score?.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

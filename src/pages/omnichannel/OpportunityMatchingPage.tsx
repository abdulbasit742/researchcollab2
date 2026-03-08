import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Compass, Target, MousePointerClick, TrendingUp, Bell } from "lucide-react";
import { getOpportunityMatches, getMatchStats } from "@/lib/omnichannel/intakeService";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function OpportunityMatchingPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [m, s] = await Promise.all([getOpportunityMatches(), getMatchStats()]);
      setMatches(m);
      setStats(s);
    } catch { toast.error("Failed to load matches"); }
    finally { setLoading(false); }
  }

  const typeData = stats ? Object.entries(stats.byType).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Compass className="h-7 w-7 text-primary" /> Opportunity Matching Agent
        </h1>
        <p className="text-sm text-muted-foreground">AI-driven researcher ↔ opportunity discovery and matching</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { label: "Total Matches", value: stats?.total || 0, icon: Compass },
          { label: "Notified", value: stats?.notified || 0, icon: Bell },
          { label: "Clicked", value: stats?.clicked || 0, icon: MousePointerClick },
          { label: "Converted", value: stats?.converted || 0, icon: TrendingUp },
          { label: "Avg Score", value: `${stats?.avgScore || 0}%`, icon: Target },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 flex items-center gap-3">
              <m.icon className="h-6 w-6 text-primary" />
              <div><p className="text-xl font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Recent Matches</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded animate-pulse bg-muted" />)}</div>
            ) : matches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No matches generated yet</p>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-2">
                  {matches.map(m => (
                    <div key={m.id} className="p-3 rounded-lg border flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{m.opportunity_title || "Untitled Opportunity"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{m.opportunity_type}</Badge>
                          {m.channel_type && <Badge variant="secondary" className="text-[10px]">{m.channel_type}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="text-right">
                          <p className="font-bold text-primary">{m.match_score}%</p>
                          <p className="text-muted-foreground">score</p>
                        </div>
                        <div className="flex gap-1">
                          {m.notified && <Badge className="text-[9px]" variant="outline">Notified</Badge>}
                          {m.clicked && <Badge className="text-[9px]" variant="outline">Clicked</Badge>}
                          {m.converted && <Badge className="text-[9px]" variant="default">Converted</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Matches by Type</CardTitle></CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={typeData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

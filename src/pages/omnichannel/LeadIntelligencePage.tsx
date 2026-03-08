import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Brain, TrendingUp, Flame, Thermometer } from "lucide-react";
import { fetchLeadScores, getLeadIntelligenceAnalytics } from "@/lib/omnichannel/leadIntelligence";

const COLORS = ["#ef4444", "#f59e0b", "#6b7280"];

export default function LeadIntelligencePage() {
  const { data: scores = [] } = useQuery({ queryKey: ["lead-scores"], queryFn: () => fetchLeadScores() });
  const analytics = getLeadIntelligenceAnalytics(scores);

  return (
    <>
      <Helmet><title>AI Lead Intelligence | RCollab</title></Helmet>
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Lead Intelligence</h1>
          <p className="text-muted-foreground">Predictive lead scoring and qualification powered by AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Average Score", value: analytics.avgScore, icon: Brain },
            { label: "Hot Leads", value: analytics.hotLeads, icon: Flame },
            { label: "Warm Leads", value: analytics.warmLeads, icon: Thermometer },
            { label: "Total Scored", value: scores.length, icon: TrendingUp },
          ].map(kpi => (
            <Card key={kpi.label}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><kpi.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm text-muted-foreground">{kpi.label}</p><p className="text-2xl font-bold text-foreground">{kpi.value}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="distribution">
          <TabsList><TabsTrigger value="distribution">Distribution</TabsTrigger><TabsTrigger value="scores">Recent Scores</TabsTrigger></TabsList>
          <TabsContent value="distribution">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle>Lead Temperature</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart><Pie data={analytics.distribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {analytics.distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Score Distribution</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.distribution}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </div>
          </TabsContent>
          <TabsContent value="scores" className="space-y-3">
            {scores.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No lead scores computed yet. Scores are generated as contacts interact with the platform.</CardContent></Card>
            ) : scores.slice(0, 50).map((score: any) => (
              <Card key={score.id}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-muted-foreground">{score.contact_id?.slice(0, 8)}...</p>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(score.factors || {}).map(([key, val]) => (
                        <Badge key={key} variant="outline" className="text-xs">{key}: {String(val)}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${score.score_value >= 70 ? "text-red-500" : score.score_value >= 40 ? "text-yellow-500" : "text-muted-foreground"}`}>{score.score_value}</p>
                    <Badge variant={score.score_value >= 70 ? "destructive" : score.score_value >= 40 ? "secondary" : "outline"}>
                      {score.score_value >= 70 ? "Hot" : score.score_value >= 40 ? "Warm" : "Cold"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

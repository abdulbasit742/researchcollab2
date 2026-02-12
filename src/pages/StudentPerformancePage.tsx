import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Clock, Star, DollarSign, BarChart3 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

const metrics = {
  milestone_timeliness: 82,
  revision_rate: 15,
  supervisor_rating: 4.2,
  trust_growth: 28,
  economic_output: 45000,
  consistency_score: 76,
};

const radarData = [
  { metric: "Timeliness", value: metrics.milestone_timeliness },
  { metric: "Quality", value: 100 - metrics.revision_rate },
  { metric: "Rating", value: metrics.supervisor_rating * 20 },
  { metric: "Trust", value: metrics.trust_growth * 2 },
  { metric: "Output", value: Math.min(metrics.economic_output / 1000, 100) },
  { metric: "Consistency", value: metrics.consistency_score },
];

const statCards = [
  { icon: Clock, label: "Milestone Timeliness", value: `${metrics.milestone_timeliness}%`, color: "text-blue-500" },
  { icon: Target, label: "Revision Rate", value: `${metrics.revision_rate}%`, color: "text-orange-500" },
  { icon: Star, label: "Supervisor Rating", value: `${metrics.supervisor_rating}/5`, color: "text-yellow-500" },
  { icon: TrendingUp, label: "Trust Growth", value: `+${metrics.trust_growth}`, color: "text-green-500" },
  { icon: DollarSign, label: "Economic Output", value: `PKR ${metrics.economic_output.toLocaleString()}`, color: "text-primary" },
  { icon: BarChart3, label: "Consistency", value: `${metrics.consistency_score}%`, color: "text-purple-500" },
];

export default function StudentPerformancePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Scorecard</h1>
          <p className="text-muted-foreground mt-1">Your academic execution metrics at a glance</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map(s => (
            <Card key={s.label}><CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <s.icon className={`h-6 w-6 ${s.color}`} />
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Performance Radar</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Growth Trend</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Timeliness", value: metrics.milestone_timeliness, percentile: 72 },
              { label: "Quality (low revision)", value: 100 - metrics.revision_rate, percentile: 85 },
              { label: "Consistency", value: metrics.consistency_score, percentile: 68 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <Badge variant="outline">Top {100 - item.percentile}%</Badge>
                </div>
                <Progress value={item.value} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

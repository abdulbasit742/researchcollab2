import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInstitutionalMetrics } from "@/hooks/useInstitutionalMetrics";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, Shield, DollarSign, Briefcase, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Props {
  institutionId: string;
}

export function InstitutionDashboardV2({ institutionId }: Props) {
  const { data: metrics, isLoading } = useInstitutionalMetrics(institutionId);

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
    </div>;
  }

  const latest = metrics?.[0];
  const chartData = (metrics || []).slice(0, 12).reverse().map((m: any) => ({
    period: format(new Date(m.period_start), "MMM"),
    economic: m.economic_contribution || 0,
    deals: m.deal_volume || 0,
    trust: m.avg_trust_score || 0,
    talent: m.talent_count || 0,
  }));

  const skillDist = latest?.skill_distribution
    ? Object.entries(latest.skill_distribution as Record<string, number>).map(([skill, count]) => ({
        skill,
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Users, label: "Talent", value: latest?.talent_count ?? 0 },
          { icon: Shield, label: "Avg Trust", value: latest?.avg_trust_score?.toFixed(1) ?? "0" },
          { icon: DollarSign, label: "Economic", value: `${((latest?.economic_contribution ?? 0) / 1000).toFixed(0)}K` },
          { icon: Briefcase, label: "Deals", value: latest?.deal_volume ?? 0 },
          { icon: AlertTriangle, label: "Risk Signals", value: latest?.active_risk_signals ?? 0 },
        ].map((s) => (
          <Card key={s.label} variant="glass">
            <CardContent className="p-3 text-center">
              <s.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skill Distribution */}
      {skillDist.length > 0 && (
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="skill" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Economic Contribution Trend */}
      {chartData.length > 1 && (
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Economic Contribution Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="economic" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Signals */}
      {(latest?.active_risk_signals ?? 0) > 0 && (
        <Card variant="glass" className="border-destructive/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium">{latest?.active_risk_signals} Active Risk Signals</p>
              <p className="text-xs text-muted-foreground">Review risk indicators for this institution.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

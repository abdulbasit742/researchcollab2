import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCapitalOptimizationAdvice } from "@/hooks/useAutonomousIntelligence";
import { DollarSign, TrendingUp, TrendingDown, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function CapitalOptimizerDashboardPage() {
  const { data: adviceData, isLoading } = useCapitalOptimizationAdvice();
  const list = adviceData ?? [];

  const increaseRecs = list.filter((a: any) => a.recommended_funding_adjustment > 0).length;
  const decreaseRecs = list.filter((a: any) => a.recommended_funding_adjustment < 0).length;
  const avgConfidence = list.length ? Math.round(list.reduce((s: number, a: any) => s + (a.execution_confidence_index || 0), 0) / list.length) : 0;

  const chartData = list.slice(0, 12).map((a: any) => ({
    name: a.project_id?.slice(0, 6) ?? "—",
    confidence: a.execution_confidence_index || 0,
    adjustment: a.recommended_funding_adjustment || 0,
  }));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Capital Allocation Optimizer
          </h1>
          <p className="text-muted-foreground mt-1">Advisory-only capital optimization based on execution intelligence</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{list.length}</p>
            <p className="text-xs text-muted-foreground">Recommendations</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{increaseRecs}</p>
            <p className="text-xs text-muted-foreground">Increase Advised</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{decreaseRecs}</p>
            <p className="text-xs text-muted-foreground">Decrease Advised</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{avgConfidence}%</p>
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
          </CardContent></Card>
        </div>

        {chartData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Execution Confidence & Funding Adjustments</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="confidence" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="adjustment" radius={[4, 4, 0, 0]}>
                    {chartData.map((e, i) => <Cell key={i} fill={e.adjustment >= 0 ? "#22c55e" : "#ef4444"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {list.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {a.recommended_funding_adjustment > 0 ? (
                        <Badge className="bg-green-600">+{a.recommended_funding_adjustment}%</Badge>
                      ) : a.recommended_funding_adjustment < 0 ? (
                        <Badge variant="destructive">{a.recommended_funding_adjustment}%</Badge>
                      ) : (
                        <Badge variant="secondary">Hold</Badge>
                      )}
                      <span className="text-sm font-medium">Project {a.project_id?.slice(0, 8)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confidence: {a.execution_confidence_index}% · Risk-Adjusted: {a.risk_adjusted_score}
                    </p>
                    {a.rationale && <p className="text-xs mt-1 text-muted-foreground">{a.rationale}</p>}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(a.generated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No capital optimization advice generated yet</CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

import { useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useExecutionSnapshots, useTakeSnapshot, useExecutionRecommendations, useGenerateRecommendations, useDismissRecommendation } from "@/hooks/usePlatformExcellence";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Area } from "recharts";
import { Camera, Sparkles, AlertTriangle, Info, XCircle, TrendingUp, Clock } from "lucide-react";

export default function ExecutionTimelinePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [inputProjectId, setInputProjectId] = useState(projectId || "");
  const activeId = projectId || inputProjectId;

  const { data: snapshots = [], isLoading } = useExecutionSnapshots(activeId || undefined);
  const { data: recommendations = [] } = useExecutionRecommendations(activeId || undefined);
  const takeSnapshot = useTakeSnapshot();
  const generateRecs = useGenerateRecommendations();
  const dismissRec = useDismissRecommendation();

  const chartData = snapshots.map((s: any) => ({
    date: new Date(s.snapshot_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    milestone: Number(s.milestone_progress_percentage),
    funding: Number(s.funding_progress_percentage),
    dispute: s.dispute_status === "active" ? 1 : 0,
  }));

  const severityIcon = (sev: string) => {
    switch (sev) {
      case "critical": return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <MainLayout>
      <div className="container py-6 px-4 space-y-6 max-w-6xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Execution Timeline
            </h1>
            <p className="text-sm text-muted-foreground">Visual execution tracking & smart recommendations</p>
          </div>
          <div className="flex gap-2">
            {!projectId && (
              <Input
                placeholder="Enter project ID..."
                value={inputProjectId}
                onChange={(e) => setInputProjectId(e.target.value)}
                className="w-64"
              />
            )}
            <Button
              onClick={() => activeId && takeSnapshot.mutate(activeId)}
              disabled={!activeId || takeSnapshot.isPending}
              variant="outline"
              size="sm"
            >
              <Camera className="h-4 w-4 mr-1" />
              Snapshot
            </Button>
            <Button
              onClick={() => activeId && generateRecs.mutate(activeId)}
              disabled={!activeId || generateRecs.isPending}
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Analyze
            </Button>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            {recommendations.map((rec: any) => (
              <Card key={rec.id} className={`border-l-4 ${
                rec.severity === "critical" ? "border-l-destructive" :
                rec.severity === "warning" ? "border-l-warning" : "border-l-primary"
              }`}>
                <CardContent className="py-3 px-4 flex items-start gap-3">
                  {severityIcon(rec.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {rec.recommendation_type.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(rec.generated_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{rec.recommendation_text}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => dismissRec.mutate(rec.id)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No snapshots yet. Click "Snapshot" to start tracking.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="funding"
                    fill="hsl(var(--primary) / 0.1)"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Funding %"
                  />
                  <Line
                    type="monotone"
                    dataKey="milestone"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Milestone %"
                  />
                  <Bar
                    dataKey="dispute"
                    fill="hsl(var(--destructive) / 0.5)"
                    name="Dispute"
                    barSize={8}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Snapshot History */}
        {snapshots.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Snapshot History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {snapshots.slice().reverse().map((snap: any) => (
                  <div key={snap.id} className="flex items-center gap-4 p-3 rounded-lg border text-sm">
                    <span className="text-muted-foreground w-24 shrink-0">
                      {new Date(snap.snapshot_date).toLocaleDateString()}
                    </span>
                    <div className="flex gap-3 flex-wrap">
                      <Badge variant="outline">
                        Milestones: {Number(snap.milestone_progress_percentage).toFixed(0)}%
                      </Badge>
                      <Badge variant="outline">
                        Funding: {Number(snap.funding_progress_percentage).toFixed(0)}%
                      </Badge>
                      <Badge variant={snap.dispute_status === "active" ? "destructive" : "secondary"}>
                        Dispute: {snap.dispute_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

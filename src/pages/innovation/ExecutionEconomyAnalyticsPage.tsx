import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Activity, DollarSign } from "lucide-react";
import { getEconomyReports, REPORT_TYPES } from "@/lib/innovation/executionEconomyAnalytics";
import { toast } from "sonner";

export default function ExecutionEconomyAnalyticsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("");

  useEffect(() => { loadReports(); }, [reportType]);

  async function loadReports() {
    setLoading(true);
    try { setReports(await getEconomyReports(reportType ? { report_type: reportType } : undefined)); }
    catch { toast.error("Failed to load reports"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" /> Execution Economy Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Enterprise analytics for the global execution economy</p>
        </div>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Report Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {REPORT_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: reports.length, icon: BarChart3 },
          { label: "Productivity", value: reports.filter(r => r.report_type === "productivity").length, icon: TrendingUp },
          { label: "Capital Reports", value: reports.filter(r => r.report_type === "capital_efficiency").length, icon: DollarSign },
          { label: "Talent Reports", value: reports.filter(r => r.report_type === "talent_mobility").length, icon: Activity },
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
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="animate-pulse h-24" />)}</div>
      ) : reports.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No economy reports generated yet.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {reports.map(r => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge>{r.report_type?.replace("_", " ")}</Badge>
                      {r.region && <Badge variant="outline">{r.region}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{r.summary || "No summary available"}</p>
                    <p className="text-xs text-muted-foreground">Period: {r.period_start} — {r.period_end}</p>
                  </div>
                  {r.metrics && (
                    <div className="text-right text-xs space-y-1">
                      {Object.entries(r.metrics as Record<string, unknown>).slice(0, 3).map(([k, v]) => (
                        <p key={k}><span className="text-muted-foreground">{k}:</span> <span className="font-mono font-bold">{String(v)}</span></p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

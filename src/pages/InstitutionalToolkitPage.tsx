import { useBulkImportJobs } from "@/hooks/useInstitutionalExpansion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Download, FileText, Upload, Shield, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const INST_ID = "00000000-0000-0000-0000-000000000001";

const EXPORTS = [
  { icon: FileText, label: "Onboarding Materials", desc: "Download onboarding guide pack" },
  { icon: BarChart3, label: "Usage Reports", desc: "Export platform usage analytics" },
  { icon: Download, label: "Department Summary", desc: "Generate department performance report" },
  { icon: Shield, label: "Certification Stats", desc: "Download certification statistics" },
  { icon: Shield, label: "Compliance Snapshot", desc: "View current compliance status" },
];

export default function InstitutionalToolkitPage() {
  const { data: jobs = [] } = useBulkImportJobs(INST_ID);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          Institutional Toolkit
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Admin tools for institutional management and exports</p>
      </div>

      {/* Export Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" /> Export Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {EXPORTS.map((e) => (
              <div key={e.label} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <e.icon className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{e.label}</p>
                  <p className="text-[10px] text-muted-foreground">{e.desc}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => toast.info("Export will be generated and logged.")}
                >
                  Export
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Import Jobs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" /> Bulk Import Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No bulk import jobs recorded.</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {jobs.map((j: any) => (
                <div key={j.id} className="flex items-center justify-between p-2 rounded border border-border text-sm">
                  <div>
                    <span className="font-medium text-foreground">{j.processed_count}/{j.total_rows} rows</span>
                    {j.error_count > 0 && (
                      <span className="text-destructive ml-2">({j.error_count} errors)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={j.status === "completed" ? "default" : "secondary"}>{j.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(j.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

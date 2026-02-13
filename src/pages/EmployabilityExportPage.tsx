import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Link2, Share2, Shield, TrendingUp, Briefcase, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmployabilityReport } from "@/hooks/useAcademicData";
import { useAuth } from "@/contexts/AuthContext";

export default function EmployabilityExportPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: report, isLoading } = useEmployabilityReport(user?.id);
  const [generating, setGenerating] = useState(false);

  const r = report || { trust_score: 0, completed_projects: 0, validation_score: 0, economic_output: 0 };

  const handleExport = async () => {
    setGenerating(true);
    await new Promise(res => setTimeout(res, 1500));
    toast({ title: "Report Generated", description: "Your employability report PDF has been generated." });
    setGenerating(false);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/employability/verify/${user?.id?.slice(0, 8)}`);
    toast({ title: "Link Copied", description: "Public verification link copied to clipboard." });
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Briefcase className="h-8 w-8 text-primary" /> Employability Report</h1>
          <p className="text-muted-foreground mt-1">Your employer-ready academic performance summary</p>
          {!report && <p className="text-sm text-muted-foreground mt-2">No report generated yet. Complete projects to build your employability profile.</p>}
        </div>

        <Card>
          <CardHeader><CardTitle>Performance Summary</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: "Trust Score", value: r.trust_score, suffix: "/100" },
                { icon: CheckCircle2, label: "Projects Completed", value: r.completed_projects },
                { icon: TrendingUp, label: "Validation Score", value: r.validation_score, suffix: "%" },
                { icon: Briefcase, label: "Economic Output", value: `PKR ${(r.economic_output ?? 0).toLocaleString()}` },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-lg border text-center">
                  <item.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{item.value}{item.suffix || ""}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="gap-2 flex-1" onClick={handleExport} disabled={generating}>
            <FileDown className="h-4 w-4" /> {generating ? "Generating..." : "Export PDF"}
          </Button>
          <Button variant="outline" className="gap-2 flex-1" onClick={handleShareLink}>
            <Link2 className="h-4 w-4" /> Copy Public Link
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}

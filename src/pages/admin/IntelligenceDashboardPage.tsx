import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CapitalVelocityPanel } from "@/components/intelligence/CapitalVelocityPanel";
import { AnomalyAlertPanel } from "@/components/intelligence/AnomalyAlertPanel";
import { useIntelligenceScores, useComputeIntelligence } from "@/hooks/useIntelligence";
import { HealthBadge } from "@/components/fyp/HealthBadge";
import { Brain, RefreshCw, Activity, TrendingUp, Shield, Briefcase, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function IntelligenceDashboardPage() {
  const { toast } = useToast();
  const compute = useComputeIntelligence();
  const { data: dealScores } = useIntelligenceScores("deal_health");
  const { data: fundingScores } = useIntelligenceScores("funding_likelihood");
  const { data: hiringScores } = useIntelligenceScores("hiring_propensity");

  const greenDeals = dealScores?.filter(s => s.health_level === "green").length ?? 0;
  const yellowDeals = dealScores?.filter(s => s.health_level === "yellow").length ?? 0;
  const redDeals = dealScores?.filter(s => s.health_level === "red").length ?? 0;
  const totalDeals = dealScores?.length ?? 0;

  const highFunding = fundingScores?.filter(s => (s.scores as any).funding_probability >= 60).length ?? 0;
  const highHiring = hiringScores?.filter(s => (s.scores as any).hiring_propensity >= 60).length ?? 0;

  const runAll = async () => {
    try {
      await compute.mutateAsync("all");
      toast({ title: "Intelligence Computed", description: "All 7 engines updated." });
    } catch {
      toast({ title: "Error", description: "Failed to compute intelligence.", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            Intelligence Command Center
          </h1>
          <Button onClick={runAll} disabled={compute.isPending} size="sm">
            <RefreshCw className={`h-4 w-4 mr-1.5 ${compute.isPending ? "animate-spin" : ""}`} />
            {compute.isPending ? "Computing..." : "Run All Engines"}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <SummaryCard icon={Activity} label="Deal Health" value={`${greenDeals}/${totalDeals}`} sub="green" />
          <SummaryCard icon={Activity} label="At Risk" value={String(yellowDeals + redDeals)} sub="yellow+red" danger={yellowDeals + redDeals > 0} />
          <SummaryCard icon={TrendingUp} label="High Funding Prob" value={String(highFunding)} sub="≥60%" />
          <SummaryCard icon={Briefcase} label="Hire-Ready Sponsors" value={String(highHiring)} sub="≥60% propensity" />
          <SummaryCard icon={Shield} label="Engines Active" value="7" sub="all operational" />
        </div>

        {/* Deal Health Grid */}
        {totalDeals > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Active Deal Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {dealScores?.slice(0, 12).map(s => {
                  const level = s.health_level === "green" ? "healthy" : s.health_level === "red" ? "critical" : "at-risk";
                  return (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs">
                      <span className="truncate font-mono text-muted-foreground max-w-[120px]">{s.entity_id.slice(0, 8)}…</span>
                      <div className="flex items-center gap-2">
                        <span>{(s.scores as any).completion_probability}% comp</span>
                        <HealthBadge level={level} score={(s.scores as any).overall} showLabel={false} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Capital Velocity + Anomalies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CapitalVelocityPanel />
          <AnomalyAlertPanel />
        </div>
      </div>
    </AdminLayout>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, danger }: { icon: any; label: string; value: string; sub: string; danger?: boolean }) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <Icon className={`h-5 w-5 mx-auto mb-1 ${danger ? "text-destructive" : "text-primary"}`} />
        <p className={`text-xl font-bold ${danger ? "text-destructive" : ""}`}>{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <Badge variant="outline" className="text-[9px] mt-1">{sub}</Badge>
      </CardContent>
    </Card>
  );
}

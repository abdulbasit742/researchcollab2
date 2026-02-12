import { MainLayout } from "@/components/layout/MainLayout";
import { OpportunityScoreCard } from "@/components/opportunity/OpportunityScoreCard";
import { OpportunityTrajectory } from "@/components/opportunity/OpportunityTrajectory";
import { useOpportunityPipeline } from "@/hooks/useOpportunityGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Target, CheckCircle, Clock } from "lucide-react";

function PipelineCard() {
  const { data: pipeline, isLoading } = useOpportunityPipeline();

  const stats = [
    { label: "Active", value: pipeline?.active ?? 0, icon: Clock, color: "text-blue-500" },
    { label: "Applied", value: pipeline?.applied ?? 0, icon: Target, color: "text-amber-500" },
    { label: "Matched", value: pipeline?.matched ?? 0, icon: CheckCircle, color: "text-emerald-500" },
  ];

  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {pipeline?.topMatches && pipeline.topMatches.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Top Matches</p>
            {pipeline.topMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{match.title}</p>
                  <Badge variant="outline" className="text-[10px] mt-0.5">{match.opportunity_type}</Badge>
                </div>
                <span className="text-sm font-bold text-primary ml-2">{Math.round(match.composite_score)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No opportunities in pipeline yet. Your score will populate as matches are found.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function OpportunityDashboardPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Opportunity Dashboard</h1>
          <p className="text-muted-foreground text-sm">Your live opportunity score, pipeline, and trajectory.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <OpportunityScoreCard />
          <PipelineCard />
          <OpportunityTrajectory />
        </div>
      </div>
    </MainLayout>
  );
}

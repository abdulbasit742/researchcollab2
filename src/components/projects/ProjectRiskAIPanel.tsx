import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PROJECT_RISK_AI_INSIGHTS,
  getRiskAICategoryLabel,
  getRiskAICounts,
  getRiskAILevelClass,
  getRiskAIScore,
  getRiskAIStatusClass,
  getRiskAIStatusLabel,
  type RiskAIInsight,
} from "@/config/projectRiskAI";
import { AlertTriangle, Bot, CheckCircle2, ClipboardList, Lock, Sparkles, UserRoundCheck, type LucideIcon } from "lucide-react";

type ProjectRiskAIPanelProps = {
  insights?: RiskAIInsight[];
};

export function ProjectRiskAIPanel({ insights = PROJECT_RISK_AI_INSIGHTS }: ProjectRiskAIPanelProps) {
  const score = getRiskAIScore(insights);
  const counts = getRiskAICounts(insights);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Risk AI Score" value={`${score}%`} helper="Higher is safer" danger={score < 70} />
        <MetricCard label="Insights" value={counts.total.toString()} helper="Generated signals" />
        <MetricCard label="High Risk" value={counts.high.toString()} helper="Needs attention" danger={counts.high > 0} />
        <MetricCard label="Action Needed" value={counts.actionNeeded.toString()} helper="Open actions" danger={counts.actionNeeded > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Project Risk AI
              </CardTitle>
              <CardDescription>
                Summarize project risks from health, tasks, evidence gaps, comments, export blockers, and viva readiness.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Sparkles className="mr-2 h-4 w-4" /> Refresh AI Summary
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Create Action Plan
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Risk AI confidence score</span>
              <span>{score}%</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is read-only AI-style risk support. Real risk AI should use live project data, saved evidence, reviewer decisions, audit logs, and human approval before changing project status.
          </div>

          <div className="grid gap-4">
            {insights.map((insight) => (
              <RiskAIInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RiskAIInsightCard({ insight }: { insight: RiskAIInsight }) {
  const attention = insight.status === "action_needed" || insight.status === "blocked";

  return (
    <div className="space-y-4 rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getRiskAICategoryLabel(insight.category)}</Badge>
            <Badge className={getRiskAILevelClass(insight.level)}>{insight.level}</Badge>
            <Badge className={getRiskAIStatusClass(insight.status)}>{getRiskAIStatusLabel(insight.status)}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{insight.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{insight.summary}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-48">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserRoundCheck className="h-3 w-3" /> Owner
          </p>
          <p className="mt-1 font-semibold">{insight.owner}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Signals" icon={attention ? AlertTriangle : CheckCircle2} items={insight.signals} warning={attention} />
        <Checklist title="Recommended Actions" icon={ClipboardList} items={insight.recommendedActions} />
      </div>
    </div>
  );
}

function Checklist({ title, icon: Icon, items, warning = false }: { title: string; icon: LucideIcon; items: string[]; warning?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className={`h-4 w-4 ${warning ? "text-amber-500" : "text-primary"}`} /> {title}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-amber-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, BookOpen, Quote, FileText, Users, Sparkles, TrendingUp } from "lucide-react";
import type { ResearchLevel, ResearchMetrics } from "@/hooks/useResearchPapers";
import ReactMarkdown from "react-markdown";

const LEVEL_COLORS: Record<ResearchLevel, string> = {
  Beginner: "secondary",
  Emerging: "info",
  Intermediate: "warning",
  Advanced: "default",
  Expert: "success",
  Distinguished: "premium",
};

interface ResearchLevelCardProps {
  level: ResearchLevel;
  nextLevel: ResearchLevel | null;
  progress: number;
  score: number;
  metrics: ResearchMetrics;
  onGetImprovementPlan: () => Promise<any>;
  aiLoading: boolean;
}

export function ResearchLevelCard({
  level, nextLevel, progress, score, metrics, onGetImprovementPlan, aiLoading,
}: ResearchLevelCardProps) {
  const [plan, setPlan] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const handleGetPlan = async () => {
    setLoadingPlan(true);
    const result = await onGetImprovementPlan();
    if (result) {
      setPlan(typeof result === "string" ? result : result.plan || result.recommendations || JSON.stringify(result));
    }
    setLoadingPlan(false);
  };

  const metricItems = [
    { label: "Publications", value: metrics.publications, icon: FileText, weight: "30%" },
    { label: "Citations", value: metrics.citations, icon: Quote, weight: "25%" },
    { label: "h-index", value: metrics.hIndex, icon: TrendingUp, weight: "20%" },
    { label: "Papers Read", value: metrics.papersRead, icon: BookOpen, weight: "15%" },
    { label: "Peer Reviews", value: metrics.peerReviews, icon: Users, weight: "10%" },
  ];

  return (
    <Card variant="premium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Research Level
          </CardTitle>
          <Badge variant={(LEVEL_COLORS[level] as any) || "default"} className="text-sm">
            {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Score: {Math.round(score)}/100</span>
            {nextLevel && <span className="text-muted-foreground">Next: {nextLevel}</span>}
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>

        {/* Metrics breakdown */}
        <div className="grid grid-cols-2 gap-2">
          {metricItems.map((m) => (
            <div key={m.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
              <m.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{m.label}</span>
              <span className="ml-auto font-semibold">{m.value}</span>
            </div>
          ))}
        </div>

        {/* AI Improvement Plan */}
        <div>
          {!plan && (
            <Button
              onClick={handleGetPlan}
              disabled={loadingPlan || aiLoading}
              className="w-full gap-2"
              variant="outline"
            >
              <Sparkles className="h-4 w-4" />
              {loadingPlan ? "Generating Plan..." : "Get AI Improvement Plan"}
            </Button>
          )}
          {loadingPlan && (
            <div className="space-y-2 mt-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}
          {plan && !loadingPlan && (
            <div className="mt-3 p-3 rounded-lg bg-muted/50 border text-sm prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{plan}</ReactMarkdown>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useProjectSimilarity } from "@/hooks/useProjectSimilarity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function SimilarProjectsPanel({ projectId }: { projectId: string }) {
  const { data: similar = [], isLoading } = useProjectSimilarity(projectId);

  if (isLoading || similar.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          Similar Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {similar.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {s.similar_project_id.slice(0, 8)}...
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Progress value={s.similarity_score} className="h-1.5 w-16" />
              <span className="text-[10px] text-muted-foreground w-8 text-right">
                {Math.round(s.similarity_score)}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

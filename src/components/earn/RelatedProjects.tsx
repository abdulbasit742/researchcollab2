import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Clock } from "lucide-react";
import { EarningProject } from "@/hooks/useEarning";
import { formatPKRRange, formatPKR } from "@/lib/currency";

interface RelatedProjectsProps {
  currentProjectId: string;
  currentTags: string[];
  projects: EarningProject[];
}

export function RelatedProjects({ currentProjectId, currentTags, projects }: RelatedProjectsProps) {
  const navigate = useNavigate();

  const related = projects
    .filter((p) => p.id !== currentProjectId && p.status === "open")
    .map((p) => {
      const overlap = (p.tags || []).filter((t) =>
        currentTags.some((ct) => ct.toLowerCase() === t.toLowerCase())
      ).length;
      return { ...p, overlap };
    })
    .filter((p) => p.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Related Projects</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {related.map((project) => (
          <Card key={project.id} variant="interactive" className="cursor-pointer" onClick={() => navigate(`/earn/projects/${project.id}`)}>
            <CardContent className="p-3 sm:p-4 space-y-2">
              <h4 className="font-medium text-sm line-clamp-2">{project.title}</h4>
              <div className="flex flex-wrap gap-1">
                {(project.tags || []).slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {project.budget_min && project.budget_max
                    ? formatPKRRange(project.budget_min, project.budget_max)
                    : project.budget_min ? formatPKR(project.budget_min) : "TBD"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {project.deadline_days ? `${project.deadline_days}d` : "Flex"}
                </span>
              </div>
              <Button size="sm" variant="ghost" className="w-full mt-1 text-xs h-7">
                View <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

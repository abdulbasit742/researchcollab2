import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EarningProject } from "@/hooks/useEarning";
import { formatPKRRange, formatPKR } from "@/lib/currency";

interface RecommendedProjectsProps {
  projects: EarningProject[];
  userSkills?: string[];
}

export function RecommendedProjects({ projects, userSkills = [] }: RecommendedProjectsProps) {
  const navigate = useNavigate();

  // Simple keyword matching: score each project by overlap with user skills
  const scored = projects.map((p) => {
    const tags = (p.tags || []).map((t) => t.toLowerCase());
    const score = userSkills.reduce(
      (acc, skill) => acc + (tags.some((t) => t.includes(skill.toLowerCase()) || skill.toLowerCase().includes(t)) ? 1 : 0),
      0
    );
    return { ...p, score };
  });

  // Take top 3 by score, fallback to most recent
  const recommended = scored
    .sort((a, b) => b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  if (recommended.length === 0) return null;

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommended.map((project) => (
            <Card
              key={project.id}
              variant="interactive"
              className="cursor-pointer"
              onClick={() => navigate(`/earn/projects/${project.id}`)}
            >
              <CardContent className="p-3 sm:p-4">
                <h4 className="font-medium text-sm truncate mb-2">{project.title}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <DollarSign className="h-3 w-3 text-primary" />
                  {project.budget_min && project.budget_max
                    ? formatPKRRange(project.budget_min, project.budget_max)
                    : project.budget_min
                      ? formatPKR(project.budget_min)
                      : "TBD"}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(project.tags || []).slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, DollarSign, Clock, Users, ArrowRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EarningProject } from "@/hooks/useEarning";
import { formatPKRRange, formatPKR } from "@/lib/currency";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface SavedProjectsTabProps {
  projects: EarningProject[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
}

export function SavedProjectsTab({ projects, savedIds, onToggleSave }: SavedProjectsTabProps) {
  const navigate = useNavigate();
  const savedProjects = projects.filter((p) => savedIds.includes(p.id));

  if (savedProjects.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 md:p-12 text-center">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Saved Projects</h3>
          <p className="text-muted-foreground mb-6">
            Bookmark projects you're interested in to find them here later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {savedProjects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card variant="interactive">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle
                    className="text-lg cursor-pointer hover:text-primary transition-colors truncate"
                    onClick={() => navigate(`/earn/projects/${project.id}`)}
                  >
                    {project.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleSave(project.id)}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-semibold">
                    {project.budget_min && project.budget_max
                      ? formatPKRRange(project.budget_min, project.budget_max)
                      : project.budget_min
                        ? formatPKR(project.budget_min)
                        : "Budget TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{project.deadline_days ? `${project.deadline_days} days` : "Flexible"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{project.bid_count || 0} bids</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button size="sm" onClick={() => navigate(`/earn/projects/${project.id}#bid`)}>
                Place Bid <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

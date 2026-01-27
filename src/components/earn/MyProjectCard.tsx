import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, Users, Eye, Pencil, X, RotateCcw, Loader2 } from "lucide-react";
import { formatPKRRange, formatPKR } from "@/lib/currency";
import { formatDistanceToNow } from "date-fns";
import { EarningProject, useUpdateProjectStatus } from "@/hooks/useEarning";

interface MyProjectCardProps {
  project: EarningProject;
  index: number;
  onEdit: (project: EarningProject) => void;
  onStatusChange: () => void;
}

const statusColors: Record<string, "success" | "secondary" | "default" | "outline"> = {
  open: "success",
  in_progress: "default",
  closed: "secondary",
  completed: "outline",
};

export function MyProjectCard({ project, index, onEdit, onStatusChange }: MyProjectCardProps) {
  const navigate = useNavigate();
  const { updateStatus, updating } = useUpdateProjectStatus();

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const formatDeadline = (days: number | null) => {
    if (!days) return "Flexible";
    return `${days} days`;
  };

  const handleToggleStatus = async () => {
    const newStatus = project.status === "open" ? "closed" : "open";
    const result = await updateStatus(project.id, newStatus);
    if (result.success) {
      onStatusChange();
    }
  };

  const status = project.status || "open";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card variant="interactive">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle 
                className="text-lg md:text-xl cursor-pointer hover:text-primary transition-colors truncate"
                onClick={() => navigate(`/earn/projects/${project.id}`)}
              >
                {project.title}
              </CardTitle>
              <CardDescription className="mt-1">
                Posted {formatTimeAgo(project.created_at)}
              </CardDescription>
            </div>
            <Badge 
              variant={statusColors[status] || "secondary"}
              className="self-start shrink-0 capitalize"
            >
              {status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap gap-4 md:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold">
                {project.budget_min && project.budget_max 
                  ? formatPKRRange(project.budget_min, project.budget_max)
                  : project.budget_min 
                    ? formatPKR(project.budget_min)
                    : "Budget TBD"
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Deadline: {formatDeadline(project.deadline_days)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium">{project.bid_count || 0} bids received</span>
            </div>
          </div>

          {(project.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {(project.tags || []).slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {(project.tags || []).length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{(project.tags || []).length - 4} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 pt-0">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate(`/earn/projects/${project.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Bids
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant={status === "open" ? "secondary" : "default"}
            size="sm"
            onClick={handleToggleStatus}
            disabled={updating}
          >
            {updating ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : status === "open" ? (
              <X className="h-4 w-4 mr-1" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-1" />
            )}
            {status === "open" ? "Close" : "Reopen"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
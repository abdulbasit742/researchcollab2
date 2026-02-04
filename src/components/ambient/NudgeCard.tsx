import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ExternalLink, 
  Lightbulb, 
  AlertTriangle, 
  Users, 
  TrendingDown,
  Clock,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";

export interface Nudge {
  id: string;
  type: "insight" | "alert" | "entropy" | "deal_risk";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action_url?: string;
  data?: unknown;
}

interface NudgeCardProps {
  nudge: Nudge;
  onDismiss?: (id: string) => void;
  onAction?: (nudge: Nudge) => void;
  compact?: boolean;
  className?: string;
}

const typeConfig = {
  insight: {
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Insight",
  },
  alert: {
    icon: Target,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Opportunity",
  },
  entropy: {
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    label: "Connection",
  },
  deal_risk: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "Risk Alert",
  },
};

const priorityConfig = {
  high: { color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
  medium: { color: "bg-warning text-warning-foreground", icon: Clock },
  low: { color: "bg-muted text-muted-foreground", icon: null },
};

export function NudgeCard({ nudge, onDismiss, onAction, compact = false, className }: NudgeCardProps) {
  const config = typeConfig[nudge.type];
  const priorityStyle = priorityConfig[nudge.priority];
  const Icon = config.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border",
          config.bg,
          config.border,
          className
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", config.color)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{nudge.title}</p>
        </div>
        {nudge.action_url && (
          <Link to={nudge.action_url}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-50 hover:opacity-100"
            onClick={() => onDismiss(nudge.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all hover:shadow-md",
        config.bg,
        config.border,
        className
      )}
    >
      {/* Priority indicator */}
      {nudge.priority === "high" && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full m-2 animate-pulse" />
      )}

      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", config.bg)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
            {nudge.priority !== "low" && (
              <Badge className={cn("text-xs", priorityStyle.color)}>
                {nudge.priority === "high" ? "Urgent" : "Important"}
              </Badge>
            )}
          </div>

          <h4 className="font-semibold text-sm mb-1">{nudge.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {nudge.description}
          </p>

          <div className="flex items-center gap-2 mt-3">
            {nudge.action_url && (
              <Link to={nudge.action_url}>
                <Button size="sm" variant="default" className="h-7 text-xs">
                  View Details
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
            {onAction && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onAction(nudge)}
              >
                Take Action
              </Button>
            )}
          </div>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-50 hover:opacity-100 shrink-0"
            onClick={() => onDismiss(nudge.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// Nudge list component
interface NudgeListProps {
  nudges: Nudge[];
  onDismiss?: (id: string) => void;
  onAction?: (nudge: Nudge) => void;
  compact?: boolean;
  maxVisible?: number;
  className?: string;
}

export function NudgeList({ 
  nudges, 
  onDismiss, 
  onAction, 
  compact = false, 
  maxVisible = 5,
  className 
}: NudgeListProps) {
  const visibleNudges = nudges.slice(0, maxVisible);
  const hiddenCount = nudges.length - maxVisible;

  return (
    <div className={cn("space-y-2", className)}>
      {visibleNudges.map((nudge) => (
        <NudgeCard
          key={nudge.id}
          nudge={nudge}
          onDismiss={onDismiss}
          onAction={onAction}
          compact={compact}
        />
      ))}
      {hiddenCount > 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          +{hiddenCount} more nudges
        </p>
      )}
    </div>
  );
}

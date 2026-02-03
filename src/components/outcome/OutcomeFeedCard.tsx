import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/currency";
import {
  Briefcase,
  Award,
  FileText,
  Users,
  Building,
  CheckCircle,
  Target,
  Shield,
  Star,
  DollarSign,
  ArrowRight,
  Microscope,
  Database,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEM_TYPE_CONFIG: Record<string, { 
  icon: React.ElementType; 
  bgColor: string; 
  textColor: string;
  label: string;
  actionLabel?: string;
  actionPath?: string;
}> = {
  project_posted: { 
    icon: Briefcase, 
    bgColor: "bg-blue-500/10", 
    textColor: "text-blue-600 dark:text-blue-400",
    label: "New Project",
    actionLabel: "View Project",
    actionPath: "/offers"
  },
  project_completed: { 
    icon: CheckCircle, 
    bgColor: "bg-green-500/10", 
    textColor: "text-green-600 dark:text-green-400",
    label: "Project Completed"
  },
  grant_opportunity: { 
    icon: Award, 
    bgColor: "bg-amber-500/10", 
    textColor: "text-amber-600 dark:text-amber-400",
    label: "Grant Opportunity",
    actionLabel: "Apply",
    actionPath: "/grants"
  },
  collaboration_request: { 
    icon: Users, 
    bgColor: "bg-purple-500/10", 
    textColor: "text-purple-600 dark:text-purple-400",
    label: "Collaboration Request",
    actionLabel: "Connect"
  },
  publication: { 
    icon: FileText, 
    bgColor: "bg-primary/10", 
    textColor: "text-primary",
    label: "Publication"
  },
  dataset_released: { 
    icon: Database, 
    bgColor: "bg-cyan-500/10", 
    textColor: "text-cyan-600 dark:text-cyan-400",
    label: "Dataset Released"
  },
  institution_announcement: { 
    icon: Building, 
    bgColor: "bg-orange-500/10", 
    textColor: "text-orange-600 dark:text-orange-400",
    label: "Institution Announcement"
  },
  verification_earned: { 
    icon: Shield, 
    bgColor: "bg-emerald-500/10", 
    textColor: "text-emerald-600 dark:text-emerald-400",
    label: "Verification Earned"
  },
  milestone_completed: { 
    icon: Star, 
    bgColor: "bg-yellow-500/10", 
    textColor: "text-yellow-600 dark:text-yellow-400",
    label: "Milestone Completed"
  },
  trust_score_change: {
    icon: Target,
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-600 dark:text-indigo-400",
    label: "Trust Update"
  },
  grant_won: {
    icon: GraduationCap,
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
    label: "Grant Awarded"
  },
  research_output: {
    icon: Microscope,
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-600 dark:text-rose-400",
    label: "Research Output"
  },
};

interface OutcomeFeedItem {
  id: string;
  item_type: string;
  actor_id: string | null;
  actor_type: string;
  target_id: string | null;
  target_type: string | null;
  title: string;
  summary: string | null;
  proof_reference: unknown;
  visibility: string;
  relevance_tags: string[];
  is_verified: boolean;
  engagement_disabled: boolean;
  created_at: string;
  actor_name?: string;
  value_amount?: number;
}

interface OutcomeFeedCardProps {
  item: OutcomeFeedItem;
}

export function OutcomeFeedCard({ item }: OutcomeFeedCardProps) {
  const config = ITEM_TYPE_CONFIG[item.item_type] || {
    icon: Target,
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    label: item.item_type.replace(/_/g, " "),
  };
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-md hover:border-primary/20 transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn("p-3 rounded-xl shrink-0", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.textColor)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className={cn("text-xs", config.bgColor, config.textColor)}>
                    {config.label}
                  </Badge>
                  {item.is_verified && (
                    <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30 bg-primary/5">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </span>
              </div>

              {/* Title */}
              <h4 className="font-semibold text-base leading-snug">
                {item.title}
              </h4>

              {/* Summary */}
              {item.summary && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.summary}
                </p>
              )}

              {/* Value Amount */}
              {item.value_amount && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <DollarSign className="h-4 w-4" />
                  {formatPKR(item.value_amount)}
                </div>
              )}

              {/* Tags */}
              {item.relevance_tags && item.relevance_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.relevance_tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.relevance_tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.relevance_tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Footer - Actor & Action */}
              <div className="flex items-center justify-between pt-1">
                {item.actor_name && (
                  <Link 
                    to={`/u/${item.actor_id}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {item.actor_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{item.actor_name}</span>
                  </Link>
                )}

                {"actionLabel" in config && "actionPath" in config && config.actionLabel && config.actionPath && (
                  <Button variant="ghost" size="sm" asChild className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={config.actionPath}>
                      {config.actionLabel}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function OutcomeFeedSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
            </div>
            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyOutcomeFeed() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <Target className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No opportunities match your profile</h3>
        <p className="text-sm text-muted-foreground mb-2 max-w-sm mx-auto">
          Projects, grants, and collaborations appear here based on your skills.
        </p>
        <p className="text-xs text-muted-foreground/70 italic mb-4">
          Complete your profile to improve matching.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild size="sm">
            <Link to="/offers">Browse All</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile">Update Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Briefcase,
  CheckCircle,
  ExternalLink,
  FileText,
  Flag,
  Handshake,
  Microscope,
  MoreHorizontal,
  Shield,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Professional update types - outcome-focused, not social
type UpdateType =
  | "project_completed"
  | "project_started"
  | "milestone_achieved"
  | "deal_closed"
  | "trust_update"
  | "verification_earned"
  | "collaboration_started"
  | "research_published";

interface ProfessionalUpdate {
  id: string;
  type: UpdateType;
  author: {
    id: string;
    name: string;
    role?: string;
    institution?: string;
    trustScore?: number;
    isVerified?: boolean;
  };
  title: string;
  description?: string;
  metadata?: {
    projectId?: string;
    escrowAmount?: number;
    trustChange?: number;
    collaborators?: string[];
    outcomeType?: string;
  };
  createdAt: string;
}

const updateTypeConfig: Record<UpdateType, {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
}> = {
  project_completed: {
    icon: CheckCircle,
    label: "Project Completed",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  project_started: {
    icon: Target,
    label: "Project Started",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  milestone_achieved: {
    icon: Flag,
    label: "Milestone Achieved",
    color: "text-violet-600",
    bgColor: "bg-violet-500/10",
  },
  deal_closed: {
    icon: Handshake,
    label: "Deal Closed",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  trust_update: {
    icon: TrendingUp,
    label: "Trust Updated",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  verification_earned: {
    icon: Shield,
    label: "Verification Earned",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  collaboration_started: {
    icon: Users,
    label: "Collaboration Started",
    color: "text-pink-600",
    bgColor: "bg-pink-500/10",
  },
  research_published: {
    icon: Microscope,
    label: "Research Published",
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
  },
};

interface ProfessionalUpdateCardProps {
  update: ProfessionalUpdate;
  onReport?: () => void;
}

export function ProfessionalUpdateCard({ update, onReport }: ProfessionalUpdateCardProps) {
  const config = updateTypeConfig[update.type];
  const UpdateIcon = config.icon;

  const initials = update.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Author Info */}
          <div className="flex items-start gap-3 min-w-0">
            <Link to={`/u/${update.author.id}`}>
              <Avatar className="h-10 w-10 ring-2 ring-background hover:ring-primary/20 transition-all">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/u/${update.author.id}`}
                  className="font-semibold text-sm hover:text-primary transition-colors truncate"
                >
                  {update.author.name}
                </Link>
                {update.author.isVerified && (
                  <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
                {update.author.trustScore && (
                  <Badge variant="outline" className="text-[10px] gap-0.5 shrink-0">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {update.author.trustScore}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {update.author.institution && (
                  <>
                    <span className="truncate">{update.author.institution}</span>
                    <span>•</span>
                  </>
                )}
                <span>{formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Update Type Badge */}
          <Badge className={cn("shrink-0 text-[10px] gap-1", config.bgColor, config.color)}>
            <UpdateIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {/* Update Title */}
        <p className="font-medium text-sm">{update.title}</p>

        {/* Description if present */}
        {update.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {update.description}
          </p>
        )}

        {/* Metadata - Outcome-focused details */}
        {update.metadata && (
          <div className="flex flex-wrap gap-2 pt-1">
            {update.metadata.escrowAmount && (
              <Badge variant="secondary" className="text-xs">
                PKR {update.metadata.escrowAmount.toLocaleString()} handled
              </Badge>
            )}
            {update.metadata.trustChange && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  update.metadata.trustChange > 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {update.metadata.trustChange > 0 ? "+" : ""}
                {update.metadata.trustChange} trust
              </Badge>
            )}
            {update.metadata.collaborators && update.metadata.collaborators.length > 0 && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Users className="h-3 w-3" />
                {update.metadata.collaborators.length} collaborator{update.metadata.collaborators.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-3">
        <div className="w-full flex items-center justify-between">
          {/* Context Link */}
          {update.metadata?.projectId && (
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
              <Link to={`/deals/${update.metadata.projectId}`}>
                <Briefcase className="h-3.5 w-3.5" />
                View Project
              </Link>
            </Button>
          )}

          {/* Actions */}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/u/${update.author.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                {onReport && (
                  <DropdownMenuItem onClick={onReport}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

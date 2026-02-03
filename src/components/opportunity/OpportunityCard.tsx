import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  Briefcase,
  Award,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  Shield,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatPKR } from "@/lib/currency";
import type { Opportunity } from "@/hooks/useOpportunityEngine";

interface OpportunityCardProps {
  opportunity: Opportunity;
  showMatchReason?: boolean;
}

export function OpportunityCard({ opportunity, showMatchReason = true }: OpportunityCardProps) {
  const getTypeIcon = () => {
    switch (opportunity.type) {
      case "project":
        return <Briefcase className="h-4 w-4" />;
      case "grant":
        return <Award className="h-4 w-4" />;
      case "collaboration":
        return <Users className="h-4 w-4" />;
      case "institutional":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (opportunity.type) {
      case "project":
        return "Project";
      case "grant":
        return "Grant";
      case "collaboration":
        return "Collaboration";
      case "institutional":
        return "Institutional";
      default:
        return "Opportunity";
    }
  };

  const formatBudget = () => {
    if (!opportunity.budget_min && !opportunity.budget_max) return null;
    if (opportunity.budget_min === opportunity.budget_max) {
      return formatPKR(opportunity.budget_min || 0);
    }
    if (opportunity.budget_min && opportunity.budget_max) {
      return `${formatPKR(opportunity.budget_min)} - ${formatPKR(opportunity.budget_max)}`;
    }
    if (opportunity.budget_max) {
      return `Up to ${formatPKR(opportunity.budget_max)}`;
    }
    return `From ${formatPKR(opportunity.budget_min || 0)}`;
  };

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {opportunity.owner_name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link
                to={`/earn/projects/${opportunity.id}`}
                className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2"
              >
                {opportunity.title}
              </Link>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{opportunity.owner_name || "Unknown"}</span>
                {opportunity.owner_university && (
                  <>
                    <span>·</span>
                    <span className="truncate">{opportunity.owner_university}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
            {getTypeIcon()}
            {getTypeLabel()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-0 space-y-3">
        {opportunity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {opportunity.description}
          </p>
        )}

        {/* Match Reason - Clear explanation */}
        {showMatchReason && opportunity.match_reason && (
          <div className="flex items-start gap-2 text-xs bg-primary/5 rounded-md px-2.5 py-2">
            <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">Match:</span> {opportunity.match_reason}
            </span>
          </div>
        )}

        {/* Tags */}
        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {opportunity.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
            {opportunity.tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{opportunity.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata - Clean layout */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {formatBudget() && (
            <span className="font-medium text-foreground">{formatBudget()}</span>
          )}
          {opportunity.deadline_days && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {opportunity.deadline_days}d
            </span>
          )}
          <span>
            {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link to={`/earn/projects/${opportunity.id}`}>
            View Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DollarSign,
  Clock,
  MapPin,
  Briefcase,
  Award,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
        return "Paid Project";
      case "grant":
        return "Grant";
      case "collaboration":
        return "Collaboration";
      case "institutional":
        return "Institution Request";
      default:
        return "Opportunity";
    }
  };

  const formatBudget = () => {
    if (!opportunity.budget_min && !opportunity.budget_max) return null;
    if (opportunity.budget_min === opportunity.budget_max) {
      return `PKR ${opportunity.budget_min?.toLocaleString()}`;
    }
    if (opportunity.budget_min && opportunity.budget_max) {
      return `PKR ${opportunity.budget_min?.toLocaleString()} - ${opportunity.budget_max?.toLocaleString()}`;
    }
    if (opportunity.budget_max) {
      return `Up to PKR ${opportunity.budget_max?.toLocaleString()}`;
    }
    return `From PKR ${opportunity.budget_min?.toLocaleString()}`;
  };

  const hasMatchReason = showMatchReason && opportunity.match_reason;

  return (
    <Card className="group hover:border-primary/50 transition-colors">
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
                    <span>•</span>
                    <span className="truncate">{opportunity.owner_university}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 gap-1">
            {getTypeIcon()}
            {getTypeLabel()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-0">
        {opportunity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {opportunity.description}
          </p>
        )}

        {/* Match Reason */}
        {hasMatchReason && (
          <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 rounded-md px-2 py-1.5 mb-3">
            <Sparkles className="h-3 w-3" />
            <span className="font-medium">Why you're seeing this:</span>
            <span>{opportunity.match_reason}</span>
          </div>
        )}

        {/* Tags */}
        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {opportunity.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {opportunity.tags.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{opportunity.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {formatBudget() && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium text-foreground">{formatBudget()}</span>
            </div>
          )}
          {opportunity.deadline_days && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{opportunity.deadline_days} days</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>Posted {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button asChild size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
          <Link to={`/earn/projects/${opportunity.id}`}>
            View Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Award,
  Users,
  Building,
  DollarSign,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Shield,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Opportunity } from "@/hooks/useOpportunityEngine";

interface OpportunityMatchCardProps {
  opportunity: Opportunity;
  showMatchReason?: boolean;
}

const typeConfig = {
  project: { icon: Briefcase, color: "bg-blue-500/10 text-blue-600", label: "Project" },
  grant: { icon: Award, color: "bg-amber-500/10 text-amber-600", label: "Grant" },
  collaboration: { icon: Users, color: "bg-purple-500/10 text-purple-600", label: "Collaboration" },
  institutional: { icon: Building, color: "bg-emerald-500/10 text-emerald-600", label: "Institutional" },
};

export function OpportunityMatchCard({
  opportunity,
  showMatchReason = true,
}: OpportunityMatchCardProps) {
  const config = typeConfig[opportunity.type] || typeConfig.project;
  const Icon = config.icon;

  const budget = opportunity.budget_min && opportunity.budget_max
    ? `${opportunity.budget_min.toLocaleString()} - ${opportunity.budget_max.toLocaleString()}`
    : opportunity.budget_min
    ? `From ${opportunity.budget_min.toLocaleString()}`
    : opportunity.budget_max
    ? `Up to ${opportunity.budget_max.toLocaleString()}`
    : null;

  return (
    <Link to={`/offers/${opportunity.id}`}>
      <Card className="hover:border-primary/50 hover:shadow-md transition-all group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`p-2.5 rounded-xl shrink-0 ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header Badges */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant="secondary" className={`text-[10px] ${config.color}`}>
                  {config.label}
                </Badge>
                {opportunity.owner_university && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Building className="h-2.5 w-2.5" />
                    {opportunity.owner_university}
                  </span>
                )}
                {(opportunity.match_score ?? 0) > 30 && (
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30 gap-0.5">
                    <Sparkles className="h-2.5 w-2.5" />
                    Match
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {opportunity.title}
              </h3>

              {/* Description */}
              {opportunity.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {opportunity.description}
                </p>
              )}

              {/* Match Reason */}
              {showMatchReason && opportunity.match_reason && (
                <div className="flex items-center gap-1 text-[11px] text-primary/80 mb-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>{opportunity.match_reason}</span>
                </div>
              )}

              {/* Tags */}
              {opportunity.tags && opportunity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {opportunity.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                  {opportunity.tags.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{opportunity.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {budget && (
                    <span className="flex items-center gap-0.5 font-medium text-foreground">
                      <DollarSign className="h-3 w-3" />
                      {budget}
                    </span>
                  )}
                  {opportunity.deadline_days && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {opportunity.deadline_days} days
                    </span>
                  )}
                  <span className="flex items-center gap-0.5">
                    {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOpportunityEngine } from "@/hooks/useOpportunityEngine";
import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  DollarSign,
  Info,
} from "lucide-react";
import { formatPKR } from "@/lib/currency";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function OpportunitySuggestions() {
  const { user } = useAuth();
  const { data: opportunities, isLoading: loading } = useOpportunityEngine();

  if (!user) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Opportunities For You
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to get personalized opportunity recommendations based on your skills and trust
            score.
          </p>
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link to="/auth">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Opportunities For You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const displayedOpportunities = opportunities?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Opportunities For You
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {displayedOpportunities.length === 0 ? (
          <div className="text-center py-4">
            <Target className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No opportunities match your profile yet.
            </p>
            <Button asChild size="sm" variant="link" className="mt-1">
              <Link to="/profile">Complete Your Profile</Link>
            </Button>
          </div>
        ) : (
          <>
            {displayedOpportunities.map((opp: any) => (
              <Link
                key={opp.id}
                to={`/offers/${opp.id}`}
                className="block p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {opp.title}
                  </h4>
                  {opp.match_score && opp.match_score > 0 && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-[10px] gap-1"
                        >
                          {Math.round(opp.match_score)}%
                          <Info className="h-2.5 w-2.5" />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p className="text-xs font-medium mb-1">Why this match?</p>
                        <ul className="text-xs space-y-0.5">
                          <li>• Skills overlap: {opp.match_reason || "Good"}</li>
                          <li>• Trust compatibility: High</li>
                          <li>• Budget fits your tier</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {opp.budget_max && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatPKR(opp.budget_max)}
                    </span>
                  )}
                  {opp.deadline_days && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {opp.deadline_days} days
                    </span>
                  )}
                </div>
              </Link>
            ))}

            <Button asChild variant="ghost" size="sm" className="w-full gap-1 mt-2">
              <Link to="/offers">
                View All Opportunities
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

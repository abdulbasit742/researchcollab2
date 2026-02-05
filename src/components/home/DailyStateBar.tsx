import { Badge } from "@/components/ui/badge";
import { TrendingUp, Briefcase, Clock, ArrowRight } from "lucide-react";
import { WhyTooltip } from "@/components/ui/why-tooltip";

interface DailyStateBarProps {
  trustScore: number;
  activeDeals: number;
  pendingActions: number;
  loading?: boolean;
}

/**
 * System 71: The Single Daily Loop - Step 1
 * "Here is your current professional state"
 */
export function DailyStateBar({ 
  trustScore, 
  activeDeals, 
  pendingActions,
  loading = false 
}: DailyStateBarProps) {
  if (loading) {
    return (
      <div className="h-10 bg-muted/30 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border rounded-lg px-4 py-2">
      <div className="flex items-center gap-6">
        {/* Trust Score */}
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Trust: {trustScore}</span>
          <WhyTooltip 
            why="Your trust score reflects your professional reliability."
            problem="Higher trust = better opportunities and faster deals."
            ignoreConsequence="Lower visibility in matching and reduced access to premium work."
          />
        </div>

        {/* Active Deals */}
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {activeDeals} active {activeDeals === 1 ? 'deal' : 'deals'}
          </span>
        </div>

        {/* Pending Actions */}
        {pendingActions > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {pendingActions} pending
          </Badge>
        )}
      </div>

      {/* Quick Action Hint */}
      {pendingActions > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Action needed</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}

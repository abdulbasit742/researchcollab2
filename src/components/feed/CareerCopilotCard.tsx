import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCareerCopilot, CareerInsight } from "@/hooks/useCareerCopilot";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Target,
  Lightbulb,
  ChevronRight,
  Zap,
} from "lucide-react";

export function CareerCopilotCard() {
  const { user, profile } = useAuth();
  const { trustProfile } = useMyTrustProfile();
  const { getWeeklyInsights, loading } = useCareerCopilot();
  const [insights, setInsights] = useState<CareerInsight[] | null>(null);

  if (!user) {
    return null;
  }

  // Calculate next best action based on profile state
  const getNextAction = () => {
    const trustScore = trustProfile?.trust_score ?? 0;
    const projectsCompleted = trustProfile?.total_projects_completed ?? 0;
    const isVerified =
      trustProfile?.is_verified_student ||
      trustProfile?.is_verified_researcher ||
      trustProfile?.is_verified_partner;

    if (!profile?.full_name) {
      return {
        icon: Target,
        title: "Complete your profile",
        description: "Add your name, skills, and bio to get discovered",
        href: "/profile",
        priority: "high" as const,
      };
    }

    if (!isVerified) {
      return {
        icon: AlertTriangle,
        title: "Get verified",
        description: "Verification unlocks higher-value opportunities",
        href: "/verification",
        priority: "high" as const,
      };
    }

    if (projectsCompleted === 0) {
      return {
        icon: Target,
        title: "Complete your first project",
        description: "Build trust by delivering on your first opportunity",
        href: "/offers",
        priority: "medium" as const,
      };
    }

    if (trustScore < 50) {
      return {
        icon: TrendingUp,
        title: "Grow your trust score",
        description: "Complete projects on time to unlock better deals",
        href: "/progress",
        priority: "medium" as const,
      };
    }

    return {
      icon: Zap,
      title: "You're doing great",
      description: "Check your career progress for insights",
      href: "/progress",
      priority: "low" as const,
    };
  };

  const nextAction = getNextAction();
  const NextIcon = nextAction.icon;

  const priorityStyles = {
    high: "border-amber-500/50 bg-amber-500/5",
    medium: "border-primary/50 bg-primary/5",
    low: "border-emerald-500/50 bg-emerald-500/5",
  };

  const iconStyles = {
    high: "bg-amber-500/10 text-amber-600",
    medium: "bg-primary/10 text-primary",
    low: "bg-emerald-500/10 text-emerald-600",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Career Co-pilot
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Next Best Action */}
        <div className={`p-3 rounded-lg border ${priorityStyles[nextAction.priority]}`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${iconStyles[nextAction.priority]}`}>
              <NextIcon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-medium text-sm">{nextAction.title}</h4>
                {nextAction.priority === "high" && (
                  <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-600">
                    Priority
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{nextAction.description}</p>
              <Button asChild size="sm" variant="ghost" className="h-7 px-2 gap-1 -ml-2">
                <Link to={nextAction.href}>
                  Take Action
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50 text-xs">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-muted-foreground">
              Professionals who complete 3+ projects earn 2.5x more
            </span>
          </div>
        </div>

        {/* View Full Dashboard */}
        <Button asChild variant="outline" size="sm" className="w-full gap-1">
          <Link to="/progress">
            View Career Dashboard
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

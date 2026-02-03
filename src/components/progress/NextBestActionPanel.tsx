import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useProgressDashboard } from "@/hooks/useProgressDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Shield,
  Briefcase,
  DollarSign,
  Zap,
} from "lucide-react";

interface NextAction {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  type: "trust" | "opportunity" | "economic" | "skill" | "verification";
  title: string;
  description: string;
  impact: string;
  actionLabel: string;
  actionHref: string;
  progress?: number;
  estimatedTime?: string;
}

export function NextBestActionPanel() {
  const { profile } = useAuth();
  const { trustProfile, loading: trustLoading } = useMyTrustProfile();
  const { data: progressData, isLoading: progressLoading } = useProgressDashboard();
  const [actions, setActions] = useState<NextAction[]>([]);

  useEffect(() => {
    if (!trustLoading && !progressLoading) {
      generateActions();
    }
  }, [trustProfile, progressData, trustLoading, progressLoading]);

  const generateActions = () => {
    const generatedActions: NextAction[] = [];
    const trustScore = trustProfile?.trust_score || 0;
    const isVerified = trustProfile?.is_verified_student || trustProfile?.is_verified_researcher;
    const projectsCompleted = trustProfile?.total_projects_completed || 0;
    const totalEarned = progressData?.economicOutcomes.totalEarned || 0;

    // Critical: Get verified if not
    if (!isVerified) {
      generatedActions.push({
        id: "verify",
        priority: "critical",
        type: "verification",
        title: "Get Verified",
        description: "Verified users get 3x more opportunities and higher trust scores.",
        impact: "+15 trust score, unlock premium opportunities",
        actionLabel: "Start Verification",
        actionHref: "/verification",
        estimatedTime: "5 minutes",
      });
    }

    // High: Low trust score needs work
    if (trustScore < 30 && projectsCompleted === 0) {
      generatedActions.push({
        id: "first-project",
        priority: "high",
        type: "trust",
        title: "Complete Your First Project",
        description: "Your trust score is low. Complete one verified project to build credibility.",
        impact: "+10-20 trust score, unlock higher-value deals",
        actionLabel: "Find Projects",
        actionHref: "/offers",
        estimatedTime: "1-2 weeks",
      });
    }

    // Trust plateaued
    if (trustScore > 30 && trustScore < 60 && progressData?.trustTrajectory.trend === "stable") {
      generatedActions.push({
        id: "plateau",
        priority: "medium",
        type: "trust",
        title: "Your Trust Plateaued",
        description: "Your trust score hasn't changed in 30 days. Activity drives trust growth.",
        impact: "Break the plateau, reach Silver/Gold tier",
        actionLabel: "View Opportunities",
        actionHref: "/opportunities",
        progress: (trustScore / 60) * 100,
      });
    }

    // Low response rate
    if (trustProfile?.response_time_hours && trustProfile.response_time_hours > 48) {
      generatedActions.push({
        id: "response",
        priority: "medium",
        type: "opportunity",
        title: "Respond Faster",
        description: "Your average response time is over 48 hours. Fast responders win 22% more deals.",
        impact: "Improve win rate by 22%",
        actionLabel: "Check Messages",
        actionHref: "/messages",
      });
    }

    // Underpricing warning
    if (projectsCompleted > 2 && trustProfile?.successful_rate && trustProfile.successful_rate > 80) {
      const avgValue = progressData?.economicOutcomes.averageProjectValue || 0;
      if (avgValue < 5000) {
        generatedActions.push({
          id: "pricing",
          priority: "medium",
          type: "economic",
          title: "You May Be Underpricing",
          description: `Your success rate is ${trustProfile.successful_rate}% but average project value is low.`,
          impact: "Increase earnings by 40-60%",
          actionLabel: "Review Pricing Guide",
          actionHref: "/help",
        });
      }
    }

    // Skills gap
    if (progressData?.skillMomentum.provenSkills.length === 0 && profile?.interests?.length === 0) {
      generatedActions.push({
        id: "skills",
        priority: "high",
        type: "skill",
        title: "Add Skills to Your Profile",
        description: "Your profile has no skills. Add skills to get matched with relevant opportunities.",
        impact: "5x better opportunity matching",
        actionLabel: "Update Profile",
        actionHref: "/profile",
        estimatedTime: "2 minutes",
      });
    }

    // Next tier milestone
    if (trustScore >= 30 && trustScore < 40) {
      generatedActions.push({
        id: "silver-tier",
        priority: "low",
        type: "trust",
        title: "Reach Silver Tier",
        description: `You're ${40 - trustScore} points away from Silver tier.`,
        impact: "Unlock institutional opportunities",
        actionLabel: "View Progress",
        actionHref: "/progress",
        progress: ((trustScore - 30) / 10) * 100,
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    generatedActions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    setActions(generatedActions.slice(0, 4)); // Show top 4
  };

  const getIcon = (type: NextAction["type"]) => {
    switch (type) {
      case "trust":
        return Target;
      case "opportunity":
        return Briefcase;
      case "economic":
        return DollarSign;
      case "skill":
        return Zap;
      case "verification":
        return Shield;
      default:
        return Target;
    }
  };

  const getPriorityStyles = (priority: NextAction["priority"]) => {
    switch (priority) {
      case "critical":
        return "border-destructive/50 bg-destructive/5";
      case "high":
        return "border-amber-500/50 bg-amber-500/5";
      case "medium":
        return "border-primary/30 bg-primary/5";
      default:
        return "border-border bg-muted/30";
    }
  };

  const getPriorityBadge = (priority: NextAction["priority"]) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge className="bg-amber-500">High Priority</Badge>;
      case "medium":
        return <Badge variant="secondary">Recommended</Badge>;
      default:
        return <Badge variant="outline">Optional</Badge>;
    }
  };

  if (trustLoading || progressLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">You're on track!</h3>
          <p className="text-sm text-muted-foreground">
            No urgent actions needed. Keep building your work history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Next Best Actions
        </CardTitle>
        <CardDescription>
          Actionable steps to improve your professional trajectory
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = getIcon(action.type);
          return (
            <div
              key={action.id}
              className={`p-4 rounded-lg border ${getPriorityStyles(action.priority)}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                    action.priority === "critical"
                      ? "bg-destructive/10 text-destructive"
                      : action.priority === "high"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{action.title}</h4>
                    {getPriorityBadge(action.priority)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                  
                  {action.progress !== undefined && (
                    <div className="mb-2">
                      <Progress value={action.progress} className="h-1.5" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {action.impact}
                      </span>
                      {action.estimatedTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {action.estimatedTime}
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                      <Link to={action.actionHref}>
                        {action.actionLabel}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Philosophy note */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            These recommendations are based on your actual work history, not generic tips.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

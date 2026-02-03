import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  Briefcase,
  DollarSign,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface NextActionProps {
  profileComplete: boolean;
  isVerified: boolean;
  hasProjects: boolean;
  hasBids: boolean;
  trustScore: number;
}

export function NextActionCard({
  profileComplete,
  isVerified,
  hasProjects,
  hasBids,
  trustScore,
}: NextActionProps) {
  // Determine the single most important next action
  const getNextAction = () => {
    if (!profileComplete) {
      return {
        icon: User,
        title: "Complete Your Profile",
        description: "Add your skills, education, and experience to get discovered by opportunities.",
        action: "Complete Profile",
        href: "/profile",
        priority: "high",
      };
    }
    if (!isVerified) {
      return {
        icon: Shield,
        title: "Get Verified",
        description: "Verify your identity to unlock higher-value projects and build trust faster.",
        action: "Start Verification",
        href: "/verification",
        priority: "high",
      };
    }
    if (!hasProjects && !hasBids) {
      return {
        icon: Briefcase,
        title: "Find Your First Project",
        description: "Browse available projects that match your skills and start earning.",
        action: "Browse Projects",
        href: "/offers",
        priority: "medium",
      };
    }
    if (trustScore < 40) {
      return {
        icon: Target,
        title: "Build Your Trust Score",
        description: "Complete projects and deliver on time to increase your trust score.",
        action: "View Tips",
        href: "/profile",
        priority: "medium",
      };
    }
    return {
      icon: Sparkles,
      title: "You're All Set!",
      description: "Check the opportunities below that match your profile.",
      action: "Browse Opportunities",
      href: "/offers",
      priority: "low",
    };
  };

  const nextAction = getNextAction();
  const Icon = nextAction.icon;

  const priorityColors = {
    high: "border-amber-500/50 bg-amber-500/5",
    medium: "border-primary/50 bg-primary/5",
    low: "border-emerald-500/50 bg-emerald-500/5",
  };

  return (
    <Card className={priorityColors[nextAction.priority as keyof typeof priorityColors]}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            nextAction.priority === "high" ? "bg-amber-500/10 text-amber-600" :
            nextAction.priority === "low" ? "bg-emerald-500/10 text-emerald-600" :
            "bg-primary/10 text-primary"
          }`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{nextAction.title}</h3>
              {nextAction.priority === "high" && (
                <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">
                  Priority
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {nextAction.description}
            </p>
            <Button size="sm" asChild className="gap-1">
              <Link to={nextAction.href}>
                {nextAction.action}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, User, Search, Send, Briefcase, Rocket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  completed: boolean;
  icon: React.ElementType;
}

export function GettingStartedChecklist() {
  const { user, profile } = useAuth();

  // Check if user has any bids or projects
  const { data: activityCounts } = useQuery({
    queryKey: ["getting-started-activity", user?.id],
    queryFn: async () => {
      if (!user?.id) return { bids: 0, projects: 0, messages: 0 };

      const [bidsRes, projectsRes, messagesRes] = await Promise.all([
        supabase
          .from("earning_bids")
          .select("id", { count: "exact", head: true })
          .eq("bidder_id", user.id),
        supabase
          .from("earning_projects")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", user.id),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("sender_id", user.id),
      ]);

      return {
        bids: bidsRes.count ?? 0,
        projects: projectsRes.count ?? 0,
        messages: messagesRes.count ?? 0,
      };
    },
    enabled: !!user?.id,
  });

  const profileComplete = !!(profile?.full_name && profile?.university && profile?.department);
  const hasBidsOrProjects = (activityCounts?.bids ?? 0) + (activityCounts?.projects ?? 0) > 0;
  const hasMessages = (activityCounts?.messages ?? 0) > 0;

  const items: ChecklistItem[] = useMemo(() => [
    {
      id: "profile",
      label: "Complete your profile",
      description: "Add your name, university, and department",
      href: "/profile",
      completed: profileComplete,
      icon: User,
    },
    {
      id: "browse",
      label: "Browse available projects",
      description: "Explore the marketplace for opportunities",
      href: "/earn",
      completed: hasBidsOrProjects, // If they've bid or posted, they've browsed
      icon: Search,
    },
    {
      id: "engage",
      label: "Place a bid or post a project",
      description: "Take your first action in the marketplace",
      href: "/earn",
      completed: hasBidsOrProjects,
      icon: Briefcase,
    },
    {
      id: "message",
      label: "Send a message",
      description: "Connect with a collaborator or project owner",
      href: "/messages",
      completed: hasMessages,
      icon: Send,
    },
  ], [profileComplete, hasBidsOrProjects, hasMessages]);

  const completedCount = items.filter((i) => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  // Hide once all items completed
  if (completedCount === items.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            Getting Started
            <Badge variant="secondary" className="text-[10px]">
              {completedCount}/{items.length}
            </Badge>
          </CardTitle>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
              item.completed
                ? "opacity-60"
                : "hover:bg-muted/50"
            }`}
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${item.completed ? "line-through" : ""}`}>
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            </div>
            <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  User,
  FolderKanban,
  Milestone,
  FileUp,
  MessageSquare,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: typeof User;
  href: string;
  completed: boolean;
}

export function OnboardingChecklist() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Check completion status from real data
  const { data: profile } = useQuery({
    queryKey: ["onboarding-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, skills, onboarding_completed")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: dealCount } = useQuery({
    queryKey: ["onboarding-deals", user?.id],
    queryFn: async () => {
      const { count } = await (supabase
        .from("offers")
        .select("id", { count: "exact", head: true }) as any)
        .eq("sponsor_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: artifactCount } = useQuery({
    queryKey: ["onboarding-artifacts", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("research_artifacts")
        .select("id", { count: "exact", head: true })
        .eq("uploaded_by", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: messageCount } = useQuery({
    queryKey: ["onboarding-messages", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: reviewCount } = useQuery({
    queryKey: ["onboarding-reviews", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("review_requests")
        .select("id", { count: "exact", head: true })
        .eq("requested_by", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  if (!user || dismissed) return null;

  const profileComplete = !!(profile?.full_name && profile?.skills?.length);
  
  const items: ChecklistItem[] = [
    { id: "profile", label: "Complete your profile", description: "Add headline, bio, and skills", icon: User, href: "/profile/settings", completed: profileComplete },
    { id: "project", label: "Create or join a project", description: "Start your first collaboration", icon: FolderKanban, href: "/offers", completed: (dealCount || 0) > 0 },
    { id: "milestone", label: "Work on a milestone", description: "Submit work for a milestone", icon: Milestone, href: "/deals", completed: (dealCount || 0) > 0 },
    { id: "artifact", label: "Upload an artifact", description: "Share research files securely", icon: FileUp, href: "/deals", completed: (artifactCount || 0) > 0 },
    { id: "message", label: "Send a message", description: "Collaborate with your team", icon: MessageSquare, href: "/messages", completed: (messageCount || 0) > 0 },
    { id: "review", label: "Request a review", description: "Get feedback on your work", icon: ClipboardCheck, href: "/reviews", completed: (reviewCount || 0) > 0 },
  ];

  const completedCount = items.filter(i => i.completed).length;
  const progressPct = Math.round((completedCount / items.length) * 100);

  // Hide if all complete
  if (completedCount === items.length || profile?.onboarding_completed) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Getting Started
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDismissed(true)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <Progress value={progressPct} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground font-medium">{completedCount}/{items.length}</span>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-2 space-y-1.5">
              {items.map(item => (
                <Link
                  key={item.id}
                  to={item.completed ? "#" : item.href}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    item.completed
                      ? "opacity-60"
                      : "hover:bg-primary/10 cursor-pointer"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${item.completed ? "line-through" : ""}`}>{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.description}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

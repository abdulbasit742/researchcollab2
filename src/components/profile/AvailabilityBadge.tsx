import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Clock, Zap, Briefcase, XCircle, CheckCircle2 } from "lucide-react";

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  full_time: { label: "Full-Time", icon: Zap, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200" },
  part_time: { label: "Part-Time", icon: Clock, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200" },
  project_only: { label: "Project-Only", icon: Briefcase, className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200" },
  available: { label: "Available", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200" },
  unavailable: { label: "Unavailable", icon: XCircle, className: "bg-muted text-muted-foreground border-muted" },
};

const intentLabels: Record<string, string> = {
  projects: "Looking for Projects",
  collaborators: "Seeking Collaborators",
  mentoring: "Open to Mentoring",
  hiring: "Hiring",
};

function useUserAvailability(userId?: string) {
  return useQuery({
    queryKey: ["user-availability", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("user_availability")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });
}

interface AvailabilityBadgeProps {
  userId?: string;
  compact?: boolean;
  className?: string;
}

export function AvailabilityBadge({ userId, compact, className }: AvailabilityBadgeProps) {
  const { data: availability } = useUserAvailability(userId);

  if (!availability || availability.status === "unavailable") return null;

  const config = statusConfig[availability.status] || statusConfig.available;
  const Icon = config.icon;
  const intents = (availability.intent as string[]) || [];

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1 ${config.className} ${className || ""}`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            {availability.capacity > 0 && (
              <p>Can take {availability.capacity} more project{availability.capacity !== 1 ? "s" : ""}</p>
            )}
            {intents.length > 0 && (
              <p>{intents.map((i) => intentLabels[i] || i).join(", ")}</p>
            )}
            {availability.available_hours_per_week > 0 && (
              <p>{availability.available_hours_per_week} hrs/week available</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className || ""}`}>
      <Badge variant="outline" className={`gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
      {availability.capacity > 0 && (
        <span className="text-xs text-muted-foreground">
          {availability.capacity} slot{availability.capacity !== 1 ? "s" : ""} open
        </span>
      )}
      {intents.map((intent) => (
        <Badge key={intent} variant="secondary" className="text-xs">
          {intentLabels[intent] || intent}
        </Badge>
      ))}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CompletionStreakIndicatorProps {
  streak: number; // consecutive on-time completions
  className?: string;
  size?: "sm" | "md";
}

function getStreakConfig(streak: number) {
  if (streak >= 10) return { icon: Trophy, label: "🏆 Legendary", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" };
  if (streak >= 5) return { icon: Flame, label: "🔥 On Fire", color: "text-orange-500 bg-orange-500/10 border-orange-500/30" };
  if (streak >= 3) return { icon: Star, label: "⭐ Rising", color: "text-primary bg-primary/10 border-primary/30" };
  return { icon: Zap, label: "Building", color: "text-muted-foreground bg-muted border-border" };
}

export function CompletionStreakIndicator({ streak, className, size = "sm" }: CompletionStreakIndicatorProps) {
  if (streak < 1) return null;

  const config = getStreakConfig(streak);
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          className={cn(
            "gap-1 font-bold",
            config.color,
            size === "md" ? "text-sm px-3 py-1" : "text-xs px-2 py-0.5",
            className
          )}
        >
          <Icon className={cn(size === "md" ? "h-4 w-4" : "h-3 w-3")} />
          {streak}× Streak
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs font-medium">{config.label}</p>
        <p className="text-xs text-muted-foreground">{streak} consecutive on-time milestone completions</p>
      </TooltipContent>
    </Tooltip>
  );
}

import { Crown, Briefcase, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  tier: "career" | "business" | "pro" | "elite" | string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const tierConfig: Record<string, { icon: React.ElementType; label: string; color: string; description: string }> = {
  career: {
    icon: Briefcase,
    label: "Career",
    color: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
    description: "Career Plan member",
  },
  pro: {
    icon: Briefcase,
    label: "Pro",
    color: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
    description: "Pro Plan member",
  },
  business: {
    icon: Crown,
    label: "Business",
    color: "bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-400",
    description: "Business Plan member",
  },
  elite: {
    icon: Sparkles,
    label: "Elite",
    color: "bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-400",
    description: "Elite Plan member",
  },
};

const sizeClasses = {
  sm: "text-[10px] px-1.5 py-0 h-4 gap-0.5",
  md: "text-xs px-2 py-0.5 gap-1",
  lg: "text-sm px-2.5 py-1 gap-1",
};

const iconSizes = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

export function PremiumBadge({ tier, size = "sm", showLabel = true, className }: PremiumBadgeProps) {
  const config = tierConfig[tier.toLowerCase()];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "font-semibold cursor-help transition-all hover:scale-105 shrink-0",
            config.color,
            sizeClasses[size],
            className
          )}
        >
          <Icon className={iconSizes[size]} />
          {showLabel && <span>{config.label}</span>}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs font-medium">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

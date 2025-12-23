import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface PresenceIndicatorProps {
  isOnline: boolean;
  lastSeen?: string | null;
  showText?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function PresenceIndicator({
  isOnline,
  lastSeen,
  showText = false,
  size = "md",
  className,
}: PresenceIndicatorProps) {
  const dotSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";

  if (showText) {
    if (isOnline) {
      return (
        <div className={cn("flex items-center gap-1.5", className)}>
          <span className={cn(dotSize, "rounded-full bg-green-500")} />
          <span className="text-xs text-green-600 dark:text-green-400">Online</span>
        </div>
      );
    }

    if (lastSeen) {
      const timeAgo = formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
      return (
        <span className={cn("text-xs text-muted-foreground", className)}>
          Last seen {timeAgo}
        </span>
      );
    }

    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Offline
      </span>
    );
  }

  // Just the dot
  return (
    <span
      className={cn(
        dotSize,
        "rounded-full",
        isOnline ? "bg-green-500" : "bg-muted-foreground/40",
        className
      )}
    />
  );
}

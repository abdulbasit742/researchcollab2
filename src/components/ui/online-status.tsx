import { cn } from "@/lib/utils";

type Status = "online" | "away" | "offline" | "busy";

interface OnlineStatusProps {
  status: Status;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<Status, { color: string; label: string }> = {
  online: { color: "bg-green-500", label: "Online" },
  away: { color: "bg-yellow-500", label: "Away" },
  busy: { color: "bg-red-500", label: "Busy" },
  offline: { color: "bg-muted-foreground/40", label: "Offline" },
};

const sizeMap = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function OnlineStatus({ status, size = "md", showLabel = false, className }: OnlineStatusProps) {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex">
        <span className={cn(sizeMap[size], config.color, "rounded-full")} />
        {status === "online" && (
          <span className={cn(sizeMap[size], config.color, "rounded-full absolute inset-0 animate-ping opacity-75")} />
        )}
      </span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}

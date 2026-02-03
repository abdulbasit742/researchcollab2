import { Users } from "lucide-react";
import { useMutualConnectionsCount } from "@/hooks/useNetwork";

interface MutualConnectionsBadgeProps {
  userId: string;
  className?: string;
}

export function MutualConnectionsBadge({ userId, className }: MutualConnectionsBadgeProps) {
  const { data: count, isLoading } = useMutualConnectionsCount(userId);
  
  if (isLoading || !count) return null;
  
  return (
    <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
      <Users className="h-3.5 w-3.5" />
      <span>{count} mutual connection{count !== 1 ? "s" : ""}</span>
    </div>
  );
}

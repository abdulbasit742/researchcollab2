import { Check, CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeliveryStatus = "sending" | "sent" | "delivered" | "read";

interface MessageStatusProps {
  status: DeliveryStatus;
  className?: string;
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  const iconClass = cn("h-3.5 w-3.5", className);

  switch (status) {
    case "sending":
      return <Clock className={cn(iconClass, "text-muted-foreground animate-pulse")} />;
    case "sent":
      return <Check className={cn(iconClass, "text-muted-foreground")} />;
    case "delivered":
      return <CheckCheck className={cn(iconClass, "text-muted-foreground")} />;
    case "read":
      return <CheckCheck className={cn(iconClass, "text-primary")} />;
    default:
      return null;
  }
}

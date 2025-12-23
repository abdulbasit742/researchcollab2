import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/useMessaging";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar?: boolean;
  senderName?: string;
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return `Yesterday ${format(date, "h:mm a")}`;
  }
  return format(date, "MMM d, h:mm a");
}

export function MessageBubble({ message, isMine, showAvatar = true, senderName }: MessageBubbleProps) {
  const initials = senderName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[85%] md:max-w-[70%]",
        isMine ? "ml-auto flex-row-reverse" : ""
      )}
    >
      {!isMine && showAvatar && (
        <Avatar className="h-8 w-8 shrink-0 mt-auto">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl break-words",
            isMine
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatMessageTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}

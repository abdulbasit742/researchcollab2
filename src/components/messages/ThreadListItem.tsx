import { useNavigate } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MessageThread } from "@/hooks/useMessaging";

interface ThreadListItemProps {
  thread: MessageThread;
}

function formatThreadTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMM d");
}

export function ThreadListItem({ thread }: ThreadListItemProps) {
  const navigate = useNavigate();
  const otherUser = thread.other_user;
  const displayName = otherUser?.full_name || "Unknown User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={() => navigate(`/messages/${thread.id}`)}
      className={cn(
        "w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors",
        "text-left border-b last:border-b-0",
        "min-h-[72px]"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {thread.unread_count && thread.unread_count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {thread.unread_count > 9 ? "9+" : thread.unread_count}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "font-medium truncate",
            thread.unread_count && thread.unread_count > 0 && "font-semibold"
          )}>
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatThreadTime(thread.last_message_at)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {otherUser?.role && (
            <Badge variant="secondary" className="text-xs capitalize shrink-0">
              {otherUser.role}
            </Badge>
          )}
          <p className={cn(
            "text-sm text-muted-foreground truncate",
            thread.unread_count && thread.unread_count > 0 && "text-foreground font-medium"
          )}>
            {thread.last_message_text || "No messages yet"}
          </p>
        </div>
      </div>
    </button>
  );
}

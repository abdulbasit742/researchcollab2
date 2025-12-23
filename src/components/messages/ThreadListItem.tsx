import { useNavigate } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUserPresence } from "@/hooks/usePresence";
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
  const { isOnline } = useUserPresence(otherUser?.id);
  const displayName = otherUser?.full_name || "Unknown User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasUnread = thread.unread_count && thread.unread_count > 0;

  return (
    <button
      onClick={() => navigate(`/messages/${thread.id}`)}
      className={cn(
        "w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors",
        "text-left border-b last:border-b-0 active:bg-muted/70",
        "min-h-[72px] touch-manipulation"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
        </Avatar>
        {/* Presence dot */}
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background",
            isOnline ? "bg-green-500" : "bg-muted-foreground/30"
          )}
        />
        {/* Unread count badge */}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {thread.unread_count! > 9 ? "9+" : thread.unread_count}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "font-medium truncate",
            hasUnread && "font-semibold"
          )}>
            {displayName}
          </span>
          <span className={cn(
            "text-xs shrink-0",
            hasUnread ? "text-primary font-medium" : "text-muted-foreground"
          )}>
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
            "text-sm truncate",
            hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {thread.last_message_text || "No messages yet"}
          </p>
        </div>
      </div>
    </button>
  );
}

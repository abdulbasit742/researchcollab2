import { useNavigate } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BellOff, Archive, Star, Volume2, VolumeX } from "lucide-react";
import { useUserPresence } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";
import type { MessageThread } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState, useRef } from "react";

interface ThreadListItemProps {
  thread: MessageThread;
  showArchived?: boolean;
  onArchive?: (threadId: string) => void;
  onUnarchive?: (threadId: string) => void;
  onMute?: (threadId: string) => void;
  onUnmute?: (threadId: string) => void;
  onStar?: (threadId: string, isUserA: boolean, currentlyStarred: boolean) => void;
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

export function ThreadListItem({ 
  thread, 
  showArchived,
  onArchive,
  onUnarchive,
  onMute,
  onUnmute,
  onStar
}: ThreadListItemProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const isUserA = user?.id === thread.user_a;
  
  // Check if muted
  const muteUntil = isUserA
    ? (thread as any).muted_by_user_a_until
    : (thread as any).muted_by_user_b_until;
  const isMuted = muteUntil && new Date(muteUntil) > new Date();
  
  // Check if starred
  const isStarred = isUserA
    ? (thread as any).starred_by_user_a
    : (thread as any).starred_by_user_b;

  // Swipe gesture state
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const SWIPE_THRESHOLD = 80;
  
  // Background colors based on swipe direction
  const leftBgOpacity = useTransform(x, [-150, -SWIPE_THRESHOLD, 0], [1, 0.8, 0]);
  const rightBgOpacity = useTransform(x, [0, SWIPE_THRESHOLD, 150], [0, 0.8, 1]);
  
  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const offset = info.offset.x;
    
    if (offset < -SWIPE_THRESHOLD) {
      // Swipe left - Archive or Mute
      if (showArchived && onUnarchive) {
        onUnarchive(thread.id);
      } else if (onArchive) {
        onArchive(thread.id);
      }
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10);
    } else if (offset > SWIPE_THRESHOLD) {
      // Swipe right - Star
      if (onStar) {
        onStar(thread.id, isUserA, !!isStarred);
      }
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Left swipe background (Archive/Unarchive) */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-end px-6 bg-destructive"
        style={{ opacity: leftBgOpacity }}
      >
        <div className="flex flex-col items-center gap-1 text-destructive-foreground">
          <Archive className="h-5 w-5" />
          <span className="text-xs font-medium">
            {showArchived ? "Unarchive" : "Archive"}
          </span>
        </div>
      </motion.div>
      
      {/* Right swipe background (Star) */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-start px-6 bg-amber-500"
        style={{ opacity: rightBgOpacity }}
      >
        <div className="flex flex-col items-center gap-1 text-white">
          <Star className={cn("h-5 w-5", isStarred && "fill-current")} />
          <span className="text-xs font-medium">
            {isStarred ? "Unstar" : "Star"}
          </span>
        </div>
      </motion.div>
      
      {/* Main content */}
      <motion.button
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={() => !isDragging && navigate(`/messages/${thread.id}`)}
        className={cn(
          "w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors",
          "text-left border-b last:border-b-0 active:bg-muted/70",
          "min-h-[72px] touch-manipulation bg-background cursor-grab active:cursor-grabbing"
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
            <div className="flex items-center gap-2 min-w-0">
              {isStarred && (
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
              )}
              <span className={cn(
                "font-medium truncate",
                hasUnread && "font-semibold"
              )}>
                {displayName}
              </span>
              {isMuted && (
                <VolumeX className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              {showArchived && (
                <Archive className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
            </div>
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
      </motion.button>
    </div>
  );
}

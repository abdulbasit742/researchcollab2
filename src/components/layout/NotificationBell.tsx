import { Link, useNavigate } from "react-router-dom";
import { Bell, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      // Projects & Work
      case "new_bid":
      case "bid_received":
      case "new_bid_received":
        return "💰";
      case "bid_viewed":
        return "👁️";
      case "bid_shortlisted":
        return "⭐";
      case "bid_accepted":
        return "🏆";
      case "bid_rejected":
      case "bid_position_filled":
        return "📋";
      case "offer_received":
        return "📩";
      case "offer_accepted":
        return "✅";
      case "offer_rejected":
        return "❌";
      case "milestone_approved":
      case "milestone_completed":
        return "🎯";
      case "escrow_released":
      case "payment_received":
        return "💵";
      case "dispute_update":
        return "⚠️";
      // Trust & Verification
      case "trust_score_changed":
        return "📊";
      case "verification_approved":
      case "verification_complete":
        return "✓";
      case "profile_viewed":
        return "👁️";
      case "shortlisted":
        return "⭐";
      // Network & Social
      case "match_request":
      case "connection_request":
        return "👋";
      case "connection_accepted":
        return "🤝";
      case "new_follower":
        return "➕";
      case "mention":
        return "📢";
      // Messages
      case "new_message":
      case "message":
        return "💬";
      case "message_reaction":
        return "❤️";
      // Groups & Events
      case "group_invitation":
        return "👥";
      case "event_invitation":
      case "event_reminder":
        return "📅";
      // Publications
      case "publication_verified":
        return "📄";
      case "publication_claimed":
        return "📝";
      // System
      case "admin_notice":
        return "📣";
      case "opportunity_match":
        return "🎯";
      default:
        return "🔔";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const getNotificationLink = (notification: Notification) => {
    const data = notification.data || {};
    switch (notification.type) {
      case "match_request":
        return "/matches";
      case "offer_received":
      case "offer_accepted":
      case "offer_rejected":
        return data.offer_id ? `/offers/${data.offer_id}` : "/offers";
      case "message":
        return data.thread_id ? `/messages/${data.thread_id}` : "/messages";
      case "milestone_completed":
        return data.offer_id ? `/workroom/${data.offer_id}` : "/wallet";
      case "payment_received":
        return "/wallet";
      case "verification_approved":
        return "/verification";
      // Bid notifications → Earn page "My Bids" tab
      case "bid_viewed":
      case "bid_shortlisted":
      case "bid_accepted":
      case "bid_rejected":
      case "bid_position_filled":
        return "/earn";
      // Project owner notifications → Earn page "My Projects" tab
      case "new_bid_received":
        return data.project_id ? `/earn/projects/${data.project_id}` : "/earn";
      default:
        return "#";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigate("/settings/notifications")}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={getNotificationLink(notification)}
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-accent/50 transition-colors",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <span className="text-xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      !notification.read && "font-medium"
                    )}>
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

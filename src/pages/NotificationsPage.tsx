import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Briefcase,
  MessageSquare,
  Users,
  Shield,
  DollarSign,
  AlertCircle,
  Settings,
  Filter,
  Trash2,
  Target,
  TrendingUp,
  Building,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const NOTIFICATION_TYPES = {
  deal: { icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100" },
  message: { icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-100" },
  connection: { icon: Users, color: "text-cyan-600", bg: "bg-cyan-100" },
  trust: { icon: Shield, color: "text-emerald-600", bg: "bg-emerald-100" },
  payment: { icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
  opportunity: { icon: Target, color: "text-orange-600", bg: "bg-orange-100" },
  system: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  milestone: { icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-100" },
  organization: { icon: Building, color: "text-amber-600", bg: "bg-amber-100" },
  verification: { icon: FileText, color: "text-teal-600", bg: "bg-teal-100" },
} as const;

function getNotificationConfig(type: string) {
  // Map notification types to our config
  const typeMap: Record<string, keyof typeof NOTIFICATION_TYPES> = {
    new_message: "message",
    message_received: "message",
    deal_update: "deal",
    deal_created: "deal",
    deal_completed: "deal",
    connection_request: "connection",
    connection_accepted: "connection",
    trust_updated: "trust",
    trust_change: "trust",
    payment_received: "payment",
    payment_sent: "payment",
    opportunity_match: "opportunity",
    new_opportunity: "opportunity",
    milestone_completed: "milestone",
    milestone_approved: "milestone",
    verification_approved: "verification",
    verification_pending: "verification",
    org_invite: "organization",
    system: "system",
  };

  const mappedType = typeMap[type] || "system";
  return NOTIFICATION_TYPES[mappedType] || NOTIFICATION_TYPES.system;
}

function NotificationItem({ 
  notification, 
  onMarkRead 
}: { 
  notification: Notification; 
  onMarkRead: (id: string) => void;
}) {
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;
  const link = notification.data?.link || "#";

  return (
    <div 
      className={cn(
        "flex gap-3 p-4 border-b last:border-0 transition-colors hover:bg-muted/50",
        !notification.read && "bg-primary/5"
      )}
    >
      <div className={cn("p-2 rounded-lg h-fit", config.bg)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link 
              to={link}
              className="font-medium text-sm hover:text-primary transition-colors block"
            >
              {notification.title}
            </Link>
            {notification.message && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {notification.message}
              </p>
            )}
            <span className="text-xs text-muted-foreground mt-1 block">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
          {!notification.read && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 shrink-0"
              onClick={() => onMarkRead(notification.id)}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState("all");

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Filter notifications by type
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.read;
    return n.type.includes(activeFilter);
  });

  // Group by date
  const today = new Date();
  const todayNotifs = filteredNotifications.filter((n) => {
    const d = new Date(n.created_at);
    return d.toDateString() === today.toDateString();
  });
  const earlierNotifs = filteredNotifications.filter((n) => {
    const d = new Date(n.created_at);
    return d.toDateString() !== today.toDateString();
  });

  return (
    <MainLayout>
      <div className="container px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Notifications</h1>
              <p className="text-sm text-muted-foreground">
                Updates on your deals, opportunities, and network
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Link to="/settings/notifications">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    All Notifications
                    {unreadCount > 0 && (
                      <Badge className="ml-2">{unreadCount} new</Badge>
                    )}
                  </CardTitle>
                  <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                    <TabsList className="h-8 overflow-x-auto">
                      <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
                      <TabsTrigger value="unread" className="text-xs px-2">Unread</TabsTrigger>
                      <TabsTrigger value="deal" className="text-xs px-2">Deals</TabsTrigger>
                      <TabsTrigger value="message" className="text-xs px-2">Messages</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <ScrollArea className="h-[calc(100vh-280px)] sm:h-[600px]">
                    {todayNotifs.length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                          Today
                        </div>
                        {todayNotifs.map((n) => (
                          <NotificationItem 
                            key={n.id} 
                            notification={n} 
                            onMarkRead={markAsRead}
                          />
                        ))}
                      </>
                    )}
                    {earlierNotifs.length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                          Earlier
                        </div>
                        {earlierNotifs.map((n) => (
                          <NotificationItem 
                            key={n.id} 
                            notification={n} 
                            onMarkRead={markAsRead}
                          />
                        ))}
                      </>
                    )}
                  </ScrollArea>
                ) : (
                  <div className="py-12 text-center">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-medium mb-1">No notifications yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Activity on your deals and opportunities will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Notification Categories */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => {
                  const Icon = config.icon;
                  const count = notifications.filter((n) => n.type.includes(key)).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveFilter(key)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        activeFilter === key 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <div className={cn("p-1 rounded", config.bg)}>
                        <Icon className={cn("h-3 w-3", config.color)} />
                      </div>
                      <span className="capitalize flex-1 text-left">{key}</span>
                      {count > 0 && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-muted/30">
              <CardContent className="py-4 text-center">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{unreadCount}</p>
                    <p className="text-xs text-muted-foreground">Unread</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{notifications.length}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Link */}
            <Card>
              <CardContent className="py-4">
                <Link to="/settings/notifications">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Notification Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}

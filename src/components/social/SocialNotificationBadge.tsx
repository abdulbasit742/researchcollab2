import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, UserPlus, Share2, AtSign, Award, TrendingUp, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "share" | "mention" | "achievement" | "trending";
  actor: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  group?: {
    count: number;
    preview: string[];
  };
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    actor: { name: "Dr. Sarah Chen" },
    content: "liked your research update",
    timestamp: "2m ago",
    isRead: false,
    group: { count: 12, preview: ["Dr. Sarah Chen", "Prof. Ahmed Khan", "and 10 others"] }
  },
  {
    id: "2",
    type: "comment",
    actor: { name: "Prof. James Wilson" },
    content: 'commented: "This is groundbreaking work!"',
    timestamp: "15m ago",
    isRead: false,
  },
  {
    id: "3",
    type: "follow",
    actor: { name: "Dr. Emily Park" },
    content: "started following you",
    timestamp: "1h ago",
    isRead: false,
    group: { count: 5, preview: ["Dr. Emily Park", "Dr. Michael Lee", "and 3 others"] }
  },
  {
    id: "4",
    type: "mention",
    actor: { name: "Prof. Ahmed Khan" },
    content: 'mentioned you in a post: "@username Check this out!"',
    timestamp: "2h ago",
    isRead: true,
  },
  {
    id: "5",
    type: "achievement",
    actor: { name: "System" },
    content: "Your post went viral! 10K+ views 🎉",
    timestamp: "3h ago",
    isRead: true,
  },
  {
    id: "6",
    type: "trending",
    actor: { name: "System" },
    content: "Your research is trending in #AIResearch",
    timestamp: "5h ago",
    isRead: true,
  },
];

const notificationIcons: Record<Notification["type"], { icon: React.ElementType; color: string }> = {
  like: { icon: Heart, color: "text-red-500 bg-red-500/10" },
  comment: { icon: MessageCircle, color: "text-blue-500 bg-blue-500/10" },
  follow: { icon: UserPlus, color: "text-green-500 bg-green-500/10" },
  share: { icon: Share2, color: "text-purple-500 bg-purple-500/10" },
  mention: { icon: AtSign, color: "text-orange-500 bg-orange-500/10" },
  achievement: { icon: Award, color: "text-yellow-500 bg-yellow-500/10" },
  trending: { icon: TrendingUp, color: "text-cyan-500 bg-cyan-500/10" },
};

export function SocialNotificationBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [hasNew, setHasNew] = useState(true);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setHasNew(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  variant="destructive" 
                  className="h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pulse indicator for new notifications */}
          {hasNew && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              All
            </TabsTrigger>
            <TabsTrigger value="mentions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Mentions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-80">
              {notifications.map((notification, index) => {
                const config = notificationIcons[notification.type];
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-0",
                      !notification.isRead && "bg-primary/5"
                    )}
                  >
                    {/* Icon or Avatar */}
                    {notification.type === "achievement" || notification.type === "trending" ? (
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {notification.actor.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
                          config.color
                        )}>
                          <Icon className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        {notification.group ? (
                          <>
                            <span className="font-semibold">{notification.group.preview[0]}</span>
                            {notification.group.count > 1 && (
                              <span> and {notification.group.count - 1} others</span>
                            )}
                          </>
                        ) : (
                          <span className="font-semibold">{notification.actor.name}</span>
                        )}
                        {" "}
                        <span className="text-muted-foreground">{notification.content}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notification.timestamp}</p>
                    </div>
                    
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </motion.div>
                );
              })}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="mentions" className="m-0">
            <ScrollArea className="h-80">
              {notifications
                .filter(n => n.type === "mention")
                .map((notification) => {
                  const config = notificationIcons[notification.type];
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {notification.actor.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.actor.name}</span>
                          {" "}
                          <span className="text-muted-foreground">{notification.content}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{notification.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

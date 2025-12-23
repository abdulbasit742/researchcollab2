import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Inbox } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ThreadListSkeleton } from "@/components/skeletons/MessagesSkeleton";
import { format, isToday, isYesterday } from "date-fns";

interface SupportThread {
  id: string;
  user_a: string;
  user_b: string;
  last_message_at: string;
  last_message_text: string | null;
  user_profile?: { id: string; full_name: string | null; role: string | null };
  unread_count?: number;
}

export default function AdminSupportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      if (!user) return;

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        navigate("/messages");
        return;
      }

      setIsAdmin(true);

      // Fetch all threads where admin is a participant
      const { data: threadsData } = await supabase
        .from("message_threads")
        .select("*")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (!threadsData) {
        setIsLoading(false);
        return;
      }

      // Get other user profiles
      const otherUserIds = threadsData.map((t) =>
        t.user_a === user.id ? t.user_b : t.user_a
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("id", otherUserIds);

      // Get unread counts
      const { data: unreadData } = await supabase
        .from("messages")
        .select("thread_id")
        .in("thread_id", threadsData.map((t) => t.id))
        .neq("sender_id", user.id)
        .is("read_at", null);

      const unreadCounts: Record<string, number> = {};
      unreadData?.forEach((m) => {
        unreadCounts[m.thread_id] = (unreadCounts[m.thread_id] || 0) + 1;
      });

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const enriched = threadsData.map((thread) => {
        const otherUserId = thread.user_a === user.id ? thread.user_b : thread.user_a;
        return {
          ...thread,
          user_profile: profileMap.get(otherUserId),
          unread_count: unreadCounts[thread.id] || 0,
        };
      });

      setThreads(enriched);
      setIsLoading(false);
    };

    checkAdminAndFetch();
  }, [user, navigate]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  if (!isAdmin && !isLoading) {
    return null;
  }

  return (
    <MainLayout>
      <div className="gradient-hero py-8 md:py-12">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge variant="secondary" className="mb-2">Admin</Badge>
            <h1 className="text-2xl md:text-3xl font-bold">Support Inbox</h1>
            <p className="text-muted-foreground mt-1">
              Manage user support conversations
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-6 px-4">
        <Card className="overflow-hidden">
          {isLoading ? (
            <ThreadListSkeleton />
          ) : threads.length === 0 ? (
            <CardContent className="p-8 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No support tickets</h3>
              <p className="text-muted-foreground">
                Support conversations will appear here.
              </p>
            </CardContent>
          ) : (
            <div className="divide-y">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => navigate(`/messages/${thread.id}`)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {thread.user_profile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {thread.unread_count && thread.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        {thread.unread_count > 9 ? "9+" : thread.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">
                        {thread.user_profile?.full_name || "Unknown User"}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTime(thread.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {thread.user_profile?.role && (
                        <Badge variant="secondary" className="text-xs capitalize shrink-0">
                          {thread.user_profile.role}
                        </Badge>
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {thread.last_message_text || "No messages"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}

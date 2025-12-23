import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, useSendMessage } from "@/hooks/useMessaging";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { MessageInput } from "@/components/messages/MessageInput";
import { MessagesSkeleton } from "@/components/skeletons/MessagesSkeleton";
import { supabase } from "@/integrations/supabase/client";

interface ThreadInfo {
  id: string;
  user_a: string;
  user_b: string;
  other_user?: {
    id: string;
    full_name: string | null;
    role: string | null;
  };
}

export default function MessageThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, isLoading, error, refetch } = useMessages(threadId);
  const { sendMessage, isSending } = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [threadInfo, setThreadInfo] = useState<ThreadInfo | null>(null);
  const [threadLoading, setThreadLoading] = useState(true);

  // Fetch thread info
  useEffect(() => {
    const fetchThread = async () => {
      if (!threadId || !user) return;

      setThreadLoading(true);
      try {
        const { data: thread } = await supabase
          .from("message_threads")
          .select("id, user_a, user_b")
          .eq("id", threadId)
          .maybeSingle();

        if (!thread) {
          navigate("/messages");
          return;
        }

        const otherUserId = thread.user_a === user.id ? thread.user_b : thread.user_a;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("id", otherUserId)
          .maybeSingle();

        setThreadInfo({
          ...thread,
          other_user: profile || { id: otherUserId, full_name: null, role: null },
        });
      } catch (err) {
        console.error("Failed to fetch thread:", err);
      } finally {
        setThreadLoading(false);
      }
    };

    fetchThread();
  }, [threadId, user, navigate]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (body: string) => {
    if (!threadId) return;
    await sendMessage(threadId, body);
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-16 px-4">
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in to view messages</h2>
              <p className="text-muted-foreground mb-6">
                You need to be logged in to access your messages.
              </p>
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const otherUser = threadInfo?.other_user;
  const displayName = otherUser?.full_name || "Unknown User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <MainLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="container px-4">
          <div className="flex items-center gap-3 py-3 min-h-[60px]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/messages")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {threadLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="font-semibold truncate">{displayName}</h2>
                  {otherUser?.role && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {otherUser.role}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container px-4 py-4">
          {isLoading ? (
            <MessagesSkeleton />
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-destructive mb-4">Failed to load messages</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No messages yet. Say hi to start the conversation!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isMine={message.sender_id === user?.id}
                  senderName={message.sender_id === user?.id ? "You" : displayName}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background">
        <div className="container px-0">
          <MessageInput
            onSend={handleSend}
            disabled={isSending || isLoading}
            placeholder="Type a message..."
          />
        </div>
      </div>
    </MainLayout>
  );
}

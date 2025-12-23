import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, useSendMessage } from "@/hooks/useMessaging";
import { useOffers, useConnections, useAttachments } from "@/hooks/useOffersConnections";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { MessageInput } from "@/components/messages/MessageInput";
import { OfferBubble } from "@/components/messages/OfferBubble";
import { ConnectionBubble } from "@/components/messages/ConnectionBubble";
import { AttachmentBubble } from "@/components/messages/AttachmentBubble";
import { AttachmentButton } from "@/components/messages/AttachmentButton";
import { ChatActionsMenu } from "@/components/messages/ChatActionsMenu";
import { SendOfferModal } from "@/components/messages/SendOfferModal";
import { MessagesSkeleton } from "@/components/skeletons/MessagesSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { supportConfig } from "@/config/support";

interface ThreadInfo {
  id: string;
  user_a: string;
  user_b: string;
  other_user?: {
    id: string;
    full_name: string | null;
    role: string | null;
  };
  is_support?: boolean;
}

export default function MessageThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const { messages, isLoading, error, refetch } = useMessages(threadId);
  const { sendMessage, isSending } = useSendMessage();
  const { sendOffer, isSending: isSendingOffer } = useOffers(threadId);
  const { sendConnectionRequest, isSending: isSendingConnection } = useConnections();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [threadInfo, setThreadInfo] = useState<ThreadInfo | null>(null);
  const [threadLoading, setThreadLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Check if should auto-open offer modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "offer") {
      setShowOfferModal(true);
      // Clear the param
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

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

        // Check if this is a support thread (other user is admin)
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", otherUserId)
          .eq("role", "admin")
          .maybeSingle();

        setThreadInfo({
          ...thread,
          other_user: profile || { id: otherUserId, full_name: null, role: null },
          is_support: !!adminRole,
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

  const handleSendAttachment = async (attachment: {
    fileName: string;
    fileType: string;
    path: string;
    size: number;
  }) => {
    if (!threadId) return;

    await supabase.from("messages").insert({
      thread_id: threadId,
      sender_id: user!.id,
      body: attachment.fileName,
      type: "attachment",
      attachment: attachment,
    });

    await supabase
      .from("message_threads")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_text: `📎 ${attachment.fileName}`,
      })
      .eq("id", threadId);
  };

  const handleSendOffer = async (data: {
    offerType: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    deliveryDays?: number;
    attachmentUrl?: string;
  }) => {
    if (!threadInfo?.other_user?.id) return;

    await sendOffer({
      recipientId: threadInfo.other_user.id,
      ...data,
    });
  };

  const handleRequestConnect = async () => {
    if (!threadInfo?.other_user?.id || !threadId) return;
    await sendConnectionRequest(threadInfo.other_user.id, threadId);
  };

  const handleWhatsAppEscalate = () => {
    const message = `Assalam o Alaikum, I need urgent support.

Name: ${profile?.full_name || "User"}
Role: ${profile?.role || "Not specified"}
Thread: ${threadId}
Page: ${window.location.pathname}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${supportConfig.phoneNumber}?text=${encoded}`, "_blank");
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
  const displayName = threadInfo?.is_support ? "Support" : (otherUser?.full_name || "Unknown User");
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const renderMessage = (message: any) => {
    const isMine = message.sender_id === user?.id;

    if (message.type === "offer" && message.metadata?.offer_id) {
      return (
        <OfferBubble
          key={message.id}
          offerId={message.metadata.offer_id}
          isMine={isMine}
        />
      );
    }

    if (message.type === "system" && message.metadata?.connection_request_id) {
      return (
        <ConnectionBubble
          key={message.id}
          requestId={message.metadata.connection_request_id}
          isMine={isMine}
        />
      );
    }

    if (message.type === "attachment" && message.attachment) {
      return (
        <AttachmentBubble
          key={message.id}
          attachment={message.attachment}
          caption={message.body !== message.attachment.fileName ? message.body : undefined}
          isMine={isMine}
        />
      );
    }

    return (
      <MessageBubble
        key={message.id}
        message={message}
        isMine={isMine}
        senderName={isMine ? "You" : displayName}
      />
    );
  };

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
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold truncate">{displayName}</h2>
                  <div className="flex items-center gap-2">
                    {threadInfo?.is_support && (
                      <Badge variant="secondary" className="text-xs">
                        Support
                      </Badge>
                    )}
                    {otherUser?.role && !threadInfo?.is_support && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {otherUser.role}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* WhatsApp Escalation for Support threads */}
                {threadInfo?.is_support && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWhatsAppEscalate}
                    className="shrink-0"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </Button>
                )}
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
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t">
        <div className="container px-4">
          <div className="flex items-end gap-2 py-3">
            <ChatActionsMenu
              onSendOffer={() => setShowOfferModal(true)}
              onRequestConnect={handleRequestConnect}
              disabled={isSending || isSendingOffer || isSendingConnection}
            />
            
            {threadId && (
              <AttachmentButton
                threadId={threadId}
                onUpload={handleSendAttachment}
                disabled={isSending}
              />
            )}

            <div className="flex-1">
              <MessageInput
                onSend={handleSend}
                disabled={isSending || isLoading}
                placeholder="Type a message..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Send Offer Modal */}
      <SendOfferModal
        open={showOfferModal}
        onOpenChange={setShowOfferModal}
        onSubmit={handleSendOffer}
        isSending={isSendingOffer}
      />
    </MainLayout>
  );
}

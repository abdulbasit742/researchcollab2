import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Ban } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, useSendMessage } from "@/hooks/useMessaging";
import { useOffers, useConnections } from "@/hooks/useOffersConnections";
import { useTyping } from "@/hooks/useTyping";
import {
  useMessageSearch,
  useThreadArchive,
  useThreadMute,
  useUserBlock,
  useReport,
} from "@/hooks/useChatControls";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { MessageInput } from "@/components/messages/MessageInput";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { TypingIndicator } from "@/components/messages/TypingIndicator";
import { ThreadSearchBar, HighlightedText } from "@/components/messages/ThreadSearchBar";
import { ChatOptionsMenu } from "@/components/messages/ChatOptionsMenu";
import { ReportModal } from "@/components/messages/ReportModal";
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
  muted_by_user_a_until?: string | null;
  muted_by_user_b_until?: string | null;
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
  const { typingText, startTyping, stopTyping } = useTyping(threadId);
  
  // Chat controls
  const { archiveThread } = useThreadArchive();
  const { muteThread, unmuteThread } = useThreadMute();
  const { blockUser, unblockUser, isBlocked: checkIsBlocked } = useUserBlock();
  const { reportUser, isLoading: isReporting } = useReport();
  const messageSearch = useMessageSearch(messages);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [threadInfo, setThreadInfo] = useState<ThreadInfo | null>(null);
  const [threadLoading, setThreadLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(new Set());

  // Check if should auto-open offer modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "offer") {
      setShowOfferModal(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Fetch thread info and check block status
  useEffect(() => {
    const fetchThread = async () => {
      if (!threadId || !user) return;

      setThreadLoading(true);
      try {
        const { data: thread } = await supabase
          .from("message_threads")
          .select("id, user_a, user_b, muted_by_user_a_until, muted_by_user_b_until")
          .eq("id", threadId)
          .maybeSingle();

        if (!thread) {
          navigate("/messages");
          return;
        }

        const otherUserId = thread.user_a === user.id ? thread.user_b : thread.user_a;
        const { data: profileData } = await supabase
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

        // Check block status
        const blocked = await checkIsBlocked(otherUserId);
        setIsBlocked(blocked);

        setThreadInfo({
          ...thread,
          other_user: profileData || { id: otherUserId, full_name: null, role: null },
          is_support: !!adminRole,
        });
      } catch (err) {
        console.error("Failed to fetch thread:", err);
      } finally {
        setThreadLoading(false);
      }
    };

    fetchThread();
  }, [threadId, user, navigate, checkIsBlocked]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!showSearch) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingText, showSearch]);

  // Scroll to search match
  useEffect(() => {
    if (messageSearch.currentMatch) {
      const msgId = messageSearch.currentMatch.message.id;
      const ref = messageRefs.current.get(msgId);
      ref?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [messageSearch.currentMatch]);

  const handleSend = async (body: string) => {
    if (!threadId || isBlocked) return;
    
    const tempId = `temp-${Date.now()}`;
    setPendingMessages(prev => new Set(prev).add(tempId));
    
    await sendMessage(threadId, body);
    
    setPendingMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(tempId);
      return newSet;
    });
  };

  const handleSendAttachment = async (attachment: {
    fileName: string;
    fileType: string;
    path: string;
    size: number;
  }) => {
    if (!threadId || isBlocked) return;

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

  const handleArchive = async () => {
    if (!threadId || !threadInfo || !user) return;
    const isUserA = threadInfo.user_a === user.id;
    await archiveThread(threadId, isUserA);
    navigate("/messages");
  };

  const handleMute = async (duration: "1h" | "24h" | "7d" | "forever") => {
    if (!threadId || !threadInfo || !user) return;
    const isUserA = threadInfo.user_a === user.id;
    await muteThread(threadId, isUserA, duration);
  };

  const handleUnmute = async () => {
    if (!threadId || !threadInfo || !user) return;
    const isUserA = threadInfo.user_a === user.id;
    await unmuteThread(threadId, isUserA);
  };

  const handleBlock = async () => {
    if (!threadInfo?.other_user?.id) return;
    if (isBlocked) {
      await unblockUser(threadInfo.other_user.id);
      setIsBlocked(false);
    } else {
      await blockUser(threadInfo.other_user.id);
      setIsBlocked(true);
    }
  };

  const handleReport = async (data: { reason: "spam" | "harassment" | "fake" | "offensive" | "other"; description?: string }) => {
    if (!threadInfo?.other_user?.id || !threadId) return;
    await reportUser({
      reportedUserId: threadInfo.other_user.id,
      threadId,
      reason: data.reason,
      description: data.description,
    });
    setShowReportModal(false);
  };

  // Check if muted
  const isUserA = user?.id === threadInfo?.user_a;
  const muteUntil = isUserA
    ? threadInfo?.muted_by_user_a_until
    : threadInfo?.muted_by_user_b_until;
  const isMuted = muteUntil && new Date(muteUntil) > new Date();

  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-background">
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
      </div>
    );
  }

  const otherUser = threadInfo?.other_user;
  const displayName = threadInfo?.is_support ? "Support" : (otherUser?.full_name || "Unknown User");

  const renderMessage = (message: any, index: number) => {
    const isMine = message.sender_id === user?.id;
    const prevMessage = messages[index - 1];
    const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
    const isSearchMatch = messageSearch.currentMatch?.message.id === message.id;

    if (message.type === "offer" && message.metadata?.offer_id) {
      return (
        <div
          key={message.id}
          ref={(el) => el && messageRefs.current.set(message.id, el)}
        >
          <OfferBubble offerId={message.metadata.offer_id} isMine={isMine} />
        </div>
      );
    }

    if (message.type === "system" && message.metadata?.connection_request_id) {
      return (
        <div
          key={message.id}
          ref={(el) => el && messageRefs.current.set(message.id, el)}
        >
          <ConnectionBubble requestId={message.metadata.connection_request_id} isMine={isMine} />
        </div>
      );
    }

    if (message.type === "attachment" && message.attachment) {
      return (
        <div
          key={message.id}
          ref={(el) => el && messageRefs.current.set(message.id, el)}
        >
          <AttachmentBubble
            attachment={message.attachment}
            caption={message.body !== message.attachment.fileName ? message.body : undefined}
            isMine={isMine}
          />
        </div>
      );
    }

    return (
      <div
        key={message.id}
        ref={(el) => el && messageRefs.current.set(message.id, el)}
        className={isSearchMatch ? "ring-2 ring-primary rounded-lg" : ""}
      >
        <MessageBubble
          message={{
            ...message,
            body: showSearch && messageSearch.searchQuery 
              ? message.body 
              : message.body,
          }}
          isMine={isMine}
          showAvatar={showAvatar}
          senderName={isMine ? "You" : displayName}
          deliveryStatus={pendingMessages.size > 0 ? "sending" : "sent"}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="relative">
        <ChatHeader
          userId={otherUser?.id}
          displayName={displayName}
          role={otherUser?.role}
          isSupport={threadInfo?.is_support}
          typingText={typingText}
          onWhatsAppEscalate={threadInfo?.is_support ? handleWhatsAppEscalate : undefined}
          isLoading={threadLoading}
        />
        
        {/* Options Menu */}
        {!threadLoading && (
          <div className="absolute top-3 right-4">
            <ChatOptionsMenu
              onSearch={() => setShowSearch(true)}
              onArchive={handleArchive}
              onMute={handleMute}
              onUnmute={handleUnmute}
              onBlock={handleBlock}
              onReport={() => setShowReportModal(true)}
              isMuted={!!isMuted}
              isBlocked={isBlocked}
            />
          </div>
        )}

        {/* Search Bar */}
        <ThreadSearchBar
          isOpen={showSearch}
          onSearch={messageSearch.setSearchQuery}
          matchCount={messageSearch.totalMatches}
          currentIndex={messageSearch.matchIndex}
          onNext={() => messageSearch.goToNext()}
          onPrev={() => messageSearch.goToPrev()}
          onClose={() => {
            setShowSearch(false);
            messageSearch.reset();
          }}
        />
      </div>

      {/* Blocked Banner */}
      {isBlocked && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-center gap-2">
          <Ban className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            This user is blocked. Messages cannot be sent.
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="container px-4 py-4 pb-safe">
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
            <div className="space-y-2">
              {messages.map((msg, idx) => renderMessage(msg, idx))}
              
              <AnimatePresence>
                {typingText && (
                  <TypingIndicator userName={otherUser?.full_name || undefined} />
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t safe-area-bottom">
        <div className="container px-4">
          <div className="flex items-end gap-2 py-3">
            {!isBlocked && (
              <>
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
              </>
            )}

            <div className="flex-1">
              <MessageInput
                onSend={handleSend}
                onTyping={startTyping}
                onStopTyping={stopTyping}
                disabled={isSending || isLoading || isBlocked}
                placeholder={isBlocked ? "You cannot message this user" : "Type a message..."}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SendOfferModal
        open={showOfferModal}
        onOpenChange={setShowOfferModal}
        onSubmit={handleSendOffer}
        isSending={isSendingOffer}
      />

      <ReportModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        onSubmit={handleReport}
        isSubmitting={isReporting}
        targetName={otherUser?.full_name || undefined}
      />
    </div>
  );
}

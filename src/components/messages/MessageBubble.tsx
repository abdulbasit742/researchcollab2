import { useState, useRef, useCallback, useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageStatus, type DeliveryStatus } from "./MessageStatus";
import { MessageContextMenu } from "./MessageContextMenu";
import { VoiceMessageBubble } from "@/components/voice/VoiceMessageBubble";
import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/useMessaging";
import type { VoiceNote } from "@/hooks/useVoiceNotes";
import { supabase } from "@/integrations/supabase/client";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar?: boolean;
  senderName?: string;
  deliveryStatus?: DeliveryStatus;
  isPinned?: boolean;
  onCopy?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return `Yesterday ${format(date, "h:mm a")}`;
  }
  return format(date, "MMM d, h:mm a");
}

const LONG_PRESS_DURATION = 500;

export function MessageBubble({ 
  message, 
  isMine, 
  showAvatar = true, 
  senderName,
  deliveryStatus = "sent",
  isPinned = false,
  onCopy,
  onPin,
  onDelete,
  onReport,
}: MessageBubbleProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [voiceNote, setVoiceNote] = useState<VoiceNote | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const initials = senderName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const status: DeliveryStatus = message.read_at 
    ? "read" 
    : deliveryStatus;

  const isDeleted = !!(message as any).deleted_at;
  const isVoiceMessage = message.type === "voice";

  // Fetch voice note if this is a voice message
  useEffect(() => {
    if (isVoiceMessage && message.metadata) {
      const metadata = message.metadata as { voice_note_id?: string };
      if (metadata.voice_note_id) {
        supabase
          .from("voice_notes")
          .select("*")
          .eq("id", metadata.voice_note_id)
          .single()
          .then(({ data }) => {
            if (data) {
              setVoiceNote(data as VoiceNote);
            }
          });
      }
    }
  }, [isVoiceMessage, message.metadata]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    
    longPressTimer.current = setTimeout(() => {
      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setContextMenu({ 
        x: touch.clientX, 
        y: touch.clientY 
      });
    }, LONG_PRESS_DURATION);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.current.x);
    const deltaY = Math.abs(touch.clientY - touchStart.current.y);
    
    // Cancel long press if finger moves too much
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStart.current = null;
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.body);
    onCopy?.();
  }, [message.body, onCopy]);

  const handlePin = useCallback(() => {
    onPin?.();
  }, [onPin]);

  const handleDelete = useCallback(() => {
    onDelete?.();
  }, [onDelete]);

  const handleReport = useCallback(() => {
    onReport?.();
  }, [onReport]);

  return (
    <>
      <div
        className={cn(
          "flex gap-2 max-w-[85%] md:max-w-[70%] select-none",
          isMine ? "ml-auto flex-row-reverse" : ""
        )}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {!isMine && showAvatar && (
          <Avatar className="h-8 w-8 shrink-0 mt-auto">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
          {/* Voice message */}
          {isVoiceMessage && voiceNote ? (
            <VoiceMessageBubble
              voiceNote={voiceNote}
              isOwn={isMine}
              showTranscript
            />
          ) : (
            /* Text message */
            <div
              className={cn(
                "px-4 py-2.5 rounded-2xl break-words transition-colors",
                isMine
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted rounded-bl-sm",
                isDeleted && "opacity-60 italic"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">
                {isDeleted ? "This message was deleted" : message.body}
              </p>
            </div>
          )}
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(message.created_at)}
            </span>
            {isMine && <MessageStatus status={status} />}
          </div>
        </div>
      </div>

      <MessageContextMenu
        message={message}
        isOpen={!!contextMenu}
        onClose={() => setContextMenu(null)}
        position={contextMenu || { x: 0, y: 0 }}
        isMine={isMine}
        isPinned={isPinned}
        onCopy={handleCopy}
        onPin={handlePin}
        onDelete={handleDelete}
        onReport={handleReport}
      />
    </>
  );
}

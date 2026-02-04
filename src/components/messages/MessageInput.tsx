import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceMessageInput } from "./VoiceMessageInput";
import { cn } from "@/lib/utils";
import type { VoiceNote } from "@/hooks/useVoiceNotes";

interface MessageInputProps {
  onSend: (message: string) => void;
  onVoiceNoteSent?: (voiceNote: VoiceNote) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  threadId?: string;
  showVoiceRecording?: boolean;
}

export function MessageInput({ 
  onSend,
  onVoiceNoteSent,
  onTyping,
  onStopTyping,
  disabled, 
  placeholder = "Type a message...",
  threadId,
  showVoiceRecording = true,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
      onStopTyping?.();
      textareaRef.current?.focus();
    }
  }, [message, disabled, onSend, onStopTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      onTyping?.();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="flex items-end gap-2">
      {showVoiceRecording && threadId && (
        <VoiceMessageInput
          threadId={threadId}
          onVoiceNoteSent={onVoiceNoteSent}
          disabled={disabled}
        />
      )}
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => onStopTyping?.()}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "min-h-[44px] max-h-[120px] resize-none flex-1",
          "rounded-2xl py-3 px-4 text-base"
        )}
        rows={1}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="h-11 w-11 rounded-full shrink-0 touch-manipulation"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}

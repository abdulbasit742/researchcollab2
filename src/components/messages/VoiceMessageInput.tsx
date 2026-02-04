import { useState, useCallback } from "react";
import { Mic, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceRecorderTrigger } from "@/components/voice/VoiceRecorder";
import { cn } from "@/lib/utils";
import type { VoiceNote } from "@/hooks/useVoiceNotes";

interface VoiceMessageInputProps {
  threadId: string;
  onVoiceNoteSent?: (voiceNote: VoiceNote) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceMessageInput({
  threadId,
  onVoiceNoteSent,
  disabled,
  className,
}: VoiceMessageInputProps) {
  const handleRecordingComplete = useCallback((voiceNote: VoiceNote) => {
    onVoiceNoteSent?.(voiceNote);
  }, [onVoiceNoteSent]);

  if (disabled) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className={cn("h-11 w-11 rounded-full shrink-0", className)}
      >
        <Mic className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <VoiceRecorderTrigger
      contextType="message"
      contextId={threadId}
      onRecordingComplete={handleRecordingComplete}
      className={cn(
        "h-11 w-11 rounded-full shrink-0 touch-manipulation",
        className
      )}
    />
  );
}

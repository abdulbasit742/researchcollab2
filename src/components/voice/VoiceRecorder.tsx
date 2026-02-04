import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Pause, Play, Trash2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceWaveform } from "./VoiceWaveform";
import { useVoiceRecorder, useVoiceNotes, VoiceNote } from "@/hooks/useVoiceNotes";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  contextType: VoiceNote["context_type"];
  contextId?: string;
  onRecordingComplete?: (voiceNote: VoiceNote) => void;
  onCancel?: () => void;
  compact?: boolean;
  className?: string;
}

export function VoiceRecorder({
  contextType,
  contextId,
  onRecordingComplete,
  onCancel,
  compact = false,
  className,
}: VoiceRecorderProps) {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    isRecording,
    isPaused,
    duration,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    maxDuration,
  } = useVoiceRecorder();

  const { uploadVoiceNote, isUploading } = useVoiceNotes();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = useCallback(async () => {
    setRecordedBlob(null);
    setPreviewUrl(null);
    await startRecording();
  }, [startRecording]);

  const handleStopRecording = useCallback(async () => {
    const blob = await stopRecording();
    if (blob) {
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    }
  }, [stopRecording]);

  const handleCancel = useCallback(() => {
    cancelRecording();
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onCancel?.();
  }, [cancelRecording, previewUrl, onCancel]);

  const handleSend = useCallback(async () => {
    if (!recordedBlob) return;

    const voiceNote = await uploadVoiceNote(
      recordedBlob,
      contextType,
      contextId,
      duration
    );

    if (voiceNote) {
      setRecordedBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      onRecordingComplete?.(voiceNote);
    }
  }, [recordedBlob, uploadVoiceNote, contextType, contextId, duration, previewUrl, onRecordingComplete]);

  const handleRetry = useCallback(() => {
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  // Idle state - show record button
  if (!isRecording && !recordedBlob) {
    return (
      <Button
        variant="ghost"
        size={compact ? "icon" : "default"}
        onClick={handleStartRecording}
        className={cn(
          "text-muted-foreground hover:text-primary transition-colors",
          className
        )}
      >
        <Mic className={cn("h-5 w-5", !compact && "mr-2")} />
        {!compact && "Record voice note"}
      </Button>
    );
  }

  // Recording state
  if (isRecording) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
          className
        )}
      >
        {/* Recording indicator */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-3 h-3 rounded-full bg-destructive"
        />

        {/* Waveform */}
        <div className="flex-1 min-w-[120px]">
          <VoiceWaveform
            audioLevel={audioLevel}
            isRecording={true}
            className="h-10"
          />
        </div>

        {/* Duration */}
        <div className="text-sm font-mono text-muted-foreground min-w-[60px] text-right">
          {formatDuration(duration)} / {formatDuration(maxDuration)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="h-8 w-8"
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={handleStopRecording}
            className="h-8 w-8"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Preview state (after recording)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
        className
      )}
    >
      {/* Audio preview */}
      {previewUrl && (
        <audio src={previewUrl} className="hidden" />
      )}

      {/* Waveform (static) */}
      <div className="flex-1 min-w-[120px]">
        <VoiceWaveform
          isRecording={false}
          className="h-10"
        />
      </div>

      {/* Duration */}
      <div className="text-sm font-mono text-muted-foreground">
        {formatDuration(duration)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRetry}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={handleSend}
          disabled={isUploading}
          className="h-8 w-8"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// Compact trigger button that expands to full recorder
export function VoiceRecorderTrigger({
  contextType,
  contextId,
  onRecordingComplete,
  className,
}: Omit<VoiceRecorderProps, "compact" | "onCancel">) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleComplete = useCallback(
    (voiceNote: VoiceNote) => {
      setIsExpanded(false);
      onRecordingComplete?.(voiceNote);
    },
    [onRecordingComplete]
  );

  return (
    <AnimatePresence mode="wait">
      {isExpanded ? (
        <VoiceRecorder
          key="recorder"
          contextType={contextType}
          contextId={contextId}
          onRecordingComplete={handleComplete}
          onCancel={() => setIsExpanded(false)}
          className={className}
        />
      ) : (
        <motion.div key="trigger">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(true)}
            className={cn("text-muted-foreground hover:text-primary", className)}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

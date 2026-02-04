import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceWaveform } from "./VoiceWaveform";
import { VoiceTranscript } from "./VoiceTranscript";
import { useVoicePlayer, useVoiceNotes, VoiceNote } from "@/hooks/useVoiceNotes";
import { cn } from "@/lib/utils";

interface VoiceMessageBubbleProps {
  voiceNote: VoiceNote;
  isOwn?: boolean;
  showTranscript?: boolean;
  className?: string;
}

export function VoiceMessageBubble({
  voiceNote,
  isOwn = false,
  showTranscript = true,
  className,
}: VoiceMessageBubbleProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const { getPlaybackUrl } = useVoiceNotes();
  const { isPlaying, currentTime, duration, loadAudio, play, pause, seek } =
    useVoicePlayer();

  useEffect(() => {
    const loadUrl = async () => {
      const url = await getPlaybackUrl(voiceNote.storage_path);
      if (url) {
        loadAudio(url);
        setIsLoaded(true);
      }
    };
    loadUrl();
  }, [voiceNote.storage_path, getPlaybackUrl, loadAudio]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const actualDuration = duration || voiceNote.duration_seconds;
  const progress = actualDuration > 0 ? (currentTime / actualDuration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "max-w-[320px] rounded-2xl overflow-hidden",
        isOwn
          ? "bg-primary text-primary-foreground ml-auto"
          : "bg-muted",
        className
      )}
    >
      {/* Voice note content */}
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              isOwn ? "bg-primary-foreground/20" : "bg-primary/10"
            )}
          >
            <Mic
              className={cn(
                "h-3.5 w-3.5",
                isOwn ? "text-primary-foreground" : "text-primary"
              )}
            />
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              isOwn ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            Voice message
          </span>
        </div>

        {/* Player */}
        <div className="flex items-center gap-3">
          <Button
            variant={isOwn ? "secondary" : "default"}
            size="icon"
            onClick={() => (isPlaying ? pause() : play())}
            disabled={!isLoaded}
            className="h-10 w-10 shrink-0 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          <div className="flex-1 space-y-1">
            {/* Waveform */}
            <VoiceWaveform
              currentTime={currentTime}
              duration={actualDuration}
              isPlaying={isPlaying}
              onSeek={seek}
              className="h-8"
              barColor={isOwn ? "hsl(var(--primary-foreground) / 0.3)" : "hsl(var(--muted-foreground))"}
              progressColor={isOwn ? "hsl(var(--primary-foreground))" : "hsl(var(--primary))"}
            />

            {/* Time */}
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs font-mono",
                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                {formatTime(currentTime)}
              </span>
              <span
                className={cn(
                  "text-xs font-mono",
                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                {formatTime(actualDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className={cn(
            "h-0.5 rounded-full overflow-hidden",
            isOwn ? "bg-primary-foreground/20" : "bg-muted-foreground/20"
          )}
        >
          <motion.div
            className={cn(
              "h-full rounded-full",
              isOwn ? "bg-primary-foreground" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>

      {/* Transcript */}
      {showTranscript && voiceNote.transcript && (
        <div
          className={cn(
            "px-3 pb-3 pt-0",
            isOwn ? "text-primary-foreground/90" : "text-foreground"
          )}
        >
          <div
            className={cn(
              "p-2 rounded-lg text-xs",
              isOwn ? "bg-primary-foreground/10" : "bg-background/50"
            )}
          >
            <p className="line-clamp-3">{voiceNote.transcript}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Simple version for thread lists
export function VoiceMessagePreview({
  durationSeconds,
  className,
}: {
  durationSeconds: number;
  className?: string;
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex items-center gap-1.5 text-muted-foreground", className)}>
      <Mic className="h-3.5 w-3.5" />
      <span className="text-sm">Voice message</span>
      <span className="text-xs font-mono">({formatTime(durationSeconds)})</span>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceWaveform } from "./VoiceWaveform";
import { useVoicePlayer, useVoiceNotes, VoiceNote } from "@/hooks/useVoiceNotes";
import { cn } from "@/lib/utils";

interface VoicePlayerProps {
  voiceNote: VoiceNote;
  showTranscript?: boolean;
  showControls?: boolean;
  onDelete?: () => void;
  compact?: boolean;
  className?: string;
}

export function VoicePlayer({
  voiceNote,
  showTranscript = true,
  showControls = true,
  onDelete,
  compact = false,
  className,
}: VoicePlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const { getPlaybackUrl } = useVoiceNotes();
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    loadAudio,
    play,
    pause,
    seek,
    changePlaybackRate,
  } = useVoicePlayer();

  // Load audio URL
  useEffect(() => {
    const loadUrl = async () => {
      const url = await getPlaybackUrl(voiceNote.storage_path);
      if (url) {
        setAudioUrl(url);
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

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const handleRestart = useCallback(() => {
    seek(0);
    play();
  }, [seek, play]);

  const handleSeek = useCallback(
    (time: number) => {
      seek(time);
    },
    [seek]
  );

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const cyclePlaybackRate = useCallback(() => {
    const currentIndex = playbackRates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % playbackRates.length;
    changePlaybackRate(playbackRates[nextIndex]);
  }, [playbackRate, changePlaybackRate]);

  const handleDownload = useCallback(async () => {
    if (!audioUrl) return;
    
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `voice-note-${voiceNote.id}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [audioUrl, voiceNote.id]);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg bg-muted/50",
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          disabled={!isLoaded}
          className="h-8 w-8 shrink-0"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1 min-w-[60px]">
          <VoiceWaveform
            currentTime={currentTime}
            duration={duration || voiceNote.duration_seconds}
            isPlaying={isPlaying}
            onSeek={handleSeek}
            className="h-6"
          />
        </div>

        <span className="text-xs font-mono text-muted-foreground shrink-0">
          {formatTime(currentTime)} / {formatTime(duration || voiceNote.duration_seconds)}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl bg-card border border-border overflow-hidden",
        className
      )}
    >
      {/* Player Section */}
      <div className="p-4 space-y-3">
        {/* Waveform */}
        <VoiceWaveform
          currentTime={currentTime}
          duration={duration || voiceNote.duration_seconds}
          isPlaying={isPlaying}
          onSeek={handleSeek}
          className="h-12"
        />

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRestart}
              disabled={!isLoaded}
              className="h-8 w-8"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={handlePlayPause}
              disabled={!isLoaded}
              className="h-10 w-10"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={cyclePlaybackRate}
              className="h-8 px-2 text-xs font-mono"
            >
              {playbackRate}x
            </Button>
          </div>

          {/* Time display */}
          <span className="text-sm font-mono text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration || voiceNote.duration_seconds)}
          </span>

          {/* Right controls */}
          {showControls && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                disabled={!audioUrl}
                className="h-8 w-8"
              >
                <Download className="h-4 w-4" />
              </Button>

              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transcript Section */}
      {showTranscript && voiceNote.transcript && (
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Transcript
            </span>
            {voiceNote.sentiment_score !== null && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  voiceNote.sentiment_score > 0.6
                    ? "bg-green-500/10 text-green-600"
                    : voiceNote.sentiment_score < 0.4
                    ? "bg-red-500/10 text-red-600"
                    : "bg-yellow-500/10 text-yellow-600"
                )}
              >
                {voiceNote.sentiment_score > 0.6
                  ? "Positive"
                  : voiceNote.sentiment_score < 0.4
                  ? "Negative"
                  : "Neutral"}
              </span>
            )}
          </div>
          
          <p
            className={cn(
              "text-sm text-muted-foreground",
              !showFullTranscript && "line-clamp-2"
            )}
          >
            {voiceNote.transcript}
          </p>
          
          {voiceNote.transcript.length > 150 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowFullTranscript(!showFullTranscript)}
              className="p-0 h-auto text-xs mt-1"
            >
              {showFullTranscript ? "Show less" : "Show more"}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Simple inline player for message bubbles
export function VoicePlayerInline({
  storagePath,
  durationSeconds,
  className,
}: {
  storagePath: string;
  durationSeconds: number;
  className?: string;
}) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { getPlaybackUrl } = useVoiceNotes();
  const { isPlaying, currentTime, duration, loadAudio, play, pause, seek } =
    useVoicePlayer();

  useEffect(() => {
    const loadUrl = async () => {
      const url = await getPlaybackUrl(storagePath);
      if (url) {
        setAudioUrl(url);
        loadAudio(url);
        setIsLoaded(true);
      }
    };
    loadUrl();
  }, [storagePath, getPlaybackUrl, loadAudio]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => (isPlaying ? pause() : play())}
        disabled={!isLoaded}
        className="h-8 w-8 shrink-0"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1 min-w-[80px]">
        <VoiceWaveform
          currentTime={currentTime}
          duration={duration || durationSeconds}
          isPlaying={isPlaying}
          onSeek={seek}
          className="h-6"
        />
      </div>

      <span className="text-xs font-mono text-muted-foreground shrink-0">
        {formatTime(duration || durationSeconds)}
      </span>
    </div>
  );
}

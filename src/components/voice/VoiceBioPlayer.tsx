import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Play, Pause, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoiceWaveform } from "./VoiceWaveform";
import { useVoicePlayer, useVoiceNotes } from "@/hooks/useVoiceNotes";
import { cn } from "@/lib/utils";

interface VoiceBioPlayerProps {
  storagePath: string;
  durationSeconds: number;
  userName?: string;
  userAvatar?: string;
  autoPlay?: boolean;
  showTranscript?: boolean;
  transcript?: string;
  className?: string;
}

export function VoiceBioPlayer({
  storagePath,
  durationSeconds,
  userName,
  userAvatar,
  autoPlay = false,
  showTranscript = false,
  transcript,
  className,
}: VoiceBioPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  const { getPlaybackUrl } = useVoiceNotes();
  const { isPlaying, currentTime, duration, loadAudio, play, pause, seek } =
    useVoicePlayer();

  useEffect(() => {
    const loadUrl = async () => {
      const url = await getPlaybackUrl(storagePath);
      if (url) {
        loadAudio(url);
        setIsLoaded(true);
      }
    };
    loadUrl();
  }, [storagePath, getPlaybackUrl, loadAudio]);

  // Auto-play when loaded (if enabled)
  useEffect(() => {
    if (isLoaded && autoPlay && !hasAutoPlayed) {
      play();
      setHasAutoPlayed(true);
    }
  }, [isLoaded, autoPlay, hasAutoPlayed, play]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (duration || durationSeconds) > 0 
    ? (currentTime / (duration || durationSeconds)) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 overflow-hidden",
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern
            id="wave-pattern"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 10 Q5 5, 10 10 T20 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
          <rect x="0" y="0" width="100" height="100" fill="url(#wave-pattern)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative p-4 space-y-3">
        {/* Header with avatar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={userAvatar} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            {/* Playing indicator */}
            {isPlaying && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
              >
                <Volume2 className="h-2.5 w-2.5 text-primary-foreground" />
              </motion.div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {userName && (
              <p className="font-medium text-sm truncate">{userName}</p>
            )}
            <p className="text-xs text-muted-foreground">Audio Introduction</p>
          </div>

          {/* Mute toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Waveform with play button overlay */}
        <div className="relative">
          <VoiceWaveform
            currentTime={currentTime}
            duration={duration || durationSeconds}
            isPlaying={isPlaying}
            onSeek={seek}
            className="h-10"
            progressColor="hsl(var(--primary))"
          />

          {/* Centered play button when not playing */}
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm"
            >
              <Button
                variant="default"
                size="icon"
                onClick={play}
                disabled={!isLoaded}
                className="h-10 w-10 rounded-full shadow-lg"
              >
                <Play className="h-5 w-5 ml-0.5" />
              </Button>
            </motion.div>
          )}
        </div>

        {/* Progress bar and time */}
        <div className="space-y-1">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || durationSeconds)}</span>
          </div>
        </div>

        {/* Transcript preview */}
        {showTranscript && transcript && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground italic line-clamp-2">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Playback controls */}
        {isPlaying && (
          <div className="flex items-center justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={pause}
              className="text-xs"
            >
              <Pause className="h-3.5 w-3.5 mr-1" />
              Pause
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Compact badge version for profile cards
export function VoiceBioBadge({
  hasAudioBio,
  onClick,
  className,
}: {
  hasAudioBio: boolean;
  onClick?: () => void;
  className?: string;
}) {
  if (!hasAudioBio) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "bg-primary/10 text-primary text-xs font-medium",
        "hover:bg-primary/20 transition-colors cursor-pointer",
        className
      )}
    >
      <Volume2 className="h-3 w-3" />
      <span>Audio Bio</span>
    </motion.button>
  );
}

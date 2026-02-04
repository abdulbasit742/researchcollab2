import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Briefcase, 
  Users, 
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioBriefings, useBriefingTypes, type BriefingType, type AudioBriefing } from "@/hooks/useAudioBriefings";
import { cn } from "@/lib/utils";

interface AudioBriefingPlayerProps {
  className?: string;
}

const iconMap = {
  calendar: Calendar,
  briefcase: Briefcase,
  users: Users,
};

export function AudioBriefingPlayer({ className }: AudioBriefingPlayerProps) {
  const briefingTypes = useBriefingTypes();
  const {
    generateBriefing,
    play,
    pause,
    resume,
    stop,
    isGenerating,
    isPlaying,
    currentBriefing,
    clearCache,
  } = useAudioBriefings();

  const [selectedType, setSelectedType] = useState<BriefingType>("week_review");
  const [showTranscript, setShowTranscript] = useState(false);
  const [muted, setMuted] = useState(false);

  const selectedBriefingMeta = briefingTypes.find((b) => b.type === selectedType);
  const Icon = selectedBriefingMeta ? iconMap[selectedBriefingMeta.icon as keyof typeof iconMap] : Calendar;

  const handlePlay = async () => {
    if (isPlaying && currentBriefing?.type === selectedType) {
      pause();
    } else if (currentBriefing?.type === selectedType && !isPlaying) {
      resume();
    } else {
      await play(selectedType);
    }
  };

  const handleRefresh = async () => {
    clearCache();
    stop();
    await generateBriefing(selectedType);
  };

  const isCurrentType = currentBriefing?.type === selectedType;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Volume2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Audio Briefings</CardTitle>
              <CardDescription className="text-xs">
                Personalized audio summaries
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMuted(!muted)}
            className="h-8 w-8"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Briefing Type Selector */}
        <div className="flex gap-2">
          {briefingTypes.map((type) => {
            const TypeIcon = iconMap[type.icon as keyof typeof iconMap];
            const isSelected = selectedType === type.type;
            const isActive = currentBriefing?.type === type.type && isPlaying;

            return (
              <Button
                key={type.type}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.type)}
                className={cn(
                  "flex-1 relative",
                  isActive && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <TypeIcon className="h-4 w-4 mr-1" />
                <span className="text-xs truncate">{type.title.split(" ")[0]}</span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </Button>
            );
          })}
        </div>

        {/* Selected Briefing Info */}
        {selectedBriefingMeta && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{selectedBriefingMeta.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {selectedBriefingMeta.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isGenerating}
            className="h-10 w-10"
          >
            <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
          </Button>

          <Button
            onClick={handlePlay}
            disabled={isGenerating || muted}
            size="lg"
            className="h-14 w-14 rounded-full"
          >
            {isGenerating ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlaying && isCurrentType ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTranscript(!showTranscript)}
            disabled={!currentBriefing || !isCurrentType}
            className="h-10 w-10"
          >
            {showTranscript ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Now Playing Indicator */}
        {isPlaying && isCurrentType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center justify-center gap-1"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-primary"
                animate={{
                  height: [8, 16, 8],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: i * 0.1,
                }}
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">Now playing...</span>
          </motion.div>
        )}

        {/* Transcript */}
        {showTranscript && currentBriefing && isCurrentType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-muted rounded-lg"
          >
            <p className="text-xs font-medium mb-2">Transcript</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentBriefing.text}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard widgets
export function AudioBriefingWidget({ className }: { className?: string }) {
  const { play, pause, isGenerating, isPlaying, currentBriefing } = useAudioBriefings();

  const handleQuickPlay = async () => {
    if (isPlaying) {
      pause();
    } else {
      await play("week_review");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleQuickPlay}
      disabled={isGenerating}
      className={cn("gap-2", className)}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {isPlaying ? "Pause Briefing" : "Play Briefing"}
    </Button>
  );
}

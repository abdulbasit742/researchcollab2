import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TranscriptWord {
  text: string;
  start: number;
  end: number;
}

interface VoiceTranscriptProps {
  transcript: string | null;
  words?: TranscriptWord[];
  currentTime?: number;
  isLoading?: boolean;
  onWordClick?: (time: number) => void;
  className?: string;
}

export function VoiceTranscript({
  transcript,
  words,
  currentTime = 0,
  isLoading = false,
  onWordClick,
  className,
}: VoiceTranscriptProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!transcript) return;
    
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 p-3 rounded-lg bg-muted/30", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Transcribing audio...</span>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className={cn("p-3 rounded-lg bg-muted/30", className)}>
        <span className="text-sm text-muted-foreground italic">
          No transcript available
        </span>
      </div>
    );
  }

  // If we have word-level timestamps, render interactive transcript
  if (words && words.length > 0) {
    return (
      <div className={cn("rounded-lg bg-muted/30 overflow-hidden", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Transcript
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-7 w-7"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </Button>
          </div>
        </div>

        {/* Word-by-word transcript */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-1">
                <p className="text-sm leading-relaxed">
                  {words.map((word, index) => {
                    const isActive =
                      currentTime >= word.start && currentTime < word.end;
                    const isPast = currentTime >= word.end;

                    return (
                      <span
                        key={index}
                        onClick={() => onWordClick?.(word.start)}
                        className={cn(
                          "transition-colors cursor-pointer hover:text-primary",
                          isActive && "text-primary font-medium bg-primary/10 px-0.5 rounded",
                          isPast && "text-foreground",
                          !isPast && !isActive && "text-muted-foreground"
                        )}
                      >
                        {word.text}
                        {index < words.length - 1 && " "}
                      </span>
                    );
                  })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed preview */}
        {!isExpanded && (
          <div className="p-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {transcript}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Simple transcript without timestamps
  return (
    <div className={cn("rounded-lg bg-muted/30 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Transcript
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-7 w-7"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p
          className={cn(
            "text-sm text-muted-foreground",
            !isExpanded && "line-clamp-2"
          )}
        >
          {transcript}
        </p>
      </div>
    </div>
  );
}

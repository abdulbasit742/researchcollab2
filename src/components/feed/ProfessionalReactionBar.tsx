import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  useProfessionalReactions,
  PROFESSIONAL_REACTIONS,
  ProfessionalReactionType,
} from "@/hooks/useProfessionalSignals";
import { cn } from "@/lib/utils";

interface ProfessionalReactionBarProps {
  postId: string;
  disabled?: boolean;
  disabledReason?: string;
  currentReaction?: ProfessionalReactionType | null;
  reactionCounts?: Record<ProfessionalReactionType, number>;
}

export function ProfessionalReactionBar({
  postId,
  disabled = false,
  disabledReason,
  currentReaction = null,
  reactionCounts = {} as Record<ProfessionalReactionType, number>,
}: ProfessionalReactionBarProps) {
  const { react, removeReaction, isReacting } = useProfessionalReactions(postId);
  const [localReaction, setLocalReaction] = useState<ProfessionalReactionType | null>(currentReaction);

  const handleReaction = (reactionType: ProfessionalReactionType) => {
    if (disabled) return;
    
    if (localReaction === reactionType) {
      setLocalReaction(null);
      removeReaction();
    } else {
      setLocalReaction(reactionType);
      react(reactionType);
    }
  };

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-2">
      {/* Reaction Counts Summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {Object.entries(reactionCounts)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => (
              <span key={type} className="flex items-center gap-0.5">
                <span>{PROFESSIONAL_REACTIONS[type as ProfessionalReactionType].emoji}</span>
                <span>{count}</span>
              </span>
            ))}
        </div>
      )}

      {/* Reaction Buttons */}
      <div className="flex items-center gap-1 flex-wrap">
        <TooltipProvider>
          {(Object.entries(PROFESSIONAL_REACTIONS) as [ProfessionalReactionType, typeof PROFESSIONAL_REACTIONS[ProfessionalReactionType]][]).map(([type, config]) => (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <Button
                  variant={localReaction === type ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleReaction(type)}
                  disabled={disabled || isReacting}
                  className={cn(
                    "h-8 gap-1 text-xs",
                    localReaction === type && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <span>{config.emoji}</span>
                  <span className="hidden sm:inline">{config.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-medium">{config.label}</p>
                <p className="text-xs text-muted-foreground">
                  {disabled ? disabledReason : config.description}
                </p>
                {!disabled && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Trust weight: +{config.trustWeight}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Trust Impact Notice */}
      {!disabled && (
        <p className="text-xs text-muted-foreground">
          Reactions are limited. Your professional signal matters.
        </p>
      )}
    </div>
  );
}

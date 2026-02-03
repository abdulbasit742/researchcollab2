import { motion, AnimatePresence } from "framer-motion";
import { 
  PROFESSIONAL_REACTIONS, 
  ProfessionalReactionType 
} from "@/hooks/useProfessionalSignals";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfessionalReactionPickerProps {
  onSelect: (reactionType: ProfessionalReactionType) => void;
  onClose: () => void;
  isOpen: boolean;
  currentReaction?: ProfessionalReactionType | null;
  position?: "left" | "right";
  disabled?: boolean;
}

export function ProfessionalReactionPicker({
  onSelect,
  onClose,
  isOpen,
  currentReaction,
  position = "left",
  disabled = false,
}: ProfessionalReactionPickerProps) {
  const reactions = Object.entries(PROFESSIONAL_REACTIONS) as [
    ProfessionalReactionType,
    typeof PROFESSIONAL_REACTIONS[ProfessionalReactionType]
  ][];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute bottom-full mb-2 z-50",
              "bg-card border border-border rounded-xl shadow-lg",
              "p-2",
              position === "right" ? "right-0" : "left-0"
            )}
          >
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground px-2 pb-1 border-b border-border/50">
                  Professional Reactions
                </p>
                <div className="flex items-center gap-1 pt-1">
                  {reactions.map(([type, config]) => {
                    const isSelected = currentReaction === type;
                    return (
                      <Tooltip key={type}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              if (!disabled) {
                                onSelect(type);
                                onClose();
                              }
                            }}
                            disabled={disabled}
                            className={cn(
                              "w-10 h-10 flex items-center justify-center rounded-lg",
                              "transition-all duration-150",
                              isSelected 
                                ? "bg-primary/10 ring-2 ring-primary/30 scale-110" 
                                : "hover:bg-muted",
                              disabled && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <span className="text-lg">{config.emoji}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[200px]">
                          <p className="font-medium">{config.label}</p>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                          <p className="text-xs text-primary mt-1">Trust weight: +{config.trustWeight}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </TooltipProvider>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ReactionsSummaryProps {
  reactions: Record<ProfessionalReactionType, number>;
  myReaction?: ProfessionalReactionType | null;
  onReactionClick?: (type: ProfessionalReactionType) => void;
}

export function ReactionsSummary({ 
  reactions, 
  myReaction, 
  onReactionClick 
}: ReactionsSummaryProps) {
  const hasReactions = Object.values(reactions).some(count => count > 0);
  
  if (!hasReactions) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.entries(reactions) as [ProfessionalReactionType, number][])
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => {
          const config = PROFESSIONAL_REACTIONS[type];
          const isMyReaction = myReaction === type;
          
          return (
            <button
              key={type}
              onClick={() => onReactionClick?.(type)}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                "border transition-colors",
                isMyReaction 
                  ? "bg-primary/10 border-primary/30 text-primary" 
                  : "bg-muted/50 border-border hover:bg-muted"
              )}
            >
              <span>{config.emoji}</span>
              <span className="font-medium">{count}</span>
            </button>
          );
        })}
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type ReactionType = "like" | "celebrate" | "support" | "insightful" | "curious";

interface ReactionConfig {
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
}

const reactions: ReactionConfig[] = [
  { type: "like", emoji: "👍", label: "Like", color: "text-blue-600 dark:text-blue-400" },
  { type: "celebrate", emoji: "🎉", label: "Celebrate", color: "text-green-600 dark:text-green-400" },
  { type: "support", emoji: "❤️", label: "Support", color: "text-red-500 dark:text-red-400" },
  { type: "insightful", emoji: "💡", label: "Insightful", color: "text-yellow-600 dark:text-yellow-400" },
  { type: "curious", emoji: "🤔", label: "Curious", color: "text-purple-600 dark:text-purple-400" },
];

interface ReactionPickerProps {
  currentReaction?: ReactionType | null;
  reactionsCount: number;
  reactionsSummary?: Record<string, number>;
  onReact: (type: ReactionType) => void;
  onRemoveReaction: () => void;
}

export function ReactionPicker({
  currentReaction,
  reactionsCount,
  reactionsSummary,
  onReact,
  onRemoveReaction,
}: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const activeReaction = currentReaction
    ? reactions.find((r) => r.type === currentReaction)
    : null;

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => setShowPicker(true), 500);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setShowPicker(false);
  };

  const handleClick = () => {
    if (currentReaction) {
      onRemoveReaction();
    } else {
      onReact("like");
    }
  };

  const handleReactionSelect = (type: ReactionType) => {
    if (currentReaction === type) {
      onRemoveReaction();
    } else {
      onReact(type);
    }
    setShowPicker(false);
  };

  // Top 3 reaction emojis for summary
  const topReactions = reactionsSummary
    ? Object.entries(reactionsSummary)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([type]) => reactions.find((r) => r.type === type)?.emoji)
        .filter(Boolean)
    : [];

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Reaction Picker Popup */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 z-50"
          >
            <div className="flex items-center gap-1 bg-card border border-border rounded-full px-2 py-1.5 shadow-lg">
              {reactions.map((reaction) => (
                <button
                  key={reaction.type}
                  onClick={() => handleReactionSelect(reaction.type)}
                  className={cn(
                    "group relative flex items-center justify-center h-9 w-9 rounded-full transition-all hover:scale-125 hover:bg-muted",
                    currentReaction === reaction.type && "bg-muted scale-110"
                  )}
                  title={reaction.label}
                >
                  <span className="text-xl">{reaction.emoji}</span>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-foreground text-background px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {reaction.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-muted flex-1 justify-center",
          activeReaction ? activeReaction.color : "text-muted-foreground"
        )}
      >
        {activeReaction ? (
          <span className="text-base">{activeReaction.emoji}</span>
        ) : (
          <span className="text-base">👍</span>
        )}
        <span className="hidden sm:inline">{activeReaction?.label || "Like"}</span>
      </button>

      {/* Reactions Summary (inline) */}
      {reactionsCount > 0 && topReactions.length > 0 && (
        <div className="absolute -top-1 -right-2 flex items-center">
          <div className="flex -space-x-1">
            {topReactions.map((emoji, i) => (
              <span key={i} className="text-xs bg-card border border-border rounded-full w-4 h-4 flex items-center justify-center">
                {emoji}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReactionsSummaryBar({
  reactionsCount,
  reactionsSummary,
}: {
  reactionsCount: number;
  reactionsSummary?: Record<string, number>;
}) {
  if (reactionsCount === 0 || !reactionsSummary) return null;

  const topReactions = Object.entries(reactionsSummary)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type, count]) => ({
      emoji: reactions.find((r) => r.type === type)?.emoji || "👍",
      count,
    }));

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <div className="flex -space-x-0.5">
        {topReactions.map((r, i) => (
          <span key={i} className="text-sm">{r.emoji}</span>
        ))}
      </div>
      <span>{reactionsCount}</span>
    </div>
  );
}

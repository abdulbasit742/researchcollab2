import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const REACTION_EMOJIS = ['👍', '❤️', '🎯', '📌', '❗'] as const;

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  isOpen: boolean;
  position?: "left" | "right";
}

export function ReactionPicker({ onSelect, onClose, isOpen, position = "left" }: ReactionPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute bottom-full mb-2 z-50",
              "bg-card border border-border rounded-full shadow-lg",
              "flex items-center gap-1 p-1.5",
              position === "right" ? "right-0" : "left-0"
            )}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-full",
                  "hover:bg-muted transition-colors",
                  "text-lg active:scale-110 transition-transform"
                )}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ReactionsDisplayProps {
  reactions: Array<{ user_id: string; emoji: string }>;
  currentUserId?: string;
  onReactionClick?: (emoji: string) => void;
}

export function ReactionsDisplay({ reactions, currentUserId, onReactionClick }: ReactionsDisplayProps) {
  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const grouped = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r.user_id);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(grouped).map(([emoji, users]) => {
        const hasMyReaction = currentUserId && users.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onReactionClick?.(emoji)}
            className={cn(
              "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs",
              "border transition-colors",
              hasMyReaction 
                ? "bg-primary/10 border-primary/30 text-primary" 
                : "bg-muted border-border hover:bg-muted/80"
            )}
          >
            <span>{emoji}</span>
            <span className="font-medium">{users.length}</span>
          </button>
        );
      })}
    </div>
  );
}

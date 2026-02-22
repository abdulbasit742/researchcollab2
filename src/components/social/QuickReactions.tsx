import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quickReactions = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "💡", label: "Brilliant" },
  { emoji: "👏", label: "Applause" },
  { emoji: "🎯", label: "Spot on" },
  { emoji: "🧠", label: "Insightful" },
  { emoji: "❤️", label: "Love" },
];

interface QuickReactionsProps {
  onReact: (emoji: string) => void;
  isOpen: boolean;
}

export function QuickReactions({ onReact, isOpen }: QuickReactionsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          className="absolute bottom-full left-0 mb-2 bg-card border rounded-2xl shadow-xl px-2 py-1.5 flex gap-0.5"
        >
          {quickReactions.map((reaction, index) => (
            <motion.button
              key={reaction.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.4, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onReact(reaction.emoji)}
              className="text-2xl p-1 hover:bg-muted rounded-lg transition-colors"
              title={reaction.label}
            >
              {reaction.emoji}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating reaction burst effect
export function ReactionBurst({ emoji, trigger }: { emoji: string; trigger: number }) {
  const [bursts, setBursts] = useState<{ id: number; x: number; rotate: number }[]>([]);

  if (trigger > 0 && !bursts.find(b => b.id === trigger)) {
    const newBurst = { id: trigger, x: Math.random() * 60 - 30, rotate: Math.random() * 60 - 30 };
    setBursts(prev => [...prev, newBurst]);
    setTimeout(() => setBursts(prev => prev.filter(b => b.id !== newBurst.id)), 1500);
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {bursts.map(burst => (
          <motion.div
            key={burst.id}
            initial={{ opacity: 1, scale: 0.5, y: 0, x: "50%" }}
            animate={{ opacity: 0, scale: 2, y: -200, x: `calc(50% + ${burst.x}px)`, rotate: burst.rotate }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute bottom-1/3 left-1/2 text-4xl"
          >
            {emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

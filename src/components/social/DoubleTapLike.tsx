import { useState, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface DoubleTapLikeProps {
  children: ReactNode;
  onDoubleTap: () => void;
  isLiked: boolean;
  className?: string;
}

export function DoubleTapLike({ children, onDoubleTap, isLiked, className }: DoubleTapLikeProps) {
  const [showHeart, setShowHeart] = useState(false);
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });
  const lastTapTime = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      // Double tap detected
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
        setHeartPosition({
          x: (clientX || 0) - rect.left,
          y: (clientY || 0) - rect.top,
        });
      }
      
      if (!isLiked) {
        onDoubleTap();
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    }
    lastTapTime.current = now;
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onClick={handleTap}
    >
      {children}
      
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              left: heartPosition.x - 40,
              top: heartPosition.y - 40,
              pointerEvents: "none",
            }}
          >
            <Heart className="h-20 w-20 text-red-500 fill-red-500 drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Floating hearts animation (like TikTok live)
interface FloatingHeartsProps {
  trigger: number; // increment to trigger a new heart
}

export function FloatingHearts({ trigger }: FloatingHeartsProps) {
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

  // Add new heart when trigger changes
  useState(() => {
    if (trigger > 0) {
      const newHeart = { id: trigger, x: Math.random() * 40 - 20 };
      setHearts(prev => [...prev, newHeart]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 2000);
    }
  });

  return (
    <div className="fixed bottom-20 right-4 pointer-events-none">
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, y: 0, x: heart.x }}
            animate={{ opacity: 0, y: -200, x: heart.x + Math.random() * 40 - 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute bottom-0"
          >
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Emoji reaction picker (like Facebook)
const reactions = [
  { emoji: "❤️", label: "Love", color: "text-red-500" },
  { emoji: "😂", label: "Haha", color: "text-yellow-500" },
  { emoji: "😮", label: "Wow", color: "text-yellow-500" },
  { emoji: "😢", label: "Sad", color: "text-yellow-500" },
  { emoji: "😡", label: "Angry", color: "text-orange-500" },
  { emoji: "👍", label: "Like", color: "text-blue-500" },
];

interface ReactionPickerProps {
  onSelect: (reaction: typeof reactions[0]) => void;
  isOpen: boolean;
}

export function ReactionPicker({ onSelect, isOpen }: ReactionPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="absolute bottom-full left-0 mb-2 bg-card border rounded-full shadow-xl p-2 flex gap-1"
        >
          {reactions.map((reaction, index) => (
            <motion.button
              key={reaction.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.3, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(reaction)}
              className="text-2xl hover:bg-muted rounded-full p-1 transition-colors"
            >
              {reaction.emoji}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

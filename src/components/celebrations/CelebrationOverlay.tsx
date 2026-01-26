import { motion, AnimatePresence } from "framer-motion";
import { Confetti } from "./Confetti";
import { Sparkles, PartyPopper, Trophy, Star } from "lucide-react";

interface CelebrationOverlayProps {
  isActive: boolean;
  title?: string;
  subtitle?: string;
  icon?: "sparkles" | "party" | "trophy" | "star";
  onComplete?: () => void;
}

const ICONS = {
  sparkles: Sparkles,
  party: PartyPopper,
  trophy: Trophy,
  star: Star,
};

export function CelebrationOverlay({
  isActive,
  title = "Congratulations!",
  subtitle,
  icon = "party",
  onComplete,
}: CelebrationOverlayProps) {
  const IconComponent = ICONS[icon];

  return (
    <>
      <Confetti isActive={isActive} onComplete={onComplete} />
      
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4 text-center px-6"
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
            >
              {/* Glowing icon */}
              <motion.div
                className="relative"
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl scale-150" />
                
                <div className="relative w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-xl">
                  <IconComponent className="w-10 h-10 text-primary-foreground" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-gradient"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {title}
              </motion.h2>

              {/* Subtitle */}
              {subtitle && (
                <motion.p
                  className="text-lg text-muted-foreground max-w-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

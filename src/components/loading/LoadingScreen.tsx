import { motion, AnimatePresence } from "framer-motion";
import { FloatingOrbs } from "@/components/decorations";
import { AnimatedLogo } from "./AnimatedLogo";

interface LoadingScreenProps {
  isLoading: boolean;
  progress: number;
  isComplete: boolean;
}

export function LoadingScreen({ isLoading, progress, isComplete }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gradient-hero"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Background orbs */}
          <FloatingOrbs />

          {/* Content container */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Animated logo */}
            <AnimatedLogo />

            {/* Brand text */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="text-gradient">ResearchCollabPro</span>
              </h1>
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                Connecting minds, accelerating research
              </motion.p>
            </motion.div>

            {/* Progress section */}
            <motion.div
              className="w-64 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              {/* Progress bar container */}
              <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                {/* Progress bar fill */}
                <motion.div
                  className="h-full rounded-full gradient-primary relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 shimmer" />
                </motion.div>
              </div>

              {/* Loading text with animated dots */}
              <motion.div
                className="flex items-center gap-1 text-xs text-muted-foreground"
                animate={isComplete ? { opacity: 0 } : { opacity: 1 }}
              >
                <span>Loading</span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.4 }}
                >
                  .
                </motion.span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { Confetti } from "./Confetti";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  TrendingUp,
  Eye,
  Star,
  ArrowRight,
} from "lucide-react";

interface MilestoneCelebrationProps {
  isActive: boolean;
  trustIncrease?: number;
  newTrustScore?: number;
  visibilityBoost?: string;
  categoryRank?: string;
  onDismiss?: () => void;
}

export function MilestoneCelebration({
  isActive,
  trustIncrease = 5,
  newTrustScore = 35,
  visibilityBoost = "15%",
  categoryRank = "Top 40%",
  onDismiss,
}: MilestoneCelebrationProps) {
  return (
    <>
      <Confetti isActive={isActive} />

      <AnimatePresence>
        {isActive && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* Icon */}
              <motion.div
                className="mx-auto mb-4"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold mb-1">Milestone Complete! 🎉</h2>
              <p className="text-muted-foreground text-sm mb-5">
                Your work has been verified and approved
              </p>

              {/* Impact metrics */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <motion.div
                  className="p-3 rounded-lg bg-accent/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <TrendingUp className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-emerald-600">+{trustIncrease}</p>
                  <p className="text-[10px] text-muted-foreground">Trust Score</p>
                </motion.div>

                <motion.div
                  className="p-3 rounded-lg bg-accent/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Eye className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-600">{visibilityBoost}</p>
                  <p className="text-[10px] text-muted-foreground">Visibility</p>
                </motion.div>

                <motion.div
                  className="p-3 rounded-lg bg-accent/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Star className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-amber-600">{categoryRank}</p>
                  <p className="text-[10px] text-muted-foreground">Your Rank</p>
                </motion.div>
              </div>

              <motion.div
                className="p-3 rounded-lg border border-primary/20 bg-primary/5 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm">
                  Your trust score is now <span className="font-bold text-primary">{newTrustScore}</span>.
                  You're ranked <span className="font-semibold">{categoryRank}</span> in your category.
                </p>
              </motion.div>

              <Button onClick={onDismiss} className="w-full gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

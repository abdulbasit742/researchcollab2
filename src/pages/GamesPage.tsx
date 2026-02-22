import { MainLayout } from "@/components/layout/MainLayout";
import { TrustQuizGame } from "@/components/games/TrustQuizGame";
import { MilestoneMatchGame } from "@/components/games/MilestoneMatchGame";
import { WordScrambleGame } from "@/components/games/WordScrambleGame";
import { Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";

export default function GamesPage() {
  return (
    <MainLayout>
      <div className="container px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Gamepad2 className="h-8 w-8 text-primary" />
            Learning Games
          </h1>
          <p className="text-muted-foreground mt-2">
            Test your knowledge about trust, escrow, and academic collaboration
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <TrustQuizGame />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <MilestoneMatchGame />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <WordScrambleGame />
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}

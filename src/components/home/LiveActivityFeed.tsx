import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

const activities = [
  { text: "Dr. Chen just published a new paper on quantum computing", time: "2m ago" },
  { text: "New collaboration formed in Molecular Biology", time: "5m ago" },
  { text: "Grant awarded: $50K for AI Ethics Research", time: "8m ago" },
  { text: "Prof. Williams joined from University of Oxford", time: "12m ago" },
  { text: "Research milestone: 500 citations achieved", time: "15m ago" },
  { text: "New team formed: Climate Data Analytics", time: "18m ago" },
  { text: "Dr. Patel completed a peer review in Physics", time: "22m ago" },
  { text: "Collaboration match: 98% compatibility score", time: "25m ago" },
];

export function LiveActivityFeed() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % activities.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const current = activities[index];

  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs md:text-sm max-w-[95vw] sm:max-w-md">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <Zap className="h-3 w-3 text-primary shrink-0" />
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-muted-foreground line-clamp-2 sm:truncate"
          >
            {current.text}
          </motion.span>
        </AnimatePresence>
        <span className="text-muted-foreground/50 text-[10px] shrink-0 hidden sm:inline">{current.time}</span>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  userName?: string;
  className?: string;
}

export function TypingIndicator({ userName, className }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn("flex items-center gap-2 px-4 py-2", className)}
    >
      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-muted">
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          className="h-2 w-2 rounded-full bg-muted-foreground/60"
        />
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          className="h-2 w-2 rounded-full bg-muted-foreground/60"
        />
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          className="h-2 w-2 rounded-full bg-muted-foreground/60"
        />
      </div>
      {userName && (
        <span className="text-xs text-muted-foreground">
          {userName} is typing...
        </span>
      )}
    </motion.div>
  );
}

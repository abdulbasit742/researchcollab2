import { motion } from "framer-motion";
import { GraduationCap, BookOpen, FlaskConical } from "lucide-react";

export function AnimatedLogo() {
  return (
    <div className="relative">
      {/* Floating academic icons */}
      <motion.div
        className="absolute -top-8 -left-12 text-primary/30"
        animate={{ y: [-5, 5, -5], rotate: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <GraduationCap className="w-6 h-6" />
      </motion.div>
      <motion.div
        className="absolute -top-6 -right-10 text-primary/25"
        animate={{ y: [5, -5, 5], rotate: [5, -5, 5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <BookOpen className="w-5 h-5" />
      </motion.div>
      <motion.div
        className="absolute -bottom-6 -right-8 text-primary/20"
        animate={{ y: [-3, 3, -3], rotate: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <FlaskConical className="w-5 h-5" />
      </motion.div>

      {/* Glow effect behind logo */}
      <motion.div
        className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-[-8px] rounded-2xl"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(280 80% 65% / 0.3))",
        }}
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Main logo container */}
      <motion.div
        className="relative w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shadow-xl"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1
        }}
      >
        {/* Logo text */}
        <motion.span
          className="text-4xl font-bold text-primary-foreground tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          RC
        </motion.span>

        {/* Inner shine effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            animate={{ x: ["-200%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

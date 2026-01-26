import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbConfig {
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
  color: "primary" | "accent" | "secondary";
}

interface FloatingOrbsProps {
  className?: string;
  variant?: "hero" | "subtle" | "dense";
}

const orbConfigs: Record<string, OrbConfig[]> = {
  hero: [
    { size: 400, x: "10%", y: "20%", delay: 0, duration: 20, color: "primary" },
    { size: 300, x: "80%", y: "10%", delay: 2, duration: 25, color: "accent" },
    { size: 250, x: "70%", y: "60%", delay: 4, duration: 22, color: "secondary" },
    { size: 200, x: "20%", y: "70%", delay: 1, duration: 18, color: "primary" },
    { size: 150, x: "50%", y: "40%", delay: 3, duration: 24, color: "accent" },
  ],
  subtle: [
    { size: 300, x: "15%", y: "25%", delay: 0, duration: 25, color: "primary" },
    { size: 250, x: "75%", y: "15%", delay: 2, duration: 28, color: "accent" },
    { size: 200, x: "85%", y: "70%", delay: 4, duration: 22, color: "secondary" },
  ],
  dense: [
    { size: 350, x: "5%", y: "15%", delay: 0, duration: 18, color: "primary" },
    { size: 280, x: "85%", y: "5%", delay: 1, duration: 22, color: "accent" },
    { size: 320, x: "75%", y: "55%", delay: 2, duration: 20, color: "secondary" },
    { size: 180, x: "25%", y: "75%", delay: 3, duration: 24, color: "primary" },
    { size: 220, x: "45%", y: "35%", delay: 1.5, duration: 26, color: "accent" },
    { size: 160, x: "60%", y: "80%", delay: 4, duration: 19, color: "secondary" },
    { size: 140, x: "10%", y: "50%", delay: 2.5, duration: 21, color: "primary" },
  ],
};

const colorClasses = {
  primary: "from-primary/20 to-primary/5",
  accent: "from-accent/30 to-accent/5",
  secondary: "from-secondary/25 to-secondary/5",
};

export function FloatingOrbs({ className, variant = "hero" }: FloatingOrbsProps) {
  const orbs = orbConfigs[variant];

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={cn(
            "absolute rounded-full bg-gradient-radial blur-3xl",
            colorClasses[orb.color]
          )}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, 0, -20, 0],
            scale: [1, 1.05, 1, 0.95, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

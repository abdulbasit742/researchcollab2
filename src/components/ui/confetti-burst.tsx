import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#FFD700",
  "#FF6B6B",
  "#4ECDC4",
  "#A78BFA",
  "#F472B6",
];

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 200 + 100),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.8,
  }));
}

interface ConfettiBurstProps {
  trigger: boolean;
  onComplete?: () => void;
  count?: number;
}

export function ConfettiBurst({ trigger, onComplete, count = 30 }: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      setParticles(createParticles(count));
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [trigger, count, onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: "50vw", y: "50vh", scale: 0, rotate: 0 }}
            animate={{
              opacity: [1, 1, 0],
              x: `calc(50vw + ${p.x}px)`,
              y: `calc(50vh + ${p.y}px)`,
              scale: p.scale,
              rotate: p.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute"
          >
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: p.color }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useConfetti() {
  const [firing, setFiring] = useState(false);
  const fire = useCallback(() => setFiring(true), []);
  const reset = useCallback(() => setFiring(false), []);
  return { firing, fire, reset };
}

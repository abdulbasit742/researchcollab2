import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  scale: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  pieceCount?: number;
  onComplete?: () => void;
}

const COLORS = [
  "hsl(263, 70%, 58%)", // Primary purple
  "hsl(280, 80%, 65%)", // Light purple
  "hsl(263, 70%, 40%)", // Dark purple
  "hsl(45, 93%, 58%)",  // Gold
  "hsl(142, 76%, 50%)", // Green
  "hsl(199, 89%, 48%)", // Blue
];

const SHAPES = ["square", "circle", "triangle"] as const;

export function Confetti({ 
  isActive, 
  duration = 3000, 
  pieceCount = 80,
  onComplete 
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      }));
      setPieces(newPieces);
      setIsVisible(true);

      // Clean up after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, pieceCount, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
          {pieces.map((piece) => (
            <ConfettiPieceComponent key={piece.id} piece={piece} />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

function ConfettiPieceComponent({ piece }: { piece: ConfettiPiece }) {
  const shape = SHAPES[piece.id % SHAPES.length];
  
  return (
    <motion.div
      className="absolute w-3 h-3"
      style={{
        left: `${piece.x}%`,
        top: -20,
      }}
      initial={{ 
        y: -20, 
        rotate: 0,
        opacity: 1,
        scale: piece.scale,
      }}
      animate={{ 
        y: window.innerHeight + 100,
        rotate: piece.rotation + 720,
        opacity: [1, 1, 0],
        x: [0, Math.sin(piece.id) * 100, Math.cos(piece.id) * 50],
      }}
      transition={{
        duration: 2.5 + Math.random(),
        delay: piece.delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {shape === "square" && (
        <div 
          className="w-full h-full rounded-sm"
          style={{ backgroundColor: piece.color }}
        />
      )}
      {shape === "circle" && (
        <div 
          className="w-full h-full rounded-full"
          style={{ backgroundColor: piece.color }}
        />
      )}
      {shape === "triangle" && (
        <div 
          className="w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderBottom: `10px solid ${piece.color}`,
          }}
        />
      )}
    </motion.div>
  );
}

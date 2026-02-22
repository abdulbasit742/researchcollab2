import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Puzzle, RotateCcw, Timer } from "lucide-react";
import { motion } from "framer-motion";

const cardPairs = [
  { id: "proposal", emoji: "📝", label: "Proposal" },
  { id: "funding", emoji: "💰", label: "Funding" },
  { id: "milestone", emoji: "🎯", label: "Milestone" },
  { id: "review", emoji: "🔍", label: "Review" },
  { id: "escrow", emoji: "🔒", label: "Escrow" },
  { id: "trust", emoji: "⭐", label: "Trust" },
];

interface MemCard {
  id: string;
  emoji: string;
  label: string;
  uniqueId: number;
  flipped: boolean;
  matched: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createBoard(): MemCard[] {
  const doubled = cardPairs.flatMap((c, i) => [
    { ...c, uniqueId: i * 2, flipped: false, matched: false },
    { ...c, uniqueId: i * 2 + 1, flipped: false, matched: false },
  ]);
  return shuffleArray(doubled);
}

export function MilestoneMatchGame() {
  const [cards, setCards] = useState<MemCard[]>(createBoard);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || gameOver) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, gameOver]);

  const handleFlip = useCallback((uniqueId: number) => {
    if (flippedIds.length >= 2) return;
    if (!started) setStarted(true);

    setCards((prev) => prev.map((c) => (c.uniqueId === uniqueId ? { ...c, flipped: true } : c)));
    setFlippedIds((prev) => {
      const next = [...prev, uniqueId];
      if (next.length === 2) {
        setMoves((m) => m + 1);
        setTimeout(() => checkMatch(next), 600);
      }
      return next;
    });
  }, [flippedIds, started]);

  const checkMatch = useCallback((ids: number[]) => {
    setCards((prev) => {
      const [a, b] = ids.map((id) => prev.find((c) => c.uniqueId === id)!);
      if (a.id === b.id) {
        const updated = prev.map((c) => (c.id === a.id ? { ...c, matched: true } : c));
        if (updated.every((c) => c.matched)) setGameOver(true);
        return updated;
      }
      return prev.map((c) => (ids.includes(c.uniqueId) ? { ...c, flipped: false } : c));
    });
    setFlippedIds([]);
  }, []);

  const restart = useCallback(() => {
    setCards(createBoard());
    setFlippedIds([]);
    setMoves(0);
    setSeconds(0);
    setGameOver(false);
    setStarted(false);
  }, []);

  const rating = moves <= 8 ? "⭐⭐⭐" : moves <= 12 ? "⭐⭐" : "⭐";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Puzzle className="h-5 w-5 text-accent-foreground" />
            Milestone Match
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <Timer className="h-3 w-3" /> {seconds}s
            </Badge>
            <Badge variant="secondary">{moves} moves</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {gameOver ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4 py-4">
            <p className="text-4xl">{rating}</p>
            <p className="text-xl font-bold text-primary">Matched in {moves} moves!</p>
            <p className="text-sm text-muted-foreground">Time: {seconds}s</p>
            <Button onClick={restart} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Play Again
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {cards.map((card) => {
              const isUp = card.flipped || card.matched;
              return (
                <motion.button
                  key={card.uniqueId}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-square rounded-xl text-center flex flex-col items-center justify-center transition-all duration-300 border-2 ${
                    card.matched
                      ? "bg-primary/10 border-primary/30"
                      : isUp
                      ? "bg-card border-primary/50"
                      : "bg-muted hover:bg-muted/80 border-border cursor-pointer"
                  }`}
                  onClick={() => !isUp && handleFlip(card.uniqueId)}
                  disabled={isUp}
                >
                  {isUp ? (
                    <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ duration: 0.3 }}>
                      <span className="text-2xl sm:text-3xl">{card.emoji}</span>
                      <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1">{card.label}</p>
                    </motion.div>
                  ) : (
                    <span className="text-xl text-muted-foreground">?</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
        {!gameOver && (
          <Button variant="ghost" size="sm" onClick={restart} className="mt-4 w-full gap-2">
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

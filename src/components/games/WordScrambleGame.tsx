import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, RotateCcw, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WordData {
  word: string;
  hint: string;
}

const words: WordData[] = [
  { word: "ESCROW", hint: "Secure fund holding mechanism" },
  { word: "MILESTONE", hint: "A project checkpoint" },
  { word: "PROPOSAL", hint: "Initial project pitch" },
  { word: "SPONSOR", hint: "Project funder" },
  { word: "RESEARCH", hint: "Systematic investigation" },
  { word: "VERIFY", hint: "Confirm identity or work" },
  { word: "TRUST", hint: "Core platform currency" },
  { word: "DELIVER", hint: "Complete and hand off work" },
];

function scramble(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join("");
  return result === word ? scramble(word) : result;
}

export function WordScrambleGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [finished, setFinished] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const scrambledWords = useMemo(() => words.map((w) => scramble(w.word)), []);

  const current = words[currentIdx];
  const scrambled = scrambledWords[currentIdx];

  const checkAnswer = useCallback(() => {
    if (input.toUpperCase().trim() === current.word) {
      setShowResult("correct");
      setScore((s) => s + (usedHint ? 5 : 10));
      setStreak((s) => s + 1);
    } else {
      setShowResult("wrong");
      setStreak(0);
    }
    setTimeout(() => {
      if (currentIdx + 1 >= words.length) {
        setFinished(true);
      } else {
        setCurrentIdx((i) => i + 1);
        setInput("");
        setShowResult(null);
        setUsedHint(false);
        setShowHint(false);
      }
    }, 1200);
  }, [input, current, currentIdx, usedHint]);

  const restart = useCallback(() => {
    setCurrentIdx(0);
    setInput("");
    setScore(0);
    setStreak(0);
    setShowResult(null);
    setFinished(false);
    setUsedHint(false);
    setShowHint(false);
  }, []);

  const pct = ((currentIdx + (showResult ? 1 : 0)) / words.length) * 100;

  if (finished) {
    const maxScore = words.length * 10;
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Word Scramble — Results
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <p className="text-5xl font-bold text-primary">{score}/{maxScore}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {score >= 70 ? "🧠 Research vocabulary master!" : score >= 40 ? "📚 Good knowledge base!" : "🌱 Keep learning!"}
            </p>
          </motion.div>
          <Button onClick={restart} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-yellow-600" />
            Word Scramble
          </CardTitle>
          <div className="flex items-center gap-2">
            {streak >= 2 && <Badge className="bg-orange-500 text-white">🔥 {streak} streak</Badge>}
            <Badge variant="secondary">{score} pts</Badge>
          </div>
        </div>
        <Progress value={pct} className="h-2" />
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <p className="text-sm text-muted-foreground mb-2">
              Unscramble this research term ({currentIdx + 1}/{words.length})
            </p>

            <div className="flex justify-center gap-1.5 mb-4">
              {scrambled.split("").map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-9 h-11 sm:w-10 sm:h-12 rounded-lg bg-muted border-2 border-border flex items-center justify-center text-lg font-bold"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {showHint && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-center text-muted-foreground mb-3 italic">
                💡 {current.hint}
              </motion.p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && input.trim() && checkAnswer()}
                placeholder="Type your answer..."
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={showResult !== null}
                autoFocus
              />
              <Button onClick={checkAnswer} disabled={!input.trim() || showResult !== null} size="default">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {!showHint && !showResult && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowHint(true); setUsedHint(true); }}
                className="mt-2 w-full text-xs"
              >
                Need a hint? (-5 pts)
              </Button>
            )}

            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-3 p-3 rounded-lg text-center font-medium ${
                  showResult === "correct" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"
                }`}
              >
                {showResult === "correct" ? "✅ Correct!" : `❌ It was "${current.word}"`}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

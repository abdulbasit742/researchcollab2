import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const questions: Question[] = [
  {
    question: "What is an escrow payment in academic project funding?",
    options: [
      "A direct payment to the student",
      "Funds held by a third party until milestones are met",
      "A university scholarship",
      "A loan from the sponsor",
    ],
    correct: 1,
    explanation: "Escrow holds funds securely until deliverables are verified, protecting both sponsors and students.",
  },
  {
    question: "Which factor does NOT typically affect a Trust Score?",
    options: [
      "Milestone completion rate",
      "Peer reviews and endorsements",
      "Favorite color",
      "Verification status",
    ],
    correct: 2,
    explanation: "Trust Scores are built from real academic outcomes — delivery, collaboration, and institutional verification.",
  },
  {
    question: "What is the purpose of milestone-based execution?",
    options: [
      "To delay project completion",
      "To break work into verifiable checkpoints",
      "To increase project cost",
      "To reduce team size",
    ],
    correct: 1,
    explanation: "Milestones break large projects into measurable chunks, enabling incremental trust building and fund release.",
  },
  {
    question: "What does FYP stand for in this platform?",
    options: [
      "Fund Your Project",
      "Final Year Project",
      "First Year Program",
      "Future Youth Platform",
    ],
    correct: 1,
    explanation: "FYP = Final Year Project — the capstone academic deliverable that connects students with real-world sponsors.",
  },
  {
    question: "Why is institutional verification important?",
    options: [
      "It looks nice on a profile",
      "It confirms academic identity and builds systemic trust",
      "It's required by law",
      "It increases project costs",
    ],
    correct: 1,
    explanation: "Verified academic identity creates a trust baseline that makes sponsors confident in funding projects.",
  },
  {
    question: "What happens when a milestone is disputed?",
    options: [
      "The project is cancelled",
      "Funds are automatically released",
      "A review process determines the outcome",
      "The student loses all trust score",
    ],
    correct: 2,
    explanation: "Disputes trigger a fair review process where evidence is examined before any funds are moved.",
  },
];

export function TrustQuizGame() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleAnswer = useCallback((idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === questions[currentQ].correct) {
      setScore((s) => s + 1);
    }
  }, [answered, currentQ]);

  const nextQuestion = useCallback(() => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  }, [currentQ]);

  const restart = useCallback(() => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswered(false);
    setFinished(false);
  }, []);

  const q = questions[currentQ];
  const pct = ((currentQ + (answered ? 1 : 0)) / questions.length) * 100;

  if (finished) {
    const tier = score === questions.length ? "🏆 Perfect!" : score >= 4 ? "🥇 Expert" : score >= 2 ? "🥈 Learning" : "🥉 Beginner";
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Trust Quiz — Results
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <p className="text-5xl font-bold text-primary">{score}/{questions.length}</p>
            <p className="text-lg mt-2 text-muted-foreground">{tier}</p>
          </motion.div>
          <p className="text-sm text-muted-foreground">
            {score === questions.length
              ? "You're a trust & escrow master!"
              : "Keep learning about how trust powers academic collaboration."}
          </p>
          <Button onClick={restart} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Trust Quiz
          </CardTitle>
          <Badge variant="secondary">{currentQ + 1}/{questions.length}</Badge>
        </div>
        <Progress value={pct} className="h-2" />
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="font-semibold mb-4">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correct;
                const isSelected = i === selected;
                let variant: "outline" | "default" | "destructive" = "outline";
                if (answered && isCorrect) variant = "default";
                else if (answered && isSelected && !isCorrect) variant = "destructive";

                return (
                  <Button
                    key={i}
                    variant={variant}
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                  >
                    <span className="flex items-center gap-2">
                      {answered && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                      {answered && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0" />}
                      {opt}
                    </span>
                  </Button>
                );
              })}
            </div>
            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
        {answered && (
          <Button onClick={nextQuestion} className="w-full">
            {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

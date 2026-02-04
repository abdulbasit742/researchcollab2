import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Vote,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SwarmDecision, SwarmVote } from "@/hooks/useCollectiveIntelligence";

interface SwarmDecisionCardProps {
  decision: SwarmDecision;
  votes?: SwarmVote[];
  userVote?: SwarmVote;
  onVote?: (optionId: string, confidence: number, reasoning?: string) => void;
  showResults?: boolean;
  className?: string;
}

export function SwarmDecisionCard({ 
  decision, 
  votes = [],
  userVote,
  onVote,
  showResults = false,
  className 
}: SwarmDecisionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState(userVote?.option_id || "");
  const [confidence, setConfidence] = useState(userVote?.confidence ? userVote.confidence * 100 : 80);
  const [reasoning, setReasoning] = useState(userVote?.reasoning || "");
  const [submitting, setSubmitting] = useState(false);

  const isOpen = decision.status === "open" || decision.status === "voting";
  const hasVoted = !!userVote;
  const closesAt = new Date(decision.closes_at);
  const isExpired = closesAt < new Date();

  // Calculate vote distribution
  const voteDistribution = decision.options.map(option => {
    const optionVotes = votes.filter(v => v.option_id === option.id);
    const totalWeight = optionVotes.reduce((sum, v) => sum + (v.weight * v.confidence), 0);
    return {
      ...option,
      votes: optionVotes.length,
      weight: totalWeight,
    };
  });

  const totalWeight = voteDistribution.reduce((sum, o) => sum + o.weight, 0);
  const winningOption = voteDistribution.reduce((a, b) => a.weight > b.weight ? a : b, voteDistribution[0]);

  const handleSubmitVote = async () => {
    if (!onVote || !selectedOption) return;
    setSubmitting(true);
    await onVote(selectedOption, confidence / 100, reasoning || undefined);
    setSubmitting(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isOpen ? "default" : "secondary"}>
                {decision.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {decision.voting_method} voting
              </Badge>
            </div>
            <CardTitle className="text-lg">{decision.title}</CardTitle>
            <CardDescription className="mt-1">
              {decision.description}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{votes.length} votes</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {isExpired 
                ? `Closed ${formatDistanceToNow(closesAt)} ago`
                : `Closes ${formatDistanceToNow(closesAt, { addSuffix: true })}`
              }
            </span>
          </div>
          {decision.min_participants && (
            <span>Min {decision.min_participants} participants</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Results view */}
        {(showResults || !isOpen || hasVoted) && (
          <div className="space-y-3">
            {voteDistribution.map((option) => {
              const percentage = totalWeight > 0 ? (option.weight / totalWeight) * 100 : 0;
              const isWinning = option.id === winningOption?.id && totalWeight > 0;
              const isUserChoice = userVote?.option_id === option.id;

              return (
                <div key={option.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        isWinning && "text-primary"
                      )}>
                        {option.label}
                      </span>
                      {isUserChoice && (
                        <Badge variant="outline" className="text-xs">
                          Your vote
                        </Badge>
                      )}
                      {isWinning && !isOpen && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {option.votes} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}

        {/* Voting interface */}
        {isOpen && !hasVoted && onVote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 pt-2 border-t"
          >
            <div>
              <Label className="text-sm font-medium mb-2 block">Select your choice</Label>
              <RadioGroup
                value={selectedOption}
                onValueChange={setSelectedOption}
                className="space-y-2"
              >
                {decision.options.map((option) => (
                  <div 
                    key={option.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                      selectedOption === option.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                    <Label htmlFor={option.id} className="cursor-pointer flex-1">
                      <span className="font-medium">{option.label}</span>
                      {option.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {option.description}
                        </p>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide advanced options
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Advanced options
                </>
              )}
            </Button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Confidence Level</Label>
                      <span className="text-sm text-muted-foreground">{confidence}%</span>
                    </div>
                    <Slider
                      value={[confidence]}
                      onValueChange={([val]) => setConfidence(val)}
                      min={10}
                      max={100}
                      step={10}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      How confident are you in this choice?
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm mb-2 block">Reasoning (optional)</Label>
                    <Textarea
                      value={reasoning}
                      onChange={(e) => setReasoning(e.target.value)}
                      placeholder="Explain your reasoning..."
                      rows={2}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleSubmitVote}
              disabled={!selectedOption || submitting}
              className="w-full"
            >
              <Vote className="h-4 w-4 mr-2" />
              {submitting ? "Submitting..." : "Cast Vote"}
            </Button>
          </motion.div>
        )}

        {/* Final result */}
        {decision.result && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold">Decision Finalized</span>
            </div>
            <p className="text-sm">
              Winner: <strong>
                {decision.options.find(o => o.id === decision.result?.winning_option_id)?.label}
              </strong>
            </p>
            {decision.result.confidence_score && (
              <p className="text-xs text-muted-foreground mt-1">
                Confidence: {(decision.result.confidence_score * 100).toFixed(0)}%
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

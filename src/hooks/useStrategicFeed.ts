import { useState, useMemo } from "react";
import { useProfessionalSignalFeed } from "@/hooks/useProfessionalSignals";
import { useOpportunityEngine } from "@/hooks/useOpportunityEngine";

export type FeedMode = "social" | "opportunity";

export function useStrategicFeed() {
  const [mode, setMode] = useState<FeedMode>("opportunity");
  const { signals, isLoading: signalsLoading, hasMore, loadMore, refetch: refreshFeed } = useProfessionalSignalFeed();
  const { data: opportunities, isLoading: oppsLoading } = useOpportunityEngine({ sortBy: "relevance" });

  const rankedSignals = useMemo(() => {
    if (!signals) return [];

    const scored = signals.map((signal) => {
      let score = 0;
      // Outcome value boost
      if ((signal as any).outcome_value) score += Math.min((signal as any).outcome_value / 10000, 30);
      // Credibility boost from trust
      if ((signal as any).trust_score) score += Math.min((signal as any).trust_score / 2, 20);
      // Engagement quality (not vanity)
      const reactions = (signal as any).reaction_count || 0;
      const comments = (signal as any).comment_count || 0;
      score += Math.min(comments * 3 + reactions, 20);
      // Recency
      const ageHours = (Date.now() - new Date(signal.created_at).getTime()) / 3600000;
      score += Math.max(0, 30 - ageHours);

      return { ...signal, _strategicScore: score };
    });

    return scored.sort((a, b) => b._strategicScore - a._strategicScore);
  }, [signals]);

  return {
    mode,
    setMode,
    signals: rankedSignals,
    opportunities: opportunities || [],
    isLoading: signalsLoading || oppsLoading,
    hasMore,
    loadMore,
    refreshFeed,
  };
}

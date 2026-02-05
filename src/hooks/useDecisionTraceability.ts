import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  TracedDecision,
  DecisionOption,
  DecisionParticipant,
  DecisionOutcome,
} from "@/types/crisis-coordination";

// System 58: Decision Traceability Engine
// Record context, participants, rationale, and outcomes for every major decision

export function useDecisionTraceability() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<TracedDecision[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create a new decision record
  const createDecision = useCallback(async (
    title: string,
    context: string,
    options: Omit<DecisionOption, "id" | "wasSelected">[],
    impactLevel: TracedDecision["impactLevel"],
    missionId?: string,
    tags?: string[]
  ): Promise<TracedDecision | null> => {
    if (!user) return null;
    setIsLoading(true);

    const decision: TracedDecision = {
      id: `decision-${Date.now()}`,
      missionId,
      title,
      context,
      options: options.map((opt, i) => ({
        ...opt,
        id: `opt-${i}`,
        wasSelected: false,
      })),
      selectedOption: "",
      rationale: "",
      participants: [{
        userId: user.id,
        role: "proposer",
      }],
      madeAt: "",
      madeBy: "",
      impactLevel,
      outcomes: [],
      linkedDecisions: [],
      tags: tags || [],
    };

    await new Promise(r => setTimeout(r, 200));
    setDecisions(prev => [...prev, decision]);
    setIsLoading(false);
    return decision;
  }, [user]);

  // Add participants to a decision
  const addParticipant = useCallback((
    decisionId: string,
    participant: DecisionParticipant
  ) => {
    setDecisions(prev => prev.map(d => 
      d.id === decisionId
        ? { ...d, participants: [...d.participants, participant] }
        : d
    ));
  }, []);

  // Record a vote/feedback from a participant
  const recordVote = useCallback((
    decisionId: string,
    participantId: string,
    vote: DecisionParticipant["vote"],
    feedback?: string
  ) => {
    setDecisions(prev => prev.map(d => 
      d.id === decisionId
        ? {
            ...d,
            participants: d.participants.map(p =>
              p.userId === participantId ? { ...p, vote, feedback } : p
            ),
          }
        : d
    ));
  }, []);

  // Finalize a decision
  const finalizeDecision = useCallback(async (
    decisionId: string,
    selectedOptionId: string,
    rationale: string
  ) => {
    if (!user) return;
    setIsLoading(true);

    setDecisions(prev => prev.map(d => 
      d.id === decisionId
        ? {
            ...d,
            selectedOption: selectedOptionId,
            rationale,
            madeAt: new Date().toISOString(),
            madeBy: user.id,
            options: d.options.map(opt => ({
              ...opt,
              wasSelected: opt.id === selectedOptionId,
            })),
          }
        : d
    ));

    await new Promise(r => setTimeout(r, 200));
    setIsLoading(false);
  }, [user]);

  // Record an outcome of a decision
  const recordOutcome = useCallback((
    decisionId: string,
    outcome: Omit<DecisionOutcome, "id">
  ) => {
    const newOutcome: DecisionOutcome = {
      ...outcome,
      id: `outcome-${Date.now()}`,
    };

    setDecisions(prev => prev.map(d => 
      d.id === decisionId
        ? { ...d, outcomes: [...d.outcomes, newOutcome] }
        : d
    ));
  }, []);

  // Link related decisions
  const linkDecisions = useCallback((
    decisionId: string,
    linkedDecisionId: string
  ) => {
    setDecisions(prev => prev.map(d => {
      if (d.id === decisionId) {
        return { ...d, linkedDecisions: [...d.linkedDecisions, linkedDecisionId] };
      }
      if (d.id === linkedDecisionId) {
        return { ...d, linkedDecisions: [...d.linkedDecisions, decisionId] };
      }
      return d;
    }));
  }, []);

  // Get decision history for a mission
  const getDecisionsByMission = useCallback((missionId: string): TracedDecision[] => {
    return decisions.filter(d => d.missionId === missionId);
  }, [decisions]);

  // Get decisions by tag
  const getDecisionsByTag = useCallback((tag: string): TracedDecision[] => {
    return decisions.filter(d => d.tags.includes(tag));
  }, [decisions]);

  // Analyze decision patterns
  const analyzeDecisionPatterns = useCallback(() => {
    const finalizedDecisions = decisions.filter(d => d.madeAt);
    
    return {
      totalDecisions: decisions.length,
      finalizedDecisions: finalizedDecisions.length,
      byImpact: {
        minor: finalizedDecisions.filter(d => d.impactLevel === "minor").length,
        moderate: finalizedDecisions.filter(d => d.impactLevel === "moderate").length,
        major: finalizedDecisions.filter(d => d.impactLevel === "major").length,
        critical: finalizedDecisions.filter(d => d.impactLevel === "critical").length,
      },
      outcomeRate: finalizedDecisions.length > 0
        ? finalizedDecisions.filter(d => d.outcomes.length > 0).length / finalizedDecisions.length
        : 0,
      successRate: (() => {
        const withOutcomes = finalizedDecisions.filter(d => d.outcomes.length > 0);
        if (withOutcomes.length === 0) return 0;
        const successful = withOutcomes.filter(d => 
          d.outcomes.some(o => o.wasSuccessful)
        ).length;
        return successful / withOutcomes.length;
      })(),
    };
  }, [decisions]);

  return {
    decisions,
    isLoading,
    createDecision,
    addParticipant,
    recordVote,
    finalizeDecision,
    recordOutcome,
    linkDecisions,
    getDecisionsByMission,
    getDecisionsByTag,
    analyzeDecisionPatterns,
  };
}

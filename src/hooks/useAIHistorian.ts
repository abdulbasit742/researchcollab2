import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  AISynthesis,
  AISynthesisType,
  PatternAlert,
} from "@/types/knowledge-civilization";

// ============================================
// SYSTEM 42: AI AS HISTORIAN & SYNTHESIZER
// AI must cite sources and confidence - no hallucinations
// ============================================

export function useAIHistorian() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syntheses, setSyntheses] = useState<AISynthesis[]>([]);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);

  // Generate a synthesis
  const generateSynthesis = useCallback(async (
    type: AISynthesisType,
    sourceObjectIds: string[],
    domain: string,
    _prompt?: string
  ): Promise<AISynthesis | null> => {
    if (sourceObjectIds.length === 0) {
      toast.error("At least one source is required");
      return null;
    }

    setLoading(true);
    try {
      const sourceCount = sourceObjectIds.length;
      // This would call an AI service
      // For now, simulate synthesis generation
      const synthesis: AISynthesis = {
        id: crypto.randomUUID(),
        type,
        title: generateSynthesisTitle(type, domain),
        content: generateSynthesisContent(type, sourceCount),
        sourceObjectIds,
        citations: sourceObjectIds.map(id => ({
        objectId: id,
          relevance: "Primary source for analysis",
        })),
        confidenceScore: calculateConfidence(sourceCount),
        uncertaintyFactors: generateUncertaintyFactors(type),
        limitations: [
          "Based on available data as of generation date",
          "May not reflect unpublished or private knowledge",
          "Synthesis is AI-generated and should be verified",
        ],
        generatedAt: new Date(),
        generatedFor: user?.id,
        domain,
      };

      setSyntheses(prev => [...prev, synthesis]);
      toast.success("Synthesis generated");
      return synthesis;
    } catch (err) {
      toast.error("Failed to generate synthesis");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Summarize a body of work
  const summarizeBodyOfWork = useCallback(async (
    sourceObjectIds: string[],
    domain: string
  ) => {
    return generateSynthesis("summary", sourceObjectIds, domain);
  }, [generateSynthesis]);

  // Detect emerging patterns
  const detectPatterns = useCallback(async (
    sourceObjectIds: string[],
    domain: string
  ) => {
    return generateSynthesis("pattern_detection", sourceObjectIds, domain);
  }, [generateSynthesis]);

  // Surface forgotten insights
  const surfaceForgottenInsights = useCallback(async (
    sourceObjectIds: string[],
    domain: string
  ) => {
    return generateSynthesis("forgotten_insight", sourceObjectIds, domain);
  }, [generateSynthesis]);

  // Warn against repeated mistakes
  const warnRepeatedMistakes = useCallback(async (
    failureRecordIds: string[],
    currentContext: string
  ): Promise<PatternAlert | null> => {
    setLoading(true);
    try {
      // Would analyze failure records and compare to current context
      const alert: PatternAlert = {
        id: crypto.randomUUID(),
        type: "repeated_mistake",
        title: "Potential repeated mistake detected",
        description: `Based on ${failureRecordIds.length} historical failure(s), the current approach may face similar challenges.`,
        confidence: 0.7,
        sources: failureRecordIds,
        recommendedAction: "Review historical failures before proceeding",
        createdAt: new Date(),
      };

      setAlerts(prev => [...prev, alert]);
      return alert;
    } catch (err) {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Find cross-domain connections
  const findCrossDomainConnections = useCallback(async (
    sourceDomain: string,
    targetDomains: string[]
  ) => {
    return generateSynthesis("cross_domain_connection", [], sourceDomain);
  }, [generateSynthesis]);

  // Analyze trends
  const analyzeTrends = useCallback(async (
    sourceObjectIds: string[],
    domain: string,
    timeRange?: { start: Date; end: Date }
  ) => {
    return generateSynthesis("trend_analysis", sourceObjectIds, domain);
  }, [generateSynthesis]);

  // Rate a synthesis (user feedback)
  const rateSynthesis = useCallback(async (
    synthesisId: string,
    rating: number,
    wasUseful: boolean,
    feedbackNotes?: string
  ): Promise<boolean> => {
    setSyntheses(prev => prev.map(s => 
      s.id === synthesisId
        ? { ...s, userRating: rating, wasUseful, feedbackNotes }
        : s
    ));

    toast.success("Feedback recorded - thank you for improving AI synthesis");
    return true;
  }, []);

  // Acknowledge an alert
  const acknowledgeAlert = useCallback(async (
    alertId: string
  ): Promise<boolean> => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId
        ? { ...a, acknowledgedAt: new Date() }
        : a
    ));
    return true;
  }, []);

  // Get unacknowledged alerts
  const getActiveAlerts = useCallback(() => {
    return alerts.filter(a => !a.acknowledgedAt);
  }, [alerts]);

  // Get synthesis quality metrics
  const getSynthesisQualityMetrics = useCallback(() => {
    const rated = syntheses.filter(s => s.userRating !== undefined);
    
    return {
      totalSyntheses: syntheses.length,
      ratedCount: rated.length,
      averageRating: rated.length > 0
        ? rated.reduce((sum, s) => sum + (s.userRating || 0), 0) / rated.length
        : 0,
      usefulPercentage: rated.length > 0
        ? (rated.filter(s => s.wasUseful).length / rated.length) * 100
        : 0,
      averageConfidence: syntheses.length > 0
        ? syntheses.reduce((sum, s) => sum + s.confidenceScore, 0) / syntheses.length
        : 0,
    };
  }, [syntheses]);

  return {
    loading,
    syntheses,
    alerts,
    generateSynthesis,
    summarizeBodyOfWork,
    detectPatterns,
    surfaceForgottenInsights,
    warnRepeatedMistakes,
    findCrossDomainConnections,
    analyzeTrends,
    rateSynthesis,
    acknowledgeAlert,
    getActiveAlerts,
    getSynthesisQualityMetrics,
  };
}

// Helper functions for synthesis generation
function generateSynthesisTitle(type: AISynthesisType, domain: string): string {
  const titles: Record<AISynthesisType, string> = {
    summary: `Summary of ${domain} Knowledge`,
    pattern_detection: `Emerging Patterns in ${domain}`,
    forgotten_insight: `Rediscovered Insights from ${domain}`,
    mistake_warning: `Warning: Historical Mistakes in ${domain}`,
    cross_domain_connection: `Cross-Domain Connections for ${domain}`,
    trend_analysis: `Trend Analysis for ${domain}`,
  };
  return titles[type];
}

function generateSynthesisContent(type: AISynthesisType, sourceCount: number): string {
  return `This ${type.replace("_", " ")} is based on ${sourceCount} source(s). ` +
    `The following synthesis represents AI-generated analysis that should be verified against primary sources.`;
}

function calculateConfidence(sourceCount: number): number {
  // More sources = higher confidence, but with diminishing returns
  return Math.min(0.95, 0.5 + (sourceCount * 0.1));
}

function generateUncertaintyFactors(type: AISynthesisType): string[] {
  const common = ["Limited to indexed knowledge objects"];
  
  const typeSpecific: Record<AISynthesisType, string[]> = {
    summary: ["May not capture nuanced disagreements"],
    pattern_detection: ["Patterns may be correlational, not causal"],
    forgotten_insight: ["Historical context may have changed"],
    mistake_warning: ["Past failures may not apply to current conditions"],
    cross_domain_connection: ["Domain expertise may be required for interpretation"],
    trend_analysis: ["Future predictions inherently uncertain"],
  };
  
  return [...common, ...(typeSpecific[type] || [])];
}

export type { AISynthesis, AISynthesisType, PatternAlert };

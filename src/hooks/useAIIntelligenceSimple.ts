import { useState, useCallback, useMemo } from "react";
import { useUniversalAI } from "@/hooks/useUniversalAI";

// AI Matching Hook
export function useAIMatching() {
  const [candidates] = useState([
    { id: "1", userId: "u1", name: "Dr. Sarah Chen", matchScore: 94, matchReasons: [{ factor: "Skill alignment", weight: 0.35, explanation: "95% match" }], trustScore: 92, skills: ["ML"], availability: "available" as const, responseRate: 98, predictedSuccess: 89 },
  ]);
  const [filters, setFilters] = useState({ minTrustScore: 60, requiredSkills: [] as string[], availability: ["available", "limited"] });
  const refreshMatches = useCallback(() => {}, []);
  return { candidates, filters, setFilters, refreshMatches };
}

// AI Content Generation Hook - now AI-powered
export function useAIContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { ask } = useUniversalAI();

  const generateContent = useCallback(async (type: string, context: any) => {
    setIsGenerating(true);
    try {
      const result = await ask<any>("deals", "write-proposal", {
        type,
        ...context,
      });

      const s = {
        id: crypto.randomUUID(),
        type,
        content: result?.executive_summary || result?.response || "Generated content...",
        tone: "professional",
        confidence: 0.9,
        wordCount: (result?.executive_summary || "").split(" ").length,
        alternatives: result?.key_differentiators || [],
      };
      setSuggestions(prev => [s, ...prev]);
      return s;
    } finally {
      setIsGenerating(false);
    }
  }, [ask]);

  return { isGenerating, suggestions, generateContent };
}

// AI Career Coaching Hook - now AI-powered
export function useAICareerCoaching() {
  const [advice, setAdvice] = useState([
    { id: "1", category: "skill", priority: "high" as const, title: "Add Cloud certification", recommendation: "In demand", expectedImpact: "+15%", timeToImplement: "2 months", resources: [] },
  ]);
  const [analysis, setAnalysis] = useState({ strengths: ["Data Science"], gaps: ["Cloud"], opportunities: ["AI boom"], threats: [], overallScore: 78, trajectory: "accelerating" as const });
  const { ask, loading } = useUniversalAI();

  const refreshAnalysis = useCallback(async () => {
    const result = await ask<any>("career", "coaching-advice", {
      current_skills: analysis.strengths,
      gaps: analysis.gaps,
    });

    if (result?.advice) {
      setAdvice(result.advice.map((a: any, i: number) => ({
        id: String(i + 1),
        category: a.category || "skill",
        priority: a.priority || "medium",
        title: a.title || "Improve skills",
        recommendation: a.recommendation || "",
        expectedImpact: a.expected_impact || "",
        timeToImplement: a.time_to_implement || "",
        resources: [],
      })));
    }
    if (result?.overall_score) {
      setAnalysis(prev => ({
        ...prev,
        overallScore: result.overall_score,
        trajectory: result.trajectory || prev.trajectory,
      }));
    }
  }, [ask, analysis.strengths, analysis.gaps]);

  return { advice, analysis, refreshAnalysis, loading };
}

// Predictive Analytics Hook
export function usePredictiveAnalytics() {
  const [predictions] = useState([
    { id: "1", type: "trust" as const, timeframe: "90d" as const, currentValue: 75, predictedValue: 82, confidence: 0.78, factors: [], scenarios: [{ name: "Expected", probability: 0.55, outcome: 82, description: "Normal progression" }] },
  ]);
  return { predictions };
}

// Smart Recommendations Hook
export function useSmartRecommendations() {
  const [recommendations, setRecommendations] = useState([
    { id: "1", category: "opportunity" as const, priority: 1, title: "AI Research Project", description: "98% skill match", matchScore: 98, actionUrl: "/opportunities/1", dismissed: false },
  ]);
  const dismissRecommendation = useCallback((id: string) => setRecommendations(prev => prev.map(r => r.id === id ? { ...r, dismissed: true } : r)), []);
  const activeRecommendations = useMemo(() => recommendations.filter(r => !r.dismissed), [recommendations]);
  return { recommendations: activeRecommendations, dismissRecommendation };
}

// AI Document Analysis Hook - now AI-powered
export function useAIDocumentAnalysis() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { ask } = useUniversalAI();

  const analyzeDocument = useCallback(async (name: string, content: string) => {
    setIsAnalyzing(true);
    try {
      const result = await ask<any>("deals", "analyze-scope", {
        document_name: name,
        document_content: content.slice(0, 4000),
      });

      const a = {
        id: crypto.randomUUID(),
        documentName: name,
        documentType: "contract",
        summary: result?.response || `Analysis of ${name}`,
        keyPoints: result?.suggested_milestones?.map((m: any) => m.name) || ["Document analyzed"],
        risks: result?.risk_factors || [],
        suggestions: [],
        confidence: 0.89,
        analyzedAt: new Date(),
      };
      setAnalyses(prev => [a, ...prev]);
      return a;
    } finally {
      setIsAnalyzing(false);
    }
  }, [ask]);

  return { analyses, isAnalyzing, analyzeDocument };
}

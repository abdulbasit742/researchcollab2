// ============================================
// SYSTEM 48: TALENT ALLOCATION ENGINE
// Allocate people to opportunities with risk balancing
// ============================================

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  AllocationRequest,
  AllocationCandidate,
  AllocationResult,
  CapabilityRequirement,
  AllocationRisk,
  ResponsibilityLevel,
} from "@/types/human-capital";

interface AllocationState {
  activeRequests: AllocationRequest[];
  results: Map<string, AllocationResult>;
  isProcessing: boolean;
}

export function useTalentAllocation() {
  const { user } = useAuth();
  
  const [state, setState] = useState<AllocationState>({
    activeRequests: [],
    results: new Map(),
    isProcessing: false,
  });

  // Create an allocation request
  const createRequest = useCallback((
    request: Omit<AllocationRequest, "id">
  ): AllocationRequest => {
    const newRequest: AllocationRequest = {
      ...request,
      id: `alloc-${Date.now()}`,
    };

    setState(prev => ({
      ...prev,
      activeRequests: [...prev.activeRequests, newRequest],
    }));

    return newRequest;
  }, []);

  // Process an allocation request and find candidates
  const processRequest = useCallback((
    requestId: string
  ): AllocationResult => {
    const request = state.activeRequests.find(r => r.id === requestId);
    if (!request) {
      return {
        requestId,
        candidates: [],
        warnings: ["Request not found"],
        alternativeSuggestions: [],
      };
    }

    // Mock candidate generation
    const candidates = generateCandidates(request);
    const result: AllocationResult = {
      requestId,
      candidates,
      warnings: generateWarnings(request, candidates),
      alternativeSuggestions: generateAlternatives(request, candidates),
    };

    setState(prev => ({
      ...prev,
      results: new Map(prev.results).set(requestId, result),
    }));

    return result;
  }, [state.activeRequests]);

  // Get allocation recommendation for a single opportunity
  const getRecommendation = useCallback((
    capabilities: CapabilityRequirement[],
    responsibilityLevel: ResponsibilityLevel,
    riskTolerance: "low" | "medium" | "high" = "medium"
  ): AllocationCandidate[] => {
    // Mock recommendation
    return generateCandidates({
      id: "temp",
      requesterId: user?.id || "",
      requesterType: "team",
      requiredCapabilities: capabilities,
      responsibilityLevel,
      riskTolerance,
      maxCandidates: 5,
      urgency: "standard",
      duration: "3 months",
      projectContext: "",
      teamContext: "",
    });
  }, [user?.id]);

  // Assess risk for a specific allocation
  const assessRisk = useCallback((
    candidateId: string,
    requestId: string
  ): AllocationRisk => {
    // Mock risk assessment
    return {
      overallRisk: "medium",
      factors: [
        { factor: "Experience gap in domain", severity: 0.3, explanation: "Limited prior experience in similar projects" },
        { factor: "Workload capacity", severity: 0.2, explanation: "Currently at 70% capacity" },
      ],
      mitigations: [
        "Provide senior mentor support",
        "Reduce scope in first month",
        "Weekly check-ins",
      ],
    };
  }, []);

  // Check for overload risk
  const checkOverloadRisk = useCallback((
    userId: string
  ): {
    isOverloaded: boolean;
    currentLoad: number;
    maxRecommended: number;
    activeAllocations: number;
  } => {
    // Mock overload check
    return {
      isOverloaded: false,
      currentLoad: 75,
      maxRecommended: 100,
      activeAllocations: 3,
    };
  }, []);

  // Get allocation history for learning
  const getAllocationHistory = useCallback((
    filters?: {
      requesterType?: string;
      outcome?: "successful" | "partial" | "failed";
    }
  ): {
    total: number;
    successRate: number;
    averageMatchScore: number;
    commonIssues: string[];
  } => {
    return {
      total: 45,
      successRate: 0.82,
      averageMatchScore: 76,
      commonIssues: [
        "Underestimated time commitment",
        "Skill gaps discovered late",
        "Team dynamics friction",
      ],
    };
  }, []);

  // Summary
  const summary = useMemo(() => ({
    activeRequests: state.activeRequests.length,
    processedResults: state.results.size,
    avgCandidatesPerRequest: state.results.size > 0
      ? Array.from(state.results.values()).reduce((sum, r) => sum + r.candidates.length, 0) / state.results.size
      : 0,
  }), [state]);

  return {
    activeRequests: state.activeRequests,
    results: state.results,
    isProcessing: state.isProcessing,
    createRequest,
    processRequest,
    getRecommendation,
    assessRisk,
    checkOverloadRisk,
    getAllocationHistory,
    summary,
  };
}

// Helper functions

function generateCandidates(request: AllocationRequest): AllocationCandidate[] {
  // Mock candidate generation
  const candidates: AllocationCandidate[] = [
    {
      userId: "user-1",
      matchScore: 85,
      capabilityMatch: request.requiredCapabilities.map(req => ({
        requirement: req.capability,
        candidateStrength: 80 + Math.random() * 15,
        gap: -5 + Math.random() * 10,
        contextMatch: Math.random() > 0.3,
      })),
      readinessMatch: 82,
      riskAssessment: {
        overallRisk: "low",
        factors: [],
        mitigations: [],
      },
      availabilityStatus: "available",
      recommendation: "strong",
    },
    {
      userId: "user-2",
      matchScore: 72,
      capabilityMatch: request.requiredCapabilities.map(req => ({
        requirement: req.capability,
        candidateStrength: 65 + Math.random() * 20,
        gap: 0 + Math.random() * 15,
        contextMatch: Math.random() > 0.5,
      })),
      readinessMatch: 70,
      riskAssessment: {
        overallRisk: "medium",
        factors: [{ factor: "Learning curve", severity: 0.4, explanation: "Some skill gaps" }],
        mitigations: ["Provide training support"],
      },
      availabilityStatus: "partial",
      recommendation: "suitable",
    },
    {
      userId: "user-3",
      matchScore: 58,
      capabilityMatch: request.requiredCapabilities.map(req => ({
        requirement: req.capability,
        candidateStrength: 50 + Math.random() * 20,
        gap: 10 + Math.random() * 15,
        contextMatch: Math.random() > 0.6,
      })),
      readinessMatch: 55,
      riskAssessment: {
        overallRisk: "high",
        factors: [
          { factor: "Experience gap", severity: 0.6, explanation: "Significant capability gaps" },
          { factor: "Stretch assignment", severity: 0.4, explanation: "Above current level" },
        ],
        mitigations: ["Intensive mentoring", "Reduced scope", "Longer timeline"],
      },
      availabilityStatus: "available",
      recommendation: "stretch",
    },
  ];

  return candidates
    .filter(c => c.matchScore >= getMinimumScore(request.riskTolerance))
    .slice(0, request.maxCandidates)
    .sort((a, b) => b.matchScore - a.matchScore);
}

function getMinimumScore(riskTolerance: "low" | "medium" | "high"): number {
  const thresholds = { low: 75, medium: 60, high: 50 };
  return thresholds[riskTolerance];
}

function generateWarnings(request: AllocationRequest, candidates: AllocationCandidate[]): string[] {
  const warnings: string[] = [];
  
  if (candidates.length < request.maxCandidates) {
    warnings.push(`Only ${candidates.length} candidates meet the requirements`);
  }
  
  if (candidates.every(c => c.riskAssessment.overallRisk !== "low")) {
    warnings.push("No low-risk candidates available");
  }
  
  if (request.urgency === "critical" && candidates.filter(c => c.availabilityStatus === "available").length < 2) {
    warnings.push("Limited immediate availability for critical request");
  }

  return warnings;
}

function generateAlternatives(request: AllocationRequest, candidates: AllocationCandidate[]): string[] {
  const alternatives: string[] = [];
  
  if (candidates.length === 0) {
    alternatives.push("Consider relaxing capability requirements");
    alternatives.push("Extend timeline to allow for training");
    alternatives.push("Split the role into multiple positions");
  } else if (candidates[0].matchScore < 70) {
    alternatives.push("Pair top candidate with an experienced mentor");
    alternatives.push("Consider a probationary period");
  }

  return alternatives;
}

export type { AllocationRequest, AllocationCandidate, AllocationResult };

// ============================================
// SYSTEM 46: CAPABILITY GRAPH
// Beyond skills - proven, context-dependent, time-evolving
// ============================================

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Capability,
  CapabilityCategory,
  CapabilityProof,
  CapabilityContext,
  CapabilityNode,
  CapabilityEdge,
  ProofType,
} from "@/types/human-capital";

interface CapabilityGraphState {
  capabilities: Capability[];
  nodes: CapabilityNode[];
  edges: CapabilityEdge[];
  clusters: CapabilityCluster[];
}

interface CapabilityCluster {
  id: string;
  name: string;
  capabilities: string[];
  strength: number;
}

export function useCapabilityGraph(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  // Mock capability data - in production, this comes from outcome analysis
  const [state] = useState<CapabilityGraphState>(() => ({
    capabilities: generateMockCapabilities(targetUserId || ""),
    nodes: [],
    edges: [],
    clusters: [],
  }));

  // Get all capabilities for a user
  const getCapabilities = useCallback((): Capability[] => {
    return state.capabilities;
  }, [state.capabilities]);

  // Get capabilities by category
  const getByCategory = useCallback((category: CapabilityCategory): Capability[] => {
    return state.capabilities.filter(c => c.category === category);
  }, [state.capabilities]);

  // Get capability strength in a specific context
  const getContextualStrength = useCallback((
    capabilityId: string,
    context: string
  ): number => {
    const capability = state.capabilities.find(c => c.id === capabilityId);
    if (!capability) return 0;

    const contextMatch = capability.contexts.find(c => c.context === context);
    return contextMatch?.strength || capability.overallStrength * 0.7;
  }, [state.capabilities]);

  // Compute capability graph for visualization
  const buildGraph = useCallback((): { nodes: CapabilityNode[]; edges: CapabilityEdge[] } => {
    const nodes: CapabilityNode[] = state.capabilities.map(cap => ({
      capability: cap,
      connections: [],
      clusterId: null,
    }));

    // Generate edges based on capability relationships
    const edges: CapabilityEdge[] = [];
    
    for (let i = 0; i < state.capabilities.length; i++) {
      for (let j = i + 1; j < state.capabilities.length; j++) {
        const cap1 = state.capabilities[i];
        const cap2 = state.capabilities[j];
        
        // Determine if capabilities are related
        const relationship = determineRelationship(cap1, cap2);
        if (relationship) {
          edges.push({
            fromCapabilityId: cap1.id,
            toCapabilityId: cap2.id,
            relationship: relationship.type,
            strength: relationship.strength,
          });
        }
      }
    }

    return { nodes, edges };
  }, [state.capabilities]);

  // Identify capability clusters
  const getClusters = useCallback((): CapabilityCluster[] => {
    const clusters: CapabilityCluster[] = [];
    const categories = new Set(state.capabilities.map(c => c.domain));

    for (const domain of categories) {
      const domainCaps = state.capabilities.filter(c => c.domain === domain);
      if (domainCaps.length >= 2) {
        clusters.push({
          id: `cluster-${domain}`,
          name: domain,
          capabilities: domainCaps.map(c => c.id),
          strength: domainCaps.reduce((sum, c) => sum + c.overallStrength, 0) / domainCaps.length,
        });
      }
    }

    return clusters;
  }, [state.capabilities]);

  // Add proof to a capability (when outcome is verified)
  const addProof = useCallback((
    capabilityId: string,
    proof: Omit<CapabilityProof, "verifiedAt">
  ): void => {
    // In production, this updates the database
    console.log("Adding proof to capability:", capabilityId, proof);
  }, []);

  // Get trajectory of a capability over time
  const getTrajectory = useCallback((capabilityId: string): {
    points: { date: Date; strength: number }[];
    trend: "growing" | "stable" | "declining";
  } => {
    const capability = state.capabilities.find(c => c.id === capabilityId);
    if (!capability) {
      return { points: [], trend: "stable" };
    }

    // Mock trajectory data
    const now = new Date();
    const points = [
      { date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), strength: capability.overallStrength - 10 },
      { date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), strength: capability.overallStrength - 5 },
      { date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), strength: capability.overallStrength - 2 },
      { date: now, strength: capability.overallStrength },
    ];

    return {
      points,
      trend: capability.growthTrajectory === "emerging" || capability.growthTrajectory === "developing"
        ? "growing"
        : capability.growthTrajectory === "declining"
        ? "declining"
        : "stable",
    };
  }, [state.capabilities]);

  // Summary statistics
  const summary = useMemo(() => ({
    totalCapabilities: state.capabilities.length,
    provenCapabilities: state.capabilities.filter(c => c.proofCount > 0).length,
    strongCapabilities: state.capabilities.filter(c => c.overallStrength >= 70).length,
    emergingCapabilities: state.capabilities.filter(c => c.growthTrajectory === "emerging").length,
    topDomains: Array.from(new Set(state.capabilities.map(c => c.domain))).slice(0, 5),
  }), [state.capabilities]);

  return {
    capabilities: state.capabilities,
    getCapabilities,
    getByCategory,
    getContextualStrength,
    buildGraph,
    getClusters,
    addProof,
    getTrajectory,
    summary,
  };
}

// Helper functions

function generateMockCapabilities(userId: string): Capability[] {
  const now = new Date();
  
  return [
    {
      id: "cap-1",
      userId,
      name: "Research Methodology",
      category: "applied_competence",
      domain: "Research",
      proofs: [
        { proofType: "outcome_verified", sourceId: "proj-1", sourceType: "project", verifiedAt: now, strength: 85, context: "Quantitative research" },
        { proofType: "peer_endorsed", sourceId: "user-2", sourceType: "user", verifiedAt: now, strength: 75, context: "Mixed methods" },
      ],
      proofCount: 2,
      strongestProof: "outcome_verified",
      contexts: [
        { context: "Quantitative research", strength: 85, outcomeCount: 5, lastApplied: now },
        { context: "Mixed methods", strength: 70, outcomeCount: 3, lastApplied: now },
      ],
      primaryContext: "Quantitative research",
      firstDemonstrated: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      lastDemonstrated: now,
      growthTrajectory: "established",
      overallStrength: 82,
      consistencyScore: 88,
      depthScore: 75,
    },
    {
      id: "cap-2",
      userId,
      name: "Team Coordination",
      category: "leadership_readiness",
      domain: "Leadership",
      proofs: [
        { proofType: "project_demonstrated", sourceId: "proj-2", sourceType: "project", verifiedAt: now, strength: 78, context: "Cross-functional teams" },
      ],
      proofCount: 1,
      strongestProof: "project_demonstrated",
      contexts: [
        { context: "Cross-functional teams", strength: 78, outcomeCount: 4, lastApplied: now },
      ],
      primaryContext: "Cross-functional teams",
      firstDemonstrated: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      lastDemonstrated: now,
      growthTrajectory: "developing",
      overallStrength: 72,
      consistencyScore: 80,
      depthScore: 65,
    },
    {
      id: "cap-3",
      userId,
      name: "Data Analysis",
      category: "technical_skill",
      domain: "Analytics",
      proofs: [
        { proofType: "outcome_verified", sourceId: "proj-3", sourceType: "project", verifiedAt: now, strength: 90, context: "Statistical analysis" },
        { proofType: "institution_certified", sourceId: "inst-1", sourceType: "institution", verifiedAt: now, strength: 88, context: "Python/R" },
      ],
      proofCount: 2,
      strongestProof: "outcome_verified",
      contexts: [
        { context: "Statistical analysis", strength: 90, outcomeCount: 8, lastApplied: now },
        { context: "Python/R", strength: 85, outcomeCount: 6, lastApplied: now },
      ],
      primaryContext: "Statistical analysis",
      firstDemonstrated: new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000),
      lastDemonstrated: now,
      growthTrajectory: "mastery",
      overallStrength: 88,
      consistencyScore: 92,
      depthScore: 85,
    },
    {
      id: "cap-4",
      userId,
      name: "Strategic Decision Making",
      category: "decision_quality",
      domain: "Strategy",
      proofs: [],
      proofCount: 0,
      strongestProof: null,
      contexts: [],
      primaryContext: null,
      firstDemonstrated: now,
      lastDemonstrated: now,
      growthTrajectory: "emerging",
      overallStrength: 45,
      consistencyScore: 50,
      depthScore: 40,
    },
  ];
}

function determineRelationship(
  cap1: Capability,
  cap2: Capability
): { type: "enables" | "requires" | "complements" | "synergizes"; strength: number } | null {
  // Simple heuristic - in production, this uses ML
  if (cap1.domain === cap2.domain) {
    return { type: "complements", strength: 0.7 };
  }
  
  // Leadership enables execution
  if (cap1.category === "leadership_readiness" && cap2.category === "execution_reliability") {
    return { type: "enables", strength: 0.6 };
  }
  
  // Technical skills synergize
  if (cap1.category === "technical_skill" && cap2.category === "technical_skill") {
    return { type: "synergizes", strength: 0.5 };
  }

  return null;
}

export type { Capability, CapabilityCategory, CapabilityNode, CapabilityCluster };

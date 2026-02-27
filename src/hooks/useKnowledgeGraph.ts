import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  GraphNode,
  GraphEdge,
  GraphNodeType,
  GraphEdgeType,
  KnowledgeLineage,
  ImpactTrace,
  KnowledgeCluster,
} from "@/types/knowledge-civilization";

// ============================================
// TYPES FOR GKGE
// ============================================

export interface ClaimCitation {
  id: string;
  citing_claim_id: string;
  cited_claim_id: string;
  citation_type: "supports" | "extends" | "contradicts" | "references";
  workspace_id: string | null;
  citing_workspace_id: string | null;
  cited_workspace_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ClaimInfluenceMetrics {
  id: string;
  claim_id: string;
  citation_count: number;
  support_count: number;
  contradiction_count: number;
  extension_count: number;
  institution_diversity: number;
  cross_border_citations: number;
  policy_adoption_count: number;
  project_implementation_count: number;
  funding_conversion_count: number;
  peer_review_validation_count: number;
  claim_influence_score: number;
  computed_at: string;
}

export interface GlobalClaimSearchResult {
  id: string;
  global_claim_id: string;
  claim_text: string;
  claim_type: string;
  confidence_score: number;
  evidence_strength: number;
  domain_category: string | null;
  topic_tags: string[];
  workspace_id: string;
  institution_id: string | null;
  citation_count: number;
  claim_influence_score: number;
}

// ============================================
// GKGE HOOKS — Global Claim Search, Citations, Influence
// ============================================

export function useGlobalClaimSearch(searchTerm: string, domain?: string) {
  return useQuery({
    queryKey: ["global-claims-search", searchTerm, domain],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_claims")
        .select("*")
        .ilike("claim_text", `%${searchTerm}%`)
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as GlobalClaimSearchResult[];
    },
    enabled: searchTerm.length >= 3,
  });
}

export function useClaimCitations(claimId?: string) {
  return useQuery({
    queryKey: ["claim-citations", claimId],
    queryFn: async () => {
      const [{ data: outgoing, error: e1 }, { data: incoming, error: e2 }] = await Promise.all([
        supabase.from("claim_citations").select("*").eq("citing_claim_id", claimId!),
        supabase.from("claim_citations").select("*").eq("cited_claim_id", claimId!),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return {
        outgoing: (outgoing ?? []) as unknown as ClaimCitation[],
        incoming: (incoming ?? []) as unknown as ClaimCitation[],
        totalCitations: incoming?.length ?? 0,
      };
    },
    enabled: !!claimId,
  });
}

export function useCreateCitation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      citingClaimId: string; citedClaimId: string;
      citationType: ClaimCitation["citation_type"];
      workspaceId?: string; citingWorkspaceId?: string; citedWorkspaceId?: string;
    }) => {
      const { data, error } = await supabase.from("claim_citations").insert({
        citing_claim_id: params.citingClaimId,
        cited_claim_id: params.citedClaimId,
        citation_type: params.citationType,
        workspace_id: params.workspaceId,
        citing_workspace_id: params.citingWorkspaceId,
        cited_workspace_id: params.citedWorkspaceId,
        created_by: user?.id,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, p) => {
      qc.invalidateQueries({ queryKey: ["claim-citations", p.citingClaimId] });
      qc.invalidateQueries({ queryKey: ["claim-citations", p.citedClaimId] });
      toast.success("Citation created");
    },
  });
}

export function useClaimInfluence(claimId?: string) {
  return useQuery({
    queryKey: ["claim-influence", claimId],
    queryFn: async () => {
      const { data, error } = await supabase.from("claim_influence_metrics").select("*").eq("claim_id", claimId!).maybeSingle();
      if (error) throw error;
      return data as unknown as ClaimInfluenceMetrics | null;
    },
    enabled: !!claimId,
  });
}

export function useComputeClaimInfluence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (claimId: string) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "compute_claim_influence", claim_id: claimId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_d, claimId) => {
      qc.invalidateQueries({ queryKey: ["claim-influence", claimId] });
      toast.success("Influence score computed");
    },
  });
}

export function useWorkspaceKnowledgeStats(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspace-knowledge-stats", workspaceId],
    queryFn: async () => {
      const { data: claims, error: e1 } = await supabase
        .from("research_claims")
        .select("*")
        .eq("workspace_id", workspaceId!);
      if (e1) throw e1;

      const claimIds = (claims ?? []).map((c: any) => c.id);
      let incomingCitations: any[] = [];
      if (claimIds.length > 0) {
        const { data: ic } = await supabase.from("claim_citations").select("*").in("cited_claim_id", claimIds.slice(0, 100));
        incomingCitations = ic ?? [];
      }

      const supportCount = incomingCitations.filter(c => c.citation_type === "supports").length;
      const contradictCount = incomingCitations.filter(c => c.citation_type === "contradicts").length;
      const extendsCount = incomingCitations.filter(c => c.citation_type === "extends").length;
      const refCount = incomingCitations.filter(c => c.citation_type === "references").length;
      const uniqueCitingWorkspaces = new Set(incomingCitations.map(c => c.citing_workspace_id).filter(Boolean));

      return {
        claims: claims ?? [],
        totalClaims: claims?.length ?? 0,
        totalIncomingCitations: incomingCitations.length,
        supportCount, contradictCount, extendsCount, refCount,
        crossWorkspaceCitations: uniqueCitingWorkspaces.size,
        topClaims: (claims ?? []).slice(0, 10),
      };
    },
    enabled: !!workspaceId,
  });
}

export function useDetectCitationManipulation() {
  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "detect_citation_manipulation", workspace_id: workspaceId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { flags: any[]; summary: string };
    },
    onSuccess: (data) => {
      if (data.flags.length > 0) toast.warning(`${data.flags.length} manipulation pattern(s) detected`);
      else toast.success("No manipulation patterns detected");
    },
  });
}

export function useDetectEmergingTopics() {
  return useMutation({
    mutationFn: async (params: { workspaceId?: string; domain?: string }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "detect_emerging_topics", workspace_id: params.workspaceId, domain: params.domain },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { topics: Array<{ topic: string; growth_rate: number; claim_count: number; severity: string }> };
    },
  });
}

// ============================================
// ORIGINAL SYSTEM 38: KNOWLEDGE INTELLIGENCE GRAPH (in-memory)
// ============================================

export function useKnowledgeGraph() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  // Add a node to the graph
  const addNode = useCallback(async (
    type: GraphNodeType,
    label: string,
    metadata: Record<string, unknown> = {}
  ): Promise<GraphNode | null> => {
    const node: GraphNode = {
      id: crypto.randomUUID(),
      type,
      label,
      weight: 1,
      metadata,
      createdAt: new Date(),
    };
    
    setNodes(prev => [...prev, node]);
    return node;
  }, []);

  // Add an edge between nodes
  const addEdge = useCallback(async (
    sourceId: string,
    targetId: string,
    type: GraphEdgeType,
    confidence: number = 1,
    metadata: Record<string, unknown> = {}
  ): Promise<GraphEdge | null> => {
    const edge: GraphEdge = {
      id: crypto.randomUUID(),
      sourceId,
      targetId,
      type,
      weight: 1,
      confidence,
      metadata,
      createdAt: new Date(),
    };
    
    setEdges(prev => [...prev, edge]);
    return edge;
  }, []);

  // Trace knowledge lineage
  const traceLineage = useCallback(async (
    objectId: string,
    maxDepth: number = 5
  ): Promise<KnowledgeLineage> => {
    setLoading(true);
    try {
      const ancestors: KnowledgeLineage["ancestors"] = [];
      const descendants: KnowledgeLineage["descendants"] = [];
      
      // BFS to find ancestors (where this knowledge came from)
      const findAncestors = (nodeId: string, depth: number) => {
        if (depth > maxDepth) return;
        
        const incomingEdges = edges.filter(e => 
          e.targetId === nodeId && 
          ["derived_from", "synthesized_from", "enabled"].includes(e.type)
        );
        
        for (const edge of incomingEdges) {
          ancestors.push({
            objectId: edge.sourceId,
            relationship: edge.type,
            depth,
          });
          findAncestors(edge.sourceId, depth + 1);
        }
      };
      
      // BFS to find descendants (what this knowledge enabled)
      const findDescendants = (nodeId: string, depth: number) => {
        if (depth > maxDepth) return;
        
        const outgoingEdges = edges.filter(e => 
          e.sourceId === nodeId && 
          ["derived_from", "synthesized_from", "enabled"].includes(e.type)
        );
        
        for (const edge of outgoingEdges) {
          descendants.push({
            objectId: edge.targetId,
            relationship: edge.type,
            depth,
          });
          findDescendants(edge.targetId, depth + 1);
        }
      };
      
      findAncestors(objectId, 1);
      findDescendants(objectId, 1);
      
      return { objectId, ancestors, descendants };
    } finally {
      setLoading(false);
    }
  }, [edges]);

  // Trace impact of a knowledge object
  const traceImpact = useCallback(async (
    objectId: string
  ): Promise<ImpactTrace> => {
    setLoading(true);
    try {
      const impacts: ImpactTrace["impacts"] = [];
      const domains = new Set<string>();
      
      // Find all nodes impacted by this object
      const impactEdges = edges.filter(e => 
        e.sourceId === objectId && 
        ["enabled", "applied", "supports"].includes(e.type)
      );
      
      for (const edge of impactEdges) {
        const targetNode = nodes.find(n => n.id === edge.targetId);
        if (targetNode) {
          impacts.push({
            targetId: edge.targetId,
            targetType: targetNode.type,
            impactType: edge.type,
            magnitude: edge.weight * edge.confidence,
            tracedAt: new Date(),
          });
          
          if (targetNode.metadata.domain) {
            domains.add(targetNode.metadata.domain as string);
          }
        }
      }
      
      return {
        sourceObjectId: objectId,
        impacts,
        totalReach: impacts.length,
        domains: Array.from(domains),
      };
    } finally {
      setLoading(false);
    }
  }, [edges, nodes]);

  // Find cross-domain connections
  const findCrossDomainConnections = useCallback(async (
    domain: string
  ): Promise<Array<{
    sourceDomain: string;
    targetDomain: string;
    connections: GraphEdge[];
    strength: number;
  }>> => {
    const domainNodes = nodes.filter(n => 
      n.metadata.domain === domain
    );
    const domainNodeIds = new Set(domainNodes.map(n => n.id));
    
    // Find edges that cross domain boundaries
    const crossEdges = edges.filter(e => 
      (domainNodeIds.has(e.sourceId) && !domainNodeIds.has(e.targetId)) ||
      (!domainNodeIds.has(e.sourceId) && domainNodeIds.has(e.targetId))
    );
    
    // Group by target domain
    const connectionsByDomain = new Map<string, GraphEdge[]>();
    for (const edge of crossEdges) {
      const targetNode = nodes.find(n => n.id === edge.targetId);
      const targetDomain = (targetNode?.metadata.domain as string) || "unknown";
      
      if (!connectionsByDomain.has(targetDomain)) {
        connectionsByDomain.set(targetDomain, []);
      }
      connectionsByDomain.get(targetDomain)!.push(edge);
    }
    
    return Array.from(connectionsByDomain.entries()).map(([targetDomain, connections]) => ({
      sourceDomain: domain,
      targetDomain,
      connections,
      strength: connections.reduce((sum, e) => sum + e.weight * e.confidence, 0),
    }));
  }, [nodes, edges]);

  // Detect knowledge clusters
  const detectClusters = useCallback(async (
    minNodes: number = 3,
    minCoherence: number = 0.5
  ): Promise<KnowledgeCluster[]> => {
    setLoading(true);
    try {
      const clusters: KnowledgeCluster[] = [];
      const visited = new Set<string>();
      
      // Simple clustering based on edge density
      for (const node of nodes) {
        if (visited.has(node.id)) continue;
        
        const clusterNodes = new Set<string>([node.id]);
        const queue = [node.id];
        
        while (queue.length > 0) {
          const current = queue.shift()!;
          const connected = edges
            .filter(e => e.sourceId === current || e.targetId === current)
            .map(e => e.sourceId === current ? e.targetId : e.sourceId)
            .filter(id => !visited.has(id) && !clusterNodes.has(id));
          
          for (const connectedId of connected) {
            clusterNodes.add(connectedId);
            queue.push(connectedId);
          }
        }
        
        if (clusterNodes.size >= minNodes) {
          const nodeIds = Array.from(clusterNodes);
          const internalEdges = edges.filter(e => 
            clusterNodes.has(e.sourceId) && clusterNodes.has(e.targetId)
          );
          
          const maxPossibleEdges = nodeIds.length * (nodeIds.length - 1) / 2;
          const coherenceScore = maxPossibleEdges > 0 
            ? internalEdges.length / maxPossibleEdges 
            : 0;
          
          if (coherenceScore >= minCoherence) {
            clusters.push({
              id: crypto.randomUUID(),
              name: `Cluster ${clusters.length + 1}`,
              description: "Auto-detected knowledge cluster",
              nodeIds,
              coherenceScore,
              emergingPatterns: [],
              createdAt: new Date(),
            });
          }
        }
        
        clusterNodes.forEach(id => visited.add(id));
      }
      
      return clusters;
    } finally {
      setLoading(false);
    }
  }, [nodes, edges]);

  // Query the graph with natural language (simplified)
  const queryGraph = useCallback(async (
    query: string
  ): Promise<{
    nodes: GraphNode[];
    edges: GraphEdge[];
    interpretation: string;
  }> => {
    // This would use AI to interpret the query
    // For now, simple keyword matching
    const keywords = query.toLowerCase().split(" ");
    
    const matchingNodes = nodes.filter(n => 
      keywords.some(k => 
        n.label.toLowerCase().includes(k) ||
        JSON.stringify(n.metadata).toLowerCase().includes(k)
      )
    );
    
    const nodeIds = new Set(matchingNodes.map(n => n.id));
    const matchingEdges = edges.filter(e => 
      nodeIds.has(e.sourceId) || nodeIds.has(e.targetId)
    );
    
    return {
      nodes: matchingNodes,
      edges: matchingEdges,
      interpretation: `Found ${matchingNodes.length} nodes matching "${query}"`,
    };
  }, [nodes, edges]);

  // Get graph statistics
  const getGraphStats = useCallback(() => {
    const nodesByType = nodes.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<GraphNodeType, number>);
    
    const edgesByType = edges.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<GraphEdgeType, number>);
    
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByType,
      edgesByType,
      avgDegree: nodes.length > 0 ? (edges.length * 2) / nodes.length : 0,
    };
  }, [nodes, edges]);

  return {
    loading,
    nodes,
    edges,
    addNode,
    addEdge,
    traceLineage,
    traceImpact,
    findCrossDomainConnections,
    detectClusters,
    queryGraph,
    getGraphStats,
  };
}

export type {
  GraphNode,
  GraphEdge,
  GraphNodeType,
  GraphEdgeType,
  KnowledgeLineage,
  ImpactTrace,
  KnowledgeCluster,
};

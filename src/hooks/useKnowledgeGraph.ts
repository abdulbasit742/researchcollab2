import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
// SYSTEM 38: KNOWLEDGE INTELLIGENCE GRAPH
// Connecting knowledge, people, outcomes, institutions
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

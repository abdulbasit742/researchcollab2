import { useState, useCallback, useMemo } from "react";
import {
  CoordinationGraph,
  CoordinationNode,
  CoordinationEdge,
  Bottleneck,
} from "@/types/crisis-coordination";

// System 57: Real-Time Coordination Graph
// Visualize dependencies, bottlenecks, and progress without micromanagement

export function useCoordinationGraph(missionId?: string) {
  const [graph, setGraph] = useState<CoordinationGraph | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize or load a coordination graph
  const initializeGraph = useCallback(async (
    missionName: string,
    initialNodes?: CoordinationNode[],
    initialEdges?: CoordinationEdge[]
  ): Promise<CoordinationGraph> => {
    setIsLoading(true);
    
    const newGraph: CoordinationGraph = {
      missionId: missionId || `mission-${Date.now()}`,
      missionName,
      nodes: initialNodes || [],
      edges: initialEdges || [],
      bottlenecks: [],
      overallProgress: 0,
      criticalPath: [],
      lastUpdated: new Date().toISOString(),
    };

    await new Promise(r => setTimeout(r, 300));
    setGraph(newGraph);
    setIsLoading(false);
    return newGraph;
  }, [missionId]);

  // Add a node to the graph
  const addNode = useCallback((node: CoordinationNode) => {
    setGraph(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: [...prev.nodes, node],
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  // Update a node
  const updateNode = useCallback((nodeId: string, updates: Partial<CoordinationNode>) => {
    setGraph(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n),
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  // Add an edge
  const addEdge = useCallback((edge: CoordinationEdge) => {
    setGraph(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        edges: [...prev.edges, edge],
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  // Remove an edge
  const removeEdge = useCallback((edgeId: string) => {
    setGraph(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        edges: prev.edges.filter(e => e.id !== edgeId),
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  // Detect bottlenecks automatically
  const detectBottlenecks = useCallback((): Bottleneck[] => {
    if (!graph) return [];

    const bottlenecks: Bottleneck[] = [];

    graph.nodes.forEach(node => {
      // Check for blocked status
      if (node.status === "blocked") {
        const downstream = graph.edges
          .filter(e => e.source === node.id)
          .map(e => e.target);

        bottlenecks.push({
          nodeId: node.id,
          severity: "high",
          reason: "Task is blocked",
          suggestedActions: ["Identify blocking issue", "Escalate if needed", "Find alternative path"],
          affectedDownstream: downstream,
        });
      }

      // Check for overdue tasks
      if (node.deadline && new Date(node.deadline) < new Date() && node.status !== "completed") {
        const downstream = graph.edges
          .filter(e => e.source === node.id)
          .map(e => e.target);

        bottlenecks.push({
          nodeId: node.id,
          severity: "critical",
          reason: "Task is overdue",
          suggestedActions: ["Review deadline feasibility", "Add resources", "Notify stakeholders"],
          affectedDownstream: downstream,
        });
      }

      // Check for at-risk tasks
      if (node.status === "at_risk") {
        bottlenecks.push({
          nodeId: node.id,
          severity: "medium",
          reason: "Task marked at risk",
          suggestedActions: ["Review risk factors", "Consider mitigation strategies"],
          affectedDownstream: [],
        });
      }
    });

    setGraph(prev => prev ? { ...prev, bottlenecks } : prev);
    return bottlenecks;
  }, [graph]);

  // Calculate critical path
  const calculateCriticalPath = useCallback((): string[] => {
    if (!graph || graph.nodes.length === 0) return [];

    // Simplified critical path: longest chain of dependencies
    const startNodes = graph.nodes.filter(n => 
      !graph.edges.some(e => e.target === n.id && e.type === "depends_on")
    );

    const findLongestPath = (nodeId: string, visited: Set<string> = new Set()): string[] => {
      if (visited.has(nodeId)) return [];
      visited.add(nodeId);

      const outgoing = graph.edges.filter(e => e.source === nodeId && e.type === "depends_on");
      if (outgoing.length === 0) return [nodeId];

      let longestPath: string[] = [];
      for (const edge of outgoing) {
        const path = findLongestPath(edge.target, new Set(visited));
        if (path.length > longestPath.length) {
          longestPath = path;
        }
      }

      return [nodeId, ...longestPath];
    };

    let criticalPath: string[] = [];
    for (const start of startNodes) {
      const path = findLongestPath(start.id);
      if (path.length > criticalPath.length) {
        criticalPath = path;
      }
    }

    setGraph(prev => prev ? { ...prev, criticalPath } : prev);
    return criticalPath;
  }, [graph]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!graph || graph.nodes.length === 0) return 0;
    
    const taskNodes = graph.nodes.filter(n => n.type === "task" || n.type === "milestone");
    if (taskNodes.length === 0) return 0;

    const totalProgress = taskNodes.reduce((sum, node) => {
      if (node.status === "completed") return sum + 100;
      return sum + (node.progress || 0);
    }, 0);

    return Math.round(totalProgress / taskNodes.length);
  }, [graph]);

  // Get dependencies for a node
  const getDependencies = useCallback((nodeId: string): CoordinationNode[] => {
    if (!graph) return [];
    
    const dependencyIds = graph.edges
      .filter(e => e.target === nodeId && e.type === "depends_on")
      .map(e => e.source);

    return graph.nodes.filter(n => dependencyIds.includes(n.id));
  }, [graph]);

  // Get dependents (nodes that depend on this one)
  const getDependents = useCallback((nodeId: string): CoordinationNode[] => {
    if (!graph) return [];
    
    const dependentIds = graph.edges
      .filter(e => e.source === nodeId && e.type === "depends_on")
      .map(e => e.target);

    return graph.nodes.filter(n => dependentIds.includes(n.id));
  }, [graph]);

  return {
    graph,
    isLoading,
    overallProgress,
    initializeGraph,
    addNode,
    updateNode,
    addEdge,
    removeEdge,
    detectBottlenecks,
    calculateCriticalPath,
    getDependencies,
    getDependents,
  };
}

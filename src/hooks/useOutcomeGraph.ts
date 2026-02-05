 import { useState, useCallback, useMemo } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 
 // ============================================
 // OUTCOME GRAPH SYSTEM
 // Connects People → Work → Results → Impact
 // The platform's real moat - replaces resumes
 // ============================================
 
 export interface OutcomeNode {
   id: string;
   type: "person" | "work" | "result" | "impact";
   label: string;
   data: Record<string, unknown>;
   trustScore: number;
   verificationStatus: "verified" | "pending" | "disputed" | "unverified";
   timestamp: Date;
 }
 
 export interface OutcomeEdge {
   id: string;
   source: string;
   target: string;
   relationship: "performed" | "produced" | "resulted_in" | "impacted" | "contributed_to";
   weight: number;
   evidence: string[];
   verified: boolean;
 }
 
 export interface OutcomeMetrics {
   totalOutcomes: number;
   verifiedOutcomes: number;
   successRate: number;
   avgImpactScore: number;
   domainDistribution: Record<string, number>;
   timelineRange: { start: Date; end: Date } | null;
 }
 
 export interface OutcomeComparison {
   personId: string;
   personName: string;
   metrics: OutcomeMetrics;
   ranking: number;
   benchmarkDelta: number;
 }
 
 export interface OutcomeCluster {
   id: string;
   name: string;
   domain: string;
   outcomes: string[];
   avgScore: number;
   pattern: string;
 }
 
 export function useOutcomeGraph(userId?: string) {
   const { user } = useAuth();
   const targetUserId = userId || user?.id;
 
   const [nodes, setNodes] = useState<OutcomeNode[]>([]);
   const [edges, setEdges] = useState<OutcomeEdge[]>([]);
   const [loading, setLoading] = useState(false);
 
   // Fetch outcome graph for a user
   const fetchOutcomeGraph = useCallback(async () => {
     if (!targetUserId) return;
     setLoading(true);
 
     try {
       // Fetch accountability records (core outcome data)
       const { data: records } = await supabase
         .from("accountability_records")
         .select("*")
         .or(`initiator_id.eq.${targetUserId},executor_id.eq.${targetUserId}`)
         .order("created_at", { ascending: false });
 
       // Build graph nodes
       const graphNodes: OutcomeNode[] = [];
       const graphEdges: OutcomeEdge[] = [];
 
       // Add person node
       graphNodes.push({
         id: targetUserId,
         type: "person",
         label: "You",
         data: {},
         trustScore: 0,
         verificationStatus: "verified",
         timestamp: new Date(),
       });
 
       // Process each accountability record
       (records || []).forEach((record: any) => {
         // Work node
         const workId = `work_${record.id}`;
         graphNodes.push({
           id: workId,
           type: "work",
           label: record.collaboration_type || "Project",
           data: {
             deliverables: record.promised_deliverables,
             deadline: record.deadline,
           },
           trustScore: 0,
           verificationStatus: record.verified_at ? "verified" : "pending",
           timestamp: new Date(record.created_at),
         });
 
         // Person → Work edge
         graphEdges.push({
           id: `edge_${targetUserId}_${workId}`,
           source: targetUserId,
           target: workId,
           relationship: record.executor_id === targetUserId ? "performed" : "contributed_to",
           weight: 1.0,
           evidence: [],
           verified: !!record.verified_at,
         });
 
         // Result node (if completed)
         if (record.outcome_status === "completed" || record.outcome_verdict) {
           const resultId = `result_${record.id}`;
           graphNodes.push({
             id: resultId,
             type: "result",
             label: record.outcome_verdict || "Completed",
             data: {
               evidence: record.outcome_evidence,
               verdict: record.outcome_verdict,
             },
             trustScore: record.trust_impact_executor || 0,
             verificationStatus: record.verified_at ? "verified" : "unverified",
             timestamp: record.verified_at ? new Date(record.verified_at) : new Date(),
           });
 
           // Work → Result edge
           graphEdges.push({
             id: `edge_${workId}_${resultId}`,
             source: workId,
             target: resultId,
             relationship: "produced",
             weight: 1.0,
             evidence: [],
             verified: !!record.verified_at,
           });
 
           // Impact node (if significant)
           if (record.total_paid && record.total_paid > 0) {
             const impactId = `impact_${record.id}`;
             graphNodes.push({
               id: impactId,
               type: "impact",
               label: `$${record.total_paid} value`,
               data: {
                 financialValue: record.total_paid,
                 trustImpact: record.trust_impact_executor,
               },
               trustScore: record.trust_impact_executor || 0,
               verificationStatus: "verified",
               timestamp: new Date(),
             });
 
             // Result → Impact edge
             graphEdges.push({
               id: `edge_${resultId}_${impactId}`,
               source: resultId,
               target: impactId,
               relationship: "impacted",
               weight: 1.0,
               evidence: [],
               verified: true,
             });
           }
         }
       });
 
       setNodes(graphNodes);
       setEdges(graphEdges);
     } catch (error) {
       console.error("Error fetching outcome graph:", error);
     } finally {
       setLoading(false);
     }
   }, [targetUserId]);
 
   // Calculate outcome metrics
   const metrics = useMemo((): OutcomeMetrics => {
     const outcomes = nodes.filter(n => n.type === "result");
     const verified = outcomes.filter(n => n.verificationStatus === "verified");
     const impacts = nodes.filter(n => n.type === "impact");
 
     const avgImpact = impacts.length > 0
       ? impacts.reduce((sum, n) => sum + (n.trustScore || 0), 0) / impacts.length
       : 0;
 
     const timestamps = nodes.map(n => n.timestamp).filter(Boolean);
     const timelineRange = timestamps.length >= 2
       ? {
           start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
           end: new Date(Math.max(...timestamps.map(t => t.getTime()))),
         }
       : null;
 
     return {
       totalOutcomes: outcomes.length,
       verifiedOutcomes: verified.length,
       successRate: outcomes.length > 0 ? (verified.length / outcomes.length) * 100 : 0,
       avgImpactScore: avgImpact,
       domainDistribution: {},
       timelineRange,
     };
   }, [nodes]);
 
   // Replay outcome (trace back inputs → work → results)
   const replayOutcome = useCallback((outcomeId: string) => {
     const visited = new Set<string>();
     const path: OutcomeNode[] = [];
 
     const traverse = (nodeId: string, direction: "backward" | "forward") => {
       if (visited.has(nodeId)) return;
       visited.add(nodeId);
 
       const node = nodes.find(n => n.id === nodeId);
       if (node) path.push(node);
 
       const connectedEdges = edges.filter(e => 
         direction === "backward" ? e.target === nodeId : e.source === nodeId
       );
 
       connectedEdges.forEach(edge => {
         const nextId = direction === "backward" ? edge.source : edge.target;
         traverse(nextId, direction);
       });
     };
 
     // Traverse backward from outcome to find inputs
     traverse(outcomeId, "backward");
 
     return path.reverse();
   }, [nodes, edges]);
 
   // Compare outcomes between users (benchmarking)
   const compareOutcomes = useCallback(async (userIds: string[]): Promise<OutcomeComparison[]> => {
     // In production, this would fetch and compare outcome graphs
     return userIds.map((id, index) => ({
       personId: id,
       personName: `User ${index + 1}`,
       metrics: {
         totalOutcomes: Math.floor(Math.random() * 20) + 5,
         verifiedOutcomes: Math.floor(Math.random() * 15) + 3,
         successRate: Math.random() * 40 + 60,
         avgImpactScore: Math.random() * 30 + 10,
         domainDistribution: {},
         timelineRange: null,
       },
       ranking: index + 1,
       benchmarkDelta: (Math.random() - 0.5) * 20,
     }));
   }, []);
 
   // Cluster similar outcomes
   const clusterOutcomes = useCallback((): OutcomeCluster[] => {
     const results = nodes.filter(n => n.type === "result");
     
     // Simple clustering by label similarity
     const clusters: Map<string, OutcomeCluster> = new Map();
     
     results.forEach(result => {
       const domain = (result.data as any)?.verdict || "general";
       
       if (!clusters.has(domain)) {
         clusters.set(domain, {
           id: `cluster_${domain}`,
           name: domain,
           domain,
           outcomes: [],
           avgScore: 0,
           pattern: "success",
         });
       }
       
       const cluster = clusters.get(domain)!;
       cluster.outcomes.push(result.id);
       cluster.avgScore = (cluster.avgScore + result.trustScore) / 2;
     });
 
     return Array.from(clusters.values());
   }, [nodes]);
 
   // Get outcome path visualization data
   const getVisualizationData = useCallback(() => {
     return {
       nodes: nodes.map(n => ({
         id: n.id,
         label: n.label,
         type: n.type,
         size: n.type === "impact" ? 30 : n.type === "result" ? 25 : 20,
         color: {
           person: "#3b82f6",
           work: "#f59e0b",
           result: "#10b981",
           impact: "#8b5cf6",
         }[n.type],
       })),
       edges: edges.map(e => ({
         id: e.id,
         source: e.source,
         target: e.target,
         label: e.relationship,
         verified: e.verified,
       })),
     };
   }, [nodes, edges]);
 
   return {
     nodes,
     edges,
     loading,
     metrics,
     fetchOutcomeGraph,
     replayOutcome,
     compareOutcomes,
     clusterOutcomes,
     getVisualizationData,
   };
 }
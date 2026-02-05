 import { useState, useCallback, useMemo } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import type {
   UPOMObject,
   UPOMObjectType,
   LifecycleState,
   VisibilityLevel,
   ObjectRelationship,
   RelationshipType,
   AuditEntry,
   TrustSignal,
 } from "@/types/upom";
 
 // ============================================
 // UNIVERSAL PROFESSIONAL OBJECT MODEL HOOK
 // Core system for managing all professional objects
 // ============================================
 
 interface ObjectQuery {
   type?: UPOMObjectType;
   ownerId?: string;
   lifecycleState?: LifecycleState;
   visibility?: VisibilityLevel;
   limit?: number;
 }
 
 interface ObjectRegistryEntry {
   id: string;
   objectType: UPOMObjectType;
   displayName: string;
   ownerId: string | null;
   version: number;
   lifecycleState: LifecycleState;
   visibility: VisibilityLevel;
   trustScore: number;
   createdAt: Date;
   updatedAt: Date;
 }
 
 export function useUniversalObjectModel() {
   const { user } = useAuth();
   const [objects, setObjects] = useState<ObjectRegistryEntry[]>([]);
   const [relationships, setRelationships] = useState<ObjectRelationship[]>([]);
   const [loading, setLoading] = useState(false);
 
   // Register a new object in the system
   const registerObject = useCallback(async (
     objectType: UPOMObjectType,
     data: {
       displayName: string;
       visibility?: VisibilityLevel;
       metadata?: Record<string, unknown>;
     }
   ): Promise<{ success: boolean; objectId?: string; error?: string }> => {
     if (!user) return { success: false, error: "Not authenticated" };
 
     const objectId = crypto.randomUUID();
     const now = new Date();
 
     const newEntry: ObjectRegistryEntry = {
       id: objectId,
       objectType,
       displayName: data.displayName,
       ownerId: user.id,
       version: 1,
       lifecycleState: "draft",
       visibility: data.visibility || "private",
       trustScore: 0,
       createdAt: now,
       updatedAt: now,
     };
 
     // In production, this would persist to database
     setObjects(prev => [...prev, newEntry]);
 
     // Create audit entry
     await logAuditEntry(objectId, "created", user.id, { objectType, ...data });
 
     return { success: true, objectId };
   }, [user]);
 
   // Update object lifecycle state
   const updateLifecycle = useCallback(async (
     objectId: string,
     newState: LifecycleState,
     reason?: string
   ): Promise<{ success: boolean }> => {
     if (!user) return { success: false };
 
     setObjects(prev => prev.map(obj => 
       obj.id === objectId 
         ? { ...obj, lifecycleState: newState, version: obj.version + 1, updatedAt: new Date() }
         : obj
     ));
 
     await logAuditEntry(objectId, "lifecycle_changed", user.id, { newState, reason });
 
     return { success: true };
   }, [user]);
 
   // Update object visibility
   const updateVisibility = useCallback(async (
     objectId: string,
     visibility: VisibilityLevel
   ): Promise<{ success: boolean }> => {
     if (!user) return { success: false };
 
     setObjects(prev => prev.map(obj => 
       obj.id === objectId 
         ? { ...obj, visibility, version: obj.version + 1, updatedAt: new Date() }
         : obj
     ));
 
     await logAuditEntry(objectId, "visibility_changed", user.id, { visibility });
 
     return { success: true };
   }, [user]);
 
   // Create relationship between objects
   const createRelationship = useCallback(async (
     sourceId: string,
     sourceType: UPOMObjectType,
     targetId: string,
     targetType: UPOMObjectType,
     relationshipType: RelationshipType,
     strength: number = 1.0
   ): Promise<{ success: boolean; relationshipId?: string }> => {
     if (!user) return { success: false };
 
     const relationship: ObjectRelationship = {
       id: crypto.randomUUID(),
       sourceId,
       sourceType,
       targetId,
       targetType,
       relationshipType,
       strength,
       createdAt: new Date(),
       metadata: {},
     };
 
     setRelationships(prev => [...prev, relationship]);
 
     return { success: true, relationshipId: relationship.id };
   }, [user]);
 
   // Query objects
   const queryObjects = useCallback(async (query: ObjectQuery): Promise<ObjectRegistryEntry[]> => {
     let results = [...objects];
 
     if (query.type) {
       results = results.filter(o => o.objectType === query.type);
     }
     if (query.ownerId) {
       results = results.filter(o => o.ownerId === query.ownerId);
     }
     if (query.lifecycleState) {
       results = results.filter(o => o.lifecycleState === query.lifecycleState);
     }
     if (query.visibility) {
       results = results.filter(o => o.visibility === query.visibility);
     }
     if (query.limit) {
       results = results.slice(0, query.limit);
     }
 
     return results;
   }, [objects]);
 
   // Get object graph (connected objects)
   const getObjectGraph = useCallback((objectId: string, depth: number = 2) => {
     const visited = new Set<string>();
     const nodes: ObjectRegistryEntry[] = [];
     const edges: ObjectRelationship[] = [];
 
     const traverse = (id: string, currentDepth: number) => {
       if (currentDepth > depth || visited.has(id)) return;
       visited.add(id);
 
       const obj = objects.find(o => o.id === id);
       if (obj) nodes.push(obj);
 
       const relatedEdges = relationships.filter(
         r => r.sourceId === id || r.targetId === id
       );
 
       relatedEdges.forEach(edge => {
         if (!edges.find(e => e.id === edge.id)) {
           edges.push(edge);
           const nextId = edge.sourceId === id ? edge.targetId : edge.sourceId;
           traverse(nextId, currentDepth + 1);
         }
       });
     };
 
     traverse(objectId, 0);
     return { nodes, edges };
   }, [objects, relationships]);
 
   // Calculate trust signals for an object
   const calculateTrustSignals = useCallback((objectId: string): TrustSignal[] => {
     const obj = objects.find(o => o.id === objectId);
     if (!obj) return [];
 
     const signals: TrustSignal[] = [];
 
     // Age-based trust
     const ageInDays = Math.floor((Date.now() - obj.createdAt.getTime()) / (1000 * 60 * 60 * 24));
     if (ageInDays > 30) {
       signals.push({
         type: "temporal",
         value: Math.min(ageInDays / 365, 1) * 10,
         source: "system",
         timestamp: new Date(),
         weight: 0.1,
       });
     }
 
     // Verification-based trust
     if (obj.lifecycleState === "verified") {
       signals.push({
         type: "institutional",
         value: 25,
         source: "verification_system",
         timestamp: new Date(),
         weight: 0.25,
       });
     }
 
     // Relationship-based trust
     const relCount = relationships.filter(
       r => r.sourceId === objectId || r.targetId === objectId
     ).length;
     if (relCount > 0) {
       signals.push({
         type: "peer_verification",
         value: Math.min(relCount * 2, 20),
         source: "relationship_graph",
         timestamp: new Date(),
         weight: 0.15,
       });
     }
 
     return signals;
   }, [objects, relationships]);
 
   // Get version history for an object
   const getVersionHistory = useCallback(async (objectId: string): Promise<AuditEntry[]> => {
     // In production, this would query the audit_logs table
     return [];
   }, []);
 
   // Stats
   const stats = useMemo(() => ({
     totalObjects: objects.length,
     byType: objects.reduce((acc, obj) => {
       acc[obj.objectType] = (acc[obj.objectType] || 0) + 1;
       return acc;
     }, {} as Record<string, number>),
     totalRelationships: relationships.length,
     activeObjects: objects.filter(o => o.lifecycleState === "active").length,
     verifiedObjects: objects.filter(o => o.lifecycleState === "verified").length,
   }), [objects, relationships]);
 
   return {
     objects,
     relationships,
     loading,
     stats,
     registerObject,
     updateLifecycle,
     updateVisibility,
     createRelationship,
     queryObjects,
     getObjectGraph,
     calculateTrustSignals,
     getVersionHistory,
   };
 }
 
 // Helper: Log audit entry
 async function logAuditEntry(
   objectId: string,
   action: string,
   actorId: string,
   details: Record<string, unknown>
 ): Promise<void> {
   // In production, this would persist to admin_audit_logs table
   console.log("[UPOM Audit]", { objectId, action, actorId, details, timestamp: new Date() });
 }
 
 // ============================================
 // OBJECT TYPE REGISTRY
 // ============================================
 
 export const OBJECT_TYPE_REGISTRY: Record<UPOMObjectType, {
   label: string;
   icon: string;
   color: string;
   description: string;
 }> = {
   person: { label: "Person", icon: "User", color: "blue", description: "Individual professional" },
   skill: { label: "Skill", icon: "Zap", color: "yellow", description: "Competency or ability" },
   credential: { label: "Credential", icon: "Award", color: "purple", description: "Verified qualification" },
   outcome: { label: "Outcome", icon: "Target", color: "green", description: "Verified result" },
   deal: { label: "Deal", icon: "Handshake", color: "orange", description: "Professional transaction" },
   project: { label: "Project", icon: "Folder", color: "indigo", description: "Collaborative work" },
   research_artifact: { label: "Research Artifact", icon: "FileText", color: "cyan", description: "Research output" },
   opportunity: { label: "Opportunity", icon: "Sparkles", color: "pink", description: "Professional opportunity" },
   institution: { label: "Institution", icon: "Building2", color: "slate", description: "Organization" },
   policy: { label: "Policy", icon: "Shield", color: "red", description: "Governance rule" },
   event: { label: "Event", icon: "Calendar", color: "teal", description: "Professional event" },
   learning_unit: { label: "Learning Unit", icon: "BookOpen", color: "amber", description: "Educational content" },
 };
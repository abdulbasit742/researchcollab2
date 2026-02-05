import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  AntiCaptureAlert,
  AntiCaptureViolationType,
  TransparencyRecord,
  MultiInstitutionAnchor,
} from "@/types/knowledge-civilization";

// ============================================
// SYSTEM 45: ANTI-CAPTURE & OPENNESS SAFEGUARDS
// Preventing monopolies, lock-in, and suppression
// ============================================

export function useAntiCapture() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<AntiCaptureAlert[]>([]);
  const [transparencyRecords, setTransparencyRecords] = useState<TransparencyRecord[]>([]);
  const [anchors, setAnchors] = useState<MultiInstitutionAnchor[]>([]);

  // Detect potential capture attempt
  const detectCaptureAttempt = useCallback(async (
    actorId: string,
    action: string,
    affectedObjectIds: string[],
    context: Record<string, unknown> = {}
  ): Promise<AntiCaptureAlert | null> => {
    // Analyze for capture patterns
    let violationType: AntiCaptureViolationType | null = null;
    let severity: AntiCaptureAlert["severity"] = "low";

    // Check for monopoly patterns
    if (affectedObjectIds.length > 10) {
      violationType = "monopoly_attempt";
      severity = "high";
    }

    // Check for lock-in patterns
    if (action === "restrict_access" || action === "exclusive_license") {
      violationType = "lock_in_pattern";
      severity = "medium";
    }

    // Check for history rewriting
    if (action === "modify_provenance" || action === "alter_validation") {
      violationType = "history_rewrite";
      severity = "critical";
    }

    // Check for suppression
    if (action === "hide" || action === "remove_visibility") {
      violationType = "suppression";
      severity = "high";
    }

    // Check for unauthorized deletion
    if (action === "delete" && affectedObjectIds.length > 3) {
      violationType = "unauthorized_deletion";
      severity = "critical";
    }

    if (!violationType) return null;

    const alert: AntiCaptureAlert = {
      id: crypto.randomUUID(),
      violationType,
      description: `Potential ${violationType.replace("_", " ")} detected for ${affectedObjectIds.length} object(s)`,
      actorId,
      affectedObjectIds,
      severity,
      detectedAt: new Date(),
    };

    setAlerts(prev => [...prev, alert]);
    
    if (severity === "critical") {
      toast.error("Critical anti-capture alert triggered");
    }

    return alert;
  }, []);

  // Record transparency action
  const recordTransparency = useCallback(async (
    objectId: string,
    action: string,
    rationale: string,
    witnesses: string[] = []
  ): Promise<TransparencyRecord | null> => {
    if (!user) return null;

    const record: TransparencyRecord = {
      id: crypto.randomUUID(),
      objectId,
      action,
      performedBy: user.id,
      performedAt: new Date(),
      rationale,
      witnesses,
      immutableHash: await generateImmutableHash(objectId, action, rationale),
    };

    setTransparencyRecords(prev => [...prev, record]);
    return record;
  }, [user]);

  // Create multi-institution anchor
  const createAnchor = useCallback(async (
    knowledgeObjectId: string,
    initialInstitutionId: string,
    endorsementLevel: "witnessed" | "endorsed" | "certified"
  ): Promise<MultiInstitutionAnchor | null> => {
    const existing = anchors.find(a => a.knowledgeObjectId === knowledgeObjectId);
    
    if (existing) {
      // Add institution to existing anchor
      setAnchors(prev => prev.map(a => {
        if (a.knowledgeObjectId !== knowledgeObjectId) return a;
        
        if (a.anchoringInstitutions.some(i => i.institutionId === initialInstitutionId)) {
          return a; // Already anchored by this institution
        }
        
        return {
          ...a,
          anchoringInstitutions: [...a.anchoringInstitutions, {
            institutionId: initialInstitutionId,
            anchoredAt: new Date(),
            endorsementLevel,
          }],
          consensusStrength: calculateConsensusStrength(
            a.anchoringInstitutions.length + 1,
            a.disputeCount
          ),
        };
      }));
      
      toast.success("Institution added to anchor");
      return anchors.find(a => a.knowledgeObjectId === knowledgeObjectId) || null;
    }

    const anchor: MultiInstitutionAnchor = {
      id: crypto.randomUUID(),
      knowledgeObjectId,
      anchoringInstitutions: [{
        institutionId: initialInstitutionId,
        anchoredAt: new Date(),
        endorsementLevel,
      }],
      consensusStrength: 0.1, // Low with single institution
      disputeCount: 0,
    };

    setAnchors(prev => [...prev, anchor]);
    toast.success("Multi-institution anchor created");
    return anchor;
  }, [anchors]);

  // Add institution to anchor
  const addInstitutionToAnchor = useCallback(async (
    anchorId: string,
    institutionId: string,
    endorsementLevel: "witnessed" | "endorsed" | "certified"
  ): Promise<boolean> => {
    setAnchors(prev => prev.map(a => {
      if (a.id !== anchorId) return a;
      
      if (a.anchoringInstitutions.some(i => i.institutionId === institutionId)) {
        return a;
      }
      
      const newInstitutions = [...a.anchoringInstitutions, {
        institutionId,
        anchoredAt: new Date(),
        endorsementLevel,
      }];
      
      return {
        ...a,
        anchoringInstitutions: newInstitutions,
        consensusStrength: calculateConsensusStrength(newInstitutions.length, a.disputeCount),
      };
    }));

    toast.success("Institution added to anchor");
    return true;
  }, []);

  // Record dispute against anchor
  const recordDispute = useCallback(async (
    anchorId: string,
    reason: string
  ): Promise<boolean> => {
    setAnchors(prev => prev.map(a => {
      if (a.id !== anchorId) return a;
      
      const newDisputeCount = a.disputeCount + 1;
      
      return {
        ...a,
        disputeCount: newDisputeCount,
        consensusStrength: calculateConsensusStrength(
          a.anchoringInstitutions.length,
          newDisputeCount
        ),
      };
    }));

    // Record transparency for the dispute
    const anchor = anchors.find(a => a.id === anchorId);
    if (anchor && user) {
      await recordTransparency(
        anchor.knowledgeObjectId,
        "dispute_recorded",
        reason
      );
    }

    return true;
  }, [anchors, user, recordTransparency]);

  // Get transparency history
  const getTransparencyHistory = useCallback((objectId: string) => {
    return transparencyRecords
      .filter(r => r.objectId === objectId)
      .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
  }, [transparencyRecords]);

  // Verify immutability
  const verifyImmutability = useCallback(async (
    recordId: string
  ): Promise<{ valid: boolean; reason?: string }> => {
    const record = transparencyRecords.find(r => r.id === recordId);
    if (!record) {
      return { valid: false, reason: "Record not found" };
    }

    // Verify hash matches
    const expectedHash = await generateImmutableHash(
      record.objectId,
      record.action,
      record.rationale
    );

    if (record.immutableHash !== expectedHash) {
      return { valid: false, reason: "Hash mismatch - record may have been tampered" };
    }

    return { valid: true };
  }, [transparencyRecords]);

  // Resolve alert
  const resolveAlert = useCallback(async (
    alertId: string,
    resolution: string
  ): Promise<boolean> => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId
        ? { ...a, resolvedAt: new Date(), resolution }
        : a
    ));

    toast.success("Alert resolved");
    return true;
  }, []);

  // Get active alerts
  const getActiveAlerts = useCallback(() => {
    return alerts.filter(a => !a.resolvedAt);
  }, [alerts]);

  // Get anchor strength
  const getAnchorStrength = useCallback((knowledgeObjectId: string) => {
    const anchor = anchors.find(a => a.knowledgeObjectId === knowledgeObjectId);
    if (!anchor) return 0;
    return anchor.consensusStrength;
  }, [anchors]);

  // Check if deletion is safe
  const canSafelyDelete = useCallback((
    objectId: string
  ): { allowed: boolean; reason?: string } => {
    // Check for anchors
    const anchor = anchors.find(a => a.knowledgeObjectId === objectId);
    if (anchor && anchor.anchoringInstitutions.length > 1) {
      return {
        allowed: false,
        reason: `Object is anchored by ${anchor.anchoringInstitutions.length} institutions`,
      };
    }

    // Check transparency records
    const records = transparencyRecords.filter(r => r.objectId === objectId);
    if (records.length > 5) {
      return {
        allowed: false,
        reason: "Object has significant transparency history",
      };
    }

    return { allowed: true };
  }, [anchors, transparencyRecords]);

  // Get safeguard statistics
  const getSafeguardStats = useCallback(() => {
    return {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => !a.resolvedAt).length,
      criticalAlerts: alerts.filter(a => a.severity === "critical" && !a.resolvedAt).length,
      totalAnchors: anchors.length,
      strongAnchors: anchors.filter(a => a.consensusStrength > 0.7).length,
      transparencyRecords: transparencyRecords.length,
    };
  }, [alerts, anchors, transparencyRecords]);

  return {
    loading,
    alerts,
    transparencyRecords,
    anchors,
    detectCaptureAttempt,
    recordTransparency,
    createAnchor,
    addInstitutionToAnchor,
    recordDispute,
    getTransparencyHistory,
    verifyImmutability,
    resolveAlert,
    getActiveAlerts,
    getAnchorStrength,
    canSafelyDelete,
    getSafeguardStats,
  };
}

// Helper functions
function calculateConsensusStrength(institutionCount: number, disputeCount: number): number {
  // More institutions = higher strength, disputes reduce it
  const base = Math.min(0.9, institutionCount * 0.2);
  const penalty = disputeCount * 0.1;
  return Math.max(0, base - penalty);
}

async function generateImmutableHash(
  objectId: string,
  action: string,
  rationale: string
): Promise<string> {
  const data = `${objectId}:${action}:${rationale}:${Date.now()}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export type { AntiCaptureAlert, AntiCaptureViolationType, TransparencyRecord, MultiInstitutionAnchor };

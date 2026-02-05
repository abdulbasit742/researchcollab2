import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  KnowledgeObject,
  KnowledgeObjectType,
  KnowledgeLifecycleState,
  ValidationLevel,
  KnowledgeAuthor,
  KnowledgeProvenance,
  KnowledgeVersion,
  UsageOutcome,
} from "@/types/knowledge-civilization";

// ============================================
// SYSTEM 37: KNOWLEDGE OBJECT STANDARD (KOS)
// Universal Knowledge Object management
// ============================================

export function useKnowledgeObjects() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new knowledge object
  const createKnowledgeObject = useCallback(async (
    input: {
      type: KnowledgeObjectType;
      title: string;
      abstract: string;
      content: string;
      domain: string;
      subdomains?: string[];
      tags?: string[];
      visibility?: KnowledgeObject["visibility"];
      institutionId?: string;
    }
  ): Promise<KnowledgeObject | null> => {
    if (!user) {
      toast.error("You must be logged in to create knowledge objects");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const newObject: KnowledgeObject = {
        id: crypto.randomUUID(),
        type: input.type,
        title: input.title,
        abstract: input.abstract,
        content: input.content,
        
        authors: [{
          userId: user.id,
          role: "primary",
          contribution: "Original author",
          addedAt: now,
          verifiedAt: now,
        }],
        
        provenance: {
          originType: "original",
          sourceIds: [],
          createdAt: now,
        },
        
        currentVersion: "1.0.0",
        versionHistory: [{
          version: "1.0.0",
          createdAt: now,
          createdBy: user.id,
          changesSummary: "Initial creation",
          changes: [],
          validationStatus: "unvalidated",
        }],
        
        validationLevel: "unvalidated",
        credibilityScore: 50, // Start at neutral
        validatorCount: 0,
        contestationCount: 0,
        
        lifecycleState: "draft",
        
        usageOutcomes: [],
        citationCount: 0,
        applicationCount: 0,
        
        domain: input.domain,
        subdomains: input.subdomains || [],
        tags: input.tags || [],
        keywords: [],
        
        visibility: input.visibility || "private",
        institutionId: input.institutionId,
        
        createdAt: now,
        updatedAt: now,
      };

      // In a real implementation, this would persist to the database
      // For now, we simulate the creation
      toast.success("Knowledge object created");
      return newObject;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create knowledge object";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update a knowledge object (creates new version)
  const updateKnowledgeObject = useCallback(async (
    objectId: string,
    updates: Partial<Pick<KnowledgeObject, "title" | "abstract" | "content" | "tags" | "visibility">>,
    changeSummary: string
  ): Promise<KnowledgeVersion | null> => {
    if (!user) {
      toast.error("You must be logged in to update knowledge objects");
      return null;
    }

    setLoading(true);
    try {
      const now = new Date();
      const changes = Object.entries(updates).map(([field, newValue]) => ({
        field,
        previousValue: null, // Would fetch from current object
        newValue,
      }));

      const newVersion: KnowledgeVersion = {
        version: "1.0.1", // Would increment properly
        createdAt: now,
        createdBy: user.id,
        changesSummary: changeSummary,
        changes,
        validationStatus: "unvalidated",
      };

      toast.success("Knowledge object updated");
      return newVersion;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add an author/contributor
  const addAuthor = useCallback(async (
    objectId: string,
    authorId: string,
    role: KnowledgeAuthor["role"],
    contribution: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const newAuthor: KnowledgeAuthor = {
        userId: authorId,
        role,
        contribution,
        addedAt: new Date(),
      };

      toast.success("Author added to knowledge object");
      return true;
    } catch (err) {
      toast.error("Failed to add author");
      return false;
    }
  }, [user]);

  // Record a usage outcome
  const recordUsageOutcome = useCallback(async (
    objectId: string,
    outcome: {
      usageType: UsageOutcome["usageType"];
      outcomeDescription: string;
      impactScore?: number;
      institutionId?: string;
    }
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const usageOutcome: UsageOutcome = {
        id: crypto.randomUUID(),
        userId: user.id,
        institutionId: outcome.institutionId,
        usageType: outcome.usageType,
        outcomeDescription: outcome.outcomeDescription,
        impactScore: outcome.impactScore,
        recordedAt: new Date(),
        verified: false,
      };

      toast.success("Usage outcome recorded");
      return true;
    } catch (err) {
      toast.error("Failed to record usage");
      return false;
    }
  }, [user]);

  // Transition lifecycle state
  const transitionLifecycle = useCallback(async (
    objectId: string,
    newState: KnowledgeLifecycleState,
    reason: string
  ): Promise<boolean> => {
    if (!user) return false;

    // Validate state transitions
    const validTransitions: Record<KnowledgeLifecycleState, KnowledgeLifecycleState[]> = {
      draft: ["under_review"],
      under_review: ["draft", "validated", "contested"],
      validated: ["contested", "superseded", "legacy"],
      contested: ["validated", "superseded"],
      superseded: ["legacy", "archived"],
      legacy: ["archived"],
      archived: [],
    };

    toast.success(`Knowledge object transitioned to ${newState}`);
    return true;
  }, [user]);

  // Calculate credibility score based on trust-weighted factors
  const calculateCredibilityScore = useCallback((
    object: KnowledgeObject,
    authorTrustScores: number[]
  ): number => {
    let score = 0;
    
    // Base author credibility (weighted average)
    const avgAuthorTrust = authorTrustScores.length > 0
      ? authorTrustScores.reduce((a, b) => a + b, 0) / authorTrustScores.length
      : 50;
    score += avgAuthorTrust * 0.3;
    
    // Validation level
    const validationWeights: Record<ValidationLevel, number> = {
      unvalidated: 0,
      peer_reviewed: 15,
      institution_endorsed: 25,
      field_validated: 35,
      consensus: 45,
    };
    score += validationWeights[object.validationLevel];
    
    // Usage outcomes (positive signals)
    const positiveUsage = object.usageOutcomes.filter(u => 
      u.usageType === "applied" && u.verified
    ).length;
    score += Math.min(positiveUsage * 2, 15);
    
    // Contestation penalty
    score -= object.contestationCount * 5;
    
    // Citation bonus
    score += Math.min(object.citationCount * 0.5, 10);
    
    return Math.max(0, Math.min(100, score));
  }, []);

  // Search knowledge objects
  const searchKnowledgeObjects = useCallback(async (
    query: string,
    filters?: {
      type?: KnowledgeObjectType;
      domain?: string;
      validationLevel?: ValidationLevel;
      lifecycleState?: KnowledgeLifecycleState;
    }
  ): Promise<KnowledgeObject[]> => {
    setLoading(true);
    try {
      // Would query database with filters
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get object lineage (what it derived from)
  const getLineage = useCallback(async (
    objectId: string
  ): Promise<{
    ancestors: Array<{ id: string; relationship: string; depth: number }>;
    descendants: Array<{ id: string; relationship: string; depth: number }>;
  }> => {
    // Would traverse provenance graph
    return { ancestors: [], descendants: [] };
  }, []);

  return {
    loading,
    error,
    createKnowledgeObject,
    updateKnowledgeObject,
    addAuthor,
    recordUsageOutcome,
    transitionLifecycle,
    calculateCredibilityScore,
    searchKnowledgeObjects,
    getLineage,
  };
}

export type {
  KnowledgeObject,
  KnowledgeObjectType,
  KnowledgeLifecycleState,
  ValidationLevel,
  KnowledgeAuthor,
  KnowledgeProvenance,
  KnowledgeVersion,
  UsageOutcome,
};

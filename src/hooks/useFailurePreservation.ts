import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  FailureRecord,
  FailureType,
} from "@/types/knowledge-civilization";

// ============================================
// SYSTEM 39: FAILURE & NEGATIVE KNOWLEDGE
// Preserving what didn't work (failure is data)
// ============================================

export function useFailurePreservation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [failures, setFailures] = useState<FailureRecord[]>([]);

  // Record a failure
  const recordFailure = useCallback(async (
    input: {
      type: FailureType;
      title: string;
      description: string;
      originalHypothesis: string;
      methodology: string;
      expectedOutcome: string;
      actualOutcome: string;
      failureReason: string;
      contributingFactors: string[];
      lessonsLearned: string[];
      conditions: string[];
      domain: string;
      tags?: string[];
      visibility?: FailureRecord["visibility"];
    }
  ): Promise<FailureRecord | null> => {
    if (!user) {
      toast.error("You must be logged in to record failures");
      return null;
    }

    setLoading(true);
    try {
      const now = new Date();
      const failureRecord: FailureRecord = {
        id: crypto.randomUUID(),
        type: input.type,
        title: input.title,
        description: input.description,
        originalHypothesis: input.originalHypothesis,
        methodology: input.methodology,
        expectedOutcome: input.expectedOutcome,
        actualOutcome: input.actualOutcome,
        failureReason: input.failureReason,
        contributingFactors: input.contributingFactors,
        lessonsLearned: input.lessonsLearned,
        recommendationsAgainst: [],
        conditions: input.conditions,
        authorId: user.id,
        credibilityScore: 50, // Start neutral
        verifiedBy: [],
        replicationAttempts: 0,
        visibility: input.visibility || "private",
        sharedWith: [],
        domain: input.domain,
        tags: input.tags || [],
        createdAt: now,
        updatedAt: now,
      };

      setFailures(prev => [...prev, failureRecord]);
      toast.success("Failure recorded - thank you for contributing to collective knowledge");
      return failureRecord;
    } catch (err) {
      toast.error("Failed to record failure");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update visibility
  const updateVisibility = useCallback(async (
    failureId: string,
    visibility: FailureRecord["visibility"]
  ): Promise<boolean> => {
    if (!user) return false;

    setFailures(prev => prev.map(f => 
      f.id === failureId && f.authorId === user.id
        ? { ...f, visibility, updatedAt: new Date() }
        : f
    ));

    toast.success(`Visibility updated to ${visibility}`);
    return true;
  }, [user]);

  // Share with specific users
  const shareWith = useCallback(async (
    failureId: string,
    userIds: string[]
  ): Promise<boolean> => {
    if (!user) return false;

    setFailures(prev => prev.map(f => 
      f.id === failureId && f.authorId === user.id
        ? { 
            ...f, 
            sharedWith: [...new Set([...f.sharedWith, ...userIds])],
            updatedAt: new Date(),
          }
        : f
    ));

    toast.success(`Shared with ${userIds.length} user(s)`);
    return true;
  }, [user]);

  // Verify a failure (by credible peers)
  const verifyFailure = useCallback(async (
    failureId: string
  ): Promise<boolean> => {
    if (!user) return false;

    setFailures(prev => prev.map(f => {
      if (f.id !== failureId) return f;
      if (f.verifiedBy.includes(user.id)) return f; // Already verified
      
      return {
        ...f,
        verifiedBy: [...f.verifiedBy, user.id],
        credibilityScore: Math.min(100, f.credibilityScore + 5), // Boost credibility
        updatedAt: new Date(),
      };
    }));

    toast.success("Failure record verified");
    return true;
  }, [user]);

  // Record replication attempt
  const recordReplicationAttempt = useCallback(async (
    failureId: string,
    replicated: boolean,
    notes: string
  ): Promise<boolean> => {
    if (!user) return false;

    setFailures(prev => prev.map(f => {
      if (f.id !== failureId) return f;
      
      return {
        ...f,
        replicationAttempts: f.replicationAttempts + 1,
        credibilityScore: replicated 
          ? Math.min(100, f.credibilityScore + 10) // Replicated = more credible
          : Math.max(0, f.credibilityScore - 5),   // Not replicated = less credible
        updatedAt: new Date(),
      };
    }));

    toast.success("Replication attempt recorded");
    return true;
  }, [user]);

  // Add lesson learned
  const addLesson = useCallback(async (
    failureId: string,
    lesson: string
  ): Promise<boolean> => {
    if (!user) return false;

    setFailures(prev => prev.map(f => 
      f.id === failureId
        ? { 
            ...f, 
            lessonsLearned: [...f.lessonsLearned, lesson],
            updatedAt: new Date(),
          }
        : f
    ));

    toast.success("Lesson added");
    return true;
  }, [user]);

  // Add recommendation against
  const addRecommendationAgainst = useCallback(async (
    failureId: string,
    recommendation: string
  ): Promise<boolean> => {
    if (!user) return false;

    setFailures(prev => prev.map(f => 
      f.id === failureId
        ? { 
            ...f, 
            recommendationsAgainst: [...f.recommendationsAgainst, recommendation],
            updatedAt: new Date(),
          }
        : f
    ));

    toast.success("Recommendation added");
    return true;
  }, [user]);

  // Link to related successes
  const linkRelatedSuccess = useCallback(async (
    failureId: string,
    successId: string
  ): Promise<boolean> => {
    if (!user) return false;

    setFailures(prev => prev.map(f => 
      f.id === failureId
        ? { 
            ...f, 
            relatedSuccesses: [...(f.relatedSuccesses || []), successId],
            updatedAt: new Date(),
          }
        : f
    ));

    toast.success("Related success linked");
    return true;
  }, [user]);

  // Search failures
  const searchFailures = useCallback(async (
    query: string,
    filters?: {
      type?: FailureType;
      domain?: string;
      visibility?: FailureRecord["visibility"];
      minCredibility?: number;
    }
  ): Promise<FailureRecord[]> => {
    setLoading(true);
    try {
      let results = failures;
      
      // Filter by visibility (respect privacy)
      if (user) {
        results = results.filter(f => 
          f.visibility === "public" ||
          (f.visibility === "field" && true) || // Would check field membership
          (f.visibility === "institution" && true) || // Would check institution
          f.authorId === user.id ||
          f.sharedWith.includes(user.id)
        );
      } else {
        results = results.filter(f => f.visibility === "public");
      }
      
      // Apply filters
      if (filters?.type) {
        results = results.filter(f => f.type === filters.type);
      }
      if (filters?.domain) {
        results = results.filter(f => f.domain === filters.domain);
      }
      if (filters?.minCredibility) {
        results = results.filter(f => f.credibilityScore >= filters.minCredibility);
      }
      
      // Text search
      if (query) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(f => 
          f.title.toLowerCase().includes(lowerQuery) ||
          f.description.toLowerCase().includes(lowerQuery) ||
          f.lessonsLearned.some(l => l.toLowerCase().includes(lowerQuery))
        );
      }
      
      return results;
    } finally {
      setLoading(false);
    }
  }, [failures, user]);

  // Get failure statistics for a domain
  const getDomainStats = useCallback((domain: string) => {
    const domainFailures = failures.filter(f => f.domain === domain);
    
    const byType = domainFailures.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {} as Record<FailureType, number>);
    
    const commonLessons = domainFailures
      .flatMap(f => f.lessonsLearned)
      .reduce((acc, lesson) => {
        acc[lesson] = (acc[lesson] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const topLessons = Object.entries(commonLessons)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    return {
      totalFailures: domainFailures.length,
      byType,
      topLessons,
      avgCredibility: domainFailures.length > 0
        ? domainFailures.reduce((sum, f) => sum + f.credibilityScore, 0) / domainFailures.length
        : 0,
      totalReplicationAttempts: domainFailures.reduce((sum, f) => sum + f.replicationAttempts, 0),
    };
  }, [failures]);

  return {
    loading,
    failures,
    recordFailure,
    updateVisibility,
    shareWith,
    verifyFailure,
    recordReplicationAttempt,
    addLesson,
    addRecommendationAgainst,
    linkRelatedSuccess,
    searchFailures,
    getDomainStats,
  };
}

export type { FailureRecord, FailureType };

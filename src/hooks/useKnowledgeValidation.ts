import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  ValidationRecord,
  ValidationAction,
  KnowledgeEvolution,
  ValidationLevel,
  KnowledgeLifecycleState,
} from "@/types/knowledge-civilization";

// ============================================
// SYSTEM 41: KNOWLEDGE VALIDATION & EVOLUTION
// No static truth - only evolving understanding
// ============================================

export function useKnowledgeValidation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationRecords, setValidationRecords] = useState<ValidationRecord[]>([]);

  // Submit a validation action
  const submitValidation = useCallback(async (
    input: {
      knowledgeObjectId: string;
      action: ValidationAction;
      rationale: string;
      evidence?: string[];
      supersedingObjectId?: string;
      supersessionReason?: string;
    }
  ): Promise<ValidationRecord | null> => {
    if (!user) {
      toast.error("You must be logged in to validate knowledge");
      return null;
    }

    setLoading(true);
    try {
      const record: ValidationRecord = {
        id: crypto.randomUUID(),
        knowledgeObjectId: input.knowledgeObjectId,
        validatorId: user.id,
        validatorCredibility: 50, // Would fetch actual credibility
        action: input.action,
        rationale: input.rationale,
        evidence: input.evidence,
        supersedingObjectId: input.supersedingObjectId,
        supersessionReason: input.supersessionReason,
        createdAt: new Date(),
        acknowledged: false,
      };

      setValidationRecords(prev => [...prev, record]);
      
      const actionMessages: Record<ValidationAction, string> = {
        endorse: "Knowledge endorsed",
        question: "Question raised",
        contest: "Contestation submitted",
        supersede: "Supersession recorded",
        merge: "Merge proposed",
        split: "Split proposed",
      };
      
      toast.success(actionMessages[input.action]);
      return record;
    } catch (err) {
      toast.error("Failed to submit validation");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Endorse knowledge
  const endorse = useCallback(async (
    objectId: string,
    rationale: string
  ) => {
    return submitValidation({
      knowledgeObjectId: objectId,
      action: "endorse",
      rationale,
    });
  }, [submitValidation]);

  // Contest knowledge
  const contest = useCallback(async (
    objectId: string,
    rationale: string,
    evidence: string[]
  ) => {
    return submitValidation({
      knowledgeObjectId: objectId,
      action: "contest",
      rationale,
      evidence,
    });
  }, [submitValidation]);

  // Supersede knowledge
  const supersede = useCallback(async (
    objectId: string,
    supersedingObjectId: string,
    reason: string
  ) => {
    return submitValidation({
      knowledgeObjectId: objectId,
      action: "supersede",
      rationale: reason,
      supersedingObjectId,
      supersessionReason: reason,
    });
  }, [submitValidation]);

  // Calculate validation level based on records
  const calculateValidationLevel = useCallback((
    objectId: string
  ): ValidationLevel => {
    const records = validationRecords.filter(r => r.knowledgeObjectId === objectId);
    
    if (records.length === 0) return "unvalidated";
    
    const endorsements = records.filter(r => r.action === "endorse");
    const contestations = records.filter(r => r.action === "contest");
    
    // Calculate weighted endorsement score
    const endorsementScore = endorsements.reduce((sum, r) => sum + r.validatorCredibility, 0);
    const contestationScore = contestations.reduce((sum, r) => sum + r.validatorCredibility, 0);
    
    const netScore = endorsementScore - contestationScore;
    
    // Determine level based on endorsement count and credibility
    const uniqueEndorsers = new Set(endorsements.map(r => r.validatorId)).size;
    const hasInstitutionalEndorsement = endorsements.some(r => r.validatorCredibility > 80);
    
    if (netScore >= 500 && uniqueEndorsers >= 10) return "consensus";
    if (netScore >= 200 && hasInstitutionalEndorsement) return "field_validated";
    if (hasInstitutionalEndorsement) return "institution_endorsed";
    if (netScore >= 50) return "peer_reviewed";
    return "unvalidated";
  }, [validationRecords]);

  // Get evolution path
  const getEvolutionPath = useCallback((
    objectId: string
  ): KnowledgeEvolution => {
    const records = validationRecords
      .filter(r => r.knowledgeObjectId === objectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    const evolutionPath: KnowledgeEvolution["evolutionPath"] = [];
    let currentCredibility = 50;
    
    for (const record of records) {
      const validationLevel = calculateValidationLevel(objectId);
      
      // Adjust credibility based on action
      switch (record.action) {
        case "endorse":
          currentCredibility = Math.min(100, currentCredibility + record.validatorCredibility * 0.1);
          break;
        case "contest":
          currentCredibility = Math.max(0, currentCredibility - record.validatorCredibility * 0.15);
          break;
        case "supersede":
          currentCredibility = Math.max(0, currentCredibility - 20);
          break;
      }
      
      evolutionPath.push({
        version: "1.0", // Would track actual version
        validationLevel,
        credibilityScore: currentCredibility,
        timestamp: record.createdAt,
        trigger: record.action,
      });
    }
    
    // Determine trajectory
    let projectedTrajectory: KnowledgeEvolution["projectedTrajectory"] = "stable";
    if (evolutionPath.length >= 3) {
      const recent = evolutionPath.slice(-3);
      const trend = recent[2].credibilityScore - recent[0].credibilityScore;
      
      if (trend > 10) projectedTrajectory = "growing";
      else if (trend < -10) projectedTrajectory = "declining";
      
      const contestations = records.filter(r => r.action === "contest").length;
      if (contestations >= 3) projectedTrajectory = "contested";
    }
    
    // Determine current state
    let currentState: KnowledgeLifecycleState = "draft";
    const level = calculateValidationLevel(objectId);
    if (level === "consensus") currentState = "validated";
    else if (level === "field_validated") currentState = "validated";
    else if (level === "institution_endorsed") currentState = "validated";
    else if (level === "peer_reviewed") currentState = "under_review";
    
    const hasSupersession = records.some(r => r.action === "supersede");
    if (hasSupersession) currentState = "superseded";
    
    return {
      objectId,
      evolutionPath,
      currentState,
      projectedTrajectory,
    };
  }, [validationRecords, calculateValidationLevel]);

  // Get validation statistics
  const getValidationStats = useCallback((objectId: string) => {
    const records = validationRecords.filter(r => r.knowledgeObjectId === objectId);
    
    const byAction = records.reduce((acc, r) => {
      acc[r.action] = (acc[r.action] || 0) + 1;
      return acc;
    }, {} as Record<ValidationAction, number>);
    
    const avgCredibility = records.length > 0
      ? records.reduce((sum, r) => sum + r.validatorCredibility, 0) / records.length
      : 0;
    
    return {
      totalValidations: records.length,
      byAction,
      avgValidatorCredibility: avgCredibility,
      uniqueValidators: new Set(records.map(r => r.validatorId)).size,
      mostRecentAt: records.length > 0 
        ? records[records.length - 1].createdAt 
        : null,
    };
  }, [validationRecords]);

  // Check if user can validate
  const canValidate = useCallback((
    objectId: string,
    action: ValidationAction
  ): { allowed: boolean; reason?: string } => {
    if (!user) {
      return { allowed: false, reason: "Must be logged in" };
    }
    
    // Check if already validated
    const existingValidation = validationRecords.find(r => 
      r.knowledgeObjectId === objectId && 
      r.validatorId === user.id &&
      r.action === action
    );
    
    if (existingValidation) {
      return { allowed: false, reason: "You have already performed this action" };
    }
    
    // Check if supersession is valid
    if (action === "supersede") {
      // Would check if user has created superseding object
    }
    
    return { allowed: true };
  }, [validationRecords, user]);

  // Acknowledge validation
  const acknowledgeValidation = useCallback(async (
    validationId: string
  ): Promise<boolean> => {
    setValidationRecords(prev => prev.map(r => 
      r.id === validationId ? { ...r, acknowledged: true } : r
    ));
    return true;
  }, []);

  return {
    loading,
    validationRecords,
    submitValidation,
    endorse,
    contest,
    supersede,
    calculateValidationLevel,
    getEvolutionPath,
    getValidationStats,
    canValidate,
    acknowledgeValidation,
  };
}

export type { ValidationRecord, ValidationAction, KnowledgeEvolution };

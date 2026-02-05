import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  MobilizationPurpose,
  MobilizationCriteria,
  MobilizationCandidate,
  MobilizedUnit,
} from "@/types/crisis-coordination";

// System 55: Collective Mobilization Engine
// Enables rapid formation of task forces, expert panels, response teams

export function useCollectiveMobilization() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeUnits, setActiveUnits] = useState<MobilizedUnit[]>([]);

  // Find candidates matching mobilization criteria
  const findCandidates = useCallback(async (
    criteria: MobilizationCriteria
  ): Promise<MobilizationCandidate[]> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    // Mock candidate matching based on criteria
    const mockCandidates: MobilizationCandidate[] = [
      {
        userId: "user-1",
        userName: "Dr. Sarah Chen",
        matchScore: 0.95,
        capabilityMatch: 0.92,
        trustScore: 88,
        readinessLevel: 4,
        availabilityStatus: "immediate" as const,
        currentCommitments: 1,
      },
      {
        userId: "user-2",
        userName: "Prof. James Wilson",
        matchScore: 0.88,
        capabilityMatch: 0.85,
        trustScore: 92,
        readinessLevel: 5,
        availabilityStatus: "within_hours" as const,
        currentCommitments: 2,
      },
      {
        userId: "user-3",
        userName: "Dr. Maria Garcia",
        matchScore: 0.82,
        capabilityMatch: 0.90,
        trustScore: 85,
        readinessLevel: 4,
        availabilityStatus: "immediate" as const,
        currentCommitments: 0,
      },
    ].filter(c =>
      c.trustScore >= criteria.minTrustScore &&
      c.readinessLevel >= criteria.minReadinessLevel
    );

    setIsLoading(false);
    return mockCandidates;
  }, []);

  // Mobilize a unit with selected candidates
  const mobilizeUnit = useCallback(async (
    purpose: MobilizationPurpose,
    name: string,
    description: string,
    objectives: string[],
    candidates: MobilizationCandidate[],
    expectedDuration: number
  ): Promise<MobilizedUnit | null> => {
    if (!user) return null;
    setIsLoading(true);

    const unit: MobilizedUnit = {
      id: `unit-${Date.now()}`,
      purpose,
      name,
      description,
      activatedAt: new Date().toISOString(),
      activatedBy: user.id,
      members: candidates,
      objectives,
      expectedDuration,
      status: "forming",
    };

    await new Promise(r => setTimeout(r, 400));
    setActiveUnits(prev => [...prev, unit]);
    setIsLoading(false);
    return unit;
  }, [user]);

  // Update unit status
  const updateUnitStatus = useCallback(async (
    unitId: string,
    status: MobilizedUnit["status"],
    outcomesSummary?: string
  ) => {
    setActiveUnits(prev => prev.map(u => 
      u.id === unitId
        ? {
            ...u,
            status,
            outcomesSummary,
            disbandedAt: status === "disbanded" ? new Date().toISOString() : undefined,
            actualDuration: status === "disbanded"
              ? Math.round((Date.now() - new Date(u.activatedAt).getTime()) / 3600000)
              : undefined,
          }
        : u
    ));
  }, []);

  // Disband a unit
  const disbandUnit = useCallback(async (
    unitId: string,
    outcomesSummary: string
  ) => {
    await updateUnitStatus(unitId, "disbanded", outcomesSummary);
  }, [updateUnitStatus]);

  // Get mobilization history
  const getMobilizationHistory = useCallback(async (
    userId?: string
  ): Promise<MobilizedUnit[]> => {
    // Would query database for historical units
    return activeUnits.filter(u => 
      u.status === "disbanded" &&
      (!userId || u.members.some(m => m.userId === userId))
    );
  }, [activeUnits]);

  return {
    isLoading,
    activeUnits,
    findCandidates,
    mobilizeUnit,
    updateUnitStatus,
    disbandUnit,
    getMobilizationHistory,
  };
}

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  LegacyDesignation,
  LegacyStatus,
  SuccessionEvent,
} from "@/types/knowledge-civilization";

// ============================================
// SYSTEM 43: LEGACY & SUCCESSION MODE
// Digital legacy, not social profiles
// ============================================

export function useLegacySuccession() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [designations, setDesignations] = useState<LegacyDesignation[]>([]);
  const [successionEvents, setSuccessionEvents] = useState<SuccessionEvent[]>([]);

  // Create or update legacy designation
  const setLegacyDesignation = useCallback(async (
    input: {
      preservationLevel?: LegacyDesignation["preservationLevel"];
      deleteAfterTransfer?: string[];
      keepPermanently?: string[];
      inactivityThresholdDays?: number;
      automaticTransfer?: boolean;
      requireSuccessorConfirmation?: boolean;
    }
  ): Promise<LegacyDesignation | null> => {
    if (!user) {
      toast.error("You must be logged in to set legacy preferences");
      return null;
    }

    setLoading(true);
    try {
      const now = new Date();
      const existingIndex = designations.findIndex(d => d.userId === user.id);
      
      const designation: LegacyDesignation = {
        id: existingIndex >= 0 ? designations[existingIndex].id : crypto.randomUUID(),
        userId: user.id,
        designatedSuccessors: existingIndex >= 0 
          ? designations[existingIndex].designatedSuccessors 
          : [],
        preservationLevel: input.preservationLevel || "standard",
        deleteAfterTransfer: input.deleteAfterTransfer || [],
        keepPermanently: input.keepPermanently || [],
        inactivityThresholdDays: input.inactivityThresholdDays || 365,
        automaticTransfer: input.automaticTransfer ?? false,
        requireSuccessorConfirmation: input.requireSuccessorConfirmation ?? true,
        status: "active",
        lastActivityAt: now,
        createdAt: existingIndex >= 0 ? designations[existingIndex].createdAt : now,
        updatedAt: now,
      };

      if (existingIndex >= 0) {
        setDesignations(prev => prev.map((d, i) => i === existingIndex ? designation : d));
      } else {
        setDesignations(prev => [...prev, designation]);
      }

      toast.success("Legacy preferences saved");
      return designation;
    } catch (err) {
      toast.error("Failed to save legacy preferences");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, designations]);

  // Add a successor
  const addSuccessor = useCallback(async (
    successorId: string,
    priority: number,
    scope: "full" | "partial",
    domains?: string[]
  ): Promise<boolean> => {
    if (!user) return false;

    setDesignations(prev => prev.map(d => {
      if (d.userId !== user.id) return d;
      
      // Check if successor already exists
      if (d.designatedSuccessors.some(s => s.userId === successorId)) {
        toast.error("This person is already a designated successor");
        return d;
      }
      
      return {
        ...d,
        designatedSuccessors: [...d.designatedSuccessors, {
          userId: successorId,
          priority,
          scope,
          domains,
        }],
        updatedAt: new Date(),
      };
    }));

    toast.success("Successor added");
    return true;
  }, [user]);

  // Remove a successor
  const removeSuccessor = useCallback(async (
    successorId: string
  ): Promise<boolean> => {
    if (!user) return false;

    setDesignations(prev => prev.map(d => {
      if (d.userId !== user.id) return d;
      
      return {
        ...d,
        designatedSuccessors: d.designatedSuccessors.filter(s => s.userId !== successorId),
        updatedAt: new Date(),
      };
    }));

    toast.success("Successor removed");
    return true;
  }, [user]);

  // Accept succession (as a designated successor)
  const acceptSuccession = useCallback(async (
    designationId: string
  ): Promise<boolean> => {
    if (!user) return false;

    setDesignations(prev => prev.map(d => {
      if (d.id !== designationId) return d;
      
      return {
        ...d,
        designatedSuccessors: d.designatedSuccessors.map(s => 
          s.userId === user.id 
            ? { ...s, acceptedAt: new Date() }
            : s
        ),
        updatedAt: new Date(),
      };
    }));

    toast.success("Succession accepted");
    return true;
  }, [user]);

  // Execute succession (transfer stewardship)
  const executeSuccession = useCallback(async (
    designationId: string,
    reason: "inactivity" | "manual" | "death"
  ): Promise<SuccessionEvent | null> => {
    const designation = designations.find(d => d.id === designationId);
    if (!designation) {
      toast.error("Designation not found");
      return null;
    }

    // Find highest priority successor who has accepted
    const acceptedSuccessors = designation.designatedSuccessors
      .filter(s => s.acceptedAt || !designation.requireSuccessorConfirmation)
      .sort((a, b) => a.priority - b.priority);

    if (acceptedSuccessors.length === 0) {
      toast.error("No successors available for transfer");
      return null;
    }

    const successor = acceptedSuccessors[0];
    const now = new Date();

    // Create succession event
    const event: SuccessionEvent = {
      id: crypto.randomUUID(),
      legacyDesignationId: designationId,
      fromUserId: designation.userId,
      toUserId: successor.userId,
      scope: successor.scope,
      transferredItems: designation.keepPermanently,
      preservedItems: designation.keepPermanently,
      executedAt: now,
    };

    setSuccessionEvents(prev => [...prev, event]);

    // Update designation status
    setDesignations(prev => prev.map(d => 
      d.id === designationId
        ? { ...d, status: "transferred" as LegacyStatus, executedAt: now }
        : d
    ));

    toast.success("Succession executed - stewardship transferred");
    return event;
  }, [designations]);

  // Check for inactivity and trigger alerts
  const checkInactivity = useCallback(async (): Promise<LegacyDesignation[]> => {
    const now = new Date();
    const inactiveDesignations: LegacyDesignation[] = [];

    for (const designation of designations) {
      const daysSinceActivity = Math.floor(
        (now.getTime() - designation.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceActivity >= designation.inactivityThresholdDays) {
        inactiveDesignations.push(designation);

        // If automatic transfer is enabled and status is still active
        if (designation.automaticTransfer && designation.status === "active") {
          setDesignations(prev => prev.map(d => 
            d.id === designation.id
              ? { ...d, status: "succession_pending" as LegacyStatus }
              : d
          ));
        }
      }
    }

    return inactiveDesignations;
  }, [designations]);

  // Update activity (prevents succession trigger)
  const recordActivity = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setDesignations(prev => prev.map(d => 
      d.userId === user.id
        ? { ...d, lastActivityAt: new Date(), status: "active" as LegacyStatus }
        : d
    ));

    return true;
  }, [user]);

  // Get user's legacy designation
  const getMyDesignation = useCallback(() => {
    if (!user) return null;
    return designations.find(d => d.userId === user.id) || null;
  }, [user, designations]);

  // Get designations where user is a successor
  const getSuccessorDesignations = useCallback(() => {
    if (!user) return [];
    return designations.filter(d => 
      d.designatedSuccessors.some(s => s.userId === user.id)
    );
  }, [user, designations]);

  // Get succession events
  const getSuccessionHistory = useCallback((userId?: string) => {
    if (userId) {
      return successionEvents.filter(e => 
        e.fromUserId === userId || e.toUserId === userId
      );
    }
    return successionEvents;
  }, [successionEvents]);

  return {
    loading,
    designations,
    successionEvents,
    setLegacyDesignation,
    addSuccessor,
    removeSuccessor,
    acceptSuccession,
    executeSuccession,
    checkInactivity,
    recordActivity,
    getMyDesignation,
    getSuccessorDesignations,
    getSuccessionHistory,
  };
}

export type { LegacyDesignation, LegacyStatus, SuccessionEvent };

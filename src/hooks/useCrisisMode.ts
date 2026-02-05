import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CrisisLevel,
  CrisisMode,
  CrisisUIOverrides,
  CrisisAuditEntry,
} from "@/types/crisis-coordination";

// System 56: Crisis Mode (Contextual Override)
// Time-bound, audited, reversible crisis state management

const DEFAULT_UI_OVERRIDES: Record<CrisisLevel, CrisisUIOverrides> = {
  advisory: {
    hideNonEssentialFeatures: false,
    elevateCoordinationTools: true,
    showCrisisBanner: true,
    prioritizedRoutes: ["/coordination", "/messaging"],
    reducedAnimations: false,
    emergencyContactsVisible: true,
  },
  elevated: {
    hideNonEssentialFeatures: false,
    elevateCoordinationTools: true,
    showCrisisBanner: true,
    prioritizedRoutes: ["/coordination", "/messaging", "/mobilization"],
    reducedAnimations: true,
    emergencyContactsVisible: true,
  },
  critical: {
    hideNonEssentialFeatures: true,
    elevateCoordinationTools: true,
    showCrisisBanner: true,
    prioritizedRoutes: ["/coordination", "/messaging", "/mobilization", "/resources"],
    reducedAnimations: true,
    emergencyContactsVisible: true,
  },
  emergency: {
    hideNonEssentialFeatures: true,
    elevateCoordinationTools: true,
    showCrisisBanner: true,
    bannerMessage: "EMERGENCY MODE ACTIVE",
    prioritizedRoutes: ["/emergency", "/coordination", "/mobilization"],
    reducedAnimations: true,
    emergencyContactsVisible: true,
  },
};

const MAX_CRISIS_DURATION: Record<CrisisLevel, number> = {
  advisory: 72, // 72 hours
  elevated: 48,
  critical: 24,
  emergency: 12,
};

export function useCrisisMode() {
  const { user } = useAuth();
  const [activeCrisis, setActiveCrisis] = useState<CrisisMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for expired crisis modes
  useEffect(() => {
    if (activeCrisis && new Date(activeCrisis.expiresAt) < new Date()) {
      deactivateCrisis("Auto-expired due to time limit");
    }
  }, [activeCrisis]);

  // Activate crisis mode
  const activateCrisis = useCallback(async (
    name: string,
    level: CrisisLevel,
    scope: CrisisMode["scope"],
    reason: string,
    scopeIdentifier?: string,
    customDurationHours?: number
  ): Promise<CrisisMode | null> => {
    if (!user) return null;
    setIsLoading(true);

    const maxDuration = MAX_CRISIS_DURATION[level];
    const duration = Math.min(customDurationHours || maxDuration, maxDuration);
    const expiresAt = new Date(Date.now() + duration * 3600000).toISOString();

    const crisis: CrisisMode = {
      id: `crisis-${Date.now()}`,
      name,
      level,
      scope,
      scopeIdentifier,
      activatedAt: new Date().toISOString(),
      activatedBy: user.id,
      expiresAt,
      reason,
      uiOverrides: DEFAULT_UI_OVERRIDES[level],
      auditLog: [{
        timestamp: new Date().toISOString(),
        action: "ACTIVATED",
        performedBy: user.id,
        details: `Crisis mode activated: ${name} (${level})`,
      }],
      isActive: true,
    };

    await new Promise(r => setTimeout(r, 300));
    setActiveCrisis(crisis);
    setIsLoading(false);
    return crisis;
  }, [user]);

  // Deactivate crisis mode
  const deactivateCrisis = useCallback(async (
    reason: string
  ) => {
    if (!activeCrisis || !user) return;

    const auditEntry: CrisisAuditEntry = {
      timestamp: new Date().toISOString(),
      action: "DEACTIVATED",
      performedBy: user.id,
      details: reason,
    };

    setActiveCrisis({
      ...activeCrisis,
      isActive: false,
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: user.id,
      deactivationReason: reason,
      auditLog: [...activeCrisis.auditLog, auditEntry],
    });
  }, [activeCrisis, user]);

  // Escalate crisis level
  const escalateCrisis = useCallback(async (
    newLevel: CrisisLevel,
    reason: string
  ) => {
    if (!activeCrisis || !user) return;

    const levelOrder: CrisisLevel[] = ["advisory", "elevated", "critical", "emergency"];
    const currentIndex = levelOrder.indexOf(activeCrisis.level);
    const newIndex = levelOrder.indexOf(newLevel);

    if (newIndex <= currentIndex) return; // Can only escalate up

    const auditEntry: CrisisAuditEntry = {
      timestamp: new Date().toISOString(),
      action: "ESCALATED",
      performedBy: user.id,
      details: `Escalated from ${activeCrisis.level} to ${newLevel}: ${reason}`,
    };

    setActiveCrisis({
      ...activeCrisis,
      level: newLevel,
      uiOverrides: DEFAULT_UI_OVERRIDES[newLevel],
      auditLog: [...activeCrisis.auditLog, auditEntry],
    });
  }, [activeCrisis, user]);

  // De-escalate crisis level
  const deescalateCrisis = useCallback(async (
    newLevel: CrisisLevel,
    reason: string
  ) => {
    if (!activeCrisis || !user) return;

    const auditEntry: CrisisAuditEntry = {
      timestamp: new Date().toISOString(),
      action: "DE-ESCALATED",
      performedBy: user.id,
      details: `De-escalated from ${activeCrisis.level} to ${newLevel}: ${reason}`,
    };

    setActiveCrisis({
      ...activeCrisis,
      level: newLevel,
      uiOverrides: DEFAULT_UI_OVERRIDES[newLevel],
      auditLog: [...activeCrisis.auditLog, auditEntry],
    });
  }, [activeCrisis, user]);

  // Extend crisis duration (with limits)
  const extendCrisis = useCallback(async (
    additionalHours: number,
    reason: string
  ) => {
    if (!activeCrisis || !user) return;

    const maxDuration = MAX_CRISIS_DURATION[activeCrisis.level];
    const currentExpiry = new Date(activeCrisis.expiresAt);
    const newExpiry = new Date(Math.min(
      currentExpiry.getTime() + additionalHours * 3600000,
      new Date(activeCrisis.activatedAt).getTime() + maxDuration * 2 * 3600000 // Max 2x original limit
    ));

    const auditEntry: CrisisAuditEntry = {
      timestamp: new Date().toISOString(),
      action: "EXTENDED",
      performedBy: user.id,
      details: `Extended to ${newExpiry.toISOString()}: ${reason}`,
    };

    setActiveCrisis({
      ...activeCrisis,
      expiresAt: newExpiry.toISOString(),
      auditLog: [...activeCrisis.auditLog, auditEntry],
    });
  }, [activeCrisis, user]);

  // Get time remaining
  const getTimeRemaining = useCallback((): number | null => {
    if (!activeCrisis || !activeCrisis.isActive) return null;
    const remaining = new Date(activeCrisis.expiresAt).getTime() - Date.now();
    return Math.max(0, remaining);
  }, [activeCrisis]);

  return {
    activeCrisis,
    isLoading,
    isCrisisActive: activeCrisis?.isActive ?? false,
    currentLevel: activeCrisis?.level ?? null,
    uiOverrides: activeCrisis?.uiOverrides ?? null,
    activateCrisis,
    deactivateCrisis,
    escalateCrisis,
    deescalateCrisis,
    extendCrisis,
    getTimeRemaining,
  };
}

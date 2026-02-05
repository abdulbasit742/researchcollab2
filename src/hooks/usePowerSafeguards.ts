import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  PowerSafeguard,
  OverrideLog,
  SurveillanceCheck,
} from "@/types/crisis-coordination";

// System 61: Ethical & Power Safeguards
// No permanent power expansion, surveillance creep, or emergency abuse

const DEFAULT_SAFEGUARDS: PowerSafeguard[] = [
  {
    id: "safeguard-time-limit",
    safeguardType: "time_limit",
    description: "All emergency powers auto-expire within 72 hours",
    isActive: true,
    parameters: { maxHours: 72 },
    violationCount: 0,
  },
  {
    id: "safeguard-scope-limit",
    safeguardType: "scope_limit",
    description: "Emergency powers cannot expand beyond initial scope",
    isActive: true,
    parameters: { allowExpansion: false },
    violationCount: 0,
  },
  {
    id: "safeguard-review",
    safeguardType: "review_required",
    description: "All overrides require post-hoc review within 24 hours",
    isActive: true,
    parameters: { reviewWindowHours: 24 },
    violationCount: 0,
  },
  {
    id: "safeguard-auto-sunset",
    safeguardType: "auto_sunset",
    description: "Unused powers automatically revoke after inactivity",
    isActive: true,
    parameters: { inactivityHours: 12 },
    violationCount: 0,
  },
  {
    id: "safeguard-escalation-cap",
    safeguardType: "escalation_cap",
    description: "Maximum three escalation levels allowed",
    isActive: true,
    parameters: { maxEscalations: 3 },
    violationCount: 0,
  },
];

export function usePowerSafeguards() {
  const { user } = useAuth();
  const [safeguards, setSafeguards] = useState<PowerSafeguard[]>(DEFAULT_SAFEGUARDS);
  const [overrideLogs, setOverrideLogs] = useState<OverrideLog[]>([]);
  const [surveillanceChecks, setSurveillanceChecks] = useState<SurveillanceCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check for expired overrides
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setOverrideLogs(prev => prev.map(log => {
        if (new Date(log.expiresAt) < now && log.autoSunset && !log.reviewOutcome) {
          return { ...log, reviewOutcome: "revoked" as const };
        }
        return log;
      }));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Grant an override
  const grantOverride = useCallback(async (
    overrideType: string,
    grantedTo: string,
    reason: string,
    scope: string,
    durationHours: number,
    autoSunset: boolean = true
  ): Promise<OverrideLog | null> => {
    if (!user) return null;
    setIsLoading(true);

    // Validate against safeguards
    const timeLimitSafeguard = safeguards.find(s => s.safeguardType === "time_limit");
    const maxHours = (timeLimitSafeguard?.parameters as { maxHours?: number })?.maxHours || 72;
    const actualDuration = Math.min(durationHours, maxHours);

    const override: OverrideLog = {
      id: `override-${Date.now()}`,
      overrideType,
      grantedTo,
      grantedBy: user.id,
      reason,
      scope,
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + actualDuration * 3600000).toISOString(),
      autoSunset,
      wasReviewed: false,
    };

    await new Promise(r => setTimeout(r, 200));
    setOverrideLogs(prev => [...prev, override]);
    setIsLoading(false);
    return override;
  }, [user, safeguards]);

  // Review an override
  const reviewOverride = useCallback(async (
    overrideId: string,
    outcome: OverrideLog["reviewOutcome"]
  ) => {
    if (!user) return;

    setOverrideLogs(prev => prev.map(log =>
      log.id === overrideId
        ? {
            ...log,
            wasReviewed: true,
            reviewedBy: user.id,
            reviewedAt: new Date().toISOString(),
            reviewOutcome: outcome,
          }
        : log
    ));
  }, [user]);

  // Revoke an override immediately
  const revokeOverride = useCallback((overrideId: string) => {
    setOverrideLogs(prev => prev.map(log =>
      log.id === overrideId
        ? { ...log, reviewOutcome: "revoked" as const }
        : log
    ));
  }, []);

  // Run a surveillance check
  const runSurveillanceCheck = useCallback(async (
    checkType: SurveillanceCheck["checkType"],
    entityChecked: string
  ): Promise<SurveillanceCheck> => {
    setIsLoading(true);

    // Mock compliance check logic
    const isCompliant = Math.random() > 0.1; // 90% compliant for demo

    const check: SurveillanceCheck = {
      id: `check-${Date.now()}`,
      checkType,
      entityChecked,
      checkedAt: new Date().toISOString(),
      result: isCompliant ? "compliant" : Math.random() > 0.5 ? "warning" : "violation",
      details: isCompliant 
        ? "All parameters within acceptable bounds"
        : "Potential overreach detected",
      remediation: isCompliant ? undefined : "Review and adjust scope",
    };

    await new Promise(r => setTimeout(r, 300));
    setSurveillanceChecks(prev => [...prev, check]);
    setIsLoading(false);
    return check;
  }, []);

  // Get pending reviews (overrides not yet reviewed)
  const getPendingReviews = useCallback((): OverrideLog[] => {
    return overrideLogs.filter(log => 
      !log.wasReviewed && 
      new Date(log.grantedAt).getTime() + 24 * 3600000 < Date.now()
    );
  }, [overrideLogs]);

  // Get active overrides
  const getActiveOverrides = useCallback((): OverrideLog[] => {
    const now = new Date();
    return overrideLogs.filter(log => 
      new Date(log.expiresAt) > now && 
      log.reviewOutcome !== "revoked"
    );
  }, [overrideLogs]);

  // Check safeguard compliance
  const checkSafeguardCompliance = useCallback((): {
    compliant: boolean;
    violations: string[];
  } => {
    const violations: string[] = [];
    const activeOverrides = getActiveOverrides();

    // Check time limits
    const timeLimitSafeguard = safeguards.find(s => s.safeguardType === "time_limit");
    if (timeLimitSafeguard?.isActive) {
      const maxHours = (timeLimitSafeguard.parameters as { maxHours?: number })?.maxHours || 72;
      const longRunning = activeOverrides.filter(o => {
        const duration = (new Date(o.expiresAt).getTime() - new Date(o.grantedAt).getTime()) / 3600000;
        return duration > maxHours;
      });
      if (longRunning.length > 0) {
        violations.push(`${longRunning.length} overrides exceed time limit`);
      }
    }

    // Check review requirements
    const reviewSafeguard = safeguards.find(s => s.safeguardType === "review_required");
    if (reviewSafeguard?.isActive) {
      const unreviewedCount = getPendingReviews().length;
      if (unreviewedCount > 0) {
        violations.push(`${unreviewedCount} overrides pending required review`);
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }, [safeguards, getActiveOverrides, getPendingReviews]);

  // Toggle a safeguard (requires elevated permissions in real system)
  const toggleSafeguard = useCallback((safeguardId: string, isActive: boolean) => {
    setSafeguards(prev => prev.map(s =>
      s.id === safeguardId ? { ...s, isActive } : s
    ));
  }, []);

  // Get safeguard health report
  const getSafeguardHealth = useCallback(() => {
    const activeSafeguards = safeguards.filter(s => s.isActive);
    const totalViolations = safeguards.reduce((sum, s) => sum + s.violationCount, 0);
    const compliance = checkSafeguardCompliance();

    return {
      activeSafeguards: activeSafeguards.length,
      totalSafeguards: safeguards.length,
      totalViolations,
      isCompliant: compliance.compliant,
      violations: compliance.violations,
      activeOverrides: getActiveOverrides().length,
      pendingReviews: getPendingReviews().length,
      surveillanceChecksRun: surveillanceChecks.length,
      recentViolations: surveillanceChecks.filter(c => c.result === "violation").length,
    };
  }, [safeguards, checkSafeguardCompliance, getActiveOverrides, getPendingReviews, surveillanceChecks]);

  return {
    safeguards,
    overrideLogs,
    surveillanceChecks,
    isLoading,
    grantOverride,
    reviewOverride,
    revokeOverride,
    runSurveillanceCheck,
    getPendingReviews,
    getActiveOverrides,
    checkSafeguardCompliance,
    toggleSafeguard,
    getSafeguardHealth,
  };
}

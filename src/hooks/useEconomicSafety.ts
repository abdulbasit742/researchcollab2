/**
 * System 35: Economic Safety & Abuse Dampening
 * Quiet, firm, fair prevention of economic exploitation
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  EconomicSafetyProfile,
  SafetyFlag,
  SafetyFlagType,
  ActiveCooldown,
  ActiveThrottle,
  VerificationLevel,
  EconomicAbusePattern,
  DetectionRule,
  AbuseResponse,
} from "@/types/economic-engine";

// Abuse detection patterns
const ABUSE_PATTERNS: EconomicAbusePattern[] = [
  {
    patternId: "fee-arbitrage",
    name: "Fee Arbitrage Attempt",
    description: "Attempting to exploit fee structure through rapid small transactions",
    detectionRules: [
      { metric: "small_transactions_1h", window: "1h", threshold: 10, operator: "gt" },
      { metric: "avg_transaction_value_1h", window: "1h", threshold: 1000, operator: "lt" },
    ],
    response: {
      immediate: ["Block further transactions for 24h", "Flag for review"],
      escalation: ["Permanent transaction limit", "Account review"],
    },
  },
  {
    patternId: "low-effort-farming",
    name: "Low Effort Value Farming",
    description: "Completing minimal work to farm value units or reputation",
    detectionRules: [
      { metric: "avg_project_duration", window: "30d", threshold: 1, operator: "lt" }, // Less than 1 day avg
      { metric: "client_satisfaction_avg", window: "30d", threshold: 3, operator: "lt" },
    ],
    response: {
      immediate: ["Reduce visibility in matching", "Slow value unit accumulation"],
      recovery: ["Complete 3 high-quality projects", "Maintain 4+ satisfaction for 60 days"],
    },
  },
  {
    patternId: "payment-manipulation",
    name: "Payment Manipulation",
    description: "Attempting to bypass escrow or manipulate payment flows",
    detectionRules: [
      { metric: "off_platform_payment_mentions", window: "7d", threshold: 3, operator: "gt" },
      { metric: "escrow_bypasses_attempted", window: "30d", threshold: 1, operator: "gt" },
    ],
    response: {
      immediate: ["Block deal creation", "Flag account for review"],
      escalation: ["Account suspension pending review"],
    },
  },
  {
    patternId: "trust-gaming",
    name: "Trust Score Gaming",
    description: "Artificial trust inflation through coordinated activity",
    detectionRules: [
      { metric: "mutual_endorsements_ratio", window: "30d", threshold: 0.5, operator: "gt" },
      { metric: "network_circularity_score", window: "30d", threshold: 0.7, operator: "gt" },
    ],
    response: {
      immediate: ["Reset affected trust components", "Reduce network weight"],
      recovery: ["Build trust through verified third-party interactions"],
    },
  },
  {
    patternId: "rapid-transactions",
    name: "Suspicious Rapid Transactions",
    description: "Unusual transaction velocity indicating potential manipulation",
    detectionRules: [
      { metric: "transactions_per_hour", window: "1h", threshold: 5, operator: "gt" },
      { metric: "unique_counterparties_1h", window: "1h", threshold: 5, operator: "gt" },
    ],
    response: {
      immediate: ["Transaction cooldown (2h)", "Velocity monitoring"],
    },
  },
  {
    patternId: "circular-value",
    name: "Circular Value Transfer",
    description: "Funds cycling between connected accounts",
    detectionRules: [
      { metric: "circular_flow_score", window: "7d", threshold: 0.3, operator: "gt" },
    ],
    response: {
      immediate: ["Flag transactions for audit", "Pause withdrawals"],
      escalation: ["Full account audit", "Potential fund freeze"],
    },
  },
];

// Verification level requirements
const VERIFICATION_THRESHOLDS = {
  none: 0,
  basic: 1000, // PKR transaction limit
  standard: 50000,
  enhanced: 200000,
  institutional: Infinity,
};

export function useEconomicSafety() {
  const { user } = useAuth();
  const [safetyProfile, setSafetyProfile] = useState<EconomicSafetyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user's safety profile
  useEffect(() => {
    if (!user) {
      setSafetyProfile(null);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);

      // Mock profile - in production, calculate from user activity
      const mockProfile: EconomicSafetyProfile = {
        userId: user.id,
        riskScore: 15, // Low risk
        riskLevel: "low",
        flags: [],
        cooldowns: [],
        throttles: [
          {
            resource: "daily_transactions",
            limit: 10,
            used: 2,
            resetsAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
            reason: "Standard daily limit",
          },
        ],
        verificationLevel: "standard",
        manualReviewRequired: false,
      };

      setSafetyProfile(mockProfile);
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  // Check if action is allowed
  const checkAction = useCallback((
    action: string,
    amount?: number
  ): { allowed: boolean; reason?: string; cooldownSeconds?: number } => {
    if (!safetyProfile) {
      return { allowed: false, reason: "Safety profile not loaded" };
    }

    // Check for manual review requirement
    if (safetyProfile.manualReviewRequired) {
      return { allowed: false, reason: "Account under review" };
    }

    // Check cooldowns
    const activeCooldown = safetyProfile.cooldowns.find((c) => c.action === action);
    if (activeCooldown && activeCooldown.remainingSeconds > 0) {
      return {
        allowed: false,
        reason: activeCooldown.reason,
        cooldownSeconds: activeCooldown.remainingSeconds,
      };
    }

    // Check throttles
    const throttle = safetyProfile.throttles.find((t) => t.resource.includes(action));
    if (throttle && throttle.used >= throttle.limit) {
      return {
        allowed: false,
        reason: `Daily limit reached (${throttle.limit})`,
      };
    }

    // Check verification level for amounts
    if (amount) {
      const requiredLevel = Object.entries(VERIFICATION_THRESHOLDS).find(
        ([_, threshold]) => amount <= threshold
      )?.[0] as VerificationLevel | undefined;

      const levelOrder: VerificationLevel[] = ["none", "basic", "standard", "enhanced", "institutional"];
      const currentLevelIndex = levelOrder.indexOf(safetyProfile.verificationLevel);
      const requiredLevelIndex = requiredLevel ? levelOrder.indexOf(requiredLevel) : 4;

      if (requiredLevelIndex > currentLevelIndex) {
        return {
          allowed: false,
          reason: `Amount exceeds your verification level. Upgrade to ${requiredLevel} for this transaction.`,
        };
      }
    }

    return { allowed: true };
  }, [safetyProfile]);

  // Report suspicious activity (internal use)
  const reportActivity = useCallback(async (
    flagType: SafetyFlagType,
    details: string,
    severity: SafetyFlag["severity"] = "warning"
  ): Promise<void> => {
    if (!safetyProfile) return;

    const newFlag: SafetyFlag = {
      type: flagType,
      severity,
      detectedAt: new Date(),
      resolved: false,
      details,
    };

    setSafetyProfile((prev) => {
      if (!prev) return null;

      // Calculate new risk score
      const severityScores = { warning: 10, moderate: 25, severe: 50 };
      const newRiskScore = Math.min(100, prev.riskScore + severityScores[severity]);
      
      let riskLevel: EconomicSafetyProfile["riskLevel"] = "low";
      if (newRiskScore >= 70) riskLevel = "high";
      else if (newRiskScore >= 50) riskLevel = "elevated";
      else if (newRiskScore >= 30) riskLevel = "moderate";

      return {
        ...prev,
        flags: [...prev.flags, newFlag],
        riskScore: newRiskScore,
        riskLevel,
        manualReviewRequired: newRiskScore >= 70,
      };
    });
  }, [safetyProfile]);

  // Apply cooldown
  const applyCooldown = useCallback(async (
    action: string,
    durationSeconds: number,
    reason: string
  ): Promise<void> => {
    if (!safetyProfile) return;

    const cooldown: ActiveCooldown = {
      action,
      reason,
      startedAt: new Date(),
      endsAt: new Date(Date.now() + durationSeconds * 1000),
      remainingSeconds: durationSeconds,
    };

    setSafetyProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        cooldowns: [...prev.cooldowns.filter((c) => c.action !== action), cooldown],
      };
    });
  }, [safetyProfile]);

  // Get transaction limits based on verification
  const getTransactionLimits = useCallback((): {
    single: number;
    daily: number;
    monthly: number;
  } => {
    if (!safetyProfile) {
      return { single: 0, daily: 0, monthly: 0 };
    }

    const limits: Record<VerificationLevel, { single: number; daily: number; monthly: number }> = {
      none: { single: 1000, daily: 5000, monthly: 20000 },
      basic: { single: 10000, daily: 50000, monthly: 200000 },
      standard: { single: 50000, daily: 200000, monthly: 1000000 },
      enhanced: { single: 200000, daily: 500000, monthly: 2000000 },
      institutional: { single: 1000000, daily: 5000000, monthly: 20000000 },
    };

    return limits[safetyProfile.verificationLevel];
  }, [safetyProfile]);

  // Get upgrade path for verification
  const getVerificationUpgradePath = useCallback((): {
    currentLevel: VerificationLevel;
    nextLevel: VerificationLevel | null;
    requirements: string[];
    benefits: string[];
  } => {
    if (!safetyProfile) {
      return {
        currentLevel: "none",
        nextLevel: "basic",
        requirements: ["Complete email verification"],
        benefits: ["PKR 10,000 single transaction limit"],
      };
    }

    const upgrades: Record<VerificationLevel, {
      next: VerificationLevel | null;
      requirements: string[];
      benefits: string[];
    }> = {
      none: {
        next: "basic",
        requirements: ["Verify email address", "Complete profile"],
        benefits: ["PKR 10,000 single transaction limit", "PKR 50,000 daily limit"],
      },
      basic: {
        next: "standard",
        requirements: ["Verify phone number", "Complete 3 transactions"],
        benefits: ["PKR 50,000 single transaction limit", "PKR 200,000 daily limit"],
      },
      standard: {
        next: "enhanced",
        requirements: ["Identity verification", "Bank account verification", "6+ months account age"],
        benefits: ["PKR 200,000 single transaction limit", "PKR 500,000 daily limit"],
      },
      enhanced: {
        next: "institutional",
        requirements: ["Institutional affiliation", "Enhanced due diligence"],
        benefits: ["PKR 1,000,000 single transaction limit", "Priority support"],
      },
      institutional: {
        next: null,
        requirements: [],
        benefits: ["Maximum limits", "Dedicated account manager"],
      },
    };

    const current = upgrades[safetyProfile.verificationLevel];
    return {
      currentLevel: safetyProfile.verificationLevel,
      nextLevel: current.next,
      requirements: current.requirements,
      benefits: current.benefits,
    };
  }, [safetyProfile]);

  // Check for abuse patterns (would run periodically in production)
  const detectAbusePatterns = useCallback((
    userMetrics: Record<string, number>
  ): EconomicAbusePattern[] => {
    const detectedPatterns: EconomicAbusePattern[] = [];

    ABUSE_PATTERNS.forEach((pattern) => {
      const allRulesTriggered = pattern.detectionRules.every((rule) => {
        const value = userMetrics[rule.metric];
        if (value === undefined) return false;

        switch (rule.operator) {
          case "gt": return value > rule.threshold;
          case "lt": return value < rule.threshold;
          case "anomaly": return Math.abs(value) > rule.threshold; // Simplified
          default: return false;
        }
      });

      if (allRulesTriggered) {
        detectedPatterns.push(pattern);
      }
    });

    return detectedPatterns;
  }, []);

  return {
    safetyProfile,
    loading,
    checkAction,
    reportActivity,
    applyCooldown,
    getTransactionLimits,
    getVerificationUpgradePath,
    detectAbusePatterns,
    abusePatterns: ABUSE_PATTERNS,
  };
}

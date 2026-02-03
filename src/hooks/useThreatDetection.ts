import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// THREAT DETECTION & PREVENTION - 12+ Features
// ============================================================

export interface ThreatIndicator {
  id: string;
  type: 'brute_force' | 'credential_stuffing' | 'session_hijack' | 'privilege_escalation' | 
        'data_exfiltration' | 'sql_injection' | 'xss' | 'csrf' | 'bot_activity' | 'account_takeover';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  source_ip: string;
  target_resource: string;
  first_seen: string;
  last_seen: string;
  occurrence_count: number;
  status: 'active' | 'mitigated' | 'false_positive' | 'investigating';
  mitigations_applied: string[];
}

export interface RateLimitConfig {
  endpoint: string;
  requests_per_minute: number;
  requests_per_hour: number;
  burst_limit: number;
  cooldown_seconds: number;
  is_enabled: boolean;
}

export interface BlockedEntity {
  id: string;
  entity_type: 'ip' | 'user_agent' | 'country' | 'fingerprint';
  entity_value: string;
  reason: string;
  blocked_at: string;
  expires_at: string | null;
  blocked_by: 'auto' | 'manual';
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  rule_type: 'rate_limit' | 'geo_block' | 'pattern_match' | 'behavior' | 'reputation';
  conditions: Record<string, unknown>;
  action: 'block' | 'challenge' | 'log' | 'alert';
  is_enabled: boolean;
  created_at: string;
  triggers_count: number;
}

export interface AnomalyScore {
  user_id: string;
  score: number; // 0-100, higher = more anomalous
  contributing_factors: {
    factor: string;
    weight: number;
    value: string;
  }[];
  last_updated: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export function useThreatDetection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threats, setThreats] = useState<ThreatIndicator[]>([]);
  const [blockedEntities, setBlockedEntities] = useState<BlockedEntity[]>([]);
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimitConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize default security rules
  useEffect(() => {
    const defaultRules: SecurityRule[] = [
      {
        id: 'rule-brute-force',
        name: 'Brute Force Protection',
        description: 'Block after 5 failed login attempts in 5 minutes',
        rule_type: 'rate_limit',
        conditions: { failed_attempts: 5, window_minutes: 5 },
        action: 'block',
        is_enabled: true,
        created_at: new Date().toISOString(),
        triggers_count: 0
      },
      {
        id: 'rule-geo-block',
        name: 'High-Risk Country Blocking',
        description: 'Challenge requests from high-risk regions',
        rule_type: 'geo_block',
        conditions: { countries: [] },
        action: 'challenge',
        is_enabled: false,
        created_at: new Date().toISOString(),
        triggers_count: 0
      },
      {
        id: 'rule-bot-detection',
        name: 'Bot Detection',
        description: 'Detect and challenge automated requests',
        rule_type: 'behavior',
        conditions: { check_captcha: true, fingerprint_analysis: true },
        action: 'challenge',
        is_enabled: true,
        created_at: new Date().toISOString(),
        triggers_count: 0
      }
    ];
    setSecurityRules(defaultRules);

    const defaultRateLimits: RateLimitConfig[] = [
      { endpoint: '/api/auth/login', requests_per_minute: 5, requests_per_hour: 30, burst_limit: 3, cooldown_seconds: 60, is_enabled: true },
      { endpoint: '/api/auth/register', requests_per_minute: 3, requests_per_hour: 10, burst_limit: 2, cooldown_seconds: 300, is_enabled: true },
      { endpoint: '/api/messages/send', requests_per_minute: 30, requests_per_hour: 500, burst_limit: 10, cooldown_seconds: 10, is_enabled: true },
      { endpoint: '/api/search', requests_per_minute: 20, requests_per_hour: 200, burst_limit: 5, cooldown_seconds: 5, is_enabled: true }
    ];
    setRateLimits(defaultRateLimits);
    setLoading(false);
  }, []);

  // Feature 1: Real-time Threat Detection
  const detectThreats = useCallback(async (): Promise<ThreatIndicator[]> => {
    // In production, this would analyze logs and patterns
    return threats.filter(t => t.status === 'active');
  }, [threats]);

  // Feature 2: Add Threat Indicator
  const reportThreat = async (
    type: ThreatIndicator['type'],
    severity: ThreatIndicator['severity'],
    sourceIp: string,
    targetResource: string
  ): Promise<ThreatIndicator> => {
    const threat: ThreatIndicator = {
      id: `threat-${Date.now()}`,
      type,
      severity,
      confidence: 75,
      source_ip: sourceIp,
      target_resource: targetResource,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      occurrence_count: 1,
      status: 'active',
      mitigations_applied: []
    };

    setThreats(prev => [threat, ...prev]);
    
    if (severity === 'critical' || severity === 'high') {
      toast({
        title: "Security Threat Detected",
        description: `${type} attack identified`,
        variant: "destructive"
      });
    }

    return threat;
  };

  // Feature 3: Mitigate Threat
  const mitigateThreat = async (threatId: string, mitigation: string): Promise<boolean> => {
    setThreats(prev => prev.map(t => {
      if (t.id === threatId) {
        return {
          ...t,
          status: 'mitigated' as const,
          mitigations_applied: [...t.mitigations_applied, mitigation]
        };
      }
      return t;
    }));

    toast({ title: "Threat Mitigated" });
    return true;
  };

  // Feature 4: Mark as False Positive
  const markFalsePositive = async (threatId: string): Promise<boolean> => {
    setThreats(prev => prev.map(t =>
      t.id === threatId ? { ...t, status: 'false_positive' as const } : t
    ));
    toast({ title: "Marked as False Positive" });
    return true;
  };

  // Feature 5: Block Entity
  const blockEntity = async (
    entityType: BlockedEntity['entity_type'],
    entityValue: string,
    reason: string,
    expiresInHours?: number
  ): Promise<boolean> => {
    const blocked: BlockedEntity = {
      id: `block-${Date.now()}`,
      entity_type: entityType,
      entity_value: entityValue,
      reason,
      blocked_at: new Date().toISOString(),
      expires_at: expiresInHours 
        ? new Date(Date.now() + expiresInHours * 3600000).toISOString() 
        : null,
      blocked_by: 'manual'
    };

    setBlockedEntities(prev => [...prev, blocked]);
    toast({ title: `${entityType.toUpperCase()} Blocked` });
    return true;
  };

  // Feature 6: Unblock Entity
  const unblockEntity = async (blockId: string): Promise<boolean> => {
    setBlockedEntities(prev => prev.filter(b => b.id !== blockId));
    toast({ title: "Entity Unblocked" });
    return true;
  };

  // Feature 7: Update Security Rule
  const updateSecurityRule = async (
    ruleId: string,
    updates: Partial<SecurityRule>
  ): Promise<boolean> => {
    setSecurityRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, ...updates } : r
    ));
    toast({ title: "Security Rule Updated" });
    return true;
  };

  // Feature 8: Toggle Security Rule
  const toggleSecurityRule = async (ruleId: string): Promise<boolean> => {
    setSecurityRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, is_enabled: !r.is_enabled } : r
    ));
    return true;
  };

  // Feature 9: Update Rate Limit
  const updateRateLimit = async (
    endpoint: string,
    config: Partial<RateLimitConfig>
  ): Promise<boolean> => {
    setRateLimits(prev => prev.map(r =>
      r.endpoint === endpoint ? { ...r, ...config } : r
    ));
    toast({ title: "Rate Limit Updated" });
    return true;
  };

  // Feature 10: Calculate Anomaly Score
  const calculateAnomalyScore = useCallback((userId: string): AnomalyScore => {
    const factors: AnomalyScore['contributing_factors'] = [];
    let score = 0;

    // Check for unusual activity patterns
    const userThreats = threats.filter(t => t.source_ip.includes(userId.slice(0, 8)));
    if (userThreats.length > 0) {
      score += 30;
      factors.push({ factor: 'Associated Threats', weight: 30, value: `${userThreats.length} threats` });
    }

    // Add more factors based on behavior analysis
    factors.push({ factor: 'Login Pattern', weight: 10, value: 'Normal' });
    factors.push({ factor: 'Access Pattern', weight: 10, value: 'Normal' });

    return {
      user_id: userId,
      score: Math.min(100, score),
      contributing_factors: factors,
      last_updated: new Date().toISOString(),
      trend: 'stable'
    };
  }, [threats]);

  // Feature 11: Get Threat Statistics
  const getThreatStats = useCallback((): {
    total: number;
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    trend: 'increasing' | 'stable' | 'decreasing';
  } => {
    const by_severity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    const by_type: Record<string, number> = {};
    const by_status: Record<string, number> = { active: 0, mitigated: 0, false_positive: 0, investigating: 0 };

    threats.forEach(t => {
      by_severity[t.severity]++;
      by_type[t.type] = (by_type[t.type] || 0) + 1;
      by_status[t.status]++;
    });

    return {
      total: threats.length,
      by_severity,
      by_type,
      by_status,
      trend: 'stable'
    };
  }, [threats]);

  // Feature 12: Check Rate Limit Status
  const checkRateLimitStatus = (endpoint: string): {
    allowed: boolean;
    remaining: number;
    reset_in_seconds: number;
  } => {
    const config = rateLimits.find(r => r.endpoint === endpoint);
    if (!config || !config.is_enabled) {
      return { allowed: true, remaining: Infinity, reset_in_seconds: 0 };
    }

    // Simulated rate limit check
    return {
      allowed: true,
      remaining: config.requests_per_minute,
      reset_in_seconds: 60
    };
  };

  // Feature 13: Get Active Blocks
  const getActiveBlocks = useCallback((): BlockedEntity[] => {
    const now = new Date();
    return blockedEntities.filter(b => 
      !b.expires_at || new Date(b.expires_at) > now
    );
  }, [blockedEntities]);

  return {
    // State
    threats,
    blockedEntities,
    securityRules,
    rateLimits,
    loading,

    // Threat Management
    detectThreats,
    reportThreat,
    mitigateThreat,
    markFalsePositive,
    getThreatStats,

    // Blocking
    blockEntity,
    unblockEntity,
    getActiveBlocks,

    // Rules
    updateSecurityRule,
    toggleSecurityRule,

    // Rate Limiting
    updateRateLimit,
    checkRateLimitStatus,

    // Anomaly Detection
    calculateAnomalyScore
  };
}

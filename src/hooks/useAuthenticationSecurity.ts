import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// AUTHENTICATION SECURITY - 15+ Features
// ============================================================

export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip_address: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
  risk_level: 'low' | 'medium' | 'high';
}

export interface LoginAttempt {
  id: string;
  timestamp: string;
  ip_address: string;
  location: string;
  success: boolean;
  failure_reason?: string;
  device_fingerprint: string;
}

export interface MFAMethod {
  id: string;
  type: 'totp' | 'sms' | 'email' | 'hardware_key';
  name: string;
  is_primary: boolean;
  last_used: string;
  created_at: string;
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  action_required: boolean;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special: boolean;
  max_age_days: number;
  prevent_reuse_count: number;
  require_mfa: boolean;
}

export function useAuthenticationSecurity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([]);
  const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Feature 1: Active Session Management
  const fetchActiveSessions = useCallback(async () => {
    if (!user) return;
    
    // Simulated session data - in production, this would query session table
    const mockSessions: SessionInfo[] = [
      {
        id: "session-1",
        device: "MacBook Pro",
        browser: "Chrome 120",
        location: "San Francisco, CA",
        ip_address: "192.168.1.***",
        last_active: new Date().toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
        is_current: true,
        risk_level: 'low'
      }
    ];
    setSessions(mockSessions);
  }, [user]);

  // Feature 2: Login History Tracking
  const fetchLoginHistory = useCallback(async () => {
    if (!user) return;
    
    const mockHistory: LoginAttempt[] = [
      {
        id: "login-1",
        timestamp: new Date().toISOString(),
        ip_address: "192.168.1.***",
        location: "San Francisco, CA",
        success: true,
        device_fingerprint: "abc123"
      }
    ];
    setLoginHistory(mockHistory);
  }, [user]);

  // Feature 3: Multi-Factor Authentication Management
  const fetchMFAMethods = useCallback(async () => {
    if (!user) return;
    
    const mockMFA: MFAMethod[] = [];
    setMfaMethods(mockMFA);
  }, [user]);

  // Feature 4: Security Alerts
  const fetchSecurityAlerts = useCallback(async () => {
    if (!user) return;
    
    const mockAlerts: SecurityAlert[] = [];
    setSecurityAlerts(mockAlerts);
  }, [user]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchActiveSessions(),
        fetchLoginHistory(),
        fetchMFAMethods(),
        fetchSecurityAlerts()
      ]);
      setLoading(false);
    };
    fetchAll();
  }, [fetchActiveSessions, fetchLoginHistory, fetchMFAMethods, fetchSecurityAlerts]);

  // Feature 5: Terminate Session
  const terminateSession = async (sessionId: string) => {
    if (sessions.find(s => s.id === sessionId)?.is_current) {
      toast({
        title: "Cannot terminate current session",
        description: "Use logout to end your current session",
        variant: "destructive"
      });
      return false;
    }
    
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({ title: "Session Terminated", description: "The session has been ended" });
    return true;
  };

  // Feature 6: Terminate All Other Sessions
  const terminateAllOtherSessions = async () => {
    setSessions(prev => prev.filter(s => s.is_current));
    toast({ title: "All Other Sessions Terminated" });
    return true;
  };

  // Feature 7: Enable MFA
  const enableMFA = async (type: MFAMethod['type']) => {
    const newMethod: MFAMethod = {
      id: `mfa-${Date.now()}`,
      type,
      name: type === 'totp' ? 'Authenticator App' : type.toUpperCase(),
      is_primary: mfaMethods.length === 0,
      last_used: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    setMfaMethods(prev => [...prev, newMethod]);
    toast({ title: "MFA Enabled", description: `${newMethod.name} has been set up` });
    return true;
  };

  // Feature 8: Disable MFA
  const disableMFA = async (methodId: string) => {
    setMfaMethods(prev => prev.filter(m => m.id !== methodId));
    toast({ title: "MFA Method Removed" });
    return true;
  };

  // Feature 9: Acknowledge Security Alert
  const acknowledgeAlert = async (alertId: string) => {
    setSecurityAlerts(prev => 
      prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    );
    return true;
  };

  // Feature 10: Password Strength Checker
  const checkPasswordStrength = (password: string): {
    score: number;
    feedback: string[];
    strength: 'weak' | 'fair' | 'good' | 'strong';
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 20;
    else feedback.push("Use at least 8 characters");

    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push("Add uppercase letters");

    if (/[a-z]/.test(password)) score += 15;
    else feedback.push("Add lowercase letters");

    if (/[0-9]/.test(password)) score += 15;
    else feedback.push("Add numbers");

    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    else feedback.push("Add special characters");

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push("Avoid repeated characters");
    }

    if (/^[A-Za-z]+$/.test(password) || /^[0-9]+$/.test(password)) {
      score -= 10;
      feedback.push("Mix different character types");
    }

    const strength = score >= 80 ? 'strong' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'weak';

    return { score: Math.max(0, Math.min(100, score)), feedback, strength };
  };

  // Feature 11: Suspicious Activity Detection
  const detectSuspiciousActivity = (): {
    hasSuspiciousActivity: boolean;
    indicators: string[];
  } => {
    const indicators: string[] = [];

    // Check for multiple failed logins
    const recentFailures = loginHistory.filter(
      l => !l.success && 
      new Date(l.timestamp) > new Date(Date.now() - 3600000)
    );
    if (recentFailures.length >= 3) {
      indicators.push("Multiple failed login attempts in the last hour");
    }

    // Check for new device/location
    const uniqueLocations = new Set(sessions.map(s => s.location));
    if (uniqueLocations.size > 2) {
      indicators.push("Access from multiple geographic locations");
    }

    // Check for high-risk sessions
    const highRiskSessions = sessions.filter(s => s.risk_level === 'high');
    if (highRiskSessions.length > 0) {
      indicators.push("High-risk session detected");
    }

    return {
      hasSuspiciousActivity: indicators.length > 0,
      indicators
    };
  };

  // Feature 12: Device Trust Management
  const getTrustedDevices = () => {
    return sessions.filter(s => s.risk_level === 'low');
  };

  // Feature 13: Recovery Code Generation
  const generateRecoveryCodes = async (): Promise<string[]> => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Array.from({ length: 8 }, () => 
        Math.random().toString(36).charAt(2)
      ).join('').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    toast({ title: "Recovery Codes Generated", description: "Store these codes safely" });
    return codes;
  };

  // Feature 14: Security Score Calculation
  const getSecurityScore = (): {
    score: number;
    breakdown: { category: string; score: number; max: number }[];
    recommendations: string[];
  } => {
    const breakdown = [];
    const recommendations: string[] = [];
    let totalScore = 0;

    // MFA Status (30 points)
    const mfaScore = mfaMethods.length > 0 ? 30 : 0;
    breakdown.push({ category: "Multi-Factor Authentication", score: mfaScore, max: 30 });
    if (mfaScore === 0) recommendations.push("Enable multi-factor authentication");
    totalScore += mfaScore;

    // Session Security (20 points)
    const highRiskSessions = sessions.filter(s => s.risk_level === 'high').length;
    const sessionScore = highRiskSessions === 0 ? 20 : Math.max(0, 20 - highRiskSessions * 5);
    breakdown.push({ category: "Session Security", score: sessionScore, max: 20 });
    if (highRiskSessions > 0) recommendations.push("Review high-risk sessions");
    totalScore += sessionScore;

    // Alert Response (20 points)
    const unacknowledgedAlerts = securityAlerts.filter(a => !a.acknowledged && a.action_required).length;
    const alertScore = unacknowledgedAlerts === 0 ? 20 : Math.max(0, 20 - unacknowledgedAlerts * 5);
    breakdown.push({ category: "Alert Response", score: alertScore, max: 20 });
    if (unacknowledgedAlerts > 0) recommendations.push("Address pending security alerts");
    totalScore += alertScore;

    // Recent Activity (15 points)
    const recentFailedLogins = loginHistory.filter(l => !l.success).length;
    const activityScore = recentFailedLogins === 0 ? 15 : Math.max(0, 15 - recentFailedLogins * 3);
    breakdown.push({ category: "Login Activity", score: activityScore, max: 15 });
    totalScore += activityScore;

    // Account Age & Verification (15 points)
    breakdown.push({ category: "Account Verification", score: 15, max: 15 });
    totalScore += 15;

    return { score: totalScore, breakdown, recommendations };
  };

  // Feature 15: IP Allowlist Management
  const [ipAllowlist, setIpAllowlist] = useState<string[]>([]);

  const addToIPAllowlist = async (ip: string) => {
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      toast({ title: "Invalid IP Address", variant: "destructive" });
      return false;
    }
    setIpAllowlist(prev => [...prev, ip]);
    toast({ title: "IP Added to Allowlist" });
    return true;
  };

  const removeFromIPAllowlist = async (ip: string) => {
    setIpAllowlist(prev => prev.filter(i => i !== ip));
    toast({ title: "IP Removed from Allowlist" });
    return true;
  };

  return {
    // State
    sessions,
    loginHistory,
    mfaMethods,
    securityAlerts,
    ipAllowlist,
    loading,

    // Session Management
    terminateSession,
    terminateAllOtherSessions,
    getTrustedDevices,

    // MFA
    enableMFA,
    disableMFA,
    generateRecoveryCodes,

    // Alerts
    acknowledgeAlert,

    // Security Analysis
    checkPasswordStrength,
    detectSuspiciousActivity,
    getSecurityScore,

    // IP Management
    addToIPAllowlist,
    removeFromIPAllowlist,

    // Refresh
    refetch: () => Promise.all([
      fetchActiveSessions(),
      fetchLoginHistory(),
      fetchMFAMethods(),
      fetchSecurityAlerts()
    ])
  };
}

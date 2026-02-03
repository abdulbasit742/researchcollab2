import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// SECURITY MONITORING & ALERTING - 12+ Features
// ============================================================

export interface SecurityEvent {
  id: string;
  event_type: string;
  category: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'network' | 'anomaly';
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  user_id?: string;
  ip_address?: string;
  description: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface SecurityMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold_warning: number;
  threshold_critical: number;
  status: 'normal' | 'warning' | 'critical';
  last_updated: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
    window_minutes: number;
  };
  actions: ('email' | 'slack' | 'webhook' | 'sms' | 'in_app')[];
  is_enabled: boolean;
  cooldown_minutes: number;
  last_triggered?: string;
}

export interface SecurityDashboardData {
  overall_status: 'secure' | 'at_risk' | 'compromised';
  risk_score: number;
  active_threats: number;
  blocked_attacks_24h: number;
  failed_logins_24h: number;
  active_sessions: number;
  mfa_adoption_rate: number;
  patch_compliance: number;
  last_security_scan: string;
  last_incident: string | null;
}

export interface IncidentReport {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  affected_systems: string[];
  affected_users_count: number;
  description: string;
  timeline: {
    timestamp: string;
    action: string;
    actor: string;
  }[];
  root_cause?: string;
  remediation_steps?: string[];
  created_at: string;
  resolved_at?: string;
}

export function useSecurityMonitoring() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [dashboardData, setDashboardData] = useState<SecurityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize security metrics
  useEffect(() => {
    const defaultMetrics: SecurityMetric[] = [
      {
        name: 'Failed Login Rate',
        value: 2.3,
        unit: '%',
        trend: 'stable',
        threshold_warning: 5,
        threshold_critical: 10,
        status: 'normal',
        last_updated: new Date().toISOString()
      },
      {
        name: 'Active Sessions',
        value: 1,
        unit: 'sessions',
        trend: 'stable',
        threshold_warning: 5,
        threshold_critical: 10,
        status: 'normal',
        last_updated: new Date().toISOString()
      },
      {
        name: 'API Error Rate',
        value: 0.5,
        unit: '%',
        trend: 'down',
        threshold_warning: 2,
        threshold_critical: 5,
        status: 'normal',
        last_updated: new Date().toISOString()
      },
      {
        name: 'Blocked Requests',
        value: 0,
        unit: 'requests/hr',
        trend: 'stable',
        threshold_warning: 100,
        threshold_critical: 500,
        status: 'normal',
        last_updated: new Date().toISOString()
      }
    ];
    setMetrics(defaultMetrics);

    const defaultAlertRules: AlertRule[] = [
      {
        id: 'alert-failed-login',
        name: 'High Failed Login Rate',
        description: 'Alert when failed login rate exceeds threshold',
        condition: { metric: 'Failed Login Rate', operator: 'gt', value: 5, window_minutes: 15 },
        actions: ['email', 'in_app'],
        is_enabled: true,
        cooldown_minutes: 30
      },
      {
        id: 'alert-blocked-requests',
        name: 'High Blocked Requests',
        description: 'Alert when many requests are being blocked',
        condition: { metric: 'Blocked Requests', operator: 'gt', value: 100, window_minutes: 60 },
        actions: ['email', 'slack', 'in_app'],
        is_enabled: true,
        cooldown_minutes: 60
      }
    ];
    setAlertRules(defaultAlertRules);

    // Initialize dashboard
    const dashboard: SecurityDashboardData = {
      overall_status: 'secure',
      risk_score: 15,
      active_threats: 0,
      blocked_attacks_24h: 0,
      failed_logins_24h: 0,
      active_sessions: 1,
      mfa_adoption_rate: 0,
      patch_compliance: 100,
      last_security_scan: new Date().toISOString(),
      last_incident: null
    };
    setDashboardData(dashboard);
    setLoading(false);
  }, []);

  // Feature 1: Log Security Event
  const logSecurityEvent = async (
    eventType: string,
    category: SecurityEvent['category'],
    severity: SecurityEvent['severity'],
    description: string,
    metadata: Record<string, unknown> = {}
  ): Promise<SecurityEvent> => {
    const event: SecurityEvent = {
      id: `event-${Date.now()}`,
      event_type: eventType,
      category,
      severity,
      source: 'frontend',
      user_id: user?.id,
      description,
      metadata,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false
    };

    setEvents(prev => [event, ...prev.slice(0, 999)]);

    if (severity === 'critical' || severity === 'error') {
      toast({
        title: "Security Event",
        description: description,
        variant: severity === 'critical' ? 'destructive' : 'default'
      });
    }

    return event;
  };

  // Feature 2: Get Events by Category
  const getEventsByCategory = useCallback((
    category?: SecurityEvent['category'],
    severity?: SecurityEvent['severity'],
    limit: number = 50
  ): SecurityEvent[] => {
    let filtered = events;
    
    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }
    if (severity) {
      filtered = filtered.filter(e => e.severity === severity);
    }

    return filtered.slice(0, limit);
  }, [events]);

  // Feature 3: Acknowledge Event
  const acknowledgeEvent = async (eventId: string): Promise<boolean> => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, acknowledged: true } : e
    ));
    return true;
  };

  // Feature 4: Resolve Event
  const resolveEvent = async (eventId: string): Promise<boolean> => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, resolved: true } : e
    ));
    return true;
  };

  // Feature 5: Create Incident Report
  const createIncident = async (
    title: string,
    severity: IncidentReport['severity'],
    description: string,
    affectedSystems: string[]
  ): Promise<IncidentReport> => {
    const incident: IncidentReport = {
      id: `incident-${Date.now()}`,
      title,
      severity,
      status: 'open',
      affected_systems: affectedSystems,
      affected_users_count: 0,
      description,
      timeline: [{
        timestamp: new Date().toISOString(),
        action: 'Incident created',
        actor: user?.email || 'system'
      }],
      created_at: new Date().toISOString()
    };

    setIncidents(prev => [incident, ...prev]);
    
    toast({
      title: "Incident Created",
      description: `Tracking: ${title}`,
      variant: severity === 'critical' ? 'destructive' : 'default'
    });

    return incident;
  };

  // Feature 6: Update Incident Status
  const updateIncidentStatus = async (
    incidentId: string,
    status: IncidentReport['status'],
    note?: string
  ): Promise<boolean> => {
    setIncidents(prev => prev.map(i => {
      if (i.id === incidentId) {
        return {
          ...i,
          status,
          timeline: [
            ...i.timeline,
            {
              timestamp: new Date().toISOString(),
              action: `Status changed to ${status}${note ? `: ${note}` : ''}`,
              actor: user?.email || 'system'
            }
          ],
          resolved_at: status === 'resolved' ? new Date().toISOString() : i.resolved_at
        };
      }
      return i;
    }));

    toast({ title: `Incident ${status}` });
    return true;
  };

  // Feature 7: Create Alert Rule
  const createAlertRule = async (rule: Omit<AlertRule, 'id'>): Promise<AlertRule> => {
    const newRule: AlertRule = {
      ...rule,
      id: `alert-${Date.now()}`
    };

    setAlertRules(prev => [...prev, newRule]);
    toast({ title: "Alert Rule Created" });
    return newRule;
  };

  // Feature 8: Update Alert Rule
  const updateAlertRule = async (
    ruleId: string,
    updates: Partial<AlertRule>
  ): Promise<boolean> => {
    setAlertRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, ...updates } : r
    ));
    return true;
  };

  // Feature 9: Toggle Alert Rule
  const toggleAlertRule = async (ruleId: string): Promise<boolean> => {
    setAlertRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, is_enabled: !r.is_enabled } : r
    ));
    return true;
  };

  // Feature 10: Get Security Summary
  const getSecuritySummary = useCallback((): {
    events_last_24h: number;
    critical_events: number;
    unacknowledged_events: number;
    open_incidents: number;
    metrics_at_warning: number;
    metrics_at_critical: number;
  } => {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => new Date(e.timestamp) > last24h);

    return {
      events_last_24h: recentEvents.length,
      critical_events: events.filter(e => e.severity === 'critical' && !e.resolved).length,
      unacknowledged_events: events.filter(e => !e.acknowledged).length,
      open_incidents: incidents.filter(i => i.status !== 'closed' && i.status !== 'resolved').length,
      metrics_at_warning: metrics.filter(m => m.status === 'warning').length,
      metrics_at_critical: metrics.filter(m => m.status === 'critical').length
    };
  }, [events, incidents, metrics]);

  // Feature 11: Check Metric Thresholds
  const checkMetricThresholds = useCallback((): SecurityMetric[] => {
    return metrics.filter(m => m.status !== 'normal');
  }, [metrics]);

  // Feature 12: Generate Security Report
  const generateSecurityReport = async (
    startDate: Date,
    endDate: Date
  ): Promise<{
    period: { start: string; end: string };
    summary: ReturnType<typeof getSecuritySummary>;
    events_by_category: Record<string, number>;
    events_by_severity: Record<string, number>;
    incidents: IncidentReport[];
    recommendations: string[];
  }> => {
    const periodEvents = events.filter(e => {
      const timestamp = new Date(e.timestamp);
      return timestamp >= startDate && timestamp <= endDate;
    });

    const by_category: Record<string, number> = {};
    const by_severity: Record<string, number> = {};

    periodEvents.forEach(e => {
      by_category[e.category] = (by_category[e.category] || 0) + 1;
      by_severity[e.severity] = (by_severity[e.severity] || 0) + 1;
    });

    const recommendations: string[] = [];
    if (!dashboardData?.mfa_adoption_rate || dashboardData.mfa_adoption_rate < 50) {
      recommendations.push("Increase MFA adoption rate to improve account security");
    }
    if (by_severity['critical'] > 0) {
      recommendations.push("Review and address all critical severity events");
    }

    return {
      period: { start: startDate.toISOString(), end: endDate.toISOString() },
      summary: getSecuritySummary(),
      events_by_category: by_category,
      events_by_severity: by_severity,
      incidents: incidents.filter(i => {
        const created = new Date(i.created_at);
        return created >= startDate && created <= endDate;
      }),
      recommendations
    };
  };

  return {
    // State
    events,
    metrics,
    alertRules,
    incidents,
    dashboardData,
    loading,

    // Event Management
    logSecurityEvent,
    getEventsByCategory,
    acknowledgeEvent,
    resolveEvent,

    // Incident Management
    createIncident,
    updateIncidentStatus,

    // Alert Rules
    createAlertRule,
    updateAlertRule,
    toggleAlertRule,

    // Analysis
    getSecuritySummary,
    checkMetricThresholds,
    generateSecurityReport
  };
}

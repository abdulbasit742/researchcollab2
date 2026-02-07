import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ============================================================
// Post-Launch Operations Center Hook
// Manages incidents, feedback triage, change freeze, daily ops,
// founder discipline, and the 5 core metrics
// ============================================================

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "p0" | "p1" | "p2" | "p3";
  status: "open" | "investigating" | "mitigating" | "resolved" | "postmortem";
  affected_system: string;
  reported_by: string | null;
  assigned_to: string | null;
  detected_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  root_cause: string | null;
  impact_summary: string | null;
  users_affected: number;
  money_at_risk: number;
  systems_frozen: string[];
  communication_sent: boolean;
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  source: string;
  raw_feedback: string;
  classification: "signal" | "noise" | "unclassified";
  category: string | null;
  frequency: number;
  is_blocking: boolean;
  affects_outcomes: boolean;
  user_count: number;
  priority: string;
  resolution_status: string;
  resolution_notes: string | null;
  triaged_by: string | null;
  triaged_at: string | null;
  created_at: string;
}

export interface ChangeFreezePolicy {
  id: string;
  policy_name: string;
  is_active: boolean;
  freeze_type: string;
  start_date: string;
  end_date: string;
  exceptions: string[];
  allowed_changes: string[];
  reason: string;
  created_at: string;
}

export interface OperatingLogEntry {
  id: string;
  log_date: string;
  log_type: string;
  summary: string;
  findings: Record<string, unknown>;
  action_items: string[];
  do_not_touch: string[];
  logged_by: string | null;
  created_at: string;
}

export interface FounderIdea {
  id: string;
  idea_title: string;
  idea_description: string | null;
  idea_type: string;
  submitted_at: string;
  cooling_expires_at: string;
  status: "cooling" | "approved" | "rejected" | "expired";
  supporting_data: string | null;
  has_usage_proof: boolean;
  has_incident_report: boolean;
  requires_schema_change: boolean;
  decision_reason: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface OpsMetrics {
  id: string;
  snapshot_date: string;
  completed_outcomes: number;
  deals_closed_cleanly: number;
  trust_variance: number;
  money_flow_incidents: number;
  organic_return_rate: number;
  dau: number;
  time_spent_avg_minutes: number;
  notes: string | null;
}

export function useOperationsCenter() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [freezePolicies, setFreezePolicies] = useState<ChangeFreezePolicy[]>([]);
  const [operatingLogs, setOperatingLogs] = useState<OperatingLogEntry[]>([]);
  const [founderIdeas, setFounderIdeas] = useState<FounderIdea[]>([]);
  const [metrics, setMetrics] = useState<OpsMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [incRes, fbRes, fpRes, olRes, fiRes, mRes] = await Promise.all([
        supabase.from("incidents" as any).select("*").order("detected_at", { ascending: false }).limit(50),
        supabase.from("feedback_triage" as any).select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("change_freeze_policy" as any).select("*").order("created_at", { ascending: false }),
        supabase.from("operating_log" as any).select("*").order("created_at", { ascending: false }).limit(30),
        supabase.from("founder_discipline" as any).select("*").order("submitted_at", { ascending: false }).limit(50),
        supabase.from("ops_metrics_snapshots" as any).select("*").order("snapshot_date", { ascending: false }).limit(90),
      ]);

      if (!incRes.error) setIncidents((incRes.data as unknown as Incident[]) || []);
      if (!fbRes.error) setFeedback((fbRes.data as unknown as FeedbackItem[]) || []);
      if (!fpRes.error) setFreezePolicies((fpRes.data as unknown as ChangeFreezePolicy[]) || []);
      if (!olRes.error) setOperatingLogs((olRes.data as unknown as OperatingLogEntry[]) || []);
      if (!fiRes.error) setFounderIdeas((fiRes.data as unknown as FounderIdea[]) || []);
      if (!mRes.error) setMetrics((mRes.data as unknown as OpsMetrics[]) || []);
    } catch (err) {
      console.error("Operations center fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ---- Incident Management ----
  const createIncident = useCallback(async (data: {
    title: string;
    description: string;
    severity: string;
    affected_system: string;
    users_affected?: number;
    money_at_risk?: number;
  }) => {
    if (!user) return null;
    const { data: result, error } = await supabase
      .from("incidents" as any)
      .insert({ ...data, reported_by: user.id })
      .select().single();
    if (error) { toast.error("Failed to create incident"); return null; }
    toast.success("Incident created");
    fetchAll();
    return result;
  }, [user, fetchAll]);

  const updateIncidentStatus = useCallback(async (id: string, status: string, extras?: Record<string, unknown>) => {
    const update: Record<string, unknown> = { status, ...extras };
    if (status === "resolved") update.resolved_at = new Date().toISOString();
    if (status === "investigating") update.acknowledged_at = new Date().toISOString();
    
    const { error } = await supabase.from("incidents" as any).update(update).eq("id", id);
    if (error) { toast.error("Failed to update incident"); return; }
    toast.success(`Incident ${status}`);
    fetchAll();
  }, [fetchAll]);

  // ---- Feedback Triage ----
  const triageFeedback = useCallback(async (id: string, classification: string, priority: string, category?: string) => {
    if (!user) return;
    const { error } = await supabase.from("feedback_triage" as any).update({
      classification, priority, category,
      triaged_by: user.id,
      triaged_at: new Date().toISOString(),
      resolution_status: "triaged",
    }).eq("id", id);
    if (error) { toast.error("Failed to triage feedback"); return; }
    toast.success("Feedback triaged");
    fetchAll();
  }, [user, fetchAll]);

  // ---- Change Freeze ----
  const createFreezePolicy = useCallback(async (data: {
    policy_name: string;
    freeze_type: string;
    end_date: string;
    reason: string;
    allowed_changes?: string[];
  }) => {
    if (!user) return null;
    const { error } = await supabase.from("change_freeze_policy" as any).insert({
      ...data, enforced_by: user.id,
    });
    if (error) { toast.error("Failed to create freeze policy"); return null; }
    toast.success("Change freeze activated");
    fetchAll();
  }, [user, fetchAll]);

  // ---- Operating Log ----
  const addLogEntry = useCallback(async (data: {
    log_type: string;
    summary: string;
    findings?: Record<string, unknown>;
    action_items?: string[];
    do_not_touch?: string[];
  }) => {
    if (!user) return null;
    const { error } = await supabase.from("operating_log" as any).insert({
      ...data, logged_by: user.id,
    });
    if (error) { toast.error("Failed to add log entry"); return null; }
    toast.success("Operating log entry added");
    fetchAll();
  }, [user, fetchAll]);

  // ---- Founder Discipline ----
  const submitIdea = useCallback(async (data: {
    idea_title: string;
    idea_description?: string;
    idea_type: string;
    requires_schema_change?: boolean;
  }) => {
    if (!user) return null;
    const { error } = await supabase.from("founder_discipline" as any).insert({
      ...data, submitted_by: user.id,
    });
    if (error) { toast.error("Failed to submit idea"); return null; }
    toast.success("Idea submitted — 30-day cooling period started");
    fetchAll();
  }, [user, fetchAll]);

  const decideIdea = useCallback(async (id: string, status: "approved" | "rejected", reason: string) => {
    if (!user) return;
    const { error } = await supabase.from("founder_discipline" as any).update({
      status, decision_reason: reason,
      decided_at: new Date().toISOString(),
      decided_by: user.id,
    }).eq("id", id);
    if (error) { toast.error("Failed to update idea"); return; }
    toast.success(`Idea ${status}`);
    fetchAll();
  }, [user, fetchAll]);

  // ---- Derived State ----
  const activeFreeze = freezePolicies.find(p => p.is_active && new Date(p.end_date) > new Date());
  const openIncidents = incidents.filter(i => i.status !== "resolved" && i.status !== "postmortem");
  const p0Incidents = openIncidents.filter(i => i.severity === "p0");
  const signalFeedback = feedback.filter(f => f.classification === "signal");
  const untriaged = feedback.filter(f => f.classification === "unclassified");
  const coolingIdeas = founderIdeas.filter(i => i.status === "cooling");
  const latestMetrics = metrics[0] || null;

  return {
    // Data
    incidents, feedback, freezePolicies, operatingLogs, founderIdeas, metrics,
    // Derived
    activeFreeze, openIncidents, p0Incidents, signalFeedback, untriaged, coolingIdeas, latestMetrics,
    // Actions
    createIncident, updateIncidentStatus, triageFeedback,
    createFreezePolicy, addLogEntry, submitIdea, decideIdea,
    // State
    loading, refetch: fetchAll,
  };
}

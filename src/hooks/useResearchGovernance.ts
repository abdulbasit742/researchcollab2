import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GovernanceEvent {
  id: string;
  event_type: string;
  related_entity_type: string;
  related_entity_id: string;
  severity_level: string;
  detection_source: string;
  description: string;
  evidence: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface GovernanceAction {
  id: string;
  governance_event_id: string;
  action_type: string;
  executed_by: string;
  justification: string;
  created_at: string;
}

export interface GovernanceAppeal {
  id: string;
  governance_event_id: string;
  appellant_id: string;
  appeal_reason: string;
  status: string;
  resolution_notes: string | null;
  created_at: string;
}

export function useResearchGovernance() {
  const { user } = useAuth();
  const [events, setEvents] = useState<GovernanceEvent[]>([]);
  const [actions, setActions] = useState<GovernanceAction[]>([]);
  const [appeals, setAppeals] = useState<GovernanceAppeal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async (statusFilter?: string) => {
    setLoading(true);
    try {
      let q = (supabase as any).from("governance_events").select("*").order("created_at", { ascending: false }).limit(100);
      if (statusFilter) q = q.eq("status", statusFilter);
      const { data } = await q;
      setEvents(data || []);
    } finally { setLoading(false); }
  }, []);

  const fetchActions = useCallback(async (eventId?: string) => {
    let q = (supabase as any).from("governance_actions").select("*").order("created_at", { ascending: false });
    if (eventId) q = q.eq("governance_event_id", eventId);
    const { data } = await q;
    setActions(data || []);
  }, []);

  const fetchAppeals = useCallback(async () => {
    const { data } = await (supabase as any).from("governance_appeals").select("*").order("created_at", { ascending: false });
    setAppeals(data || []);
  }, []);

  const runScan = useCallback(async (entityType?: string, entityId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "governance_scan", entity_type: entityType, entity_id: entityId },
      });
      if (error) throw error;
      toast.success(`Scan complete: ${data.events_created} events found`);
      await fetchEvents();
      return data;
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally { setLoading(false); }
  }, [fetchEvents]);

  const submitAppeal = useCallback(async (eventId: string, reason: string) => {
    const { data, error } = await supabase.functions.invoke("research-intelligence", {
      body: { action: "submit_appeal", governance_event_id: eventId, appeal_reason: reason },
    });
    if (error) { toast.error("Appeal failed"); return; }
    toast.success("Appeal submitted");
    await fetchEvents();
    await fetchAppeals();
  }, [fetchEvents, fetchAppeals]);

  const resolveAppeal = useCallback(async (appealId: string, decision: string, notes: string) => {
    const { error } = await supabase.functions.invoke("research-intelligence", {
      body: { action: "resolve_appeal", appeal_id: appealId, decision, resolution_notes: notes },
    });
    if (error) { toast.error("Resolution failed"); return; }
    toast.success("Appeal resolved");
    await fetchAppeals();
    await fetchEvents();
  }, [fetchAppeals, fetchEvents]);

  const resolveEvent = useCallback(async (eventId: string) => {
    await (supabase as any).from("governance_events").update({
      status: "resolved", resolved_at: new Date().toISOString(), resolved_by: user?.id,
    }).eq("id", eventId);
    toast.success("Event resolved");
    await fetchEvents();
  }, [user, fetchEvents]);

  const stats = {
    totalEvents: events.length,
    openEvents: events.filter(e => e.status === "open").length,
    criticalEvents: events.filter(e => e.severity_level === "critical").length,
    highEvents: events.filter(e => e.severity_level === "high").length,
    pendingAppeals: appeals.filter(a => a.status === "pending").length,
    resolvedEvents: events.filter(e => e.status === "resolved").length,
  };

  return {
    events, actions, appeals, loading, stats,
    fetchEvents, fetchActions, fetchAppeals,
    runScan, submitAppeal, resolveAppeal, resolveEvent,
  };
}

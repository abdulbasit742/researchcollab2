import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types
interface AIContextSnapshot {
  id: string;
  user_id: string;
  context_type: "research_timeline" | "publication" | "dataset" | "funding_application" | "peer_review" | "career";
  context_id: string;
  context_summary: string;
  context_tokens: number | null;
  is_active: boolean;
  last_updated_at: string;
}

interface AIAssistantSession {
  id: string;
  user_id: string;
  scope_type: "research_timeline" | "publication" | "dataset" | "funding_application" | "peer_review" | "general" | null;
  scope_id: string | null;
  intent: "brainstorm" | "critique" | "summarize" | "plan" | "check" | "outline" | "review_response" | "methodology";
  session_title: string | null;
  is_active: boolean;
  created_at: string;
  ended_at: string | null;
}

interface AIAssistantOutput {
  id: string;
  session_id: string;
  prompt_summary: string;
  ai_output: string;
  confidence_level: "low" | "medium" | "high";
  citations_used: Record<string, unknown>[];
  tokens_used: number | null;
  model_used: string | null;
  processing_time_ms: number | null;
  user_rating: number | null;
  user_feedback: string | null;
  was_helpful: boolean | null;
  created_at: string;
}

interface AIGuardrailEvent {
  id: string;
  session_id: string | null;
  user_id: string | null;
  guardrail_type: "hallucination_risk" | "ethical_flag" | "missing_data" | "citation_needed" | "uncertainty_high" | "sensitive_content" | "rate_limit" | "policy_violation";
  message: string;
  severity: "info" | "warning" | "critical";
  was_blocked: boolean;
  triggered_at: string;
}

interface AIUsageQuota {
  id: string;
  user_id: string;
  quota_type: "daily" | "weekly" | "monthly";
  tokens_used: number;
  tokens_limit: number;
  sessions_count: number;
  period_start: string;
  period_end: string;
}

// AI Context Management
export function useAIContext() {
  const { user } = useAuth();
  const [contexts, setContexts] = useState<AIContextSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContexts = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("ai_context_snapshots")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("last_updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching AI contexts:", error);
    } else {
      setContexts((data || []) as AIContextSnapshot[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchContexts();
  }, [fetchContexts]);

  const addContext = async (context: {
    context_type: AIContextSnapshot["context_type"];
    context_id: string;
    context_summary: string;
    context_tokens?: number;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("ai_context_snapshots")
      .upsert({
        ...context,
        user_id: user.id,
        last_updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,context_type,context_id",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to add context:", error);
      return { success: false, error };
    }

    await fetchContexts();
    return { success: true, data };
  };

  const removeContext = async (contextId: string) => {
    const { error } = await supabase
      .from("ai_context_snapshots")
      .update({ is_active: false })
      .eq("id", contextId);

    if (error) {
      return { success: false, error };
    }

    await fetchContexts();
    return { success: true };
  };

  return { contexts, loading, fetchContexts, addContext, removeContext };
}

// AI Assistant Sessions
export function useAIAssistant() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AIAssistantSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AIAssistantSession | null>(null);
  const [outputs, setOutputs] = useState<AIAssistantOutput[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("ai_assistant_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching sessions:", error);
    } else {
      setSessions((data || []) as AIAssistantSession[]);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchSessionOutputs = useCallback(async (sessionId: string) => {
    const { data, error } = await supabase
      .from("ai_assistant_outputs")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error) {
      setOutputs((data || []) as AIAssistantOutput[]);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (currentSession) {
      fetchSessionOutputs(currentSession.id);
    }
  }, [currentSession, fetchSessionOutputs]);

  const startSession = async (session: {
    intent: AIAssistantSession["intent"];
    scope_type?: AIAssistantSession["scope_type"];
    scope_id?: string;
    session_title?: string;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("ai_assistant_sessions")
      .insert({
        ...session,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to start AI session");
      return { success: false, error };
    }

    setCurrentSession(data as AIAssistantSession);
    await fetchSessions();
    return { success: true, data };
  };

  const endSession = async (sessionId?: string) => {
    const targetId = sessionId || currentSession?.id;
    if (!targetId) return { success: false, error: "No session to end" };

    const { error } = await supabase
      .from("ai_assistant_sessions")
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
      })
      .eq("id", targetId);

    if (error) {
      return { success: false, error };
    }

    if (targetId === currentSession?.id) {
      setCurrentSession(null);
      setOutputs([]);
    }
    await fetchSessions();
    return { success: true };
  };

  const addOutput = async (output: {
    prompt_summary: string;
    ai_output: string;
    confidence_level?: AIAssistantOutput["confidence_level"];
    citations_used?: Record<string, unknown>[];
    tokens_used?: number;
    model_used?: string;
    processing_time_ms?: number;
  }) => {
    if (!currentSession) return { success: false, error: "No active session" };

    const { data, error } = await supabase
      .from("ai_assistant_outputs")
      .insert({
        prompt_summary: output.prompt_summary,
        ai_output: output.ai_output,
        confidence_level: output.confidence_level || "medium",
        citations_used: output.citations_used as unknown as undefined,
        tokens_used: output.tokens_used,
        model_used: output.model_used,
        processing_time_ms: output.processing_time_ms,
        session_id: currentSession.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error };
    }

    await fetchSessionOutputs(currentSession.id);
    return { success: true, data };
  };

  const rateOutput = async (outputId: string, rating: number, feedback?: string, wasHelpful?: boolean) => {
    const { error } = await supabase
      .from("ai_assistant_outputs")
      .update({
        user_rating: rating,
        user_feedback: feedback,
        was_helpful: wasHelpful,
      })
      .eq("id", outputId);

    if (error) {
      return { success: false, error };
    }

    if (currentSession) {
      await fetchSessionOutputs(currentSession.id);
    }
    return { success: true };
  };

  return {
    sessions,
    currentSession,
    outputs,
    loading,
    fetchSessions,
    startSession,
    endSession,
    addOutput,
    rateOutput,
    setCurrentSession,
  };
}

// AI Guardrails
export function useAIGuardrails() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AIGuardrailEvent[]>([]);

  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("ai_guardrail_events")
      .select("*")
      .eq("user_id", user.id)
      .order("triggered_at", { ascending: false })
      .limit(50);

    if (!error) {
      setEvents((data || []) as AIGuardrailEvent[]);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const logGuardrail = async (event: {
    session_id?: string;
    guardrail_type: AIGuardrailEvent["guardrail_type"];
    message: string;
    severity?: AIGuardrailEvent["severity"];
    was_blocked?: boolean;
  }) => {
    if (!user?.id) return;

    await supabase.from("ai_guardrail_events").insert({
      ...event,
      user_id: user.id,
    });

    await fetchEvents();
  };

  return { events, fetchEvents, logGuardrail };
}

// AI Usage Quotas
export function useAIQuota() {
  const { user } = useAuth();
  const [quota, setQuota] = useState<AIUsageQuota | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuota = useCallback(async () => {
    if (!user?.id) return;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const { data, error } = await supabase
      .from("ai_usage_quotas")
      .select("*")
      .eq("user_id", user.id)
      .eq("quota_type", "daily")
      .gte("period_end", now.toISOString())
      .order("period_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching quota:", error);
    } else if (data) {
      setQuota(data as AIUsageQuota);
    } else {
      // Create new daily quota
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const { data: newQuota } = await supabase
        .from("ai_usage_quotas")
        .insert({
          user_id: user.id,
          quota_type: "daily",
          period_start: startOfDay.toISOString(),
          period_end: endOfDay.toISOString(),
        })
        .select()
        .single();

      if (newQuota) {
        setQuota(newQuota as AIUsageQuota);
      }
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const checkQuota = () => {
    if (!quota) return { allowed: true, remaining: 50000 };
    const remaining = quota.tokens_limit - quota.tokens_used;
    return { allowed: remaining > 0, remaining };
  };

  const updateUsage = async (tokensUsed: number) => {
    if (!quota) return;

    await supabase
      .from("ai_usage_quotas")
      .update({
        tokens_used: quota.tokens_used + tokensUsed,
        sessions_count: quota.sessions_count + 1,
      })
      .eq("id", quota.id);

    await fetchQuota();
  };

  return { quota, loading, checkQuota, updateUsage, fetchQuota };
}

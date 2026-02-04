import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AmbientInsight {
  id: string;
  insight_type: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action_url?: string;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
}

export interface DealHealthMetric {
  id: string;
  deal_id: string;
  health_score: number;
  communication_score?: number;
  milestone_velocity?: number;
  sentiment_trend?: "improving" | "stable" | "declining";
  risk_factors: string[];
  last_activity_at?: string;
  days_since_activity?: number;
  predicted_outcome?: "on_track" | "at_risk" | "likely_fail";
  confidence?: number;
  calculated_at: string;
}

export interface RelationshipEntropy {
  id: string;
  user_id: string;
  connection_id: string;
  entropy_score: number;
  interaction_frequency?: number;
  last_interaction_at?: string;
  days_since_interaction?: number;
  interaction_trend?: "increasing" | "stable" | "decreasing" | "dormant";
  relationship_value?: number;
  suggested_action?: string;
  calculated_at: string;
  connection?: {
    id: string;
    full_name?: string;
  };
}

export interface OpportunityAlert {
  id: string;
  user_id: string;
  opportunity_id: string;
  match_score: number;
  alert_type: "high_match" | "deadline_approaching" | "budget_fit" | "skill_match";
  match_reasons: string[];
  deadline_distance_days?: number;
  is_notified: boolean;
  is_dismissed: boolean;
  created_at: string;
  expires_at?: string;
  opportunity?: {
    id: string;
    title: string;
    description?: string;
    budget_min?: number;
    budget_max?: number;
  };
}

export function useAmbientIntelligence() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AmbientInsight[]>([]);
  const [dealHealth, setDealHealth] = useState<DealHealthMetric[]>([]);
  const [relationshipEntropy, setRelationshipEntropy] = useState<RelationshipEntropy[]>([]);
  const [opportunityAlerts, setOpportunityAlerts] = useState<OpportunityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmbientData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch insights
      const { data: insightsData } = await supabase
        .from("ambient_insights")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false });

      if (insightsData) {
        setInsights(insightsData.map(i => ({
          id: i.id, insight_type: i.insight_type, title: i.title, description: i.description,
          priority: i.priority as AmbientInsight["priority"], is_read: i.is_read, is_dismissed: i.is_dismissed,
          created_at: i.created_at, action_url: i.action_url || undefined, expires_at: i.expires_at || undefined,
        })));
      }

      // Fetch deal health
      const { data: dealsData } = await supabase
        .from("deal_rooms")
        .select("id")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (dealsData && dealsData.length > 0) {
        const dealIds = dealsData.map(d => d.id);
        const { data: healthData } = await supabase
          .from("deal_health_metrics")
          .select("*")
          .in("deal_id", dealIds);

        if (healthData) {
          const latestHealth = new Map<string, DealHealthMetric>();
          healthData.forEach(h => {
            if (!latestHealth.has(h.deal_id)) {
              latestHealth.set(h.deal_id, {
                ...h,
                risk_factors: (h.risk_factors as string[]) || [],
                sentiment_trend: h.sentiment_trend as DealHealthMetric["sentiment_trend"],
                predicted_outcome: h.predicted_outcome as DealHealthMetric["predicted_outcome"],
              });
            }
          });
          setDealHealth(Array.from(latestHealth.values()));
        }
      }

      // Fetch relationship entropy
      const { data: entropyData } = await supabase
        .from("relationship_entropy")
        .select(`*, connection:profiles!relationship_entropy_connection_id_fkey(id, full_name)`)
        .eq("user_id", user.id)
        .order("entropy_score", { ascending: false })
        .limit(20);

      if (entropyData) {
        setRelationshipEntropy(entropyData.map(e => ({
          ...e,
          interaction_trend: e.interaction_trend as RelationshipEntropy["interaction_trend"],
          connection: e.connection as RelationshipEntropy["connection"],
        })));
      }

      // Fetch opportunity alerts
      const { data: alertsData } = await supabase
        .from("opportunity_alerts")
        .select(`*, opportunity:offers!opportunity_alerts_opportunity_id_fkey(id, title, description, budget_min, budget_max)`)
        .eq("user_id", user.id)
        .eq("is_dismissed", false)
        .order("match_score", { ascending: false })
        .limit(10);

      if (alertsData) {
        setOpportunityAlerts(alertsData.map(a => ({
          id: a.id, user_id: a.user_id, opportunity_id: a.opportunity_id, match_score: a.match_score,
          is_notified: a.is_notified, is_dismissed: a.is_dismissed, created_at: a.created_at,
          match_reasons: (a.match_reasons as string[]) || [],
          alert_type: a.alert_type as OpportunityAlert["alert_type"],
          deadline_distance_days: a.deadline_distance_days || undefined,
          expires_at: a.expires_at || undefined,
          opportunity: a.opportunity as unknown as OpportunityAlert["opportunity"],
        })));
      }
    } catch (err: unknown) {
      console.error("Ambient intelligence error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch ambient data");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markInsightRead = useCallback(async (insightId: string) => {
    await supabase.from("ambient_insights").update({ is_read: true }).eq("id", insightId);
    setInsights(prev => prev.map(i => i.id === insightId ? { ...i, is_read: true } : i));
  }, []);

  const dismissInsight = useCallback(async (insightId: string) => {
    await supabase.from("ambient_insights").update({ is_dismissed: true }).eq("id", insightId);
    setInsights(prev => prev.filter(i => i.id !== insightId));
  }, []);

  const dismissAlert = useCallback(async (alertId: string) => {
    await supabase.from("opportunity_alerts").update({ is_dismissed: true }).eq("id", alertId);
    setOpportunityAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const getNudges = useCallback(() => {
    const nudges: Array<{
      id: string;
      type: "insight" | "alert" | "entropy" | "deal_risk";
      priority: "high" | "medium" | "low";
      title: string;
      description: string;
      action_url?: string;
      data: unknown;
    }> = [];

    insights.forEach(insight => {
      nudges.push({
        id: insight.id,
        type: "insight",
        priority: insight.priority,
        title: insight.title,
        description: insight.description,
        action_url: insight.action_url,
        data: insight,
      });
    });

    opportunityAlerts.filter(a => a.match_score >= 80).forEach(alert => {
      nudges.push({
        id: alert.id,
        type: "alert",
        priority: "high",
        title: `High Match: ${alert.opportunity?.title || "New Opportunity"}`,
        description: `${alert.match_score}% match`,
        action_url: `/offers/${alert.opportunity_id}`,
        data: alert,
      });
    });

    relationshipEntropy.filter(e => e.entropy_score >= 70).forEach(entropy => {
      nudges.push({
        id: entropy.id,
        type: "entropy",
        priority: entropy.entropy_score >= 85 ? "high" : "medium",
        title: `Reconnect with ${entropy.connection?.full_name || "connection"}`,
        description: `No interaction in ${entropy.days_since_interaction} days`,
        action_url: `/profile/${entropy.connection_id}`,
        data: entropy,
      });
    });

    dealHealth.filter(d => d.predicted_outcome !== "on_track").forEach(health => {
      nudges.push({
        id: health.id,
        type: "deal_risk",
        priority: health.predicted_outcome === "likely_fail" ? "high" : "medium",
        title: `Deal at risk (${health.health_score}%)`,
        description: health.risk_factors[0] || "Concerns detected",
        action_url: `/deals/${health.deal_id}`,
        data: health,
      });
    });

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return nudges.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [insights, opportunityAlerts, relationshipEntropy, dealHealth]);

  useEffect(() => { fetchAmbientData(); }, [fetchAmbientData]);

  return {
    insights, dealHealth, relationshipEntropy, opportunityAlerts,
    nudges: getNudges(), loading, error,
    fetchAmbientData, markInsightRead, dismissInsight, dismissAlert,
    unreadCount: insights.filter(i => !i.is_read).length,
    highPriorityCount: getNudges().filter(n => n.priority === "high").length,
    atRiskDealsCount: dealHealth.filter(d => d.predicted_outcome !== "on_track").length,
  };
}

export function useDealHealthMonitor(dealId?: string) {
  const [health, setHealth] = useState<DealHealthMetric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dealId) { setLoading(false); return; }
    const fetchHealth = async () => {
      const { data } = await supabase
        .from("deal_health_metrics")
        .select("*")
        .eq("deal_id", dealId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setHealth({
          ...data,
          risk_factors: (data.risk_factors as string[]) || [],
          sentiment_trend: data.sentiment_trend as DealHealthMetric["sentiment_trend"],
          predicted_outcome: data.predicted_outcome as DealHealthMetric["predicted_outcome"],
        });
      }
      setLoading(false);
    };
    fetchHealth();
  }, [dealId]);

  return { health, loading };
}

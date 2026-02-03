import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface NationalInsight {
  id: string;
  insight_type: string;
  country_code: string | null;
  title: string;
  summary: string;
  detailed_analysis: string | null;
  data_sources: Json;
  confidence_score: number | null;
  recommendations: Json;
  is_public: boolean;
  generated_by: string;
  approved_by: string | null;
  approved_at: string | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

interface AIBiasMonitoring {
  id: string;
  ai_capability: string;
  monitoring_period_start: string;
  monitoring_period_end: string;
  total_decisions: number;
  demographic_breakdown: Json;
  outcome_distribution: Json;
  bias_indicators: Json;
  fairness_score: number | null;
  recommendations: string[] | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface InternationalInstitution {
  id: string;
  name: string;
  country_code: string;
  city: string | null;
  institution_type: string;
  accreditation_status: string | null;
  ranking_tier: string | null;
  website_url: string | null;
  verified: boolean;
  created_at: string;
}

// New interfaces for research map
export interface NationalResearchSnapshot {
  id: string;
  country_code: string;
  country_name: string;
  total_institutions: number;
  total_researchers: number;
  total_active_research: number;
  total_publications: number;
  research_domains: Record<string, number>;
  funding_distribution: Record<string, number>;
  institution_participation: Array<{
    institution_id: string;
    name: string;
    researcher_count: number;
    research_count: number;
  }>;
  talent_flow_metrics: {
    inflow: number;
    outflow: number;
    net_flow: number;
    top_source_countries?: string[];
    top_destination_countries?: string[];
  };
  collaboration_density: number;
  international_collaboration_rate: number;
  avg_funding_per_researcher: number;
  top_research_areas: string[];
  emerging_domains: string[];
  snapshot_period: string;
  period_start: string;
  period_end: string;
  computed_at: string;
}

export interface PolicyInsight {
  id: string;
  scope: "institution" | "national" | "regional" | "global";
  scope_id: string | null;
  insight_type: string;
  severity: "info" | "attention" | "warning" | "critical";
  title: string;
  summary: string;
  detailed_analysis: Record<string, any>;
  affected_domains: string[];
  recommendations: any[];
  confidence_score: number;
  is_active: boolean;
  generated_at: string;
}

export interface NationalDashboardAccess {
  id: string;
  country_code: string;
  user_id: string;
  access_level: "viewer" | "analyst" | "policy_maker" | "admin";
  organization_affiliation: string | null;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export function useNationalInsights() {
  const [insights, setInsights] = useState<NationalInsight[]>([]);
  const [biasMonitoring, setBiasMonitoring] = useState<AIBiasMonitoring[]>([]);
  const [institutions, setInstitutions] = useState<InternationalInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async (countryCode?: string) => {
    let query = supabase
      .from("national_insights")
      .select("*")
      .order("created_at", { ascending: false });

    if (countryCode) {
      query = query.eq("country_code", countryCode);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching national insights:", error);
    } else {
      setInsights((data || []) as NationalInsight[]);
    }
  }, []);

  const fetchBiasMonitoring = useCallback(async () => {
    const { data, error } = await supabase
      .from("ai_bias_monitoring")
      .select("*")
      .order("monitoring_period_end", { ascending: false });

    if (error) {
      console.error("Error fetching AI bias monitoring:", error);
    } else {
      setBiasMonitoring((data || []) as AIBiasMonitoring[]);
    }
  }, []);

  const fetchInstitutions = useCallback(async (countryCode?: string) => {
    let query = supabase
      .from("international_institutions")
      .select("*")
      .order("name");

    if (countryCode) {
      query = query.eq("country_code", countryCode);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching international institutions:", error);
    } else {
      setInstitutions((data || []) as InternationalInstitution[]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchInsights(),
        fetchBiasMonitoring(),
        fetchInstitutions(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchInsights, fetchBiasMonitoring, fetchInstitutions]);

  const createInsight = async (insight: {
    insight_type: string;
    title: string;
    summary: string;
    country_code?: string;
    detailed_analysis?: string;
    data_sources?: Json;
    confidence_score?: number;
    recommendations?: Json;
    valid_from?: string;
    valid_until?: string;
  }) => {
    const { data, error } = await supabase
      .from("national_insights")
      .insert(insight)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create national insight");
      return { success: false, error };
    }

    toast.success("National insight created");
    await fetchInsights();
    return { success: true, data };
  };

  const approveInsight = async (id: string, approvedBy: string) => {
    const { error } = await supabase
      .from("national_insights")
      .update({
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        is_public: true
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to approve insight");
      return { success: false, error };
    }

    toast.success("Insight approved and published");
    await fetchInsights();
    return { success: true };
  };

  const createBiasReport = async (report: {
    ai_capability: string;
    monitoring_period_start: string;
    monitoring_period_end: string;
    total_decisions: number;
    demographic_breakdown?: Json;
    outcome_distribution?: Json;
    bias_indicators?: Json;
    fairness_score?: number;
    recommendations?: string[];
  }) => {
    const { data, error } = await supabase
      .from("ai_bias_monitoring")
      .insert(report)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create bias monitoring report");
      return { success: false, error };
    }

    toast.success("Bias monitoring report created");
    await fetchBiasMonitoring();
    return { success: true, data };
  };

  const reviewBiasReport = async (id: string, reviewedBy: string) => {
    const { error } = await supabase
      .from("ai_bias_monitoring")
      .update({
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to mark report as reviewed");
      return { success: false, error };
    }

    toast.success("Bias report reviewed");
    await fetchBiasMonitoring();
    return { success: true };
  };

  const createInstitution = async (institution: {
    name: string;
    country_code: string;
    institution_type: string;
    city?: string;
    accreditation_status?: string;
    ranking_tier?: string;
    website_url?: string;
  }) => {
    const { data, error } = await supabase
      .from("international_institutions")
      .insert(institution)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create institution");
      return { success: false, error };
    }

    toast.success("Institution created");
    await fetchInstitutions();
    return { success: true, data };
  };

  const verifyInstitution = async (id: string) => {
    const { error } = await supabase
      .from("international_institutions")
      .update({
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to verify institution");
      return { success: false, error };
    }

    toast.success("Institution verified");
    await fetchInstitutions();
    return { success: true };
  };

  const getInsightsByType = (type: string) => {
    return insights.filter(i => i.insight_type === type);
  };

  const getPublicInsights = () => {
    return insights.filter(i => i.is_public);
  };

  const getUnreviewedBiasReports = () => {
    return biasMonitoring.filter(b => !b.reviewed_at);
  };

  const getVerifiedInstitutions = () => {
    return institutions.filter(i => i.verified);
  };

  const getInstitutionsByCountry = (countryCode: string) => {
    return institutions.filter(i => i.country_code === countryCode);
  };

  return {
    insights,
    biasMonitoring,
    institutions,
    loading,
    fetchInsights,
    fetchBiasMonitoring,
    fetchInstitutions,
    createInsight,
    approveInsight,
    createBiasReport,
    reviewBiasReport,
    createInstitution,
    verifyInstitution,
    getInsightsByType,
    getPublicInsights,
    getUnreviewedBiasReports,
    getVerifiedInstitutions,
    getInstitutionsByCountry,
  };
}

// New hook for national research map
export function useNationalResearchMap(countryCode: string | undefined) {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<NationalResearchSnapshot[]>([]);
  const [latestSnapshot, setLatestSnapshot] = useState<NationalResearchSnapshot | null>(null);
  const [insights, setInsights] = useState<PolicyInsight[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLevel, setAccessLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAccess = useCallback(async () => {
    if (!user || !countryCode) {
      setHasAccess(false);
      setAccessLevel(null);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("national_dashboard_access")
        .select("access_level")
        .eq("country_code", countryCode)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHasAccess(true);
        setAccessLevel(data.access_level);
        return true;
      }

      // Check if admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleData?.role === "admin") {
        setHasAccess(true);
        setAccessLevel("admin");
        return true;
      }

      setHasAccess(false);
      setAccessLevel(null);
      return false;
    } catch (err) {
      console.error("Error checking national access:", err);
      return false;
    }
  }, [user, countryCode]);

  const fetchSnapshots = useCallback(async () => {
    if (!countryCode || !hasAccess) return;

    try {
      const { data, error } = await supabase
        .from("national_research_snapshots")
        .select("*")
        .eq("country_code", countryCode)
        .order("period_start", { ascending: false })
        .limit(12);

      if (error) throw error;
      setSnapshots((data || []) as NationalResearchSnapshot[]);
      if (data && data.length > 0) {
        setLatestSnapshot(data[0] as NationalResearchSnapshot);
      }
    } catch (err) {
      console.error("Error fetching national snapshots:", err);
    }
  }, [countryCode, hasAccess]);

  const fetchPolicyInsights = useCallback(async () => {
    if (!countryCode || !hasAccess) return;

    try {
      const { data, error } = await supabase
        .from("policy_insight_flags")
        .select("*")
        .eq("scope", "national")
        .eq("scope_id", countryCode)
        .eq("is_active", true)
        .order("generated_at", { ascending: false });

      if (error) throw error;
      setInsights((data || []) as PolicyInsight[]);
    } catch (err) {
      console.error("Error fetching policy insights:", err);
    }
  }, [countryCode, hasAccess]);

  const logDashboardAccess = useCallback(async (action: string, dataAccessed?: Record<string, any>) => {
    if (!user || !countryCode) return;

    try {
      await supabase.from("dashboard_audit_logs").insert({
        dashboard_type: "national",
        scope_id: countryCode,
        user_id: user.id,
        action,
        data_accessed: dataAccessed || {},
      });
    } catch (err) {
      console.error("Error logging dashboard access:", err);
    }
  }, [user, countryCode]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const access = await checkAccess();
      if (access) {
        await Promise.all([fetchSnapshots(), fetchPolicyInsights()]);
        await logDashboardAccess("view_dashboard");
      }
      setLoading(false);
    };

    init();
  }, [checkAccess, fetchSnapshots, fetchPolicyInsights, logDashboardAccess]);

  return {
    snapshots,
    latestSnapshot,
    insights,
    hasAccess,
    accessLevel,
    loading,
    refetch: async () => {
      await Promise.all([fetchSnapshots(), fetchPolicyInsights()]);
    },
  };
}

// Hook for global research overview
export function useGlobalResearchOverview() {
  const [countries, setCountries] = useState<Array<{
    country_code: string;
    country_name: string;
    total_researchers: number;
    total_publications: number;
    total_active_research: number;
  }>>([]);
  const [globalInsights, setGlobalInsights] = useState<PolicyInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCountries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("national_research_snapshots")
        .select("country_code, country_name, total_researchers, total_publications, total_active_research")
        .order("computed_at", { ascending: false });

      if (error) throw error;

      // Deduplicate by country_code (keep latest)
      const countryMap = new Map<string, typeof data[0]>();
      (data || []).forEach(row => {
        if (!countryMap.has(row.country_code)) {
          countryMap.set(row.country_code, row);
        }
      });

      setCountries(Array.from(countryMap.values()));
    } catch (err) {
      console.error("Error fetching countries:", err);
    }
  }, []);

  const fetchGlobalInsights = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("policy_insight_flags")
        .select("*")
        .eq("scope", "global")
        .eq("is_active", true)
        .order("generated_at", { ascending: false });

      if (error) throw error;
      setGlobalInsights((data || []) as PolicyInsight[]);
    } catch (err) {
      console.error("Error fetching global insights:", err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCountries(), fetchGlobalInsights()]);
      setLoading(false);
    };

    init();
  }, [fetchCountries, fetchGlobalInsights]);

  return {
    countries,
    globalInsights,
    loading,
    refetch: async () => {
      await Promise.all([fetchCountries(), fetchGlobalInsights()]);
    },
  };
}

// Hook for national dashboard access management
export function useNationalDashboardAccess() {
  const { user } = useAuth();
  const [accessList, setAccessList] = useState<NationalDashboardAccess[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccess = useCallback(async () => {
    if (!user) {
      setAccessList([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("national_dashboard_access")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;
      setAccessList((data || []) as NationalDashboardAccess[]);
    } catch (err) {
      console.error("Error fetching national access:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  return {
    accessList,
    loading,
    refetch: fetchAccess,
  };
}

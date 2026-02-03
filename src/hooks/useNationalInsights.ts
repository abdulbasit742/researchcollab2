import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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

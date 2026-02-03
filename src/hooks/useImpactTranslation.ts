import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types for impact & policy translation
export interface ImpactPathway {
  id: string;
  research_timeline_id: string;
  impact_domain: "policy" | "healthcare" | "education" | "environment" | "industry" | "community" | "technology" | "social_justice";
  intended_outcome: string;
  theory_of_change: string | null;
  status: "hypothesized" | "in_progress" | "observed" | "validated" | "refuted";
  primary_contact_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PolicyTranslationRecord {
  id: string;
  impact_pathway_id: string;
  policy_area: string;
  translation_summary: string;
  evidence_strength: "exploratory" | "moderate" | "strong" | "conclusive";
  limitations: string | null;
  target_audience: string | null;
  plain_language_summary: string | null;
  created_by: string;
  reviewed_by: string | null;
  created_at: string;
}

export interface ImpactAdoption {
  id: string;
  impact_pathway_id: string;
  adopting_entity_type: "government" | "ngo" | "industry" | "community" | "healthcare" | "education_system";
  adopting_entity_name: string;
  adopting_entity_id: string | null;
  adoption_description: string;
  adoption_date: string;
  adoption_evidence_url: string | null;
  verification_status: "self_reported" | "externally_confirmed" | "disputed" | "verified";
  verified_by: string | null;
  created_at: string;
}

export interface ImpactEvaluation {
  id: string;
  impact_pathway_id: string;
  evaluation_method: "qualitative" | "quantitative" | "mixed" | "case_study" | "systematic_review";
  findings_summary: string;
  success_indicators: Record<string, unknown>;
  unintended_effects: string | null;
  lessons_learned: string | null;
  data_sources: string[];
  evaluated_by: string;
  external_evaluator: string | null;
  evaluated_at: string;
}

export interface ImpactDisclaimer {
  id: string;
  impact_pathway_id: string;
  disclaimer_text: string;
  visibility: "public" | "institutional" | "internal";
  required_by: string | null;
  created_at: string;
}

export function useImpactPathways() {
  const { user } = useAuth();
  const [pathways, setPathways] = useState<ImpactPathway[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch impact pathways
  const fetchPathways = useCallback(async (filters?: {
    researchTimelineId?: string;
    domain?: string;
    status?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase.from("impact_pathways").select("*");
      
      if (filters?.researchTimelineId) {
        query = query.eq("research_timeline_id", filters.researchTimelineId);
      }
      if (filters?.domain) {
        query = query.eq("impact_domain", filters.domain);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      setPathways(data as ImpactPathway[]);
      return data as ImpactPathway[];
    } catch (err) {
      console.error("Error fetching impact pathways:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create impact pathway
  const createPathway = useCallback(async (
    pathway: Omit<ImpactPathway, "id" | "created_at" | "updated_at" | "status">
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("impact_pathways")
      .insert({
        ...pathway,
        primary_contact_id: pathway.primary_contact_id || user.id,
        status: "hypothesized",
      })
      .select()
      .single();
    
    if (error) throw error;
    await fetchPathways();
    return data as ImpactPathway;
  }, [user, fetchPathways]);

  // Update pathway status
  const updatePathwayStatus = useCallback(async (
    pathwayId: string,
    status: ImpactPathway["status"]
  ) => {
    const { error } = await supabase
      .from("impact_pathways")
      .update({ status })
      .eq("id", pathwayId);
    
    if (error) throw error;
    await fetchPathways();
  }, [fetchPathways]);

  return {
    pathways,
    loading,
    fetchPathways,
    createPathway,
    updatePathwayStatus,
  };
}

export function usePolicyTranslation() {
  const { user } = useAuth();
  const [translations, setTranslations] = useState<PolicyTranslationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch policy translations
  const fetchTranslations = useCallback(async (pathwayId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("policy_translation_records")
        .select("*")
        .eq("impact_pathway_id", pathwayId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setTranslations(data as PolicyTranslationRecord[]);
      return data as PolicyTranslationRecord[];
    } catch (err) {
      console.error("Error fetching policy translations:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create policy translation
  const createTranslation = useCallback(async (
    translation: Omit<PolicyTranslationRecord, "id" | "created_by" | "reviewed_by" | "created_at">
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("policy_translation_records")
      .insert({
        ...translation,
        created_by: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    await fetchTranslations(translation.impact_pathway_id);
    return data as PolicyTranslationRecord;
  }, [user, fetchTranslations]);

  return {
    translations,
    loading,
    fetchTranslations,
    createTranslation,
  };
}

export function useImpactAdoptions() {
  const [adoptions, setAdoptions] = useState<ImpactAdoption[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch impact adoptions
  const fetchAdoptions = useCallback(async (pathwayId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("impact_adoptions")
        .select("*")
        .eq("impact_pathway_id", pathwayId)
        .order("adoption_date", { ascending: false });
      
      if (error) throw error;
      setAdoptions(data as ImpactAdoption[]);
      return data as ImpactAdoption[];
    } catch (err) {
      console.error("Error fetching impact adoptions:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Record adoption
  const recordAdoption = useCallback(async (
    adoption: Omit<ImpactAdoption, "id" | "verified_by" | "created_at" | "verification_status">
  ) => {
    const { data, error } = await supabase
      .from("impact_adoptions")
      .insert({
        ...adoption,
        verification_status: "self_reported",
      })
      .select()
      .single();
    
    if (error) throw error;
    await fetchAdoptions(adoption.impact_pathway_id);
    return data as ImpactAdoption;
  }, [fetchAdoptions]);

  return {
    adoptions,
    loading,
    fetchAdoptions,
    recordAdoption,
  };
}

export function useImpactEvaluation() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<ImpactEvaluation[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch evaluations
  const fetchEvaluations = useCallback(async (pathwayId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("impact_evaluations")
        .select("*")
        .eq("impact_pathway_id", pathwayId)
        .order("evaluated_at", { ascending: false });
      
      if (error) throw error;
      setEvaluations(data as ImpactEvaluation[]);
      return data as ImpactEvaluation[];
    } catch (err) {
      console.error("Error fetching evaluations:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create evaluation
  const createEvaluation = useCallback(async (
    evaluation: Omit<ImpactEvaluation, "id" | "evaluated_by" | "evaluated_at">
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("impact_evaluations")
      .insert({
        impact_pathway_id: evaluation.impact_pathway_id,
        evaluation_method: evaluation.evaluation_method,
        findings_summary: evaluation.findings_summary,
        success_indicators: evaluation.success_indicators,
        unintended_effects: evaluation.unintended_effects,
        lessons_learned: evaluation.lessons_learned,
        data_sources: evaluation.data_sources,
        external_evaluator: evaluation.external_evaluator,
        evaluated_by: user.id,
      } as any)
      .select()
      .single();
    
    if (error) throw error;
    await fetchEvaluations(evaluation.impact_pathway_id);
    return data as ImpactEvaluation;
  }, [user, fetchEvaluations]);

  return {
    evaluations,
    loading,
    fetchEvaluations,
    createEvaluation,
  };
}

export function useImpactDisclaimers() {
  const [disclaimers, setDisclaimers] = useState<ImpactDisclaimer[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch disclaimers
  const fetchDisclaimers = useCallback(async (pathwayId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("impact_disclaimers")
        .select("*")
        .eq("impact_pathway_id", pathwayId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setDisclaimers(data as ImpactDisclaimer[]);
      return data as ImpactDisclaimer[];
    } catch (err) {
      console.error("Error fetching disclaimers:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add disclaimer
  const addDisclaimer = useCallback(async (
    disclaimer: Omit<ImpactDisclaimer, "id" | "created_at">
  ) => {
    const { data, error } = await supabase
      .from("impact_disclaimers")
      .insert(disclaimer)
      .select()
      .single();
    
    if (error) throw error;
    await fetchDisclaimers(disclaimer.impact_pathway_id);
    return data as ImpactDisclaimer;
  }, [fetchDisclaimers]);

  return {
    disclaimers,
    loading,
    fetchDisclaimers,
    addDisclaimer,
  };
}

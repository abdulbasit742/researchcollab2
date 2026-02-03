import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types
export interface AcademicDiscipline {
  id: string;
  name: string;
  parent_discipline_id: string | null;
  description: string | null;
  icon_name: string | null;
  created_at: string;
}

export interface DisciplineAffiliation {
  id: string;
  scholar_passport_id: string;
  discipline_id: string;
  depth_level: "primary" | "secondary" | "working_knowledge";
  verified: boolean;
  years_experience: number | null;
  created_at: string;
  discipline?: AcademicDiscipline;
}

export interface InterdisciplinaryCall {
  id: string;
  created_by_user_id: string;
  primary_discipline_id: string;
  missing_disciplines: string[];
  problem_statement: string;
  collaboration_type: "research" | "methodology" | "application" | "translation";
  expected_duration: string | null;
  visibility: "public" | "institution" | "invited";
  status: "open" | "matched" | "in_progress" | "closed" | "cancelled";
  created_at: string;
  updated_at: string;
  primary_discipline?: AcademicDiscipline;
  creator?: { full_name: string };
}

export interface InterdisciplinaryResponse {
  id: string;
  call_id: string;
  responder_user_id: string;
  offering_disciplines: string[];
  proposal_text: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  responder?: { full_name: string };
}

export interface FieldTranslationRecord {
  id: string;
  source_discipline_id: string;
  target_discipline_id: string;
  related_research_timeline_id: string | null;
  translation_summary: string;
  key_concepts_mapped: Record<string, string> | null;
  methodology_adaptations: string | null;
  created_by: string;
  visibility: "private" | "collaborators" | "public";
  created_at: string;
}

export interface BridgeRole {
  id: string;
  research_timeline_id: string;
  scholar_passport_id: string;
  role_type: "translator" | "integrator" | "method_adapter" | "domain_explainer" | "cross_validator";
  description: string | null;
  source_discipline_id: string | null;
  target_discipline_id: string | null;
  created_at: string;
}

// Hook: Disciplines
export function useDisciplines() {
  const [disciplines, setDisciplines] = useState<AcademicDiscipline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisciplines();
  }, []);

  const fetchDisciplines = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("academic_disciplines")
      .select("*")
      .order("name");

    if (!error && data) {
      setDisciplines(data);
    }
    setLoading(false);
  };

  const getDisciplineById = (id: string) => 
    disciplines.find(d => d.id === id);

  const getChildDisciplines = (parentId: string) =>
    disciplines.filter(d => d.parent_discipline_id === parentId);

  return { disciplines, loading, refetch: fetchDisciplines, getDisciplineById, getChildDisciplines };
}

// Hook: User's Discipline Affiliations
export function useDisciplineAffiliations(scholarPassportId?: string) {
  const [affiliations, setAffiliations] = useState<DisciplineAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (scholarPassportId) {
      fetchAffiliations();
    }
  }, [scholarPassportId]);

  const fetchAffiliations = async () => {
    if (!scholarPassportId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("discipline_affiliations")
      .select(`
        *,
        discipline:academic_disciplines(*)
      `)
      .eq("scholar_passport_id", scholarPassportId);

    if (!error && data) {
      setAffiliations(data as unknown as DisciplineAffiliation[]);
    }
    setLoading(false);
  };

  const addAffiliation = async (
    disciplineId: string,
    depthLevel: "primary" | "secondary" | "working_knowledge",
    yearsExperience?: number
  ) => {
    if (!scholarPassportId) return { error: new Error("No passport ID") };

    const { error } = await supabase
      .from("discipline_affiliations")
      .insert({
        scholar_passport_id: scholarPassportId,
        discipline_id: disciplineId,
        depth_level: depthLevel,
        years_experience: yearsExperience,
      });

    if (!error) await fetchAffiliations();
    return { error };
  };

  const removeAffiliation = async (affiliationId: string) => {
    const { error } = await supabase
      .from("discipline_affiliations")
      .delete()
      .eq("id", affiliationId);

    if (!error) await fetchAffiliations();
    return { error };
  };

  return { affiliations, loading, refetch: fetchAffiliations, addAffiliation, removeAffiliation };
}

// Hook: Interdisciplinary Calls
export function useInterdisciplinaryCalls() {
  const [calls, setCalls] = useState<InterdisciplinaryCall[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("interdisciplinary_calls")
      .select(`
        *,
        primary_discipline:academic_disciplines(*),
        creator:profiles!created_by_user_id(full_name)
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCalls(data as unknown as InterdisciplinaryCall[]);
    }
    setLoading(false);
  };

  const createCall = async (callData: {
    primary_discipline_id: string;
    missing_disciplines: string[];
    problem_statement: string;
    collaboration_type: "research" | "methodology" | "application" | "translation";
    expected_duration?: string;
    visibility?: "public" | "institution" | "invited";
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error, data } = await supabase
      .from("interdisciplinary_calls")
      .insert({
        ...callData,
        created_by_user_id: user.id,
      })
      .select()
      .single();

    if (!error) await fetchCalls();
    return { error, data };
  };

  const updateCallStatus = async (callId: string, status: InterdisciplinaryCall["status"]) => {
    const { error } = await supabase
      .from("interdisciplinary_calls")
      .update({ status })
      .eq("id", callId);

    if (!error) await fetchCalls();
    return { error };
  };

  return { calls, loading, refetch: fetchCalls, createCall, updateCallStatus };
}

// Hook: Responses to Calls
export function useInterdisciplinaryResponses(callId?: string) {
  const [responses, setResponses] = useState<InterdisciplinaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (callId) {
      fetchResponses();
    }
  }, [callId]);

  const fetchResponses = async () => {
    if (!callId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("interdisciplinary_responses")
      .select(`
        *,
        responder:profiles!responder_user_id(full_name)
      `)
      .eq("call_id", callId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setResponses(data as unknown as InterdisciplinaryResponse[]);
    }
    setLoading(false);
  };

  const submitResponse = async (
    offeringDisciplines: string[],
    proposalText: string
  ) => {
    if (!user || !callId) return { error: new Error("Missing data") };

    const { error, data } = await supabase
      .from("interdisciplinary_responses")
      .insert({
        call_id: callId,
        responder_user_id: user.id,
        offering_disciplines: offeringDisciplines,
        proposal_text: proposalText,
      })
      .select()
      .single();

    if (!error) await fetchResponses();
    return { error, data };
  };

  const updateResponseStatus = async (
    responseId: string,
    status: "accepted" | "rejected" | "withdrawn"
  ) => {
    const { error } = await supabase
      .from("interdisciplinary_responses")
      .update({ status })
      .eq("id", responseId);

    if (!error) await fetchResponses();
    return { error };
  };

  return { responses, loading, refetch: fetchResponses, submitResponse, updateResponseStatus };
}

// Hook: Field Translation Records
export function useFieldTranslations() {
  const [translations, setTranslations] = useState<FieldTranslationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("field_translation_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTranslations(data as FieldTranslationRecord[]);
    }
    setLoading(false);
  };

  const createTranslation = async (translationData: {
    source_discipline_id: string;
    target_discipline_id: string;
    translation_summary: string;
    key_concepts_mapped?: Record<string, string>;
    methodology_adaptations?: string;
    related_research_timeline_id?: string;
    visibility?: "private" | "collaborators" | "public";
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error, data } = await supabase
      .from("field_translation_records")
      .insert({
        ...translationData,
        key_concepts_mapped: translationData.key_concepts_mapped || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (!error) await fetchTranslations();
    return { error, data };
  };

  return { translations, loading, refetch: fetchTranslations, createTranslation };
}

// Hook: Bridge Roles
export function useBridgeRoles(researchTimelineId?: string) {
  const [bridgeRoles, setBridgeRoles] = useState<BridgeRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (researchTimelineId) {
      fetchBridgeRoles();
    }
  }, [researchTimelineId]);

  const fetchBridgeRoles = async () => {
    if (!researchTimelineId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("bridge_roles")
      .select("*")
      .eq("research_timeline_id", researchTimelineId);

    if (!error && data) {
      setBridgeRoles(data as BridgeRole[]);
    }
    setLoading(false);
  };

  const assignBridgeRole = async (roleData: {
    scholar_passport_id: string;
    role_type: BridgeRole["role_type"];
    description?: string;
    source_discipline_id?: string;
    target_discipline_id?: string;
  }) => {
    if (!researchTimelineId) return { error: new Error("No timeline ID") };

    const { error, data } = await supabase
      .from("bridge_roles")
      .insert({
        ...roleData,
        research_timeline_id: researchTimelineId,
      })
      .select()
      .single();

    if (!error) await fetchBridgeRoles();
    return { error, data };
  };

  const removeBridgeRole = async (roleId: string) => {
    const { error } = await supabase
      .from("bridge_roles")
      .delete()
      .eq("id", roleId);

    if (!error) await fetchBridgeRoles();
    return { error };
  };

  return { bridgeRoles, loading, refetch: fetchBridgeRoles, assignBridgeRole, removeBridgeRole };
}

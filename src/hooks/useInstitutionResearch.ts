import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PolicyInsight } from "./useNationalInsights";

export interface InstitutionResearchSnapshot {
  id: string;
  institution_id: string;
  active_research_timelines: number;
  completed_research_timelines: number;
  total_publications: number;
  total_researchers: number;
  funding_received: number;
  funding_utilized: number;
  collaborations_count: number;
  external_collaborations: number;
  interdisciplinary_score: number;
  avg_project_completion_rate: number;
  research_domains: string[];
  snapshot_period: string;
  period_start: string;
  period_end: string;
  last_updated_at: string;
}

export interface InstitutionResearchLink {
  id: string;
  institution_id: string;
  scholar_passport_id: string;
  user_id: string;
  role: "student" | "researcher" | "faculty" | "postdoc" | "visiting" | "affiliate";
  department: string | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
}

export interface InstitutionDashboardAccess {
  id: string;
  institution_id: string;
  user_id: string;
  access_level: "viewer" | "analyst" | "admin";
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface ResearchDomain {
  id: string;
  domain_code: string;
  domain_name: string;
  description: string | null;
  is_interdisciplinary: boolean;
  parent_domain_id: string | null;
}

export function useInstitutionResearch(institutionId: string | undefined) {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<InstitutionResearchSnapshot[]>([]);
  const [latestSnapshot, setLatestSnapshot] = useState<InstitutionResearchSnapshot | null>(null);
  const [insights, setInsights] = useState<PolicyInsight[]>([]);
  const [researchers, setResearchers] = useState<InstitutionResearchLink[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLevel, setAccessLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAccess = useCallback(async () => {
    if (!user || !institutionId) {
      setHasAccess(false);
      setAccessLevel(null);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("institution_dashboard_access")
        .select("access_level")
        .eq("institution_id", institutionId)
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
      console.error("Error checking institution access:", err);
      return false;
    }
  }, [user, institutionId]);

  const fetchSnapshots = useCallback(async () => {
    if (!institutionId || !hasAccess) return;

    try {
      const { data, error } = await supabase
        .from("institution_research_snapshots")
        .select("*")
        .eq("institution_id", institutionId)
        .order("period_start", { ascending: false })
        .limit(12);

      if (error) throw error;
      setSnapshots((data || []) as InstitutionResearchSnapshot[]);
      if (data && data.length > 0) {
        setLatestSnapshot(data[0] as InstitutionResearchSnapshot);
      }
    } catch (err) {
      console.error("Error fetching institution snapshots:", err);
    }
  }, [institutionId, hasAccess]);

  const fetchInsights = useCallback(async () => {
    if (!institutionId || !hasAccess) return;

    try {
      const { data, error } = await supabase
        .from("policy_insight_flags")
        .select("*")
        .eq("scope", "institution")
        .eq("scope_id", institutionId)
        .eq("is_active", true)
        .order("generated_at", { ascending: false });

      if (error) throw error;
      setInsights((data || []) as PolicyInsight[]);
    } catch (err) {
      console.error("Error fetching institution insights:", err);
    }
  }, [institutionId, hasAccess]);

  const fetchResearchers = useCallback(async () => {
    if (!institutionId || !hasAccess) return;

    try {
      const { data, error } = await supabase
        .from("institution_research_links")
        .select("*")
        .eq("institution_id", institutionId)
        .eq("is_current", true)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setResearchers((data || []) as InstitutionResearchLink[]);
    } catch (err) {
      console.error("Error fetching institution researchers:", err);
    }
  }, [institutionId, hasAccess]);

  const logDashboardAccess = useCallback(async (action: string, dataAccessed?: Record<string, any>) => {
    if (!user || !institutionId) return;

    try {
      await supabase.from("dashboard_audit_logs").insert({
        dashboard_type: "institution",
        scope_id: institutionId,
        user_id: user.id,
        action,
        data_accessed: dataAccessed || {},
      });
    } catch (err) {
      console.error("Error logging dashboard access:", err);
    }
  }, [user, institutionId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const access = await checkAccess();
      if (access) {
        await Promise.all([fetchSnapshots(), fetchInsights(), fetchResearchers()]);
        await logDashboardAccess("view_dashboard");
      }
      setLoading(false);
    };

    init();
  }, [checkAccess, fetchSnapshots, fetchInsights, fetchResearchers, logDashboardAccess]);

  return {
    snapshots,
    latestSnapshot,
    insights,
    researchers,
    hasAccess,
    accessLevel,
    loading,
    refetch: async () => {
      await Promise.all([fetchSnapshots(), fetchInsights(), fetchResearchers()]);
    },
  };
}

export function useInstitutionLinks() {
  const { user } = useAuth();
  const [links, setLinks] = useState<InstitutionResearchLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    if (!user) {
      setLinks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("institution_research_links")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setLinks((data || []) as InstitutionResearchLink[]);
    } catch (err) {
      console.error("Error fetching institution links:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createLink = async (linkData: {
    institution_id: string;
    scholar_passport_id: string;
    role: InstitutionResearchLink["role"];
    department?: string;
    start_date: string;
    end_date?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("institution_research_links")
        .insert({
          ...linkData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchLinks();
      return data;
    } catch (err) {
      console.error("Error creating institution link:", err);
      throw err;
    }
  };

  const updateLink = async (linkId: string, updates: Partial<InstitutionResearchLink>) => {
    try {
      const { data, error } = await supabase
        .from("institution_research_links")
        .update(updates)
        .eq("id", linkId)
        .select()
        .single();

      if (error) throw error;
      await fetchLinks();
      return data;
    } catch (err) {
      console.error("Error updating institution link:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    links,
    loading,
    createLink,
    updateLink,
    refetch: fetchLinks,
  };
}

export function useResearchDomains() {
  const [domains, setDomains] = useState<ResearchDomain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const { data, error } = await supabase
          .from("research_domain_registry")
          .select("*")
          .order("domain_name");

        if (error) throw error;
        setDomains((data || []) as ResearchDomain[]);
      } catch (err) {
        console.error("Error fetching research domains:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  return { domains, loading };
}

export function useInstitutionDashboardAccess(institutionId: string | undefined) {
  const { user } = useAuth();
  const [accessList, setAccessList] = useState<InstitutionDashboardAccess[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccess = useCallback(async () => {
    if (!institutionId) {
      setAccessList([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("institution_dashboard_access")
        .select("*")
        .eq("institution_id", institutionId)
        .eq("is_active", true);

      if (error) throw error;
      setAccessList((data || []) as InstitutionDashboardAccess[]);
    } catch (err) {
      console.error("Error fetching institution access:", err);
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  const grantAccess = async (userId: string, accessLevel: InstitutionDashboardAccess["access_level"]) => {
    if (!user || !institutionId) return null;

    try {
      const { data, error } = await supabase
        .from("institution_dashboard_access")
        .insert({
          institution_id: institutionId,
          user_id: userId,
          access_level: accessLevel,
          granted_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAccess();
      return data;
    } catch (err) {
      console.error("Error granting access:", err);
      throw err;
    }
  };

  const revokeAccess = async (accessId: string) => {
    try {
      const { error } = await supabase
        .from("institution_dashboard_access")
        .update({ is_active: false })
        .eq("id", accessId);

      if (error) throw error;
      await fetchAccess();
    } catch (err) {
      console.error("Error revoking access:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  return {
    accessList,
    loading,
    grantAccess,
    revokeAccess,
    refetch: fetchAccess,
  };
}

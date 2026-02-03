import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface GovernmentBody {
  id: string;
  name: string;
  country: string;
  body_type: string;
  integration_status: string;
  api_access_level: string;
  contact_email: string | null;
  contact_name: string | null;
  agreement_signed_at: string | null;
  created_at: string;
}

interface GovernmentUser {
  id: string;
  government_body_id: string;
  user_id: string | null;
  email: string;
  name: string;
  role: string;
  permissions: Json;
  is_active: boolean;
  last_access_at: string | null;
}

interface GovernmentReport {
  id: string;
  government_body_id: string;
  report_type: string;
  report_name: string;
  description: string | null;
  schedule: string | null;
  format: string;
  is_active: boolean;
  last_generated_at: string | null;
}

interface CountryPolicy {
  id: string;
  country_code: string;
  country_name: string;
  is_enabled: boolean;
  payment_enabled: boolean;
  government_integration_enabled: boolean;
  tax_rate_percentage: number | null;
}

export function useGovernmentIntegration() {
  const { user } = useAuth();
  const [governmentBodies, setGovernmentBodies] = useState<GovernmentBody[]>([]);
  const [governmentUsers, setGovernmentUsers] = useState<GovernmentUser[]>([]);
  const [reports, setReports] = useState<GovernmentReport[]>([]);
  const [countryPolicies, setCountryPolicies] = useState<CountryPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGovernmentBodies = useCallback(async () => {
    const { data, error } = await supabase
      .from("government_bodies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching government bodies:", error);
    } else {
      setGovernmentBodies((data || []) as GovernmentBody[]);
    }
  }, []);

  const fetchGovernmentUsers = useCallback(async (bodyId?: string) => {
    let query = supabase.from("government_users").select("*");
    
    if (bodyId) {
      query = query.eq("government_body_id", bodyId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching government users:", error);
    } else {
      setGovernmentUsers((data || []) as GovernmentUser[]);
    }
  }, []);

  const fetchReports = useCallback(async (bodyId?: string) => {
    let query = supabase.from("government_reports").select("*");
    
    if (bodyId) {
      query = query.eq("government_body_id", bodyId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching government reports:", error);
    } else {
      setReports((data || []) as GovernmentReport[]);
    }
  }, []);

  const fetchCountryPolicies = useCallback(async () => {
    const { data, error } = await supabase
      .from("country_policies")
      .select("*")
      .order("country_name");

    if (error) {
      console.error("Error fetching country policies:", error);
    } else {
      setCountryPolicies((data || []) as CountryPolicy[]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchGovernmentBodies(),
        fetchCountryPolicies(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchGovernmentBodies, fetchCountryPolicies]);

  const createGovernmentBody = async (body: {
    name: string;
    country: string;
    body_type: string;
    contact_email?: string;
    contact_name?: string;
  }) => {
    const { data, error } = await supabase
      .from("government_bodies")
      .insert(body)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create government body");
      return { success: false, error };
    }

    toast.success("Government body created");
    await fetchGovernmentBodies();
    return { success: true, data };
  };

  const updateGovernmentBody = async (id: string, updates: Partial<GovernmentBody>) => {
    const { error } = await supabase
      .from("government_bodies")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update government body");
      return { success: false, error };
    }

    toast.success("Government body updated");
    await fetchGovernmentBodies();
    return { success: true };
  };

  const activateIntegration = async (bodyId: string) => {
    return updateGovernmentBody(bodyId, { 
      integration_status: "active",
      agreement_signed_at: new Date().toISOString()
    });
  };

  const suspendIntegration = async (bodyId: string) => {
    return updateGovernmentBody(bodyId, { integration_status: "suspended" });
  };

  const createGovernmentUser = async (userData: {
    government_body_id: string;
    email: string;
    name: string;
    role?: string;
  }) => {
    const { data, error } = await supabase
      .from("government_users")
      .insert(userData)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create government user");
      return { success: false, error };
    }

    toast.success("Government user created");
    await fetchGovernmentUsers(userData.government_body_id);
    return { success: true, data };
  };

  const createReport = async (reportData: {
    government_body_id: string;
    report_type: string;
    report_name: string;
    description?: string;
    schedule?: string;
    format?: string;
  }) => {
    const { data, error } = await supabase
      .from("government_reports")
      .insert(reportData)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create report");
      return { success: false, error };
    }

    toast.success("Report created");
    await fetchReports(reportData.government_body_id);
    return { success: true, data };
  };

  const executeReport = async (reportId: string) => {
    const { data, error } = await supabase
      .from("government_report_executions")
      .insert({
        report_id: reportId,
        requested_by: user?.id,
        execution_status: "pending"
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to queue report execution");
      return { success: false, error };
    }

    toast.success("Report execution queued");
    return { success: true, data };
  };

  const updateCountryPolicy = async (id: string, updates: Partial<CountryPolicy>) => {
    const { error } = await supabase
      .from("country_policies")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update country policy");
      return { success: false, error };
    }

    toast.success("Country policy updated");
    await fetchCountryPolicies();
    return { success: true };
  };

  return {
    governmentBodies,
    governmentUsers,
    reports,
    countryPolicies,
    loading,
    fetchGovernmentBodies,
    fetchGovernmentUsers,
    fetchReports,
    fetchCountryPolicies,
    createGovernmentBody,
    updateGovernmentBody,
    activateIntegration,
    suspendIntegration,
    createGovernmentUser,
    createReport,
    executeReport,
    updateCountryPolicy,
  };
}

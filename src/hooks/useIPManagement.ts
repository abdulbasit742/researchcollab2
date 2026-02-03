import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export interface IPRecord {
  id: string;
  target_type: string;
  target_id: string;
  title: string;
  description: string | null;
  ip_regime: string;
  declared_by: string;
  institution_policy_id: string | null;
  status: string;
  declared_at: string;
  created_at: string;
  updated_at: string;
}

export interface IPContributor {
  id: string;
  ip_record_id: string;
  scholar_passport_id: string;
  contribution_record_id: string | null;
  ownership_percentage: number | null;
  role: string;
  rights_description: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

export interface IPLicense {
  id: string;
  ip_record_id: string;
  license_type: string;
  licensee_org_id: string | null;
  licensee_name: string | null;
  licensee_type: string | null;
  scope: string;
  territory: string;
  duration_months: number | null;
  royalty_terms: Json;
  upfront_fee: number | null;
  currency: string;
  status: string;
  signed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface CommercializationRequest {
  id: string;
  ip_record_id: string;
  requester_user_id: string | null;
  requester_org_id: string | null;
  intended_use: string;
  market_description: string | null;
  proposed_terms: Json;
  business_plan_summary: string | null;
  expected_revenue_share: number | null;
  status: string;
  review_notes: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface IPDispute {
  id: string;
  ip_record_id: string;
  raised_by: string;
  dispute_type: string;
  description: string;
  evidence_summary: string | null;
  status: string;
  resolution_summary: string | null;
  mediator_id: string | null;
  resolved_at: string | null;
  created_at: string;
}

export function useIPRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<IPRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("ip_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setRecords(data || []);
    } catch (err: any) {
      console.error("Error fetching IP records:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const declareIP = async (record: {
    target_type: string;
    target_id: string;
    title: string;
    description?: string;
    ip_regime: string;
  }) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("ip_records")
        .insert({
          ...record,
          declared_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      await fetchRecords();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateIPRecord = async (id: string, updates: Partial<IPRecord>) => {
    try {
      const { error } = await supabase
        .from("ip_records")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;
      await fetchRecords();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
    declareIP,
    updateIPRecord,
  };
}

export function useIPContributors(ipRecordId?: string) {
  const [contributors, setContributors] = useState<IPContributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributors = async () => {
      if (!ipRecordId) {
        setContributors([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("ip_contributors")
          .select("*")
          .eq("ip_record_id", ipRecordId);

        if (error) throw error;
        setContributors(data || []);
      } catch (err) {
        console.error("Error fetching contributors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, [ipRecordId]);

  const addContributor = async (contributor: Partial<IPContributor>) => {
    try {
      const { data, error } = await supabase
        .from("ip_contributors")
        .insert(contributor as any)
        .select()
        .single();

      if (error) throw error;
      setContributors(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { contributors, loading, addContributor };
}

export function useIPLicenses(ipRecordId?: string) {
  const [licenses, setLicenses] = useState<IPLicense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLicenses = useCallback(async () => {
    if (!ipRecordId) {
      setLicenses([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("ip_licenses")
        .select("*")
        .eq("ip_record_id", ipRecordId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLicenses(data || []);
    } catch (err) {
      console.error("Error fetching licenses:", err);
    } finally {
      setLoading(false);
    }
  }, [ipRecordId]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const createLicense = async (license: Partial<IPLicense>) => {
    try {
      const { data, error } = await supabase
        .from("ip_licenses")
        .insert(license as any)
        .select()
        .single();

      if (error) throw error;
      await fetchLicenses();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateLicense = async (id: string, updates: Partial<IPLicense>) => {
    try {
      const { error } = await supabase
        .from("ip_licenses")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;
      await fetchLicenses();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { licenses, loading, createLicense, updateLicense, refetch: fetchLicenses };
}

export function useCommercialization() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CommercializationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("commercialization_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching commercialization requests:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const submitRequest = async (request: {
    ip_record_id: string;
    intended_use: string;
    market_description?: string;
    proposed_terms?: Record<string, any>;
    business_plan_summary?: string;
    expected_revenue_share?: number;
  }) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("commercialization_requests")
        .insert({
          ...request,
          requester_user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      await fetchRequests();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { requests, loading, submitRequest, refetch: fetchRequests };
}

export function useIPDisputes(ipRecordId?: string) {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<IPDispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      if (!ipRecordId) {
        setDisputes([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("ip_disputes")
          .select("*")
          .eq("ip_record_id", ipRecordId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDisputes(data || []);
      } catch (err) {
        console.error("Error fetching disputes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, [ipRecordId]);

  const raiseDispute = async (dispute: {
    ip_record_id: string;
    dispute_type: string;
    description: string;
    evidence_summary?: string;
  }) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("ip_disputes")
        .insert({
          ...dispute,
          raised_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      setDisputes(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { disputes, loading, raiseDispute };
}

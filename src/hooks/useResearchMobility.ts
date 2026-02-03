import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import type { Json } from "@/integrations/supabase/types";

export interface MobilityRequest {
  id: string;
  applicant_scholar_passport_id: string;
  host_institution_id: string;
  home_institution_id: string | null;
  mobility_type: string;
  research_timeline_id: string | null;
  proposed_start_date: string;
  proposed_end_date: string;
  purpose_statement: string | null;
  funding_source: string | null;
  funding_details: Json;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MobilityAgreement {
  id: string;
  mobility_request_id: string;
  agreement_type: string;
  agreement_summary: string;
  obligations_home: string | null;
  obligations_host: string | null;
  scholar_rights: string | null;
  ip_terms: string | null;
  signed_at: string | null;
  status: string;
  created_at: string;
}

export interface MobilityApproval {
  id: string;
  mobility_request_id: string;
  approver_type: string;
  approver_user_id: string | null;
  approver_org_id: string | null;
  decision: string | null;
  conditions: string | null;
  notes: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface VisitingScholarRecord {
  id: string;
  scholar_passport_id: string;
  host_institution_id: string;
  mobility_request_id: string | null;
  active_from: string;
  active_until: string;
  access_scope: string;
  office_location: string | null;
  is_active: boolean;
  created_at: string;
}

export function useMobilityRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MobilityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("research_mobility_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err: any) {
      console.error("Error fetching mobility requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (request: Partial<MobilityRequest>) => {
    try {
      const { data, error } = await supabase
        .from("research_mobility_requests")
        .insert(request as any)
        .select()
        .single();

      if (error) throw error;
      await fetchRequests();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateRequest = async (id: string, updates: Partial<MobilityRequest>) => {
    try {
      const { error } = await supabase
        .from("research_mobility_requests")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;
      await fetchRequests();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const submitRequest = async (id: string) => {
    return updateRequest(id, { status: "submitted" });
  };

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    createRequest,
    updateRequest,
    submitRequest,
  };
}

export function useMobilityApprovals(requestId?: string) {
  const [approvals, setApprovals] = useState<MobilityApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      if (!requestId) {
        setApprovals([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("mobility_approvals")
          .select("*")
          .eq("mobility_request_id", requestId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setApprovals(data || []);
      } catch (err) {
        console.error("Error fetching approvals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [requestId]);

  const submitDecision = async (approvalId: string, decision: string, notes?: string, conditions?: string) => {
    try {
      const { error } = await supabase
        .from("mobility_approvals")
        .update({
          decision,
          notes,
          conditions,
          decided_at: new Date().toISOString(),
        })
        .eq("id", approvalId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { approvals, loading, submitDecision };
}

export function useVisitingScholar() {
  const { user } = useAuth();
  const [records, setRecords] = useState<VisitingScholarRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<VisitingScholarRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("visiting_scholar_records")
          .select("*")
          .order("active_from", { ascending: false });

        if (error) throw error;
        setRecords(data || []);
        setActiveRecord(data?.find(r => r.is_active) || null);
      } catch (err) {
        console.error("Error fetching visiting records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  return { records, activeRecord, loading };
}

export function useMobilityAgreements(requestId?: string) {
  const [agreements, setAgreements] = useState<MobilityAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgreements = async () => {
      if (!requestId) {
        setAgreements([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("mobility_agreements")
          .select("*")
          .eq("mobility_request_id", requestId);

        if (error) throw error;
        setAgreements(data || []);
      } catch (err) {
        console.error("Error fetching agreements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgreements();
  }, [requestId]);

  return { agreements, loading };
}

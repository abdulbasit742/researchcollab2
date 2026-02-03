import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface AcademicRecord {
  id: string;
  user_id: string;
  record_type: string;
  title: string;
  description: string | null;
  entity_type: string | null;
  entity_id: string | null;
  institution_id: string | null;
  supervisor_id: string | null;
  start_date: string | null;
  end_date: string | null;
  skills_demonstrated: string[] | null;
  verification_status: string;
  verified_at: string | null;
  is_public: boolean;
  created_at: string;
}

interface DigitalCredential {
  id: string;
  user_id: string;
  credential_type: string;
  title: string;
  description: string | null;
  issuer_type: string;
  issuer_name: string;
  related_record_id: string | null;
  issue_date: string;
  expiry_date: string | null;
  verification_code: string;
  is_revoked: boolean;
  created_at: string;
}

interface DataAccessRequest {
  id: string;
  user_id: string;
  request_type: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
}

interface UserConsent {
  id: string;
  user_id: string;
  consent_type: string;
  version: string;
  granted: boolean;
  granted_at: string | null;
}

export function useAcademicCredentials() {
  const { user } = useAuth();
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [credentials, setCredentials] = useState<DigitalCredential[]>([]);
  const [dataRequests, setDataRequests] = useState<DataAccessRequest[]>([]);
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAcademicRecords = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    const { data, error } = await supabase
      .from("academic_records")
      .select("*")
      .eq("user_id", targetUserId)
      .order("end_date", { ascending: false });

    if (error) {
      console.error("Error fetching academic records:", error);
    } else {
      setAcademicRecords((data || []) as AcademicRecord[]);
    }
  }, [user?.id]);

  const fetchCredentials = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    const { data, error } = await supabase
      .from("digital_credentials")
      .select("*")
      .eq("user_id", targetUserId)
      .order("issue_date", { ascending: false });

    if (error) {
      console.error("Error fetching credentials:", error);
    } else {
      setCredentials((data || []) as DigitalCredential[]);
    }
  }, [user?.id]);

  const fetchDataRequests = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("data_access_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("Error fetching data requests:", error);
    } else {
      setDataRequests((data || []) as DataAccessRequest[]);
    }
  }, [user?.id]);

  const fetchConsents = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("user_consents")
      .select("*")
      .eq("user_id", user.id)
      .order("granted_at", { ascending: false });

    if (error) {
      console.error("Error fetching consents:", error);
    } else {
      setConsents((data || []) as UserConsent[]);
    }
  }, [user?.id]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      await Promise.all([
        fetchAcademicRecords(),
        fetchCredentials(),
        fetchDataRequests(),
        fetchConsents(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [user?.id, fetchAcademicRecords, fetchCredentials, fetchDataRequests, fetchConsents]);

  const createAcademicRecord = async (record: {
    record_type: string;
    title: string;
    description?: string;
    entity_type?: string;
    entity_id?: string;
    start_date?: string;
    end_date?: string;
    skills_demonstrated?: string[];
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("academic_records")
      .insert({ ...record, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create academic record");
      return { success: false, error };
    }

    toast.success("Academic record created");
    await fetchAcademicRecords();
    return { success: true, data };
  };

  const updateAcademicRecord = async (id: string, updates: Partial<AcademicRecord>) => {
    const { error } = await supabase
      .from("academic_records")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update academic record");
      return { success: false, error };
    }

    toast.success("Academic record updated");
    await fetchAcademicRecords();
    return { success: true };
  };

  const toggleRecordVisibility = async (id: string, isPublic: boolean) => {
    return updateAcademicRecord(id, { is_public: isPublic });
  };

  const verifyCredential = async (verificationCode: string) => {
    const { data, error } = await supabase
      .from("digital_credentials")
      .select("*")
      .eq("verification_code", verificationCode)
      .eq("is_revoked", false)
      .maybeSingle();

    if (error || !data) {
      return { success: false, valid: false, credential: null };
    }

    // Log the verification
    await supabase.from("credential_verifications").insert({
      credential_id: data.id,
      verification_method: "code",
      verification_result: true,
    });

    return { success: true, valid: true, credential: data };
  };

  const requestDataExport = async () => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("data_access_requests")
      .insert({
        user_id: user.id,
        request_type: "export",
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to submit data export request");
      return { success: false, error };
    }

    toast.success("Data export request submitted");
    await fetchDataRequests();
    return { success: true, data };
  };

  const requestDataDeletion = async () => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("data_access_requests")
      .insert({
        user_id: user.id,
        request_type: "delete",
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to submit data deletion request");
      return { success: false, error };
    }

    toast.success("Data deletion request submitted - our team will review it");
    await fetchDataRequests();
    return { success: true, data };
  };

  const grantConsent = async (consentType: string, version: string) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("user_consents")
      .insert({
        user_id: user.id,
        consent_type: consentType,
        version,
        granted: true,
        granted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to record consent");
      return { success: false, error };
    }

    await fetchConsents();
    return { success: true, data };
  };

  const withdrawConsent = async (consentId: string) => {
    const { error } = await supabase
      .from("user_consents")
      .update({ 
        granted: false,
        withdrawn_at: new Date().toISOString()
      })
      .eq("id", consentId);

    if (error) {
      toast.error("Failed to withdraw consent");
      return { success: false, error };
    }

    toast.success("Consent withdrawn");
    await fetchConsents();
    return { success: true };
  };

  const getPublicRecords = async (userId: string) => {
    const { data, error } = await supabase
      .from("academic_records")
      .select("*")
      .eq("user_id", userId)
      .eq("is_public", true)
      .eq("verification_status", "verified")
      .order("end_date", { ascending: false });

    if (error) {
      return { success: false, records: [] };
    }

    return { success: true, records: data || [] };
  };

  const getPublicCredentials = async (userId: string) => {
    const { data, error } = await supabase
      .from("digital_credentials")
      .select("*")
      .eq("user_id", userId)
      .eq("is_revoked", false)
      .order("issue_date", { ascending: false });

    if (error) {
      return { success: false, credentials: [] };
    }

    return { success: true, credentials: data || [] };
  };

  return {
    academicRecords,
    credentials,
    dataRequests,
    consents,
    loading,
    fetchAcademicRecords,
    fetchCredentials,
    createAcademicRecord,
    updateAcademicRecord,
    toggleRecordVisibility,
    verifyCredential,
    requestDataExport,
    requestDataDeletion,
    grantConsent,
    withdrawConsent,
    getPublicRecords,
    getPublicCredentials,
  };
}

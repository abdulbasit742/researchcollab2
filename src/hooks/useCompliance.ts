import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PolicyAcceptance {
  id: string;
  user_id: string;
  policy_type: string;
  policy_version: string;
  accepted_at: string;
}

export interface DataAccessRequest {
  id: string;
  user_id: string;
  request_type: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
  response_file_url: string | null;
  notes: string | null;
}

const CURRENT_POLICY_VERSIONS = {
  terms_of_service: "1.0",
  privacy_policy: "1.0",
  cookie_policy: "1.0",
  ai_disclosure: "1.0",
  data_processing: "1.0",
};

export function usePolicyAcceptance() {
  const { user } = useAuth();
  const [acceptances, setAcceptances] = useState<PolicyAcceptance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAcceptances = useCallback(async () => {
    if (!user) {
      setAcceptances([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("policy_acceptances")
        .select("*")
        .eq("user_id", user.id)
        .order("accepted_at", { ascending: false });

      if (error) throw error;
      setAcceptances((data || []) as PolicyAcceptance[]);
    } catch (err) {
      console.error("Error fetching policy acceptances:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAcceptances();
  }, [fetchAcceptances]);

  const hasAcceptedPolicy = (policyType: string): boolean => {
    const currentVersion = CURRENT_POLICY_VERSIONS[policyType as keyof typeof CURRENT_POLICY_VERSIONS];
    if (!currentVersion) return true;

    return acceptances.some(
      (a) => a.policy_type === policyType && a.policy_version === currentVersion
    );
  };

  const hasAcceptedAllPolicies = (): boolean => {
    return Object.keys(CURRENT_POLICY_VERSIONS).every(hasAcceptedPolicy);
  };

  const acceptPolicy = async (policyType: string) => {
    if (!user) return { success: false };

    const version = CURRENT_POLICY_VERSIONS[policyType as keyof typeof CURRENT_POLICY_VERSIONS];
    if (!version) return { success: false };

    try {
      const { error } = await supabase.from("policy_acceptances").insert({
        user_id: user.id,
        policy_type: policyType,
        policy_version: version,
      });

      if (error) throw error;

      await fetchAcceptances();
      return { success: true };
    } catch (err: any) {
      if (err.code === "23505") {
        // Already accepted
        return { success: true };
      }
      console.error("Error accepting policy:", err);
      return { success: false, error: err.message };
    }
  };

  const acceptAllPolicies = async () => {
    if (!user) return { success: false };

    try {
      const policiesToAccept = Object.entries(CURRENT_POLICY_VERSIONS)
        .filter(([policyType]) => !hasAcceptedPolicy(policyType))
        .map(([policyType, version]) => ({
          user_id: user.id,
          policy_type: policyType,
          policy_version: version,
        }));

      if (policiesToAccept.length === 0) return { success: true };

      const { error } = await supabase.from("policy_acceptances").insert(policiesToAccept);

      if (error) throw error;

      await fetchAcceptances();
      return { success: true };
    } catch (err: any) {
      console.error("Error accepting policies:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    acceptances,
    loading,
    hasAcceptedPolicy,
    hasAcceptedAllPolicies,
    acceptPolicy,
    acceptAllPolicies,
    refetch: fetchAcceptances,
  };
}

export function useDataAccessRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DataAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("data_access_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setRequests((data || []) as DataAccessRequest[]);
    } catch (err) {
      console.error("Error fetching data access requests:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const requestDataExport = async () => {
    if (!user) {
      toast.error("Please sign in");
      return { success: false };
    }

    try {
      const { error } = await supabase.from("data_access_requests").insert({
        user_id: user.id,
        request_type: "export",
      });

      if (error) throw error;

      toast.success("Data export request submitted. We'll notify you when it's ready.");
      await fetchRequests();
      return { success: true };
    } catch (err: any) {
      toast.error("Failed to submit request");
      return { success: false, error: err.message };
    }
  };

  const requestAccountDeletion = async () => {
    if (!user) {
      toast.error("Please sign in");
      return { success: false };
    }

    try {
      const { error } = await supabase.from("data_access_requests").insert({
        user_id: user.id,
        request_type: "deletion",
      });

      if (error) throw error;

      toast.success("Account deletion request submitted. Our team will process it within 30 days.");
      await fetchRequests();
      return { success: true };
    } catch (err: any) {
      toast.error("Failed to submit request");
      return { success: false, error: err.message };
    }
  };

  const requestDataRectification = async () => {
    if (!user) {
      toast.error("Please sign in");
      return { success: false };
    }

    try {
      const { error } = await supabase.from("data_access_requests").insert({
        user_id: user.id,
        request_type: "rectification",
      });

      if (error) throw error;

      toast.success("Data rectification request submitted.");
      await fetchRequests();
      return { success: true };
    } catch (err: any) {
      toast.error("Failed to submit request");
      return { success: false, error: err.message };
    }
  };

  const pendingExportRequest = requests.find(
    (r) => r.request_type === "export" && r.status === "pending"
  );
  const pendingDeletionRequest = requests.find(
    (r) => r.request_type === "deletion" && (r.status === "pending" || r.status === "processing")
  );

  return {
    requests,
    loading,
    pendingExportRequest,
    pendingDeletionRequest,
    refetch: fetchRequests,
    requestDataExport,
    requestAccountDeletion,
    requestDataRectification,
  };
}

export function useAdminScopes() {
  const { user } = useAuth();
  const [scopes, setScopes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScopes = async () => {
      if (!user) {
        setScopes([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("admin_scopes")
          .select("scope")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (error) throw error;
        setScopes(data?.map((d) => d.scope) || []);
      } catch (err) {
        console.error("Error fetching admin scopes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScopes();
  }, [user]);

  const hasScope = (scope: string): boolean => {
    return scopes.includes("super_admin") || scopes.includes(scope);
  };

  const isSuperAdmin = scopes.includes("super_admin");
  const isModerator = hasScope("moderator");
  const isReadOnly = scopes.length === 1 && scopes[0] === "read_only";

  return {
    scopes,
    loading,
    hasScope,
    isSuperAdmin,
    isModerator,
    isReadOnly,
  };
}

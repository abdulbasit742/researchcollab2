import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types
interface ResearchDataset {
  id: string;
  owner_user_id: string;
  research_timeline_id: string | null;
  title: string;
  description: string | null;
  dataset_type: "experimental" | "survey" | "simulation" | "observational" | "mixed" | "derived";
  size_mb: number;
  access_level: "open" | "restricted" | "embargoed" | "private";
  embargo_until: string | null;
  license: string;
  doi: string | null;
  keywords: string[] | null;
  methodology_summary: string | null;
  ethical_approval_ref: string | null;
  consent_type: "full" | "limited" | "anonymized" | "exempt" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DatasetVersion {
  id: string;
  dataset_id: string;
  version_number: number;
  change_log: string;
  file_manifest: Record<string, unknown>[];
  checksum: string | null;
  total_records: number | null;
  created_by: string;
  created_at: string;
}

interface DatasetAccessRequest {
  id: string;
  dataset_id: string;
  requester_user_id: string;
  purpose: string;
  intended_use: string | null;
  institution: string | null;
  status: "pending" | "approved" | "rejected" | "revoked" | "expired";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  access_expires_at: string | null;
  created_at: string;
}

interface ReproducibilityRecord {
  id: string;
  target_type: "publication" | "research_timeline" | "research_entry";
  target_id: string;
  reproducibility_level: "not_attempted" | "partial" | "full" | "failed";
  reproduction_notes: string | null;
  methodology_documented: boolean;
  data_available: boolean;
  code_available: boolean;
  environment_specified: boolean;
  reproduced_by: string | null;
  verification_date: string | null;
  created_at: string;
}

interface OpenScienceBadge {
  id: string;
  target_type: "publication" | "research_timeline" | "dataset" | "scholar_passport";
  target_id: string;
  badge_type: "open_data" | "open_code" | "open_materials" | "reproducible_results" | "preregistered" | "transparent_methods";
  issued_by: "system" | "admin" | "institution" | "funder";
  issued_at: string;
  expires_at: string | null;
}

// Datasets Hook
export function useDatasets(timelineId?: string) {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<ResearchDataset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("research_datasets")
      .select("*")
      .order("created_at", { ascending: false });

    if (timelineId) {
      query = query.eq("research_timeline_id", timelineId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching datasets:", error);
    } else {
      setDatasets((data || []) as ResearchDataset[]);
    }
    setLoading(false);
  }, [timelineId]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const createDataset = async (dataset: {
    title: string;
    description?: string;
    dataset_type: ResearchDataset["dataset_type"];
    access_level?: ResearchDataset["access_level"];
    research_timeline_id?: string;
    license?: string;
    keywords?: string[];
    embargo_until?: string;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("research_datasets")
      .insert({
        ...dataset,
        owner_user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create dataset");
      return { success: false, error };
    }

    toast.success("Dataset created successfully");
    await fetchDatasets();
    return { success: true, data };
  };

  const updateDataset = async (id: string, updates: Partial<ResearchDataset>) => {
    const { error } = await supabase
      .from("research_datasets")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update dataset");
      return { success: false, error };
    }

    toast.success("Dataset updated");
    await fetchDatasets();
    return { success: true };
  };

  return { datasets, loading, fetchDatasets, createDataset, updateDataset };
}

// Dataset Versions Hook
export function useDatasetVersions(datasetId: string) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<DatasetVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVersions = useCallback(async () => {
    if (!datasetId) return;

    const { data, error } = await supabase
      .from("dataset_versions")
      .select("*")
      .eq("dataset_id", datasetId)
      .order("version_number", { ascending: false });

    if (error) {
      console.error("Error fetching versions:", error);
    } else {
      setVersions((data || []) as DatasetVersion[]);
    }
    setLoading(false);
  }, [datasetId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const createVersion = async (version: {
    change_log: string;
    file_manifest?: Record<string, unknown>[];
    checksum?: string;
    total_records?: number;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("dataset_versions")
      .insert({
        change_log: version.change_log,
        file_manifest: version.file_manifest as unknown as undefined,
        checksum: version.checksum,
        total_records: version.total_records,
        dataset_id: datasetId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create version");
      return { success: false, error };
    }

    toast.success("New version created");
    await fetchVersions();
    return { success: true, data };
  };

  return { versions, loading, fetchVersions, createVersion };
}

// Dataset Access Requests Hook
export function useDatasetAccess(datasetId?: string) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DatasetAccessRequest[]>([]);
  const [myRequests, setMyRequests] = useState<DatasetAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user?.id) return;

    // Fetch requests for the dataset (owner view)
    if (datasetId) {
      const { data, error } = await supabase
        .from("dataset_access_requests")
        .select("*")
        .eq("dataset_id", datasetId)
        .order("created_at", { ascending: false });

      if (!error) {
        setRequests((data || []) as DatasetAccessRequest[]);
      }
    }

    // Fetch user's own requests
    const { data: myData } = await supabase
      .from("dataset_access_requests")
      .select("*")
      .eq("requester_user_id", user.id)
      .order("created_at", { ascending: false });

    setMyRequests((myData || []) as DatasetAccessRequest[]);
    setLoading(false);
  }, [datasetId, user?.id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const requestAccess = async (request: {
    dataset_id: string;
    purpose: string;
    intended_use?: string;
    institution?: string;
    ethics_approval_ref?: string;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("dataset_access_requests")
      .insert({
        ...request,
        requester_user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to submit access request");
      return { success: false, error };
    }

    toast.success("Access request submitted");
    await fetchRequests();
    return { success: true, data };
  };

  const reviewRequest = async (requestId: string, status: "approved" | "rejected", notes?: string) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("dataset_access_requests")
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes,
      })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to review request");
      return { success: false, error };
    }

    toast.success(`Request ${status}`);
    await fetchRequests();
    return { success: true };
  };

  return { requests, myRequests, loading, fetchRequests, requestAccess, reviewRequest };
}

// Reproducibility Hook
export function useReproducibility(targetType?: string, targetId?: string) {
  const { user } = useAuth();
  const [records, setRecords] = useState<ReproducibilityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    let query = supabase
      .from("reproducibility_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (targetType && targetId) {
      query = query.eq("target_type", targetType).eq("target_id", targetId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching reproducibility records:", error);
    } else {
      setRecords((data || []) as ReproducibilityRecord[]);
    }
    setLoading(false);
  }, [targetType, targetId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const createRecord = async (record: {
    target_type: ReproducibilityRecord["target_type"];
    target_id: string;
    reproducibility_level: ReproducibilityRecord["reproducibility_level"];
    reproduction_notes?: string;
    methodology_documented?: boolean;
    data_available?: boolean;
    code_available?: boolean;
    environment_specified?: boolean;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("reproducibility_records")
      .insert({
        ...record,
        reproduced_by: user.id,
        verification_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create reproducibility record");
      return { success: false, error };
    }

    toast.success("Reproducibility record created");
    await fetchRecords();
    return { success: true, data };
  };

  return { records, loading, fetchRecords, createRecord };
}

// Open Science Badges Hook
export function useOpenScienceBadges(targetType?: string, targetId?: string) {
  const [badges, setBadges] = useState<OpenScienceBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    let query = supabase
      .from("open_science_badges")
      .select("*")
      .order("issued_at", { ascending: false });

    if (targetType && targetId) {
      query = query.eq("target_type", targetType).eq("target_id", targetId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching badges:", error);
    } else {
      setBadges((data || []) as OpenScienceBadge[]);
    }
    setLoading(false);
  }, [targetType, targetId]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return { badges, loading, fetchBadges };
}

// Dataset Usage Tracking
export function useDatasetUsage(datasetId: string) {
  const { user } = useAuth();

  const logUsage = async (usageType: "view" | "download" | "cite" | "derive") => {
    await supabase.from("dataset_usage_logs").insert({
      dataset_id: datasetId,
      user_id: user?.id || null,
      usage_type: usageType,
    });
  };

  return { logUsage };
}

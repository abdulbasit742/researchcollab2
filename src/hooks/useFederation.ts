import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types for federation & interoperability
export interface ApiClient {
  id: string;
  client_name: string;
  client_secret_hash: string;
  owner_entity_type: "user" | "organization" | "institution";
  owner_entity_id: string;
  scopes: string[];
  rate_limit_per_hour: number;
  status: "active" | "suspended" | "revoked";
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface FederatedNode {
  id: string;
  node_name: string;
  node_type: "institutional_repo" | "national_portal" | "publisher" | "funder" | "research_network";
  base_url: string;
  trust_level: "limited" | "trusted" | "verified";
  federation_protocol: string;
  public_key: string | null;
  capabilities: string[];
  status: "active" | "suspended" | "decommissioned";
  registered_at: string;
  last_sync_at: string | null;
}

export interface DataExchangeLog {
  id: string;
  source_node_id: string | null;
  target_node_id: string | null;
  data_type: "publication" | "dataset" | "metadata" | "funding_record" | "identity" | "citation";
  exchange_direction: "inbound" | "outbound";
  consent_reference: string | null;
  record_count: number;
  status: "pending" | "completed" | "failed" | "rejected";
  exchanged_at: string;
}

export interface ExportPackage {
  id: string;
  requested_by: string;
  export_scope: "profile" | "research" | "publications" | "datasets" | "full_account";
  format: "json" | "xml" | "zip" | "bagit";
  status: "processing" | "ready" | "expired" | "failed";
  download_url: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface IntegrationMapping {
  id: string;
  external_system: "orcid" | "crossref" | "datacite" | "institutional_cris" | "pubmed" | "arxiv";
  internal_entity_type: string;
  internal_entity_id: string;
  external_identifier: string;
  mapping_metadata: Record<string, unknown>;
  verified: boolean;
  last_synced_at: string | null;
  created_at: string;
}

export function useApiAccess() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's API clients
  const fetchApiClients = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("api_clients")
        .select("*")
        .eq("owner_entity_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setClients(data as ApiClient[]);
      return data as ApiClient[];
    } catch (err) {
      console.error("Error fetching API clients:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create new API client
  const createApiClient = useCallback(async (
    clientName: string,
    scopes: string[],
    rateLimitPerHour?: number
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    // Generate a simple hash for demo purposes (in production, use proper hashing)
    const secretHash = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const { data, error } = await supabase
      .from("api_clients")
      .insert({
        client_name: clientName,
        client_secret_hash: secretHash,
        owner_entity_type: "user",
        owner_entity_id: user.id,
        scopes,
        rate_limit_per_hour: rateLimitPerHour || 1000,
      })
      .select()
      .single();
    
    if (error) throw error;
    await fetchApiClients();
    return { client: data as ApiClient, secret: secretHash };
  }, [user, fetchApiClients]);

  // Revoke API client
  const revokeApiClient = useCallback(async (clientId: string) => {
    const { error } = await supabase
      .from("api_clients")
      .update({ status: "revoked" })
      .eq("id", clientId);
    
    if (error) throw error;
    await fetchApiClients();
  }, [fetchApiClients]);

  return {
    clients,
    loading,
    fetchApiClients,
    createApiClient,
    revokeApiClient,
  };
}

export function useFederatedNodes() {
  const [nodes, setNodes] = useState<FederatedNode[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch federated nodes
  const fetchNodes = useCallback(async (filters?: {
    nodeType?: string;
    trustLevel?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase.from("federated_nodes").select("*");
      
      if (filters?.nodeType) {
        query = query.eq("node_type", filters.nodeType);
      }
      if (filters?.trustLevel) {
        query = query.eq("trust_level", filters.trustLevel);
      }
      
      const { data, error } = await query
        .eq("status", "active")
        .order("registered_at", { ascending: false });
      
      if (error) throw error;
      setNodes(data as FederatedNode[]);
      return data as FederatedNode[];
    } catch (err) {
      console.error("Error fetching federated nodes:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch exchange logs
  const fetchExchangeLogs = useCallback(async (nodeId?: string) => {
    try {
      let query = supabase.from("data_exchange_logs").select("*");
      
      if (nodeId) {
        query = query.or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`);
      }
      
      const { data, error } = await query
        .order("exchanged_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as DataExchangeLog[];
    } catch (err) {
      console.error("Error fetching exchange logs:", err);
      return [];
    }
  }, []);

  return {
    nodes,
    loading,
    fetchNodes,
    fetchExchangeLogs,
  };
}

export function useDataExport() {
  const { user } = useAuth();
  const [exports, setExports] = useState<ExportPackage[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's export packages
  const fetchExports = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("export_packages")
        .select("*")
        .eq("requested_by", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setExports(data as ExportPackage[]);
      return data as ExportPackage[];
    } catch (err) {
      console.error("Error fetching exports:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Request new export
  const requestExport = useCallback(async (
    scope: ExportPackage["export_scope"],
    format: ExportPackage["format"]
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("export_packages")
      .insert({
        requested_by: user.id,
        export_scope: scope,
        format,
        status: "processing",
      })
      .select()
      .single();
    
    if (error) throw error;
    await fetchExports();
    return data as ExportPackage;
  }, [user, fetchExports]);

  return {
    exports,
    loading,
    fetchExports,
    requestExport,
  };
}

export function useIntegrationMappings() {
  const [mappings, setMappings] = useState<IntegrationMapping[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch integration mappings
  const fetchMappings = useCallback(async (entityId?: string, entityType?: string) => {
    setLoading(true);
    try {
      let query = supabase.from("integration_mappings").select("*");
      
      if (entityId) {
        query = query.eq("internal_entity_id", entityId);
      }
      if (entityType) {
        query = query.eq("internal_entity_type", entityType);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      setMappings(data as IntegrationMapping[]);
      return data as IntegrationMapping[];
    } catch (err) {
      console.error("Error fetching integration mappings:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mappings,
    loading,
    fetchMappings,
  };
}

// ── Platform Node Hooks (Federation Infrastructure) ──
const FED_STALE = 10 * 60 * 1000;

export function usePlatformNodes() {
  return useQuery({
    queryKey: ["platform-nodes"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_nodes").select("*").order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    staleTime: FED_STALE,
  });
}

export function useNodeGovernanceMetrics(nodeId?: string) {
  return useQuery({
    queryKey: ["node-gov-metrics", nodeId],
    queryFn: async () => {
      if (!nodeId) return null;
      const { data } = await supabase.from("node_governance_metrics").select("*").eq("node_id", nodeId).order("generated_at", { ascending: false }).limit(1).maybeSingle();
      return data as any | null;
    },
    enabled: !!nodeId,
    staleTime: FED_STALE,
  });
}

export function useFederationMetadata(nodeId?: string) {
  return useQuery({
    queryKey: ["fed-metadata", nodeId],
    queryFn: async () => {
      let q = supabase.from("federation_metadata_registry").select("*").order("registered_at", { ascending: false }).limit(20);
      if (nodeId) q = q.eq("node_origin", nodeId);
      const { data } = await q;
      return (data ?? []) as any[];
    },
    staleTime: FED_STALE,
  });
}

export function useFederatedDiscovery(nodeId?: string) {
  return useQuery({
    queryKey: ["fed-discovery", nodeId],
    queryFn: async () => {
      let q = supabase.from("federated_discovery_index").select("*").order("created_at", { ascending: false }).limit(20);
      if (nodeId) q = q.eq("node_id", nodeId);
      const { data } = await q;
      return (data ?? []) as any[];
    },
    staleTime: FED_STALE,
  });
}

export function useInteroperabilityEndpoints(nodeId?: string) {
  return useQuery({
    queryKey: ["interop-endpoints", nodeId],
    queryFn: async () => {
      let q = supabase.from("interoperability_endpoints").select("*").order("created_at", { ascending: false }).limit(20);
      if (nodeId) q = q.eq("node_id", nodeId);
      const { data } = await q;
      return (data ?? []) as any[];
    },
    staleTime: FED_STALE,
  });
}

export function useFederatedIdentityLinks() {
  return useQuery({
    queryKey: ["fed-identity-links"],
    queryFn: async () => {
      const { data } = await supabase.from("federated_identity_links").select("*").order("created_at", { ascending: false }).limit(20);
      return (data ?? []) as any[];
    },
    staleTime: FED_STALE,
  });
}

export function useFederationComplianceFlags(nodeId?: string) {
  return useQuery({
    queryKey: ["fed-compliance", nodeId],
    queryFn: async () => {
      if (!nodeId) return null;
      const { data } = await supabase.from("federation_compliance_flags").select("*").eq("node_id", nodeId).order("generated_at", { ascending: false }).limit(1).maybeSingle();
      return data as any | null;
    },
    enabled: !!nodeId,
    staleTime: FED_STALE,
  });
}

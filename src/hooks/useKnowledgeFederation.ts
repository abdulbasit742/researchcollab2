import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DeploymentNode {
  id: string;
  node_name: string;
  region: string;
  owner_type: string;
  compliance_profile: Record<string, unknown>;
  federation_status: string;
  trust_interoperability_level: string;
  is_active: boolean;
  created_at: string;
}

export interface FederationAgreement {
  id: string;
  source_node_id: string;
  target_node_id: string;
  agreement_type: string;
  data_exchange_scope: Record<string, boolean>;
  status: string;
  created_at: string;
}

export interface FederatedClaim {
  global_claim_id: string;
  topic_tags: string[];
  influence_score: number;
  institution_origin: string;
  trust_weight: number;
  data_residency_tag: string;
  is_restricted: boolean;
  message?: string;
}

export interface FederationAuditLog {
  id: string;
  action_type: string;
  resource_type: string;
  was_blocked: boolean;
  block_reason: string | null;
  created_at: string;
}

export function useKnowledgeFederation() {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<DeploymentNode[]>([]);
  const [agreements, setAgreements] = useState<FederationAgreement[]>([]);
  const [searchResults, setSearchResults] = useState<FederatedClaim[]>([]);
  const [auditLogs, setAuditLogs] = useState<FederationAuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNodes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await (supabase as any).from("deployment_nodes").select("*").order("created_at", { ascending: false });
      setNodes(data || []);
    } finally { setLoading(false); }
  }, []);

  const fetchAgreements = useCallback(async () => {
    const { data } = await (supabase as any).from("federation_agreements").select("*").order("created_at", { ascending: false });
    setAgreements(data || []);
  }, []);

  const fetchAuditLogs = useCallback(async (limit = 50) => {
    const { data } = await (supabase as any).from("federation_audit_logs").select("*").order("created_at", { ascending: false }).limit(limit);
    setAuditLogs(data || []);
  }, []);

  const createNode = useCallback(async (params: { node_name: string; region: string; owner_type: string; federation_status: string; compliance_profile?: Record<string, unknown> }) => {
    const { error } = await (supabase as any).from("deployment_nodes").insert(params);
    if (error) { toast.error(error.message); return false; }
    toast.success("Deployment node created");
    await fetchNodes();
    return true;
  }, [fetchNodes]);

  const createAgreement = useCallback(async (params: { source_node_id: string; target_node_id: string; agreement_type: string }) => {
    const { error } = await (supabase as any).from("federation_agreements").insert({
      ...params,
      data_exchange_scope: { claims_metadata: true, full_documents: false, funding_details: false, trust_scores: true },
    });
    if (error) { toast.error(error.message); return false; }
    toast.success("Federation agreement created");
    await fetchAgreements();
    return true;
  }, [fetchAgreements]);

  const activateAgreement = useCallback(async (id: string) => {
    const { error } = await (supabase as any).from("federation_agreements").update({ status: "active" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Agreement activated");
    await fetchAgreements();
  }, [fetchAgreements]);

  const federatedSearch = useCallback(async (queryText: string, regionFilter?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "federated_search", query_text: queryText, region_filter: regionFilter },
      });
      if (error) throw error;
      setSearchResults(data?.results || []);
    } catch (e: any) {
      toast.error(e.message || "Search failed");
    } finally { setLoading(false); }
  }, []);

  const validateCompliance = useCallback(async (sourceNodeId: string, targetNodeId: string, requestedAction: string) => {
    const { data, error } = await supabase.functions.invoke("research-intelligence", {
      body: { action: "validate_compliance", source_node_id: sourceNodeId, target_node_id: targetNodeId, requested_action: requestedAction },
    });
    if (error) { toast.error("Compliance check failed"); return null; }
    return data as { passed: boolean; violations: string[] };
  }, []);

  const stats = {
    totalNodes: nodes.length,
    activeNodes: nodes.filter(n => n.is_active).length,
    federatedNodes: nodes.filter(n => n.federation_status === "federated").length,
    isolatedNodes: nodes.filter(n => n.federation_status === "isolated").length,
    activeAgreements: agreements.filter(a => a.status === "active").length,
    blockedActions: auditLogs.filter(l => l.was_blocked).length,
  };

  return {
    nodes, agreements, searchResults, auditLogs, loading, stats,
    fetchNodes, fetchAgreements, fetchAuditLogs,
    createNode, createAgreement, activateAgreement,
    federatedSearch, validateCompliance,
  };
}

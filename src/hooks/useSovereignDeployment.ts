import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type DeploymentType = "saas" | "dedicated" | "sovereign";
export type GovernanceMode = "platform" | "delegated" | "autonomous";
export type IsolationLevel = "shared" | "logical" | "physical";

export interface DeploymentInstance {
  id: string;
  instance_name: string;
  instance_code: string;
  instance_type: DeploymentType;
  owner_entity_type: string;
  owner_entity_id: string | null;
  owner_contact_email: string | null;
  region: string;
  data_residency_country: string | null;
  data_residency_certified: boolean;
  data_residency_certificate_url: string | null;
  isolation_level: IsolationLevel;
  database_cluster_id: string | null;
  storage_bucket_prefix: string | null;
  auth_tenant_id: string | null;
  stripe_account_id: string | null;
  payment_provider: string;
  local_payment_config: Record<string, unknown> | null;
  governance_mode: GovernanceMode;
  governance_authority_name: string | null;
  governance_authority_contact: string | null;
  network_mode: string;
  allowed_outbound_domains: string[] | null;
  local_services_config: Record<string, unknown> | null;
  status: string;
  provisioned_at: string | null;
  last_health_check: string | null;
  health_status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface DeploymentConfiguration {
  id: string;
  deployment_instance_id: string;
  config_key: string;
  config_value: unknown;
  config_type: string;
  overrides_default: boolean;
  default_value: unknown | null;
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataResidencyProof {
  id: string;
  deployment_instance_id: string;
  proof_type: string;
  proof_timestamp: string;
  data_location_verified: string;
  verification_method: string;
  verifier_entity: string | null;
  proof_hash: string;
  proof_signature: string | null;
  proof_certificate_chain: string | null;
  evidence_urls: string[] | null;
  evidence_metadata: Record<string, unknown> | null;
  valid_from: string;
  valid_until: string | null;
  is_current: boolean;
  created_at: string;
}

export interface DeploymentComplianceStatus {
  id: string;
  deployment_instance_id: string;
  compliance_framework: string;
  status: string;
  last_assessment_at: string | null;
  next_assessment_due: string | null;
  finding_count: number;
  critical_findings: number;
  remediation_plan_url: string | null;
  is_certified: boolean;
  certificate_url: string | null;
  certificate_expires_at: string | null;
  certifying_authority: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeploymentAdmin {
  id: string;
  deployment_instance_id: string;
  user_id: string;
  admin_role: string;
  can_modify_config: boolean;
  can_approve_updates: boolean;
  can_access_data: boolean;
  can_manage_admins: boolean;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
}

export interface IsolationAuditEntry {
  id: string;
  source_instance_id: string | null;
  target_instance_id: string | null;
  access_type: string;
  access_path: string | null;
  accessor_user_id: string | null;
  was_blocked: boolean;
  block_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export function useSovereignDeployment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [instances, setInstances] = useState<DeploymentInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("deployment_instances" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setInstances((data as unknown as DeploymentInstance[]) || []);
    } catch (err: any) {
      console.error("Error fetching deployment instances:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const createInstance = async (
    data: Partial<DeploymentInstance>
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data: newInstance, error: createError } = await supabase
        .from("deployment_instances" as any)
        .insert({
          ...data,
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      toast({
        title: "Deployment Created",
        description: `Instance ${data.instance_name} has been created.`,
      });

      await fetchInstances();
      return { success: true, id: (newInstance as any).id };
    } catch (err: any) {
      console.error("Error creating deployment:", err);
      toast({
        title: "Creation Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const updateInstance = async (
    id: string,
    data: Partial<DeploymentInstance>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: updateError } = await supabase
        .from("deployment_instances" as any)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (updateError) throw updateError;

      toast({
        title: "Deployment Updated",
        description: "Instance configuration has been updated.",
      });

      await fetchInstances();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating deployment:", err);
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const provisionSovereignInstance = async (
    instanceId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: updateError } = await supabase
        .from("deployment_instances" as any)
        .update({
          status: "active",
          provisioned_at: new Date().toISOString(),
          last_health_check: new Date().toISOString(),
          health_status: "healthy",
        })
        .eq("id", instanceId);

      if (updateError) throw updateError;

      toast({
        title: "Instance Provisioned",
        description: "Sovereign deployment is now active.",
      });

      await fetchInstances();
      return { success: true };
    } catch (err: any) {
      console.error("Error provisioning instance:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    instances,
    loading,
    error,
    refetch: fetchInstances,
    createInstance,
    updateInstance,
    provisionSovereignInstance,
  };
}

export function useDeploymentConfigurations(deploymentId?: string) {
  const [configurations, setConfigurations] = useState<DeploymentConfiguration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deploymentId) {
      setConfigurations([]);
      setLoading(false);
      return;
    }

    const fetchConfigs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("deployment_configurations" as any)
          .select("*")
          .eq("deployment_instance_id", deploymentId)
          .order("config_key");

        if (error) throw error;
        setConfigurations((data as unknown as DeploymentConfiguration[]) || []);
      } catch (err) {
        console.error("Error fetching configurations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, [deploymentId]);

  const setConfiguration = async (
    configKey: string,
    configValue: unknown,
    configType: string = "feature"
  ): Promise<{ success: boolean; error?: string }> => {
    if (!deploymentId) return { success: false, error: "No deployment selected" };

    try {
      const { error } = await supabase
        .from("deployment_configurations" as any)
        .upsert({
          deployment_instance_id: deploymentId,
          config_key: configKey,
          config_value: configValue,
          config_type: configType,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "deployment_instance_id,config_key",
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error setting configuration:", err);
      return { success: false, error: err.message };
    }
  };

  return { configurations, loading, setConfiguration };
}

export function useDataResidencyProofs(deploymentId?: string) {
  const [proofs, setProofs] = useState<DataResidencyProof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deploymentId) {
      setProofs([]);
      setLoading(false);
      return;
    }

    const fetchProofs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("data_residency_proofs" as any)
          .select("*")
          .eq("deployment_instance_id", deploymentId)
          .order("proof_timestamp", { ascending: false });

        if (error) throw error;
        setProofs((data as unknown as DataResidencyProof[]) || []);
      } catch (err) {
        console.error("Error fetching residency proofs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProofs();
  }, [deploymentId]);

  return { proofs, loading };
}

export function useDeploymentCompliance(deploymentId?: string) {
  const [compliance, setCompliance] = useState<DeploymentComplianceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deploymentId) {
      setCompliance([]);
      setLoading(false);
      return;
    }

    const fetchCompliance = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("deployment_compliance_status" as any)
          .select("*")
          .eq("deployment_instance_id", deploymentId)
          .order("compliance_framework");

        if (error) throw error;
        setCompliance((data as unknown as DeploymentComplianceStatus[]) || []);
      } catch (err) {
        console.error("Error fetching compliance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompliance();
  }, [deploymentId]);

  return { compliance, loading };
}

export function useIsolationAudit(deploymentId?: string) {
  const [auditEntries, setAuditEntries] = useState<IsolationAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deploymentId) {
      setAuditEntries([]);
      setLoading(false);
      return;
    }

    const fetchAudit = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("deployment_isolation_audit" as any)
          .select("*")
          .or(`source_instance_id.eq.${deploymentId},target_instance_id.eq.${deploymentId}`)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        setAuditEntries((data as unknown as IsolationAuditEntry[]) || []);
      } catch (err) {
        console.error("Error fetching isolation audit:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [deploymentId]);

  return { auditEntries, loading };
}

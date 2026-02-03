import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface InfrastructureContract {
  id: string;
  contract_type: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string;
  country_code: string | null;
  contract_value: number | null;
  currency: string;
  billing_cycle: string | null;
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  services_included: Json;
  usage_limits: Json;
  status: string;
  signed_at: string | null;
  created_at: string;
}

interface ContractUsage {
  id: string;
  contract_id: string;
  usage_period_start: string;
  usage_period_end: string;
  api_calls: number;
  reports_generated: number;
  users_active: number;
  storage_used_mb: number;
  ai_credits_used: number;
}

interface GovernanceRole {
  id: string;
  role_name: string;
  role_level: number;
  permissions: Json;
  succession_order: number | null;
  requires_mfa: boolean;
  max_holders: number | null;
  description: string | null;
}

interface GovernanceAssignment {
  id: string;
  user_id: string;
  governance_role_id: string;
  assigned_by: string | null;
  assigned_at: string;
  expires_at: string | null;
  is_active: boolean;
  succession_priority: number | null;
}

export function useInfrastructureContracts() {
  const [contracts, setContracts] = useState<InfrastructureContract[]>([]);
  const [contractUsage, setContractUsage] = useState<ContractUsage[]>([]);
  const [governanceRoles, setGovernanceRoles] = useState<GovernanceRole[]>([]);
  const [governanceAssignments, setGovernanceAssignments] = useState<GovernanceAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = useCallback(async () => {
    const { data, error } = await supabase
      .from("infrastructure_contracts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contracts:", error);
    } else {
      setContracts((data || []) as InfrastructureContract[]);
    }
  }, []);

  const fetchContractUsage = useCallback(async (contractId: string) => {
    const { data, error } = await supabase
      .from("contract_usage")
      .select("*")
      .eq("contract_id", contractId)
      .order("usage_period_start", { ascending: false });

    if (error) {
      console.error("Error fetching contract usage:", error);
    } else {
      setContractUsage((data || []) as ContractUsage[]);
    }
  }, []);

  const fetchGovernanceRoles = useCallback(async () => {
    const { data, error } = await supabase
      .from("governance_roles")
      .select("*")
      .order("role_level");

    if (error) {
      console.error("Error fetching governance roles:", error);
    } else {
      setGovernanceRoles((data || []) as GovernanceRole[]);
    }
  }, []);

  const fetchGovernanceAssignments = useCallback(async () => {
    const { data, error } = await supabase
      .from("governance_assignments")
      .select("*")
      .eq("is_active", true)
      .order("succession_priority");

    if (error) {
      console.error("Error fetching governance assignments:", error);
    } else {
      setGovernanceAssignments((data || []) as GovernanceAssignment[]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchContracts(),
        fetchGovernanceRoles(),
        fetchGovernanceAssignments(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchContracts, fetchGovernanceRoles, fetchGovernanceAssignments]);

  const createContract = async (contract: {
    contract_type: string;
    entity_type: string;
    entity_name: string;
    start_date: string;
    country_code?: string;
    contract_value?: number;
    billing_cycle?: string;
    end_date?: string;
    services_included?: Json;
    usage_limits?: Json;
  }) => {
    const { data, error } = await supabase
      .from("infrastructure_contracts")
      .insert(contract)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create contract");
      return { success: false, error };
    }

    toast.success("Contract created");
    await fetchContracts();
    return { success: true, data };
  };

  const updateContract = async (id: string, updates: Partial<{
    status: string;
    contract_value: number;
    end_date: string;
    auto_renew: boolean;
    signed_by: string;
    signed_at: string;
  }>) => {
    const { error } = await supabase
      .from("infrastructure_contracts")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update contract");
      return { success: false, error };
    }

    toast.success("Contract updated");
    await fetchContracts();
    return { success: true };
  };

  const activateContract = async (id: string, signedBy: string) => {
    return updateContract(id, {
      status: "active",
      signed_by: signedBy,
      signed_at: new Date().toISOString()
    });
  };

  const terminateContract = async (id: string) => {
    return updateContract(id, { status: "terminated" });
  };

  const recordUsage = async (usage: {
    contract_id: string;
    usage_period_start: string;
    usage_period_end: string;
    api_calls?: number;
    reports_generated?: number;
    users_active?: number;
    storage_used_mb?: number;
    ai_credits_used?: number;
  }) => {
    const { data, error } = await supabase
      .from("contract_usage")
      .insert(usage)
      .select()
      .single();

    if (error) {
      toast.error("Failed to record usage");
      return { success: false, error };
    }

    return { success: true, data };
  };

  const assignGovernanceRole = async (
    userId: string,
    roleId: string,
    assignedBy: string,
    successionPriority?: number
  ) => {
    const { data, error } = await supabase
      .from("governance_assignments")
      .insert({
        user_id: userId,
        governance_role_id: roleId,
        assigned_by: assignedBy,
        succession_priority: successionPriority,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to assign governance role");
      return { success: false, error };
    }

    toast.success("Governance role assigned");
    await fetchGovernanceAssignments();
    return { success: true, data };
  };

  const revokeGovernanceRole = async (assignmentId: string) => {
    const { error } = await supabase
      .from("governance_assignments")
      .update({ is_active: false })
      .eq("id", assignmentId);

    if (error) {
      toast.error("Failed to revoke governance role");
      return { success: false, error };
    }

    toast.success("Governance role revoked");
    await fetchGovernanceAssignments();
    return { success: true };
  };

  const getContractStats = () => {
    const active = contracts.filter(c => c.status === "active").length;
    const pending = contracts.filter(c => c.status === "pending").length;
    const totalValue = contracts
      .filter(c => c.status === "active")
      .reduce((sum, c) => sum + (c.contract_value || 0), 0);

    return { active, pending, totalValue };
  };

  const getSuccessionChain = () => {
    return governanceAssignments
      .sort((a, b) => (a.succession_priority || 999) - (b.succession_priority || 999))
      .map(assignment => {
        const role = governanceRoles.find(r => r.id === assignment.governance_role_id);
        return { ...assignment, role };
      });
  };

  return {
    contracts,
    contractUsage,
    governanceRoles,
    governanceAssignments,
    loading,
    fetchContracts,
    fetchContractUsage,
    fetchGovernanceRoles,
    fetchGovernanceAssignments,
    createContract,
    updateContract,
    activateContract,
    terminateContract,
    recordUsage,
    assignGovernanceRole,
    revokeGovernanceRole,
    getContractStats,
    getSuccessionChain,
  };
}

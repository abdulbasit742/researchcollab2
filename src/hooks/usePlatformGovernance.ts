import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import type { Json } from "@/integrations/supabase/types";

interface PlatformCharter {
  id: string;
  charter_type: string;
  title: string;
  version: string;
  content: string;
  rationale: string | null;
  effective_from: string;
  is_active: boolean;
  amendment_process: string | null;
  created_at: string;
}

interface GovernanceCouncil {
  id: string;
  council_type: string;
  name: string;
  description: string | null;
  authority_scope: Json;
  quorum_requirement: number;
  term_length_months: number | null;
  max_members: number | null;
  min_members: number;
  can_be_dissolved: boolean;
  created_at: string;
}

interface CouncilMembership {
  id: string;
  council_id: string;
  user_id: string | null;
  external_member_name: string | null;
  external_member_org: string | null;
  role_in_council: string;
  voting_power: number;
  started_at: string;
  ends_at: string | null;
  succession_priority: number | null;
  is_active: boolean;
  council?: GovernanceCouncil;
}

interface CouncilDecision {
  id: string;
  council_id: string;
  decision_type: string;
  title: string;
  description: string;
  rationale: string | null;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  quorum_met: boolean | null;
  decision_outcome: string | null;
  implementation_deadline: string | null;
  implemented_at: string | null;
  created_at: string;
  council?: GovernanceCouncil;
}

interface EmergencyProtocol {
  id: string;
  protocol_name: string;
  trigger_conditions: Record<string, unknown>;
  severity_level: number;
  powers_granted: Record<string, unknown>;
  time_limit_hours: number | null;
  requires_council: string[] | null;
  is_active: boolean;
}

interface EmergencyActivation {
  id: string;
  protocol_id: string;
  activated_by: string;
  activation_reason: string;
  activated_at: string;
  deactivated_at: string | null;
  actions_taken: unknown[];
  protocol?: EmergencyProtocol;
}

export function usePlatformGovernance() {
  const { user } = useAuth();
  const [charters, setCharters] = useState<PlatformCharter[]>([]);
  const [councils, setCouncils] = useState<GovernanceCouncil[]>([]);
  const [memberships, setMemberships] = useState<CouncilMembership[]>([]);
  const [decisions, setDecisions] = useState<CouncilDecision[]>([]);
  const [emergencyProtocols, setEmergencyProtocols] = useState<EmergencyProtocol[]>([]);
  const [activeEmergencies, setActiveEmergencies] = useState<EmergencyActivation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const fetchGovernanceData = async () => {
    setLoading(true);
    try {
      const [
        chartersRes,
        councilsRes,
        membershipsRes,
        decisionsRes,
        protocolsRes,
        emergenciesRes,
      ] = await Promise.all([
        supabase.from("platform_charters").select("*").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("governance_councils").select("*").order("council_type"),
        supabase.from("council_memberships").select("*, council:governance_councils(*)").eq("is_active", true),
        supabase.from("council_decisions").select("*, council:governance_councils(*)").order("created_at", { ascending: false }).limit(50),
        supabase.from("emergency_protocols").select("*").eq("is_active", true),
        supabase.from("emergency_activations").select("*, protocol:emergency_protocols(*)").is("deactivated_at", null),
      ]);

      if (chartersRes.data) setCharters(chartersRes.data as PlatformCharter[]);
      if (councilsRes.data) setCouncils(councilsRes.data as GovernanceCouncil[]);
      if (membershipsRes.data) setMemberships(membershipsRes.data as CouncilMembership[]);
      if (decisionsRes.data) setDecisions(decisionsRes.data as CouncilDecision[]);
      if (protocolsRes.data) setEmergencyProtocols(protocolsRes.data as EmergencyProtocol[]);
      if (emergenciesRes.data) setActiveEmergencies(emergenciesRes.data as EmergencyActivation[]);
    } catch (error) {
      console.error("Error fetching governance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCharter = async (charter: Omit<PlatformCharter, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("platform_charters").insert([charter]);
      if (error) throw error;
      toast.success("Charter created successfully");
      fetchGovernanceData();
      return true;
    } catch (error) {
      console.error("Error creating charter:", error);
      toast.error("Failed to create charter");
      return false;
    }
  };

  const createCouncil = async (council: Omit<GovernanceCouncil, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("governance_councils").insert([council]);
      if (error) throw error;
      toast.success("Council created successfully");
      fetchGovernanceData();
      return true;
    } catch (error) {
      console.error("Error creating council:", error);
      toast.error("Failed to create council");
      return false;
    }
  };

  const addCouncilMember = async (membership: { council_id: string; role_in_council: string; user_id?: string; external_member_name?: string }) => {
    try {
      const { error } = await supabase.from("council_memberships").insert([membership]);
      if (error) throw error;
      toast.success("Council member added");
      fetchGovernanceData();
      return true;
    } catch (error) {
      console.error("Error adding council member:", error);
      toast.error("Failed to add council member");
      return false;
    }
  };

  const createDecision = async (decision: { council_id: string; decision_type: string; title: string; description: string }) => {
    try {
      const { error } = await supabase.from("council_decisions").insert([decision]);
      if (error) throw error;
      toast.success("Decision recorded");
      fetchGovernanceData();
      return true;
    } catch (error) {
      console.error("Error creating decision:", error);
      toast.error("Failed to record decision");
      return false;
    }
  };

  const activateEmergency = async (protocolId: string, reason: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from("emergency_activations").insert({
        protocol_id: protocolId,
        activated_by: user.id,
        activation_reason: reason,
      });
      if (error) throw error;
      toast.success("Emergency protocol activated");
      fetchGovernanceData();
      return true;
    } catch (error) {
      console.error("Error activating emergency:", error);
      toast.error("Failed to activate emergency protocol");
      return false;
    }
  };

  const deactivateEmergency = async (activationId: string, reason: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("emergency_activations")
        .update({
          deactivated_at: new Date().toISOString(),
          deactivated_by: user.id,
          deactivation_reason: reason,
        })
        .eq("id", activationId);
      if (error) throw error;
      toast.success("Emergency protocol deactivated");
      fetchGovernanceData();
      return true;
    } catch (error) {
      console.error("Error deactivating emergency:", error);
      toast.error("Failed to deactivate emergency protocol");
      return false;
    }
  };

  const getGovernanceStats = () => {
    return {
      activeCharters: charters.filter((c) => c.is_active).length,
      totalCouncils: councils.length,
      activeMembers: memberships.filter((m) => m.is_active).length,
      pendingDecisions: decisions.filter((d) => d.decision_outcome === "pending").length,
      activeEmergencies: activeEmergencies.length,
    };
  };

  return {
    charters,
    councils,
    memberships,
    decisions,
    emergencyProtocols,
    activeEmergencies,
    loading,
    createCharter,
    createCouncil,
    addCouncilMember,
    createDecision,
    activateEmergency,
    deactivateEmergency,
    getGovernanceStats,
    refresh: fetchGovernanceData,
  };
}

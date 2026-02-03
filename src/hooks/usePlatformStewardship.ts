import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =============================================
// FEATURE 30: Platform Self-Evolution & Stewardship
// =============================================

export interface PlatformMission {
  id: string;
  version_number: number;
  mission_statement: string;
  core_principles: string[];
  non_negotiables: string[];
  adopted_by_constitution_version?: number;
  adopted_at: string;
  superseded_by_version?: number;
  superseded_at?: string;
}

export interface StewardshipEntity {
  id: string;
  entity_type: 'foundation' | 'trust' | 'consortium' | 'public_body' | 'academic_council';
  name: string;
  mandate: string;
  jurisdiction?: string;
  legal_registration?: string;
  contact_info: Record<string, unknown>;
  activated_at?: string;
  status: 'pending' | 'active' | 'dissolved';
  created_at: string;
}

export interface StewardshipRole {
  id: string;
  stewardship_entity_id?: string;
  authority_scope: 'mission_guardian' | 'constitutional_enforcer' | 'asset_custodian' | 'crisis_responder' | 'succession_manager';
  limitations?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface PlatformEvolutionProposal {
  id: string;
  proposal_type: 'architecture_change' | 'governance_reform' | 'economic_model_shift' | 'mission_amendment' | 'stewardship_change';
  title: string;
  proposal_text: string;
  impact_assessment?: string;
  constitutional_implications?: string;
  proposed_by?: string;
  stewardship_entity_id?: string;
  status: 'draft' | 'deliberation' | 'supermajority_vote' | 'adopted' | 'rejected' | 'withdrawn';
  voting_threshold_percentage: number;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  voting_deadline?: string;
  created_at: string;
  decided_at?: string;
}

export interface ContinuityTrigger {
  id: string;
  trigger_type: 'operator_exit' | 'bankruptcy' | 'acquisition_attempt' | 'legal_shutdown' | 'governance_failure' | 'force_majeure';
  trigger_conditions: Record<string, unknown>;
  predefined_response: string;
  response_steps: unknown[];
  responsible_steward_id?: string;
  activated_at?: string;
  resolved_at?: string;
  status: 'dormant' | 'activated' | 'resolved' | 'failed';
  created_at: string;
}

export interface ForkExitProtocol {
  id: string;
  protocol_type: 'code_fork' | 'governance_fork' | 'national_exit' | 'institutional_exit' | 'emergency_shutdown';
  protocol_name: string;
  conditions: string;
  asset_distribution_rules: Record<string, unknown>;
  data_preservation_rules: Record<string, unknown>;
  user_rights_during_exit: Record<string, unknown>;
  approved_by?: string;
  approved_at?: string;
  is_active: boolean;
  created_at: string;
}

export function usePlatformMission() {
  const [currentMission, setCurrentMission] = useState<PlatformMission | null>(null);
  const [missionHistory, setMissionHistory] = useState<PlatformMission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCurrentMission = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_mission_registry")
        .select("*")
        .is("superseded_by_version", null)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setCurrentMission(data as PlatformMission);
    } catch (error) {
      console.error("Error fetching mission:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMissionHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_mission_registry")
        .select("*")
        .order("version_number", { ascending: false });

      if (error) throw error;
      setMissionHistory((data || []) as PlatformMission[]);
    } catch (error) {
      console.error("Error fetching mission history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentMission,
    missionHistory,
    isLoading,
    fetchCurrentMission,
    fetchMissionHistory
  };
}

export function useStewardship() {
  const [entities, setEntities] = useState<StewardshipEntity[]>([]);
  const [roles, setRoles] = useState<StewardshipRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActiveStewards = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("stewardship_entities")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setEntities((data || []) as StewardshipEntity[]);
    } catch (error) {
      console.error("Error fetching stewards:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRolesForEntity = useCallback(async (entityId: string) => {
    try {
      const { data, error } = await supabase
        .from("stewardship_roles")
        .select("*")
        .eq("stewardship_entity_id", entityId)
        .eq("is_active", true);

      if (error) throw error;
      setRoles((data || []) as StewardshipRole[]);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }, []);

  return {
    entities,
    roles,
    isLoading,
    fetchActiveStewards,
    fetchRolesForEntity
  };
}

export function usePlatformEvolution() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<PlatformEvolutionProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActiveProposals = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_evolution_proposals")
        .select("*")
        .in("status", ["deliberation", "supermajority_vote"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProposals((data || []) as PlatformEvolutionProposal[]);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProposal = useCallback(async (
    proposalType: PlatformEvolutionProposal['proposal_type'],
    title: string,
    proposalText: string,
    options?: {
      impactAssessment?: string;
      constitutionalImplications?: string;
    }
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("platform_evolution_proposals")
        .insert({
          proposal_type: proposalType,
          title,
          proposal_text: proposalText,
          impact_assessment: options?.impactAssessment,
          constitutional_implications: options?.constitutionalImplications,
          proposed_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Evolution proposal created");
      return data as PlatformEvolutionProposal;
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("Failed to create proposal");
      return null;
    }
  }, [user]);

  const voteOnProposal = useCallback(async (
    proposalId: string,
    vote: 'for' | 'against' | 'abstain'
  ) => {
    // In a real implementation, this would record individual votes
    // For now, we just update the counters
    const voteField = vote === 'for' ? 'votes_for' : 
                      vote === 'against' ? 'votes_against' : 'votes_abstain';

    try {
      const { data: current } = await supabase
        .from("platform_evolution_proposals")
        .select(voteField)
        .eq("id", proposalId)
        .single();

      if (!current) throw new Error("Proposal not found");

      const { error } = await supabase
        .from("platform_evolution_proposals")
        .update({ [voteField]: (current[voteField] as number) + 1 })
        .eq("id", proposalId);

      if (error) throw error;
      toast.success("Vote recorded");
      return true;
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to record vote");
      return false;
    }
  }, []);

  return {
    proposals,
    isLoading,
    fetchActiveProposals,
    createProposal,
    voteOnProposal
  };
}

export function useContinuityTriggers() {
  const [triggers, setTriggers] = useState<ContinuityTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllTriggers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("continuity_triggers")
        .select("*")
        .order("trigger_type");

      if (error) throw error;
      setTriggers((data || []) as ContinuityTrigger[]);
    } catch (error) {
      console.error("Error fetching triggers:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getActiveTriggers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("continuity_triggers")
        .select("*")
        .eq("status", "activated");

      if (error) throw error;
      return (data || []) as ContinuityTrigger[];
    } catch (error) {
      console.error("Error fetching active triggers:", error);
      return [];
    }
  }, []);

  return {
    triggers,
    isLoading,
    fetchAllTriggers,
    getActiveTriggers
  };
}

export function useForkExitProtocols() {
  const [protocols, setProtocols] = useState<ForkExitProtocol[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchApprovedProtocols = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("fork_exit_protocols")
        .select("*")
        .not("approved_at", "is", null)
        .eq("is_active", true)
        .order("protocol_type");

      if (error) throw error;
      setProtocols((data || []) as ForkExitProtocol[]);
    } catch (error) {
      console.error("Error fetching protocols:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProtocolByType = useCallback(async (type: ForkExitProtocol['protocol_type']) => {
    try {
      const { data, error } = await supabase
        .from("fork_exit_protocols")
        .select("*")
        .eq("protocol_type", type)
        .eq("is_active", true)
        .not("approved_at", "is", null)
        .single();

      if (error) throw error;
      return data as ForkExitProtocol;
    } catch (error) {
      console.error("Error fetching protocol:", error);
      return null;
    }
  }, []);

  return {
    protocols,
    isLoading,
    fetchApprovedProtocols,
    getProtocolByType
  };
}

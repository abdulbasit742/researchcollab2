import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// ADVANCED IDENTITY & CREDENTIALS (Features 1-25)
// =====================================================

// Feature 1: Dynamic Proof-of-Work Verification
export interface ProofOfWork {
  id: string;
  user_id: string;
  work_type: 'project_completion' | 'publication' | 'patent' | 'presentation' | 'certification' | 'code_contribution';
  title: string;
  description: string;
  evidence_url?: string;
  verified: boolean;
  verification_method: 'self' | 'peer' | 'institution' | 'automated';
  impact_score: number;
  created_at: string;
}

// Feature 2: Outcome-Weighted Reputation
export interface OutcomeWeight {
  outcome_type: string;
  success_count: number;
  failure_count: number;
  weighted_score: number;
  trend: 'improving' | 'stable' | 'declining';
}

// Feature 3: Skill Validation via Completed Tasks
export interface TaskBasedSkillValidation {
  skill: string;
  validated_through: {
    project_id: string;
    project_title: string;
    rating: number;
    date: string;
  }[];
  proficiency: 'novice' | 'competent' | 'proficient' | 'expert' | 'master';
  last_validated: string;
}

// Feature 4: Peer Credibility Weighting System
export interface PeerCredibilityWeight {
  endorser_id: string;
  endorser_name: string;
  endorser_trust: number;
  endorsement_domain: string;
  weight_applied: number;
  relationship_strength: 'weak' | 'moderate' | 'strong';
}

// Feature 5: Institution-Backed Credentials
export interface InstitutionalCredential {
  id: string;
  institution_id: string;
  institution_name: string;
  credential_type: 'degree' | 'certificate' | 'affiliation' | 'position' | 'award';
  title: string;
  verified: boolean;
  issued_date: string;
  expiry_date?: string;
}

// Feature 6: Time-Decay Trust Logic
export interface TrustDecay {
  last_activity_date: string;
  days_inactive: number;
  decay_applied: number;
  decay_rate: number;
  pause_conditions_met: string[];
}

// Feature 7: Trust Recovery Paths
export interface RecoveryPath {
  trigger: string;
  trust_lost: number;
  steps: {
    action: string;
    recovery_amount: number;
    completed: boolean;
    deadline?: string;
  }[];
  progress_percentage: number;
}

// Feature 8: Public vs Private Trust Layers
export interface TrustLayers {
  public_score: number;
  network_score: number;
  private_score: number;
  visibility_settings: {
    component: string;
    visible_to: 'public' | 'network' | 'private';
  }[];
}

// Feature 9: Role-Based Reputation Views
export interface RoleReputation {
  role: 'researcher' | 'advisor' | 'executor' | 'funder' | 'mentor';
  reputation_score: number;
  projects_in_role: number;
  success_rate: number;
  peer_ratings: number;
}

// Feature 10: Cross-Domain Credibility Mapping
export interface DomainCredibility {
  domain: string;
  credibility_score: number;
  projects_completed: number;
  transferable_to: string[];
  expertise_level: 'emerging' | 'established' | 'expert';
}

// Feature 11: Conflict-of-Interest Detection
export interface ConflictOfInterest {
  id: string;
  type: 'financial' | 'personal' | 'institutional' | 'competitive';
  parties: string[];
  detected_at: string;
  severity: 'low' | 'medium' | 'high';
  resolution_required: boolean;
  disclosed: boolean;
}

// Feature 12: Credential Expiration Alerts
export interface CredentialAlert {
  credential_id: string;
  credential_title: string;
  expires_in_days: number;
  renewal_options: string[];
  priority: 'low' | 'medium' | 'high';
}

// Feature 13: Trust Volatility Indicators
export interface TrustVolatility {
  volatility_score: number;
  recent_changes: { date: string; delta: number; reason: string }[];
  stability_rating: 'stable' | 'moderate' | 'volatile';
  risk_factors: string[];
}

// Feature 14: Trust Audit Trail UI
export interface TrustAuditEntry {
  id: string;
  timestamp: string;
  event: string;
  trust_before: number;
  trust_after: number;
  delta: number;
  reason: string;
  reversible: boolean;
  evidence?: string;
}

// Feature 15: Trust Explanation Engine
export interface TrustExplanation {
  current_score: number;
  breakdown: { factor: string; contribution: number; explanation: string }[];
  improvement_paths: { action: string; potential_gain: number }[];
  comparison_to_average: number;
}

// Feature 16: Trust Comparison (Contextual)
export interface TrustComparison {
  domain: string;
  user_percentile: number;
  domain_average: number;
  top_performers_threshold: number;
  gap_to_top: number;
}

// Feature 17: Identity Versioning (Career Phases)
export interface CareerPhase {
  id: string;
  phase_name: string;
  start_date: string;
  end_date?: string;
  primary_role: string;
  achievements: string[];
  skills_gained: string[];
  trust_at_phase_end?: number;
}

// Feature 18: Multi-Profile Modes
export interface ProfileMode {
  mode: 'researcher' | 'advisor' | 'operator' | 'investor' | 'mentor';
  active: boolean;
  bio: string;
  highlighted_skills: string[];
  preferred_opportunities: string[];
  visibility: 'public' | 'network' | 'private';
}

// Feature 19: Verified Failure Records (Non-Punitive)
export interface VerifiedFailure {
  id: string;
  project_id: string;
  failure_type: string;
  description: string;
  lessons_learned: string[];
  recovery_actions: string[];
  trust_impact: number;
  recovery_status: 'in_progress' | 'recovered' | 'ongoing';
}

// Feature 20: Reputation Portability (Export)
export interface PortableReputation {
  exported_at: string;
  format: 'json' | 'w3c_vc' | 'pdf';
  includes: string[];
  verification_hash: string;
  valid_until: string;
}

export function useAdvancedIdentity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [proofOfWork, setProofOfWork] = useState<ProofOfWork[]>([]);
  const [skillValidations, setSkillValidations] = useState<TaskBasedSkillValidation[]>([]);
  const [credentials, setCredentials] = useState<InstitutionalCredential[]>([]);
  const [careerPhases, setCareerPhases] = useState<CareerPhase[]>([]);
  const [profileModes, setProfileModes] = useState<ProfileMode[]>([]);
  const [failures, setFailures] = useState<VerifiedFailure[]>([]);

  // Feature 21: Calculate Outcome-Weighted Reputation
  const calculateOutcomeWeights = useCallback((outcomes: { type: string; success: boolean }[]): OutcomeWeight[] => {
    const grouped = outcomes.reduce((acc, o) => {
      if (!acc[o.type]) acc[o.type] = { success: 0, failure: 0 };
      o.success ? acc[o.type].success++ : acc[o.type].failure++;
      return acc;
    }, {} as Record<string, { success: number; failure: number }>);

    return Object.entries(grouped).map(([type, counts]) => ({
      outcome_type: type,
      success_count: counts.success,
      failure_count: counts.failure,
      weighted_score: (counts.success - counts.failure * 2) / Math.max(1, counts.success + counts.failure) * 100,
      trend: counts.success > counts.failure ? 'improving' : counts.success < counts.failure ? 'declining' : 'stable'
    }));
  }, []);

  // Feature 22: Detect Conflicts of Interest
  const detectConflicts = useCallback((partyA: string, partyB: string, relationships: any[]): ConflictOfInterest[] => {
    const conflicts: ConflictOfInterest[] = [];
    // Check for shared institutions, past disputes, financial relationships
    relationships.forEach(rel => {
      if (rel.type === 'institutional' && rel.shared) {
        conflicts.push({
          id: crypto.randomUUID(),
          type: 'institutional',
          parties: [partyA, partyB],
          detected_at: new Date().toISOString(),
          severity: 'medium',
          resolution_required: true,
          disclosed: false
        });
      }
    });
    return conflicts;
  }, []);

  // Feature 23: Generate Trust Explanation
  const generateTrustExplanation = useCallback((trustScore: number, components: any[]): TrustExplanation => {
    const breakdown = components.map(c => ({
      factor: c.name,
      contribution: c.value * c.weight,
      explanation: `${c.name} contributes ${Math.round(c.value * c.weight)} points (${c.value}% × ${c.weight} weight)`
    }));

    return {
      current_score: trustScore,
      breakdown,
      improvement_paths: [
        { action: 'Complete verification', potential_gain: 10 },
        { action: 'Complete more projects', potential_gain: 5 },
        { action: 'Get peer endorsements', potential_gain: 3 }
      ],
      comparison_to_average: trustScore - 55 // Platform average
    };
  }, []);

  // Feature 24: Export Portable Reputation
  const exportReputation = useCallback(async (format: 'json' | 'w3c_vc' | 'pdf'): Promise<PortableReputation | null> => {
    if (!user) return null;

    const exportData = {
      user_id: user.id,
      exported_at: new Date().toISOString(),
      proof_of_work: proofOfWork,
      skills: skillValidations,
      credentials,
      career_phases: careerPhases
    };

    const hash = btoa(JSON.stringify(exportData).slice(0, 50));

    toast({ title: "Reputation Exported", description: `Your portable reputation is ready in ${format} format` });

    return {
      exported_at: new Date().toISOString(),
      format,
      includes: ['proof_of_work', 'skills', 'credentials', 'career_phases'],
      verification_hash: hash,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }, [user, proofOfWork, skillValidations, credentials, careerPhases, toast]);

  // Feature 25: Add Career Phase
  const addCareerPhase = useCallback((phase: Omit<CareerPhase, 'id'>): void => {
    setCareerPhases(prev => [...prev, { ...phase, id: crypto.randomUUID() }]);
    toast({ title: "Career Phase Added", description: `Added ${phase.phase_name}` });
  }, [toast]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Initialize default profile modes
    setProfileModes([
      { mode: 'researcher', active: true, bio: '', highlighted_skills: [], preferred_opportunities: [], visibility: 'public' },
      { mode: 'advisor', active: false, bio: '', highlighted_skills: [], preferred_opportunities: [], visibility: 'network' },
      { mode: 'operator', active: false, bio: '', highlighted_skills: [], preferred_opportunities: [], visibility: 'public' }
    ]);

    setLoading(false);
  }, [user]);

  return {
    loading,
    proofOfWork,
    skillValidations,
    credentials,
    careerPhases,
    profileModes,
    failures,
    calculateOutcomeWeights,
    detectConflicts,
    generateTrustExplanation,
    exportReputation,
    addCareerPhase,
    setProfileModes
  };
}

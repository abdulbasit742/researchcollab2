import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Feature 1: Dynamic Credential Verification
export interface Credential {
  id: string;
  type: 'degree' | 'certification' | 'license' | 'publication' | 'patent' | 'award' | 'employment' | 'research';
  title: string;
  issuer: string;
  issuer_verified: boolean;
  issue_date: string;
  expiry_date?: string;
  verification_status: 'pending' | 'verified' | 'expired' | 'revoked' | 'disputed';
  verification_method: 'document' | 'api' | 'institution' | 'blockchain' | 'peer';
  verification_confidence: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Feature 2: Skill Validation via Tasks
export interface SkillValidation {
  skill_name: string;
  validation_count: number;
  last_validated: string;
  validation_sources: Array<{
    type: 'project_completion' | 'peer_endorsement' | 'assessment' | 'certification';
    weight: number;
    date: string;
  }>;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence_score: number;
}

// Feature 3: Peer Credibility Weighting
export interface PeerCredibility {
  endorser_id: string;
  endorser_trust_score: number;
  endorsement_weight: number;
  domain_expertise: string[];
  relationship_context: string;
  endorsement_date: string;
}

// Feature 4: Institution-Backed Credentials
export interface InstitutionalCredential {
  institution_id: string;
  institution_name: string;
  institution_verified: boolean;
  credential_type: string;
  issued_by_role: string;
  verification_chain: string[];
}

// Feature 5: Cross-Domain Credibility Mapping
export interface DomainCredibility {
  domain: string;
  credibility_score: number;
  contributing_factors: Array<{
    factor: string;
    weight: number;
    source: string;
  }>;
  transferable_to: string[];
}

// Feature 6: Credential Expiration Alerts
export interface ExpirationAlert {
  credential_id: string;
  credential_title: string;
  expiry_date: string;
  days_until_expiry: number;
  renewal_options: string[];
  alert_sent: boolean;
}

// Feature 7: Identity Versioning (Career Phases)
export interface CareerPhase {
  id: string;
  phase_name: string;
  start_date: string;
  end_date?: string;
  primary_role: string;
  key_achievements: string[];
  skills_developed: string[];
  trust_trajectory: number[];
  is_current: boolean;
}

// Feature 8: Multi-Profile Modes
export interface ProfileMode {
  mode: 'researcher' | 'advisor' | 'operator' | 'investor' | 'mentor' | 'student';
  is_active: boolean;
  visibility: 'public' | 'network' | 'private';
  custom_bio: string;
  highlighted_credentials: string[];
  preferred_opportunities: string[];
}

export function useCredentialVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [skillValidations, setSkillValidations] = useState<SkillValidation[]>([]);
  const [careerPhases, setCareerPhases] = useState<CareerPhase[]>([]);
  const [profileModes, setProfileModes] = useState<ProfileMode[]>([]);
  const [expirationAlerts, setExpirationAlerts] = useState<ExpirationAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Feature 9: Verification Confidence Calculator
  const calculateVerificationConfidence = useCallback((credential: Partial<Credential>): number => {
    let confidence = 0;
    
    // Method weight
    const methodWeights: Record<string, number> = {
      blockchain: 0.95,
      api: 0.90,
      institution: 0.85,
      document: 0.70,
      peer: 0.50
    };
    confidence += (methodWeights[credential.verification_method || 'document'] || 0.5) * 40;
    
    // Issuer verification
    if (credential.issuer_verified) confidence += 25;
    
    // Recency (newer = more confident)
    if (credential.issue_date) {
      const age = (Date.now() - new Date(credential.issue_date).getTime()) / (365 * 24 * 60 * 60 * 1000);
      confidence += Math.max(0, 20 - age * 2);
    }
    
    // Not expired
    if (!credential.expiry_date || new Date(credential.expiry_date) > new Date()) {
      confidence += 15;
    }
    
    return Math.min(100, Math.round(confidence));
  }, []);

  // Feature 10: Skill Proficiency Calculator
  const calculateSkillProficiency = useCallback((validations: SkillValidation['validation_sources']): SkillValidation['proficiency_level'] => {
    const totalWeight = validations.reduce((sum, v) => sum + v.weight, 0);
    const projectCompletions = validations.filter(v => v.type === 'project_completion').length;
    
    if (totalWeight >= 50 && projectCompletions >= 10) return 'expert';
    if (totalWeight >= 30 && projectCompletions >= 5) return 'advanced';
    if (totalWeight >= 15 && projectCompletions >= 2) return 'intermediate';
    return 'beginner';
  }, []);

  // Feature 11: Credential Conflict Detection
  const detectCredentialConflicts = useCallback((creds: Credential[]): Array<{ credential_ids: string[]; conflict_type: string; description: string }> => {
    const conflicts: Array<{ credential_ids: string[]; conflict_type: string; description: string }> = [];
    
    // Check for overlapping employment
    const employments = creds.filter(c => c.type === 'employment');
    for (let i = 0; i < employments.length; i++) {
      for (let j = i + 1; j < employments.length; j++) {
        const a = employments[i];
        const b = employments[j];
        const aStart = new Date(a.issue_date);
        const aEnd = a.expiry_date ? new Date(a.expiry_date) : new Date();
        const bStart = new Date(b.issue_date);
        const bEnd = b.expiry_date ? new Date(b.expiry_date) : new Date();
        
        if (aStart <= bEnd && bStart <= aEnd) {
          // Check if full-time overlap
          if (a.metadata?.employment_type === 'full-time' && b.metadata?.employment_type === 'full-time') {
            conflicts.push({
              credential_ids: [a.id, b.id],
              conflict_type: 'overlapping_employment',
              description: `Full-time positions at ${a.issuer} and ${b.issuer} overlap`
            });
          }
        }
      }
    }
    
    // Check for degree timeline issues
    const degrees = creds.filter(c => c.type === 'degree');
    for (const degree of degrees) {
      const issueDate = new Date(degree.issue_date);
      const minAge = degree.metadata?.degree_level === 'phd' ? 25 : 
                     degree.metadata?.degree_level === 'masters' ? 22 : 18;
      // This would need birth date to fully validate
    }
    
    return conflicts;
  }, []);

  // Feature 12: Generate Verification Report
  const generateVerificationReport = useCallback(async (): Promise<{
    total_credentials: number;
    verified_count: number;
    verification_rate: number;
    average_confidence: number;
    expiring_soon: number;
    conflicts: number;
    recommendations: string[];
  }> => {
    const verified = credentials.filter(c => c.verification_status === 'verified');
    const expiringSoon = expirationAlerts.filter(a => a.days_until_expiry <= 30).length;
    const conflicts = detectCredentialConflicts(credentials);
    
    const recommendations: string[] = [];
    if (verified.length < credentials.length * 0.5) {
      recommendations.push('Verify more credentials to increase trust score');
    }
    if (expiringSoon > 0) {
      recommendations.push(`${expiringSoon} credentials expiring soon - consider renewal`);
    }
    if (conflicts.length > 0) {
      recommendations.push('Resolve credential conflicts to maintain credibility');
    }
    
    return {
      total_credentials: credentials.length,
      verified_count: verified.length,
      verification_rate: credentials.length > 0 ? (verified.length / credentials.length) * 100 : 0,
      average_confidence: credentials.reduce((sum, c) => sum + c.verification_confidence, 0) / Math.max(1, credentials.length),
      expiring_soon: expiringSoon,
      conflicts: conflicts.length,
      recommendations
    };
  }, [credentials, expirationAlerts, detectCredentialConflicts]);

  // Feature 13: Submit Credential for Verification
  const submitCredential = useCallback(async (credential: Omit<Credential, 'id' | 'verification_status' | 'verification_confidence' | 'created_at'>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const confidence = calculateVerificationConfidence(credential);
      
      const { error } = await supabase
        .from('verification_submissions' as any)
        .insert({
          user_id: user.id,
          verification_type: credential.type,
          submitted_documents: credential.metadata,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({ title: "Credential Submitted", description: "Your credential is pending verification" });
      return true;
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit credential", variant: "destructive" });
      return false;
    }
  }, [user, calculateVerificationConfidence, toast]);

  // Feature 14: Add Career Phase
  const addCareerPhase = useCallback(async (phase: Omit<CareerPhase, 'id'>): Promise<boolean> => {
    if (!user) return false;
    
    const newPhase: CareerPhase = {
      ...phase,
      id: crypto.randomUUID()
    };
    
    setCareerPhases(prev => [...prev, newPhase]);
    toast({ title: "Career Phase Added", description: `Added ${phase.phase_name} to your timeline` });
    return true;
  }, [user, toast]);

  // Feature 15: Switch Profile Mode
  const switchProfileMode = useCallback(async (mode: ProfileMode['mode']): Promise<boolean> => {
    setProfileModes(prev => prev.map(p => ({
      ...p,
      is_active: p.mode === mode
    })));
    toast({ title: "Profile Mode Switched", description: `Now showing as ${mode}` });
    return true;
  }, [toast]);

  // Feature 16: Export Credentials (Portability)
  const exportCredentials = useCallback(async (format: 'json' | 'pdf' | 'linkedin'): Promise<string | null> => {
    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user?.id,
      credentials,
      skill_validations: skillValidations,
      career_phases: careerPhases,
      verification_summary: await generateVerificationReport()
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    // Other formats would be handled by backend
    return null;
  }, [user, credentials, skillValidations, careerPhases, generateVerificationReport]);

  // Feature 17: Request Peer Verification
  const requestPeerVerification = useCallback(async (credentialId: string, peerId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Create notification for peer
      await supabase
        .from('notifications' as any)
        .insert({
          user_id: peerId,
          type: 'verification_request',
          title: 'Credential Verification Request',
          message: `A colleague has requested your verification of their credential`,
          data: { credential_id: credentialId, requester_id: user.id }
        });
      
      toast({ title: "Request Sent", description: "Peer verification request sent" });
      return true;
    } catch (err) {
      return false;
    }
  }, [user, toast]);

  // Feature 18: Validate Skill from Project
  const validateSkillFromProject = useCallback((skillName: string, projectOutcome: 'success' | 'partial' | 'failed'): void => {
    const weight = projectOutcome === 'success' ? 10 : projectOutcome === 'partial' ? 5 : 1;
    
    setSkillValidations(prev => {
      const existing = prev.find(s => s.skill_name === skillName);
      if (existing) {
        const newSources = [...existing.validation_sources, {
          type: 'project_completion' as const,
          weight,
          date: new Date().toISOString()
        }];
        const newProficiency = calculateSkillProficiency(newSources);
        return prev.map(s => s.skill_name === skillName ? {
          ...s,
          validation_count: s.validation_count + 1,
          last_validated: new Date().toISOString(),
          validation_sources: newSources,
          proficiency_level: newProficiency,
          confidence_score: Math.min(100, s.confidence_score + weight)
        } : s);
      }
      return [...prev, {
        skill_name: skillName,
        validation_count: 1,
        last_validated: new Date().toISOString(),
        validation_sources: [{
          type: 'project_completion' as const,
          weight,
          date: new Date().toISOString()
        }],
        proficiency_level: 'beginner',
        confidence_score: weight
      }];
    });
  }, [calculateSkillProficiency]);

  // Initialize data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Initialize with default profile modes
    setProfileModes([
      { mode: 'researcher', is_active: true, visibility: 'public', custom_bio: '', highlighted_credentials: [], preferred_opportunities: ['research', 'collaboration'] },
      { mode: 'advisor', is_active: false, visibility: 'network', custom_bio: '', highlighted_credentials: [], preferred_opportunities: ['advisory', 'mentorship'] },
      { mode: 'operator', is_active: false, visibility: 'public', custom_bio: '', highlighted_credentials: [], preferred_opportunities: ['projects', 'contracts'] }
    ]);

    setLoading(false);
  }, [user]);

  return {
    credentials,
    skillValidations,
    careerPhases,
    profileModes,
    expirationAlerts,
    loading,
    // Actions
    submitCredential,
    addCareerPhase,
    switchProfileMode,
    exportCredentials,
    requestPeerVerification,
    validateSkillFromProject,
    // Calculators
    calculateVerificationConfidence,
    calculateSkillProficiency,
    detectCredentialConflicts,
    generateVerificationReport
  };
}

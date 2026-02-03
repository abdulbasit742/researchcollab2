import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Portable Professional Record Format
export interface PortableProfessionalRecord {
  version: "1.0";
  exportedAt: string;
  expiresAt: string | null;
  recordType: "professional_identity";
  
  identity: {
    userId: string;
    displayName: string;
    primaryRole: string;
    institutions: string[];
    verificationLevel: string;
    accountCreatedAt: string;
  };
  
  trustProfile: {
    currentScore: number;
    tier: string;
    dimensions: {
      deliveryReliability: number;
      qualityConsistency: number;
      financialIntegrity: number;
      collaborationSkill: number;
      disputeHistory: number;
    };
    trajectory: "improving" | "stable" | "declining";
    lastUpdated: string;
  };
  
  workLedger: {
    totalProjectsCompleted: number;
    totalProjectsFailed: number;
    successRate: number;
    totalEarnings: number;
    escrowSuccessRate: number;
    disputesWon: number;
    disputesLost: number;
    projects: Array<{
      id: string;
      title: string;
      role: string;
      outcome: "completed" | "failed" | "disputed";
      completedAt: string;
      isPublic: boolean;
    }>;
  };
  
  skills: Array<{
    name: string;
    source: "proven" | "claimed";
    projectCount: number;
    lastUsed: string;
  }>;
  
  publications: Array<{
    title: string;
    doi: string | null;
    publishedAt: string;
    isVerified: boolean;
  }>;
  
  signature: {
    hash: string;
    signedAt: string;
    algorithm: string;
  };
}

// Verification link format
export interface VerificationLink {
  id: string;
  userId: string;
  linkType: "full" | "summary" | "trust_only";
  accessCode: string;
  expiresAt: string;
  createdAt: string;
  accessCount: number;
  maxAccesses: number | null;
}

// Hook for exporting portable records
export function useExportProfessionalRecord() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (options: {
      includeProjects?: boolean;
      includePublications?: boolean;
      includeEarnings?: boolean;
    }): Promise<PortableProfessionalRecord> => {
      if (!user) throw new Error("Not authenticated");

      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Fetch trust profile
      const { data: trustProfile } = await supabase
        .from("user_trust_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch accountability records (projects)
      const { data: projects } = await supabase
        .from("accountability_records")
        .select("*")
        .or(`initiator_id.eq.${user.id},executor_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      // Fetch skills
      const { data: skills } = await supabase
        .from("user_skills")
        .select("*")
        .eq("user_id", user.id);

      // Calculate metrics
      const completedProjects = projects?.filter(p => p.outcome_status === 'completed') || [];
      const failedProjects = projects?.filter(p => p.outcome_status === 'failed') || [];
      const totalProjects = completedProjects.length + failedProjects.length;
      const successRate = totalProjects > 0 ? (completedProjects.length / totalProjects) * 100 : 0;

      // Build portable record
      const record: PortableProfessionalRecord = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        expiresAt: null,
        recordType: "professional_identity",
        
        identity: {
          userId: user.id,
          displayName: profile?.full_name || "Unknown",
          primaryRole: profile?.role || "professional",
          institutions: profile?.university ? [profile.university] : [],
          verificationLevel: trustProfile?.trust_tier || "unverified",
          accountCreatedAt: profile?.created_at || new Date().toISOString(),
        },
        
        trustProfile: {
          currentScore: trustProfile?.trust_score || 0,
          tier: trustProfile?.trust_tier || "bronze",
          dimensions: {
            deliveryReliability: 100 - (trustProfile?.avg_milestone_approval_hours || 0) / 24,
            qualityConsistency: trustProfile?.trust_score || 0,
            financialIntegrity: trustProfile?.financial_reliability_score || 0,
            collaborationSkill: trustProfile?.trust_score || 0,
            disputeHistory: 100 - ((trustProfile?.dispute_rate || 0) * 100),
          },
          trajectory: "stable",
          lastUpdated: trustProfile?.updated_at || new Date().toISOString(),
        },
        
        workLedger: {
          totalProjectsCompleted: completedProjects.length,
          totalProjectsFailed: failedProjects.length,
          successRate: Math.round(successRate),
          totalEarnings: options.includeEarnings 
            ? completedProjects.reduce((sum, p) => sum + (p.total_paid || 0), 0)
            : 0,
          escrowSuccessRate: successRate,
          disputesWon: 0,
          disputesLost: 0,
          projects: options.includeProjects 
            ? (projects || []).slice(0, 20).map(p => ({
                id: p.id,
                title: `Project ${p.id.slice(0, 8)}`,
                role: p.executor_id === user.id ? "executor" : "initiator",
                outcome: p.outcome_status as "completed" | "failed" | "disputed",
                completedAt: p.updated_at || p.created_at,
                isPublic: p.is_public || false,
              }))
            : [],
        },
        
        skills: (skills || []).map(s => ({
          name: s.skill_name,
          source: (s.endorsement_count > 0 ? "proven" : "claimed") as "proven" | "claimed",
          projectCount: s.endorsement_count || 0,
          lastUsed: s.created_at,
        })),
        
        publications: [],
        
        signature: {
          hash: generateRecordHash(user.id, new Date().toISOString()),
          signedAt: new Date().toISOString(),
          algorithm: "SHA-256",
        },
      };

      return record;
    },
    onSuccess: () => {
      toast({
        title: "Record exported",
        description: "Your portable professional record is ready for download.",
      });
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook for creating verification links
export function useCreateVerificationLink() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (options: {
      linkType: "full" | "summary" | "trust_only";
      expiresInDays?: number;
      maxAccesses?: number;
    }): Promise<VerificationLink> => {
      if (!user) throw new Error("Not authenticated");

      const accessCode = generateAccessCode();
      const expiresAt = options.expiresInDays 
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default 30 days

      // For now, return a mock link (would store in database)
      const link: VerificationLink = {
        id: `vl_${Date.now()}`,
        userId: user.id,
        linkType: options.linkType,
        accessCode,
        expiresAt,
        createdAt: new Date().toISOString(),
        accessCount: 0,
        maxAccesses: options.maxAccesses || null,
      };

      return link;
    },
    onSuccess: () => {
      toast({
        title: "Verification link created",
        description: "Share this link to verify your professional identity.",
      });
    },
  });
}

// Hook for jurisdiction-aware operations
export function useJurisdictionAwareness() {
  const { user } = useAuth();

  const getApplicableRules = useCallback((jurisdiction: string) => {
    // Define jurisdiction-specific rules
    const rules: Record<string, {
      dataRetention: string;
      disputeResolution: string;
      privacyLevel: string;
      complianceNotes: string[];
    }> = {
      EU: {
        dataRetention: "GDPR-compliant (right to erasure)",
        disputeResolution: "EU Alternative Dispute Resolution",
        privacyLevel: "Enhanced (GDPR)",
        complianceNotes: [
          "Data portability required",
          "Consent must be explicit",
          "72-hour breach notification",
        ],
      },
      US: {
        dataRetention: "Standard (7 years for financial)",
        disputeResolution: "Arbitration-first",
        privacyLevel: "Standard",
        complianceNotes: [
          "CCPA compliance for CA residents",
          "State-specific variations apply",
        ],
      },
      DEFAULT: {
        dataRetention: "Standard retention",
        disputeResolution: "Platform mediation",
        privacyLevel: "Standard",
        complianceNotes: [],
      },
    };

    return rules[jurisdiction] || rules.DEFAULT;
  }, []);

  return { getApplicableRules };
}

// Hook for institutional onboarding
export interface InstitutionOnboardingStatus {
  step: number;
  totalSteps: number;
  currentStepName: string;
  completedSteps: string[];
  pendingSteps: string[];
  estimatedTimeRemaining: string;
}

export function useInstitutionalOnboarding(institutionId?: string) {
  return useQuery({
    queryKey: ["institution-onboarding", institutionId],
    queryFn: async (): Promise<InstitutionOnboardingStatus> => {
      // Return mock onboarding status
      return {
        step: 2,
        totalSteps: 5,
        currentStepName: "Verification",
        completedSteps: ["Registration", "Profile Setup"],
        pendingSteps: ["Verification", "Integration", "Go-Live"],
        estimatedTimeRemaining: "3-5 business days",
      };
    },
    enabled: !!institutionId,
  });
}

// Helper functions
function generateRecordHash(userId: string, timestamp: string): string {
  // Simple hash for demo - in production, use proper cryptographic signing
  const input = `${userId}-${timestamp}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `RCollab-${Math.abs(hash).toString(16).toUpperCase()}`;
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Export record to JSON file
export function downloadProfessionalRecord(record: PortableProfessionalRecord) {
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rcollab-professional-record-${record.identity.userId.slice(0, 8)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

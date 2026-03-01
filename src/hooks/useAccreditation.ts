import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MilestoneCertification {
  id: string;
  milestone_id: string;
  certified_by: string;
  institution_id: string | null;
  certification_type: string;
  certification_score: number;
  certification_notes: string | null;
  verification_hash: string;
  issued_at: string;
}

export interface ProjectCertificate {
  id: string;
  project_id: string;
  institution_id: string | null;
  completion_score: number;
  review_quality_score: number;
  dispute_ratio: number;
  execution_stability_score: number;
  issued_by: string;
  certificate_hash: string;
  issued_at: string;
}

export interface AccreditationLevel {
  id: string;
  institution_id: string;
  accreditation_tier: string;
  completion_rate: number;
  governance_score: number;
  compliance_score: number;
  engagement_score: number;
  issued_at: string;
  reviewed_at: string | null;
}

export interface UserCredential {
  id: string;
  user_id: string;
  institution_id: string | null;
  credential_type: string;
  milestones_completed: number;
  review_score_average: number;
  on_time_completion_rate: number;
  credential_hash: string;
  issued_at: string;
}

// Generate a simple SHA-256-like hash from inputs
async function generateHash(...inputs: string[]): Promise<string> {
  const data = inputs.join("|");
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function useAccreditationLevel(institutionId?: string) {
  return useQuery({
    queryKey: ["accreditation-level", institutionId],
    queryFn: async (): Promise<AccreditationLevel | null> => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("institution_accreditation_levels")
        .select("*")
        .eq("institution_id", institutionId)
        .order("issued_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as AccreditationLevel | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAccreditationHistory(institutionId?: string) {
  return useQuery({
    queryKey: ["accreditation-history", institutionId],
    queryFn: async (): Promise<AccreditationLevel[]> => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("institution_accreditation_levels")
        .select("*")
        .eq("institution_id", institutionId)
        .order("issued_at", { ascending: false })
        .limit(10);
      return (data ?? []) as AccreditationLevel[];
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMilestoneCertifications(institutionId?: string) {
  return useQuery({
    queryKey: ["milestone-certifications", institutionId],
    queryFn: async (): Promise<MilestoneCertification[]> => {
      let query = supabase
        .from("milestone_certifications")
        .select("*")
        .order("issued_at", { ascending: false })
        .limit(30);
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return (data ?? []) as MilestoneCertification[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjectCertificates(institutionId?: string) {
  return useQuery({
    queryKey: ["project-certificates", institutionId],
    queryFn: async (): Promise<ProjectCertificate[]> => {
      let query = supabase
        .from("project_execution_certificates")
        .select("*")
        .order("issued_at", { ascending: false })
        .limit(20);
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return (data ?? []) as ProjectCertificate[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserCredentials(userId?: string) {
  return useQuery({
    queryKey: ["user-credentials", userId],
    queryFn: async (): Promise<UserCredential[]> => {
      if (!userId) return [];
      const { data } = await supabase
        .from("user_execution_credentials")
        .select("*")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false });
      return (data ?? []) as UserCredential[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCertificationAuditLog(institutionId?: string) {
  return useQuery({
    queryKey: ["certification-audit-log", institutionId],
    queryFn: async () => {
      let query = supabase
        .from("certification_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useIssueMilestoneCertification(institutionId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ milestoneId, score, notes }: { milestoneId: string; score: number; notes?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const hash = await generateHash(milestoneId, user.id, new Date().toISOString());
      const { error } = await supabase.from("milestone_certifications").insert([{
        milestone_id: milestoneId,
        certified_by: user.id,
        institution_id: institutionId ?? null,
        certification_type: "completion",
        certification_score: score,
        certification_notes: notes ?? null,
        verification_hash: hash,
      }]);
      if (error) throw error;
      await supabase.from("certification_audit_log").insert([{
        actor_id: user.id,
        entity_type: "milestone",
        entity_id: milestoneId,
        action: "issued",
        reason: "Milestone certification issued",
        institution_id: institutionId ?? null,
      }]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milestone-certifications"] });
      qc.invalidateQueries({ queryKey: ["certification-audit-log"] });
    },
  });
}

export function useVerifyCertificate() {
  return useMutation({
    mutationFn: async (hash: string) => {
      // Check milestone certifications
      const { data: ms } = await supabase
        .from("milestone_certifications")
        .select("id, certification_type, issued_at, verification_hash")
        .eq("verification_hash", hash)
        .maybeSingle();
      if (ms) return { valid: true, type: "milestone", ...ms };

      // Check project certificates
      const { data: proj } = await supabase
        .from("project_execution_certificates")
        .select("id, issued_at, certificate_hash")
        .eq("certificate_hash", hash)
        .maybeSingle();
      if (proj) return { valid: true, type: "project", ...proj };

      // Check user credentials
      const { data: cred } = await supabase
        .from("user_execution_credentials")
        .select("id, credential_type, issued_at, credential_hash")
        .eq("credential_hash", hash)
        .maybeSingle();
      if (cred) return { valid: true, type: "credential", ...cred };

      return { valid: false };
    },
  });
}

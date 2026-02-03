import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ResearchArtifact {
  id: string;
  artifact_type: string;
  title: string;
  description: string | null;
  owner_id: string;
  visibility: string;
  version: string;
  checksum: string;
  license: string | null;
  doi: string | null;
  keywords: string[] | null;
  reproducibility_score: number | null;
  verification_status: string;
  created_at: string;
}

export interface ArtifactLineage {
  id: string;
  parent_artifact_id: string;
  child_artifact_id: string;
  relationship: string;
  relationship_details: string | null;
  confidence_level: string;
  created_at: string;
}

export interface ReproducibilityClaim {
  id: string;
  artifact_id: string;
  claim_type: string;
  claim_level: string;
  requirements: Record<string, unknown> | null;
  environment_specification: Record<string, unknown> | null;
  estimated_reproduction_time: string | null;
  estimated_cost: string | null;
  limitations: string | null;
  submitted_by: string;
  submitted_at: string;
  review_status: string;
}

export interface VerificationAttempt {
  id: string;
  artifact_id: string;
  claim_id: string | null;
  verifier_id: string;
  outcome: string;
  outcome_details: string | null;
  methodology_followed: boolean;
  time_spent_hours: number | null;
  evidence_links: string[] | null;
  conflict_of_interest_declared: boolean;
  is_public: boolean;
  created_at: string;
}

export function useReproducibility() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [artifacts, setArtifacts] = useState<ResearchArtifact[]>([]);
  const [lineage, setLineage] = useState<ArtifactLineage[]>([]);
  const [claims, setClaims] = useState<ReproducibilityClaim[]>([]);
  const [verifications, setVerifications] = useState<VerificationAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [artifactsRes, lineageRes, claimsRes, verificationsRes] = await Promise.all([
        supabase.from("research_artifacts" as any).select("*").order("created_at", { ascending: false }),
        supabase.from("artifact_lineage" as any).select("*"),
        supabase.from("reproducibility_claims" as any).select("*").order("submitted_at", { ascending: false }),
        supabase.from("verification_attempts" as any).select("*").order("created_at", { ascending: false }),
      ]);

      setArtifacts((artifactsRes.data as unknown as ResearchArtifact[]) || []);
      setLineage((lineageRes.data as unknown as ArtifactLineage[]) || []);
      setClaims((claimsRes.data as unknown as ReproducibilityClaim[]) || []);
      setVerifications((verificationsRes.data as unknown as VerificationAttempt[]) || []);
    } catch (err) {
      console.error("Error fetching reproducibility data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const submitClaim = async (artifactId: string, claimData: Partial<ReproducibilityClaim>) => {
    const { error } = await supabase.from("reproducibility_claims" as any).insert({
      ...claimData,
      artifact_id: artifactId,
      submitted_by: user?.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Claim Submitted" });
    await fetchAll();
    return true;
  };

  const submitVerification = async (artifactId: string, verificationData: Partial<VerificationAttempt>) => {
    const { error } = await supabase.from("verification_attempts" as any).insert({
      ...verificationData,
      artifact_id: artifactId,
      verifier_id: user?.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Verification Recorded" });
    await fetchAll();
    return true;
  };

  const stats = {
    totalArtifacts: artifacts.length,
    verifiedArtifacts: artifacts.filter(a => a.verification_status === "verified").length,
    pendingVerification: artifacts.filter(a => a.verification_status === "pending").length,
    totalClaims: claims.length,
    approvedClaims: claims.filter(c => c.review_status === "approved").length,
    totalVerifications: verifications.length,
    successfulVerifications: verifications.filter(v => v.outcome === "success").length,
    avgReproducibilityScore: artifacts.filter(a => a.reproducibility_score).length > 0
      ? Math.round(artifacts.reduce((sum, a) => sum + (a.reproducibility_score || 0), 0) / 
          artifacts.filter(a => a.reproducibility_score).length)
      : 0,
  };

  return {
    artifacts,
    lineage,
    claims,
    verifications,
    loading,
    stats,
    refetch: fetchAll,
    submitClaim,
    submitVerification,
  };
}

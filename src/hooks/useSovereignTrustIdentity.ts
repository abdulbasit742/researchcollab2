/**
 * React hooks for Sovereign Trust Identity & Global Ledger (STIGL).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSEID, getSEID, updateSEID,
  appendTrustLedger, getUserTrustLedger,
  saveECSV2, getECSV2,
  addInstitutionalVerification, getUserVerifications,
  saveCrossBorderCompatibility, getCrossBorderCompatibility,
  logIdentityExport, getIdentityExports,
  savePrivacySettings, getPrivacySettings,
  flagFraud, getFraudFlags, reviewFraudFlag,
  initiateTrustRecovery, getUserTrustRecovery, updateTrustRecovery,
  saveAITrustAnalysis, getAITrustAnalysis,
  requestExternalIntegration, getExternalIntegrations,
  saveTrustGraphEdge, getUserTrustGraph,
  saveGenerationalContinuity, getGenerationalContinuity,
  createAccessKey, getUserAccessKeys, unlockAccessKey,
} from "@/lib/professional/sovereignTrustIdentityEngine";
import type {
  SEIDInput, TrustLedgerEntry, ECSV2Input, InstitutionalVerificationInput,
  CrossBorderCompatibilityInput, IdentityExportInput, PrivacySettingsInput,
  FraudFlagInput, TrustRecoveryInput, AITrustAnalysisInput,
  ExternalIntegrationInput, TrustGraphEdgeInput, GenerationalContinuityInput,
  AccessKeyInput,
} from "@/lib/professional/sovereignTrustIdentityEngine";

// ─── SEID ───────────────────────────────────────────────────
export function useSTIGLSEID(userId?: string) {
  return useQuery({ queryKey: ["stigl-seid", userId], queryFn: () => getSEID(userId!), enabled: !!userId });
}
export function useCreateSTIGLSEID() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SEIDInput) => createSEID(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-seid"] }); toast.success("Sovereign Execution ID created"); },
  });
}
export function useUpdateSTIGLSEID() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: string; updates: Partial<SEIDInput> }) => updateSEID(p.userId, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-seid"] }); },
  });
}

// ─── Trust Ledger ───────────────────────────────────────────
export function useSTIGLTrustLedger(userId?: string, limit?: number) {
  return useQuery({ queryKey: ["stigl-ledger", userId], queryFn: () => getUserTrustLedger(userId!, limit), enabled: !!userId });
}
export function useAppendSTIGLTrustLedger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entry: TrustLedgerEntry) => appendTrustLedger(entry),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-ledger"] }); },
  });
}

// ─── ECS v2 ─────────────────────────────────────────────────
export function useSTIGLECSV2(userId?: string) {
  return useQuery({ queryKey: ["stigl-ecs", userId], queryFn: () => getECSV2(userId!), enabled: !!userId });
}
export function useSaveSTIGLECSV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ECSV2Input) => saveECSV2(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-ecs"] }); toast.success("ECS 2.0 computed"); },
  });
}

// ─── Institutional Verification ─────────────────────────────
export function useSTIGLVerifications(userId?: string) {
  return useQuery({ queryKey: ["stigl-verif", userId], queryFn: () => getUserVerifications(userId!), enabled: !!userId });
}
export function useAddSTIGLVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InstitutionalVerificationInput) => addInstitutionalVerification(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-verif"] }); toast.success("Verification added"); },
  });
}

// ─── Cross-Border Compatibility ─────────────────────────────
export function useSTIGLCrossBorder(userId?: string) {
  return useQuery({ queryKey: ["stigl-xborder", userId], queryFn: () => getCrossBorderCompatibility(userId!), enabled: !!userId });
}
export function useSaveSTIGLCrossBorder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossBorderCompatibilityInput) => saveCrossBorderCompatibility(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-xborder"] }); },
  });
}

// ─── Identity Export ────────────────────────────────────────
export function useSTIGLExports(userId?: string) {
  return useQuery({ queryKey: ["stigl-exports", userId], queryFn: () => getIdentityExports(userId!), enabled: !!userId });
}
export function useLogSTIGLExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IdentityExportInput) => logIdentityExport(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-exports"] }); toast.success("Identity exported"); },
  });
}

// ─── Privacy Settings ───────────────────────────────────────
export function useSTIGLPrivacy(userId?: string) {
  return useQuery({ queryKey: ["stigl-privacy", userId], queryFn: () => getPrivacySettings(userId!), enabled: !!userId });
}
export function useSaveSTIGLPrivacy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PrivacySettingsInput) => savePrivacySettings(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-privacy"] }); toast.success("Privacy settings updated"); },
  });
}

// ─── Fraud Flags ────────────────────────────────────────────
export function useSTIGLFraudFlags(status?: string) {
  return useQuery({ queryKey: ["stigl-fraud", status], queryFn: () => getFraudFlags(status) });
}
export function useFlagSTIGLFraud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FraudFlagInput) => flagFraud(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-fraud"] }); toast.success("Fraud flagged"); },
  });
}
export function useReviewSTIGLFraudFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { flagId: string; reviewedBy: string }) => reviewFraudFlag(p.flagId, p.reviewedBy),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-fraud"] }); },
  });
}

// ─── Trust Recovery ─────────────────────────────────────────
export function useSTIGLTrustRecovery(userId?: string) {
  return useQuery({ queryKey: ["stigl-recovery", userId], queryFn: () => getUserTrustRecovery(userId!), enabled: !!userId });
}
export function useInitiateSTIGLRecovery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrustRecoveryInput) => initiateTrustRecovery(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-recovery"] }); toast.success("Trust recovery initiated"); },
  });
}
export function useUpdateSTIGLRecovery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; updates: Partial<TrustRecoveryInput> & Record<string, unknown> }) => updateTrustRecovery(p.id, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-recovery"] }); },
  });
}

// ─── AI Trust Analysis ─────────────────────────────────────
export function useSTIGLAIAnalysis(userId?: string) {
  return useQuery({ queryKey: ["stigl-ai", userId], queryFn: () => getAITrustAnalysis(userId!), enabled: !!userId });
}
export function useSaveSTIGLAIAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AITrustAnalysisInput) => saveAITrustAnalysis(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-ai"] }); },
  });
}

// ─── External Integrations ──────────────────────────────────
export function useSTIGLExternalIntegrations(targetUserId?: string) {
  return useQuery({ queryKey: ["stigl-ext", targetUserId], queryFn: () => getExternalIntegrations(targetUserId!), enabled: !!targetUserId });
}
export function useRequestSTIGLIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExternalIntegrationInput) => requestExternalIntegration(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-ext"] }); toast.success("Integration requested"); },
  });
}

// ─── Trust Graph ────────────────────────────────────────────
export function useSTIGLTrustGraph(userId?: string) {
  return useQuery({ queryKey: ["stigl-graph", userId], queryFn: () => getUserTrustGraph(userId!), enabled: !!userId });
}
export function useSaveSTIGLTrustGraphEdge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrustGraphEdgeInput) => saveTrustGraphEdge(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-graph"] }); },
  });
}

// ─── Generational Continuity ────────────────────────────────
export function useSTIGLGenerational(userId?: string) {
  return useQuery({ queryKey: ["stigl-gen", userId], queryFn: () => getGenerationalContinuity(userId!), enabled: !!userId });
}
export function useSaveSTIGLGenerational() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerationalContinuityInput) => saveGenerationalContinuity(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-gen"] }); },
  });
}

// ─── Access Keys ────────────────────────────────────────────
export function useSTIGLAccessKeys(userId?: string) {
  return useQuery({ queryKey: ["stigl-access", userId], queryFn: () => getUserAccessKeys(userId!), enabled: !!userId });
}
export function useCreateSTIGLAccessKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AccessKeyInput) => createAccessKey(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-access"] }); },
  });
}
export function useUnlockSTIGLAccessKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (keyId: string) => unlockAccessKey(keyId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stigl-access"] }); toast.success("Access unlocked"); },
  });
}

// ─── Aggregated Identity Dashboard ─────────────────────────
export function useSTIGLIdentityDashboard(userId?: string) {
  const seid = useSTIGLSEID(userId);
  const ecs = useSTIGLECSV2(userId);
  const ledger = useSTIGLTrustLedger(userId, 20);
  const verifications = useSTIGLVerifications(userId);
  const crossBorder = useSTIGLCrossBorder(userId);
  const privacy = useSTIGLPrivacy(userId);
  const recovery = useSTIGLTrustRecovery(userId);
  const graph = useSTIGLTrustGraph(userId);
  const generational = useSTIGLGenerational(userId);
  const accessKeys = useSTIGLAccessKeys(userId);

  return {
    sovereignId: seid.data,
    executionCreditScore: ecs.data,
    trustLedger: ledger.data ?? [],
    verifications: verifications.data ?? [],
    crossBorderCompatibility: crossBorder.data,
    privacySettings: privacy.data,
    trustRecovery: recovery.data ?? [],
    trustGraph: graph.data ?? [],
    generationalContinuity: generational.data,
    accessKeys: accessKeys.data ?? [],
    isLoading: seid.isLoading || ecs.isLoading || ledger.isLoading,
  };
}

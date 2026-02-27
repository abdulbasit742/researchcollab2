/**
 * React hooks for Global Research Governance & Compliance System (GRGCS).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createComplianceCheckpoint, getGrantComplianceCheckpoints, verifyCheckpoint,
  saveCIS, getCIS, createEthicsRecord, getEthicsRecords, flagEthicsRecord,
  assessCrossBorderCompliance, getCrossBorderAssessments,
  detectComplianceAnomalies, saveComplianceAnomalies,
  forecastCompliance, saveComplianceForecast,
  saveDataGovernanceAssessment, getDataGovernance,
  getRegulatoryTemplates, getGovernmentOversight,
} from "@/lib/professional/researchGovernanceCompliance";
import type {
  ComplianceCheckpoint, ComplianceIntegrityInput, EthicsRecord,
  CrossBorderAssessment, DataGovernanceAssessment,
} from "@/lib/professional/researchGovernanceCompliance";

export function useGrantComplianceCheckpoints(grantId?: string) {
  return useQuery({ queryKey: ["complianceCheckpoints", grantId], queryFn: () => getGrantComplianceCheckpoints(grantId!), enabled: !!grantId });
}

export function useCreateComplianceCheckpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cp: ComplianceCheckpoint) => createComplianceCheckpoint(cp),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["complianceCheckpoints"] }); toast.success("Compliance checkpoint created"); },
  });
}

export function useVerifyCheckpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { checkpointId: string; verifiedBy: string }) => verifyCheckpoint(params.checkpointId, params.verifiedBy),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["complianceCheckpoints"] }); toast.success("Checkpoint verified"); },
  });
}

export function useComplianceIntegrityScore(entityType?: string, entityId?: string) {
  return useQuery({ queryKey: ["complianceCIS", entityType, entityId], queryFn: () => getCIS(entityType!, entityId!), enabled: !!entityType && !!entityId });
}

export function useComputeCIS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ComplianceIntegrityInput) => saveCIS(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["complianceCIS"] }); toast.success("Compliance score computed"); },
  });
}

export function useEthicsRecords(grantId?: string, institutionId?: string) {
  return useQuery({ queryKey: ["ethicsRecords", grantId, institutionId], queryFn: () => getEthicsRecords(grantId, institutionId) });
}

export function useCreateEthicsRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (record: EthicsRecord) => createEthicsRecord(record),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ethicsRecords"] }); toast.success("Ethics record created"); },
  });
}

export function useFlagEthicsRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { recordId: string; reason: string }) => flagEthicsRecord(params.recordId, params.reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ethicsRecords"] }); toast.success("Ethics record flagged"); },
  });
}

export function useCrossBorderAssessments(grantId?: string) {
  return useQuery({ queryKey: ["crossBorderCompliance", grantId], queryFn: () => getCrossBorderAssessments(grantId!), enabled: !!grantId });
}

export function useAssessCrossBorder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assessment: CrossBorderAssessment) => assessCrossBorderCompliance(assessment),
    onSuccess: (riskLevel) => { qc.invalidateQueries({ queryKey: ["crossBorderCompliance"] }); toast.success(`Cross-border risk: ${riskLevel}`); },
  });
}

export function useDetectComplianceAnomalies() {
  return useMutation({
    mutationFn: async (params: { entityType: string; entityId: string } & Parameters<typeof detectComplianceAnomalies>[0]) => {
      const flags = detectComplianceAnomalies(params);
      await saveComplianceAnomalies(params.entityType, params.entityId, flags);
      return flags;
    },
  });
}

export function useForecastCompliance() {
  return useMutation({
    mutationFn: async (params: { entityType: string; entityId: string } & Parameters<typeof forecastCompliance>[0]) => {
      const forecast = forecastCompliance(params);
      await saveComplianceForecast(params.entityType, params.entityId, forecast);
      return forecast;
    },
    onSuccess: () => toast.success("Compliance forecast generated"),
  });
}

export function useDataGovernance(grantId?: string, institutionId?: string) {
  return useQuery({ queryKey: ["dataGovernance", grantId, institutionId], queryFn: () => getDataGovernance(grantId, institutionId) });
}

export function useSaveDataGovernance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assessment: DataGovernanceAssessment) => saveDataGovernanceAssessment(assessment),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dataGovernance"] }); toast.success("Data governance assessment saved"); },
  });
}

export function useRegulatoryTemplates(jurisdiction?: string) {
  return useQuery({ queryKey: ["regulatoryTemplates", jurisdiction], queryFn: () => getRegulatoryTemplates(jurisdiction) });
}

export function useGovernmentOversight(country?: string) {
  return useQuery({ queryKey: ["governmentOversight", country], queryFn: () => getGovernmentOversight(country!), enabled: !!country });
}

/**
 * React hooks for Global Open Science & Living Knowledge Infrastructure (GOSLKI).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createLRO, getLRO, searchLROs, updateLROVersion, getLROVersionHistory,
  createDataset, getDatasets, logDatasetAccess,
  saveReproducibilityRecord, getReproducibilityRecords,
  saveRRI, getRRI, submitReplicationAttempt, completeReplication,
  getReplicationAttempts, saveOpenScienceImpact,
} from "@/lib/professional/openScienceInfrastructure";
import type {
  LROInput, LROVersionInput, DatasetInput, ReproducibilityInput,
  RRIInput, ReplicationAttemptInput, OpenScienceImpactInput,
} from "@/lib/professional/openScienceInfrastructure";

export function useLRO(lroId?: string) {
  return useQuery({ queryKey: ["lro", lroId], queryFn: () => getLRO(lroId!), enabled: !!lroId });
}

export function useSearchLROs(filters: Parameters<typeof searchLROs>[0]) {
  return useQuery({ queryKey: ["lros", filters], queryFn: () => searchLROs(filters) });
}

export function useCreateLRO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LROInput) => createLRO(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lros"] }); toast.success("Living Research Object created"); },
  });
}

export function useUpdateLROVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LROVersionInput) => updateLROVersion(input),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ["lro", v.lro_id] }); qc.invalidateQueries({ queryKey: ["lroVersions"] }); toast.success("LRO version updated"); },
  });
}

export function useLROVersionHistory(lroId?: string) {
  return useQuery({ queryKey: ["lroVersions", lroId], queryFn: () => getLROVersionHistory(lroId!), enabled: !!lroId });
}

export function useCreateDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DatasetInput) => createDataset(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["datasets"] }); toast.success("Dataset registered"); },
  });
}

export function useDatasets(lroId?: string, institutionId?: string) {
  return useQuery({ queryKey: ["datasets", lroId, institutionId], queryFn: () => getDatasets(lroId, institutionId) });
}

export function useLogDatasetAccess() {
  return useMutation({
    mutationFn: (p: { datasetId: string; accessedBy: string; accessType: string; granted: boolean; denialReason?: string }) =>
      logDatasetAccess(p.datasetId, p.accessedBy, p.accessType, p.granted, p.denialReason),
  });
}

export function useSaveReproducibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReproducibilityInput) => saveReproducibilityRecord(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reproducibility"] }); toast.success("Reproducibility record saved"); },
  });
}

export function useReproducibilityRecords(lroId?: string) {
  return useQuery({ queryKey: ["reproducibility", lroId], queryFn: () => getReproducibilityRecords(lroId!), enabled: !!lroId });
}

export function useSaveRRI() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { lroId: string; input: RRIInput }) => saveRRI(p.lroId, p.input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rri"] }); toast.success("Reproducibility score computed"); },
  });
}

export function useRRI(lroId?: string) {
  return useQuery({ queryKey: ["rri", lroId], queryFn: () => getRRI(lroId!), enabled: !!lroId });
}

export function useSubmitReplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReplicationAttemptInput) => submitReplicationAttempt(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["replications"] }); toast.success("Replication attempt submitted"); },
  });
}

export function useCompleteReplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { attemptId: string; success: boolean; report: string }) => completeReplication(p.attemptId, p.success, p.report),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["replications"] }); toast.success("Replication completed"); },
  });
}

export function useReplicationAttempts(lroId?: string) {
  return useQuery({ queryKey: ["replications", lroId], queryFn: () => getReplicationAttempts(lroId!), enabled: !!lroId });
}

export function useSaveOpenScienceImpact() {
  return useMutation({
    mutationFn: (p: { entityType: string; entityId: string; input: OpenScienceImpactInput }) =>
      saveOpenScienceImpact(p.entityType, p.entityId, p.input),
    onSuccess: () => toast.success("Open science impact score saved"),
  });
}

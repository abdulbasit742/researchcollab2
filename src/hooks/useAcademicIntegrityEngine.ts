/**
 * React hooks for Global Academic Integrity & Defense Engine (GAIDE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  saveCitationFlags, getCitationFlags, detectCitationManipulation,
  saveCoauthorFlags, getCoauthorFlags,
  saveGrantMisuseFlags, getGrantMisuseFlags, detectGrantMisuse,
  savePatentInflationFlags, getPatentInflationFlags,
  saveIIRI, getIIRI,
  saveJournalRisk, getJournalRisks,
  saveVolatilityEvents, getVolatilityEvents,
  saveOpenScienceFraudFlags, getOpenScienceFraudFlags,
  saveCollusionFlags, getCollusionFlags,
  saveICS, getICS,
  submitAppeal, updateAppealStatus, getAppeals,
} from "@/lib/professional/academicIntegrityEngine";
import type {
  CitationFlagInput, CoauthorFlagInput, GrantMisuseFlagInput,
  PatentInflationFlagInput, IIRIInput, JournalRiskInput,
  VolatilityEventInput, OpenScienceFraudInput, CollusionFlagInput,
  ICSInput, AppealInput,
} from "@/lib/professional/academicIntegrityEngine";

// === Citation Integrity ===
export function useCitationFlags(researcherId?: string) {
  return useQuery({ queryKey: ["citationFlags", researcherId], queryFn: () => getCitationFlags(researcherId) });
}

export function useSaveCitationFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flags: CitationFlagInput[]) => saveCitationFlags(flags),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["citationFlags"] }); toast.success("Citation integrity flags saved"); },
  });
}

// === Co-Author Inflation ===
export function useCoauthorFlags(researcherId?: string) {
  return useQuery({ queryKey: ["coauthorFlags", researcherId], queryFn: () => getCoauthorFlags(researcherId) });
}

export function useSaveCoauthorFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flags: CoauthorFlagInput[]) => saveCoauthorFlags(flags),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["coauthorFlags"] }); toast.success("Co-author flags saved"); },
  });
}

// === Grant Misuse ===
export function useGrantMisuseFlags(grantId?: string, institutionId?: string) {
  return useQuery({ queryKey: ["grantMisuseFlags", grantId, institutionId], queryFn: () => getGrantMisuseFlags(grantId, institutionId) });
}

export function useSaveGrantMisuseFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flags: GrantMisuseFlagInput[]) => saveGrantMisuseFlags(flags),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grantMisuseFlags"] }); toast.success("Grant misuse flags saved"); },
  });
}

// === Patent Inflation ===
export function usePatentInflationFlags(entityType?: string, entityId?: string) {
  return useQuery({ queryKey: ["patentInflationFlags", entityType, entityId], queryFn: () => getPatentInflationFlags(entityType, entityId) });
}

export function useSavePatentInflationFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flags: PatentInflationFlagInput[]) => savePatentInflationFlags(flags),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patentInflationFlags"] }); toast.success("Patent inflation flags saved"); },
  });
}

// === Institutional Integrity Risk (IIRI) ===
export function useIIRI(institutionId?: string) {
  return useQuery({ queryKey: ["iiri", institutionId], queryFn: () => getIIRI(institutionId) });
}

export function useSaveIIRI() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IIRIInput) => saveIIRI(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["iiri"] }); toast.success("Institutional integrity risk computed"); },
  });
}

// === Journal Risk ===
export function useJournalRisks(tier?: string) {
  return useQuery({ queryKey: ["journalRisks", tier], queryFn: () => getJournalRisks(tier) });
}

export function useSaveJournalRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: JournalRiskInput) => saveJournalRisk(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["journalRisks"] }); toast.success("Journal risk profile saved"); },
  });
}

// === Reputation Volatility ===
export function useVolatilityEvents(entityType?: string, entityId?: string) {
  return useQuery({ queryKey: ["volatilityEvents", entityType, entityId], queryFn: () => getVolatilityEvents(entityType, entityId) });
}

export function useSaveVolatilityEvents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (events: VolatilityEventInput[]) => saveVolatilityEvents(events),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["volatilityEvents"] }); toast.success("Volatility events recorded"); },
  });
}

// === Open Science Fraud ===
export function useOpenScienceFraudFlags(entityType?: string, entityId?: string) {
  return useQuery({ queryKey: ["openScienceFraud", entityType, entityId], queryFn: () => getOpenScienceFraudFlags(entityType, entityId) });
}

export function useSaveOpenScienceFraudFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flags: OpenScienceFraudInput[]) => saveOpenScienceFraudFlags(flags),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["openScienceFraud"] }); toast.success("Open science fraud flags saved"); },
  });
}

// === Network Collusion ===
export function useCollusionFlags(collusionType?: string) {
  return useQuery({ queryKey: ["collusionFlags", collusionType], queryFn: () => getCollusionFlags(collusionType) });
}

export function useSaveCollusionFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flags: CollusionFlagInput[]) => saveCollusionFlags(flags),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["collusionFlags"] }); toast.success("Collusion flags saved"); },
  });
}

// === Integrity Confidence Score ===
export function useICS(entityType?: string, entityId?: string) {
  return useQuery({ queryKey: ["ics", entityType, entityId], queryFn: () => getICS(entityType, entityId) });
}

export function useSaveICS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ICSInput) => saveICS(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ics"] }); toast.success("Integrity confidence score saved"); },
  });
}

// === Appeals ===
export function useAppeals(filters?: Parameters<typeof getAppeals>[0]) {
  return useQuery({ queryKey: ["integrityAppeals", filters], queryFn: () => getAppeals(filters) });
}

export function useSubmitAppeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AppealInput) => submitAppeal(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["integrityAppeals"] }); toast.success("Appeal submitted"); },
  });
}

export function useUpdateAppealStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { appealId: string; update: Parameters<typeof updateAppealStatus>[1] }) => updateAppealStatus(p.appealId, p.update),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["integrityAppeals"] }); toast.success("Appeal status updated"); },
  });
}

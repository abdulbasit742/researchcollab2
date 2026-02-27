/**
 * React hooks for Global Research Infrastructure & Interoperability Engine (GRIIE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  registerApi, getApis, grantApiAccess, getApiAccessGrants, getApiAuditLogs,
  saveIntegrationConfig, getIntegrationConfigs, updateIntegrationSync,
  subscribeWebhook, getWebhookSubscriptions,
  emitEvent, getEvents,
  logDataExport, getDataExportLogs,
  requestCrossBorderTransfer, approveCrossBorderTransfer, getCrossBorderTransfers,
  registerExtension, getExtensions, updateExtensionReview,
  saveStandardizationMapping, getStandardizationMappings,
  linkIdentity, getLinkedIdentities, verifyIdentityLink,
} from "@/lib/professional/researchInfrastructureEngine";
import type {
  ApiRegistryInput, ApiAccessGrantInput, IntegrationConfigInput,
  WebhookSubscriptionInput, EventEmission, DataExportInput,
  CrossBorderTransferInput, ExtensionInput, IdentityFederationInput,
  StandardizationMappingInput,
} from "@/lib/professional/researchInfrastructureEngine";

// === API Registry ===
export function useApis(type?: string) {
  return useQuery({ queryKey: ["apis", type], queryFn: () => getApis(type) });
}

export function useRegisterApi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApiRegistryInput) => registerApi(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["apis"] }); toast.success("API registered"); },
  });
}

export function useApiAccessGrants(apiId?: string, granteeId?: string) {
  return useQuery({ queryKey: ["apiAccess", apiId, granteeId], queryFn: () => getApiAccessGrants(apiId, granteeId) });
}

export function useGrantApiAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApiAccessGrantInput) => grantApiAccess(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["apiAccess"] }); toast.success("API access granted"); },
  });
}

export function useApiAuditLogs(apiId?: string, callerId?: string) {
  return useQuery({ queryKey: ["apiAudit", apiId, callerId], queryFn: () => getApiAuditLogs(apiId, callerId) });
}

// === Integrations ===
export function useIntegrationConfigs(type?: string, institutionId?: string) {
  return useQuery({ queryKey: ["integrations", type, institutionId], queryFn: () => getIntegrationConfigs(type, institutionId) });
}

export function useSaveIntegrationConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IntegrationConfigInput) => saveIntegrationConfig(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["integrations"] }); toast.success("Integration configured"); },
  });
}

export function useUpdateIntegrationSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { configId: string; status: string; errorLog?: Record<string, unknown> }) => updateIntegrationSync(p.configId, p.status, p.errorLog),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["integrations"] }); toast.success("Sync status updated"); },
  });
}

// === Webhooks ===
export function useWebhookSubscriptions(subscriberId?: string) {
  return useQuery({ queryKey: ["webhooks", subscriberId], queryFn: () => getWebhookSubscriptions(subscriberId) });
}

export function useSubscribeWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WebhookSubscriptionInput) => subscribeWebhook(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["webhooks"] }); toast.success("Webhook subscribed"); },
  });
}

// === Event Bus ===
export function useEvents(eventType?: string, entityType?: string) {
  return useQuery({ queryKey: ["events", eventType, entityType], queryFn: () => getEvents(eventType, entityType) });
}

export function useEmitEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (event: EventEmission) => emitEvent(event),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); },
  });
}

// === Data Export ===
export function useDataExportLogs(exporterId?: string, format?: string) {
  return useQuery({ queryKey: ["dataExports", exporterId, format], queryFn: () => getDataExportLogs(exporterId, format) });
}

export function useLogDataExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DataExportInput) => logDataExport(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dataExports"] }); toast.success("Export logged"); },
  });
}

// === Cross-Border Transfers ===
export function useCrossBorderTransfers(status?: string, jurisdiction?: string) {
  return useQuery({ queryKey: ["crossBorder", status, jurisdiction], queryFn: () => getCrossBorderTransfers(status, jurisdiction) });
}

export function useRequestCrossBorderTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossBorderTransferInput) => requestCrossBorderTransfer(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crossBorder"] }); toast.success("Cross-border transfer requested"); },
  });
}

export function useApproveCrossBorderTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { transferId: string; approvedBy: string }) => approveCrossBorderTransfer(p.transferId, p.approvedBy),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crossBorder"] }); toast.success("Transfer approved"); },
  });
}

// === Extensions ===
export function useExtensions(type?: string, verifiedOnly = true) {
  return useQuery({ queryKey: ["extensions", type, verifiedOnly], queryFn: () => getExtensions(type, verifiedOnly) });
}

export function useRegisterExtension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExtensionInput) => registerExtension(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["extensions"] }); toast.success("Extension registered"); },
  });
}

export function useUpdateExtensionReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { extensionId: string; updates: Parameters<typeof updateExtensionReview>[1] }) => updateExtensionReview(p.extensionId, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["extensions"] }); toast.success("Extension review updated"); },
  });
}

// === Standardization ===
export function useStandardizationMappings(schemaType?: string, sourceSystem?: string) {
  return useQuery({ queryKey: ["stdMappings", schemaType, sourceSystem], queryFn: () => getStandardizationMappings(schemaType, sourceSystem) });
}

export function useSaveStandardizationMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StandardizationMappingInput) => saveStandardizationMapping(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stdMappings"] }); toast.success("Mapping saved"); },
  });
}

// === Identity Federation ===
export function useLinkedIdentities(userId?: string) {
  return useQuery({
    queryKey: ["identityLinks", userId],
    queryFn: () => getLinkedIdentities(userId!),
    enabled: !!userId,
  });
}

export function useLinkIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IdentityFederationInput) => linkIdentity(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["identityLinks"] }); toast.success("Identity linked"); },
  });
}

export function useVerifyIdentityLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => verifyIdentityLink(linkId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["identityLinks"] }); toast.success("Identity verified"); },
  });
}

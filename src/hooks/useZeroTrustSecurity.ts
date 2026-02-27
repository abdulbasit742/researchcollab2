/**
 * React hooks for Zero-Trust Security & Privacy Infrastructure.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  getPrivacySettings,
  updatePrivacySettings,
  getAlgorithmTransparency,
  detectIntegrityViolations,
  getSecurityTransparencyReports,
  ZERO_TRUST_TRANSPARENCY,
  type ProfessionalPrivacySettings,
} from "@/lib/professional/zeroTrustSecurity";

export function usePrivacySettings(userId?: string) {
  return useQuery({
    queryKey: ["privacy-settings", userId],
    queryFn: () => getPrivacySettings(userId!),
    enabled: !!userId,
  });
}

export function useUpdatePrivacySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; settings: Partial<ProfessionalPrivacySettings> }) =>
      updatePrivacySettings(params.userId, params.settings),
    onSuccess: (_data, variables) => {
      toast({ title: "Privacy updated", description: "Your privacy settings have been saved." });
      queryClient.invalidateQueries({ queryKey: ["privacy-settings", variables.userId] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useAlgorithmTransparency() {
  return useQuery({
    queryKey: ["algorithm-transparency"],
    queryFn: getAlgorithmTransparency,
    staleTime: 30 * 60 * 1000,
  });
}

export function useIntegrityMonitoring(userId?: string) {
  return useQuery({
    queryKey: ["integrity-monitoring", userId],
    queryFn: () => detectIntegrityViolations(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSecurityTransparencyReports() {
  return useQuery({
    queryKey: ["security-transparency-reports"],
    queryFn: getSecurityTransparencyReports,
    staleTime: 60 * 60 * 1000,
  });
}

export function useZeroTrustTransparency() {
  return ZERO_TRUST_TRANSPARENCY;
}

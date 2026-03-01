import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RegulatoryReport {
  id: string;
  institution_id: string;
  report_type: string;
  generated_by: string;
  file_url: string | null;
  status: string;
  created_at: string;
}

export function useRegulatoryReports(institutionId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["regulatory-reports", institutionId],
    queryFn: async (): Promise<RegulatoryReport[]> => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("regulatory_reports")
        .select("*")
        .eq("generated_by", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      return (data ?? []) as RegulatoryReport[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const requestReport = useMutation({
    mutationFn: async (reportType: string) => {
      if (!user?.id || !institutionId) throw new Error("Missing context");
      await supabase.from("regulatory_reports").insert({
        institution_id: institutionId,
        report_type: reportType,
        generated_by: user.id,
        status: "pending",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regulatory-reports"] }),
  });

  return { reports, isLoading, requestReport: requestReport.mutate };
}

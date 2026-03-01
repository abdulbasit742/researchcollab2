import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BoardReportExport {
  id: string;
  institution_id: string;
  generated_by: string;
  report_type: string;
  file_url: string | null;
  status: string;
  created_at: string;
}

export function useBoardReportExports(institutionId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: exports = [], isLoading } = useQuery({
    queryKey: ["board-report-exports", institutionId],
    queryFn: async (): Promise<BoardReportExport[]> => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("board_report_exports")
        .select("*")
        .eq("generated_by", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as BoardReportExport[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const requestExport = useMutation({
    mutationFn: async (reportType: string) => {
      if (!user?.id || !institutionId) throw new Error("Missing context");
      await supabase.from("board_report_exports").insert({
        institution_id: institutionId,
        generated_by: user.id,
        report_type: reportType,
        status: "pending",
      });
      // Log to compliance audit
      await supabase.from("compliance_audit_log").insert({
        actor_id: user.id,
        action_type: "board_export_requested",
        entity_type: "board_report",
        entity_id: reportType,
        institution_id: institutionId,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["board-report-exports"] }),
  });

  return { exports, isLoading, requestExport: requestExport.mutate };
}

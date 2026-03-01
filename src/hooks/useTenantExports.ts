import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface InstitutionExport {
  id: string;
  institution_id: string;
  export_type: string;
  requested_by: string;
  status: string;
  file_url: string | null;
  created_at: string;
}

export function useTenantExports(institutionId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: exports = [], isLoading } = useQuery({
    queryKey: ["tenant-exports", institutionId],
    queryFn: async (): Promise<InstitutionExport[]> => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("institution_exports")
        .select("*")
        .eq("requested_by", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as InstitutionExport[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const requestExport = useMutation({
    mutationFn: async (exportType: string) => {
      if (!user?.id || !institutionId) throw new Error("Missing context");
      const { error } = await supabase.from("institution_exports").insert({
        institution_id: institutionId,
        export_type: exportType,
        requested_by: user.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenant-exports", institutionId] }),
  });

  return { exports, isLoading, requestExport: requestExport.mutate };
}

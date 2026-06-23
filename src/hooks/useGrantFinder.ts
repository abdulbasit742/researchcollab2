import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GrantRow {
  id: string;
  title: string;
  funder: string;
  description: string | null;
  amount_min: number | null;
  amount_max: number | null;
  currency: string;
  deadline: string | null;
  eligibility: string | null;
  fields: string[] | null;
  application_url: string | null;
  country: string | null;
  region: string | null;
  grant_type: string;
  is_active: boolean;
}

export interface GrantFilters {
  search?: string;
  country?: string;
  field?: string;
  type?: string;
}

export function useGrants(filters: GrantFilters = {}) {
  return useQuery({
    queryKey: ["grants", filters],
    queryFn: async () => {
      let q = supabase.from("grants").select("*").eq("is_active", true).order("deadline", { ascending: true });
      if (filters.country && filters.country !== "all") q = q.eq("country", filters.country);
      if (filters.type && filters.type !== "all") q = q.eq("grant_type", filters.type);
      if (filters.field && filters.field !== "all") q = q.contains("fields", [filters.field]);
      if (filters.search) q = q.or(`title.ilike.%${filters.search}%,funder.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as GrantRow[];
    },
  });
}

export function useSavedGrants() {
  return useQuery({
    queryKey: ["saved_grants"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await supabase
        .from("saved_grants")
        .select("*, grant:grants(*)")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleSaveGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ grantId, saved }: { grantId: string; saved: boolean }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sign in to save grants");
      if (saved) {
        const { error } = await supabase
          .from("saved_grants")
          .delete()
          .eq("user_id", u.user.id)
          .eq("grant_id", grantId);
        if (error) throw error;
        return { saved: false };
      } else {
        const { error } = await supabase
          .from("saved_grants")
          .insert({ user_id: u.user.id, grant_id: grantId });
        if (error) throw error;
        return { saved: true };
      }
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["saved_grants"] });
      toast.success(res.saved ? "Grant saved" : "Removed from saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export interface EligibilityResult {
  fit_score: number;
  verdict: "strong" | "moderate" | "weak";
  reasons: string[];
  missing: string[];
  suggestions: string[];
  draft_pitch: string;
}

export async function checkEligibility(grant: GrantRow, profile: Record<string, unknown>): Promise<EligibilityResult> {
  const { data, error } = await supabase.functions.invoke("grant-eligibility-check", {
    body: { grant, profile },
  });
  if (error) throw error;
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as EligibilityResult;
}

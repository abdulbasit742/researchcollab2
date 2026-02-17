import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFinancialRails() {
  return useQuery({
    queryKey: ["financial-rails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_rail_registry")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useTreatyRegistry() {
  return useQuery({
    queryKey: ["treaty-registry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("treaty_registry")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useRegulatoryPartners() {
  return useQuery({
    queryKey: ["regulatory-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regulatory_partners")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useJurisdictionRules(countryCode?: string) {
  return useQuery({
    queryKey: ["jurisdiction-rules", countryCode],
    queryFn: async () => {
      let query = supabase.from("jurisdiction_rules").select("*").eq("is_active", true);
      if (countryCode) query = query.eq("country_code", countryCode);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

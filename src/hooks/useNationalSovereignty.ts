import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Feature 29: National Sovereignty Hooks (separate from useGovernmentIntegration)

export interface NationalProfile {
  id: string;
  country_code: string;
  country_name: string;
  deployment_model: string;
  status: string;
  data_residency_rules: Record<string, unknown>;
}

export interface NationalStrategy {
  id: string;
  country_code: string;
  strategy_name: string;
  priority_domains: string[];
  adopted_at?: string;
}

export function useNationalSovereignty() {
  const [profiles, setProfiles] = useState<NationalProfile[]>([]);
  const [strategies, setStrategies] = useState<NationalStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActiveProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("national_infrastructure_profiles")
        .select("*")
        .eq("status", "active");
      if (error) throw error;
      setProfiles((data || []) as NationalProfile[]);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStrategiesForCountry = useCallback(async (countryCode: string) => {
    const { data } = await supabase
      .from("national_research_strategies")
      .select("*")
      .eq("country_code", countryCode)
      .not("adopted_at", "is", null);
    setStrategies((data || []) as NationalStrategy[]);
  }, []);

  return { profiles, strategies, isLoading, fetchActiveProfiles, fetchStrategiesForCountry };
}

export function useSovereignFederationLinks() {
  const [links, setLinks] = useState<any[]>([]);
  
  const fetchActiveLinks = useCallback(async (countryCode?: string) => {
    let query = supabase.from("sovereign_federation_links").select("*").eq("status", "active");
    if (countryCode) {
      query = query.or(`source_country.eq.${countryCode},target_country.eq.${countryCode}`);
    }
    const { data } = await query;
    setLinks(data || []);
  }, []);

  return { links, fetchActiveLinks };
}

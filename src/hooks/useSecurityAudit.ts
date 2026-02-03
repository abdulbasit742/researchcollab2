import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ThreatModel {
  id: string;
  component: string;
  threat_type: string;
  threat_category: string | null;
  title: string;
  description: string;
  attack_vector: string | null;
  potential_impact: string | null;
  risk_level: string;
  likelihood: string;
  mitigation: string | null;
  mitigation_status: string;
  reviewed_at: string | null;
  created_at: string;
}

export interface AttackSurface {
  id: string;
  surface_name: string;
  surface_type: string;
  component: string;
  entry_points: string[] | null;
  authentication_required: boolean;
  authorization_level: string | null;
  data_sensitivity: string;
  exposure_level: string;
  risk_score: number;
  last_assessed_at: string | null;
  created_at: string;
}

export interface SecurityTestResult {
  id: string;
  suite_id: string | null;
  test_type: string;
  test_name: string;
  component: string;
  result: string;
  severity: string | null;
  evidence: Record<string, unknown> | null;
  tested_at: string;
  resolved_at: string | null;
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  description: string;
  component: string;
  vulnerability_type: string;
  severity: string;
  cvss_score: number | null;
  status: string;
  discovered_at: string;
  remediation_deadline: string | null;
  resolved_at: string | null;
}

export interface SecurityIncident {
  id: string;
  incident_id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  incident_type: string;
  affected_components: string[] | null;
  affected_users_count: number;
  data_compromised: boolean;
  detected_at: string;
  contained_at: string | null;
  closed_at: string | null;
}

export function useSecurityAudit() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threatModels, setThreatModels] = useState<ThreatModel[]>([]);
  const [attackSurfaces, setAttackSurfaces] = useState<AttackSurface[]>([]);
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<SecurityVulnerability[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [threats, surfaces, tests, vulns, incs] = await Promise.all([
        supabase.from("threat_models" as any).select("*").order("risk_level"),
        supabase.from("attack_surfaces" as any).select("*").order("risk_score", { ascending: false }),
        supabase.from("security_test_results" as any).select("*").order("tested_at", { ascending: false }).limit(50),
        supabase.from("security_vulnerabilities" as any).select("*").order("severity"),
        supabase.from("security_incidents" as any).select("*").order("detected_at", { ascending: false }),
      ]);

      setThreatModels((threats.data as unknown as ThreatModel[]) || []);
      setAttackSurfaces((surfaces.data as unknown as AttackSurface[]) || []);
      setTestResults((tests.data as unknown as SecurityTestResult[]) || []);
      setVulnerabilities((vulns.data as unknown as SecurityVulnerability[]) || []);
      setIncidents((incs.data as unknown as SecurityIncident[]) || []);
    } catch (err) {
      console.error("Error fetching security data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createThreatModel = async (data: Partial<ThreatModel>) => {
    const { error } = await supabase.from("threat_models" as any).insert(data);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Threat Model Created" });
    await fetchAll();
    return true;
  };

  const createVulnerability = async (data: Partial<SecurityVulnerability>) => {
    const { error } = await supabase.from("security_vulnerabilities" as any).insert(data);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Vulnerability Logged" });
    await fetchAll();
    return true;
  };

  const resolveVulnerability = async (id: string, notes: string) => {
    const { error } = await supabase
      .from("security_vulnerabilities" as any)
      .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: user?.id })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Vulnerability Resolved" });
    await fetchAll();
    return true;
  };

  const stats = {
    totalThreats: threatModels.length,
    criticalThreats: threatModels.filter(t => t.risk_level === "critical").length,
    openVulnerabilities: vulnerabilities.filter(v => v.status === "open").length,
    criticalVulnerabilities: vulnerabilities.filter(v => v.severity === "critical" && v.status === "open").length,
    activeIncidents: incidents.filter(i => !["closed", "recovered"].includes(i.status)).length,
    failedTests: testResults.filter(t => t.result === "fail" && !t.resolved_at).length,
    attackSurfacesCovered: attackSurfaces.length,
    highRiskSurfaces: attackSurfaces.filter(s => s.risk_score >= 70).length,
  };

  return {
    threatModels,
    attackSurfaces,
    testResults,
    vulnerabilities,
    incidents,
    loading,
    stats,
    refetch: fetchAll,
    createThreatModel,
    createVulnerability,
    resolveVulnerability,
  };
}

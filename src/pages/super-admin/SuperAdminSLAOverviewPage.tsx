import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSuperAdminAudit } from "@/hooks/useSuperAdminAudit";
import { useEffect, useMemo } from "react";
import { ShieldCheck, AlertTriangle, TrendingUp, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function useGlobalSLAData() {
  return useQuery({
    queryKey: ["sa-sla-overview"],
    queryFn: async () => {
      const [metricsRes, breachesRes, orgsRes] = await Promise.all([
        (supabase as any).from("sla_performance_metrics").select("*").order("generated_at", { ascending: false }).limit(200),
        (supabase as any).from("sla_breach_events").select("institution_id, breach_level, sla_type").limit(500),
        supabase.from("organizations").select("id, name, org_trust_score").limit(100),
      ]);

      const metrics = metricsRes.data || [];
      const breaches = breachesRes.data || [];
      const orgs = orgsRes.data || [];

      // Per-institution breach density
      const breachByOrg: Record<string, number> = {};
      breaches.forEach((b: any) => {
        breachByOrg[b.institution_id] = (breachByOrg[b.institution_id] || 0) + 1;
      });

      const orgMap = new Map(orgs.map((o: any) => [o.id, o]));

      const ranked = Object.entries(breachByOrg)
        .map(([id, count]) => {
          const org = orgMap.get(id);
          return { id, name: org?.name ?? "Unknown", breaches: count, trust: org?.org_trust_score ?? 0 };
        })
        .sort((a, b) => b.breaches - a.breaches)
        .slice(0, 15);

      const avgCompliance = metrics.length > 0
        ? Math.round(metrics.reduce((s: number, m: any) => s + (m.compliance_rate_percent ?? 100), 0) / metrics.length)
        : 100;

      return {
        totalMetrics: metrics.length,
        totalBreaches: breaches.length,
        avgCompliance,
        rankedInstitutions: ranked,
        totalInstitutionsTracked: new Set(metrics.map((m: any) => m.institution_id)).size,
      };
    },
    staleTime: 120_000,
  });
}

export default function SuperAdminSLAOverviewPage() {
  const { logAction } = useSuperAdminAudit();
  const { data, isLoading } = useGlobalSLAData();

  useEffect(() => { logAction("view_sla_overview"); }, []);

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">Global SLA Overview</h1>
            <p className="text-sm text-muted-foreground">Cross-institution SLA compliance and breach density</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Avg Compliance", value: data ? `${data.avgCompliance}%` : undefined, icon: ShieldCheck, color: (data?.avgCompliance ?? 100) >= 90 ? "text-success" : "text-warning" },
              { label: "Total Breaches", value: data?.totalBreaches, icon: AlertTriangle, color: (data?.totalBreaches ?? 0) > 0 ? "text-destructive" : "text-success" },
              { label: "Institutions Tracked", value: data?.totalInstitutionsTracked, icon: Building2, color: "text-primary" },
              { label: "Data Points", value: data?.totalMetrics, icon: TrendingUp, color: "text-primary" },
            ].map(m => (
              <Card key={m.label}>
                <CardContent className="p-4 text-center">
                  <m.icon className={`h-5 w-5 mx-auto mb-2 ${m.color}`} />
                  {isLoading ? <Skeleton className="h-7 w-14 mx-auto" /> : <p className="text-xl font-bold">{m.value ?? "—"}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Breach Density by Institution</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-56" /> : !data?.rankedInstitutions.length ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No breach data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, data.rankedInstitutions.length * 32)}>
                  <BarChart data={data.rankedInstitutions} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="breaches" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} name="Breaches" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {!isLoading && data?.rankedInstitutions && data.rankedInstitutions.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Institution SLA Rankings</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {data.rankedInstitutions.map((org, i) => (
                  <div key={org.id} className="flex items-center gap-3 p-2.5 rounded-lg border">
                    <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{org.name}</p>
                      <p className="text-[9px] text-muted-foreground">Trust: {org.trust} · Breaches: {org.breaches}</p>
                    </div>
                    <Badge variant={org.breaches > 10 ? "destructive" : org.breaches > 3 ? "warning" as any : "default"} className="text-[9px]">
                      {org.breaches} breach{org.breaches !== 1 ? "es" : ""}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}

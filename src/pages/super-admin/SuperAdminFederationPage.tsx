import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSuperAdminAudit } from "@/hooks/useSuperAdminAudit";
import { useEffect } from "react";
import { Globe, Server, Shield, CheckCircle } from "lucide-react";

function useFederationData() {
  return useQuery({
    queryKey: ["sa-federation"],
    queryFn: async () => {
      const { data: nodes } = await (supabase as any)
        .from("federation_nodes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: certs, count: certCount } = await (supabase as any)
        .from("platform_certificates")
        .select("id", { count: "exact", head: true });

      return {
        nodes: (nodes || []) as any[],
        totalNodes: nodes?.length ?? 0,
        certVerifications: certCount ?? 0,
      };
    },
    staleTime: 120_000,
  });
}

export default function SuperAdminFederationPage() {
  const { logAction } = useSuperAdminAudit();
  const { data, isLoading } = useFederationData();

  useEffect(() => { logAction("view_federation"); }, []);

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">Federation Overview</h1>
            <p className="text-sm text-muted-foreground">Cross-node health, compliance, and verification volume</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Globe className="h-5 w-5 mx-auto mb-2 text-primary" />
                {isLoading ? <Skeleton className="h-7 w-12 mx-auto" /> : <p className="text-xl font-bold">{data?.totalNodes}</p>}
                <p className="text-[10px] text-muted-foreground">Total Nodes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-5 w-5 mx-auto mb-2 text-success" />
                {isLoading ? <Skeleton className="h-7 w-12 mx-auto" /> : <p className="text-xl font-bold">{data?.certVerifications}</p>}
                <p className="text-[10px] text-muted-foreground">Cert Verifications</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Server className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-xl font-bold">{data?.nodes?.filter((n: any) => n.status === "active").length ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Active Nodes</p>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <Skeleton className="h-40" />
          ) : !data?.nodes?.length ? (
            <EmptyState icon={Globe} title="No federation nodes" description="Federation nodes will appear when multi-node deployment is active." />
          ) : (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Node Registry</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {data.nodes.map((n: any) => (
                  <div key={n.id} className="flex items-center gap-3 p-2.5 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full ${n.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.node_name || n.id}</p>
                      <p className="text-[9px] text-muted-foreground">{n.region || "Unknown region"}</p>
                    </div>
                    <Badge variant={n.status === "active" ? "default" : "secondary"} className="text-[9px]">{n.status}</Badge>
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

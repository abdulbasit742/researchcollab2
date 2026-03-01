import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SuperAdminAuditLogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sa-audit-log"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("super_admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return (data || []) as any[];
    },
    staleTime: 15_000,
  });

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">Super Admin Audit Log</h1>
            <p className="text-sm text-muted-foreground">Immutable record of all super admin actions</p>
          </div>

          {isLoading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : !data?.length ? (
            <EmptyState icon={FileText} title="No audit entries" description="Super admin actions will be logged here." />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {data.map((entry: any) => (
                    <div key={entry.id} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{entry.action_type}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {entry.target_entity_type && `${entry.target_entity_type}`}
                          {entry.target_entity_id && ` → ${entry.target_entity_id.slice(0, 8)}…`}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}

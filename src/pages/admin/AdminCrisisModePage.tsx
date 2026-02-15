import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield } from "lucide-react";

export default function AdminCrisisModePage() {
  const { data: crises } = useQuery({
    queryKey: ["crisis-modes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_crisis_modes")
        .select("*")
        .order("activated_at", { ascending: false });
      return data || [];
    },
  });

  const active = crises?.filter((c) => c.is_active) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Crisis Mode</h1>
            <p className="text-muted-foreground">Emergency restrictions & stability controls</p>
          </div>
          {active.length > 0 && <Badge variant="destructive">🔴 {active.length} Active</Badge>}
        </div>

        {active.length > 0 && (
          <Card className="border-destructive">
            <CardHeader><CardTitle className="text-destructive">Active Crisis Modes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {active.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.trigger_type}</span>
                    <Badge variant="destructive">Active</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Activated: {new Date(c.activated_at).toLocaleString()}
                  </div>
                  <div className="text-xs mt-1">
                    Restrictions: {JSON.stringify(c.restrictions_applied)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Crisis History</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {crises?.length === 0 && <p className="text-muted-foreground">No crisis events recorded.</p>}
            {crises?.filter(c => !c.is_active).map((c) => (
              <div key={c.id} className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{c.trigger_type}</span>
                  <Badge variant="secondary">Resolved</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(c.activated_at).toLocaleDateString()} — {c.deactivated_at ? new Date(c.deactivated_at).toLocaleDateString() : "N/A"}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

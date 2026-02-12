import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminFeatureGovernancePage() {
  const { data: proposals } = useQuery({
    queryKey: ["feature-proposals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("feature_proposals")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const statusIcon = (s: string) => {
    if (s === "approved") return <CheckCircle className="h-4 w-4 text-primary" />;
    if (s === "rejected") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Feature Governance</h1>
            <p className="text-muted-foreground">No feature goes live without impact review</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-foreground">{proposals?.filter(p => p.approval_status === "proposed").length}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{proposals?.filter(p => p.approval_status === "approved").length}</p><p className="text-sm text-muted-foreground">Approved</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-destructive">{proposals?.filter(p => p.approval_status === "rejected").length}</p><p className="text-sm text-muted-foreground">Rejected</p></CardContent></Card>
        </div>

        <div className="space-y-3">
          {proposals?.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No feature proposals yet.</CardContent></Card>}
          {proposals?.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">{statusIcon(p.approval_status)}{p.feature_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Complexity: {p.complexity_score}</Badge>
                    <Badge>{p.approval_status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                {p.description && <p>{p.description}</p>}
                <div className="flex gap-4">
                  <span>Revenue Impact: {p.projected_revenue_impact || "N/A"}</span>
                  <span>Trust Impact: {p.projected_trust_impact || "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

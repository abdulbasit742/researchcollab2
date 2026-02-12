import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Shield, Scale, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GovernanceConstitutionPage() {
  const { data: constitution } = useQuery({
    queryKey: ["constitution-latest"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_constitution_versions")
        .select("*")
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: amendments } = useQuery({
    queryKey: ["constitution-amendments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("constitution_amendments")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const principles = (constitution?.principles as string[]) || [];
  const economicRules = (constitution?.economic_rules as string[]) || [];
  const governanceRules = (constitution?.governance_rules as string[]) || [];

  return (
    <div className="min-h-screen bg-background p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Constitution</h1>
          <p className="text-muted-foreground">
            Version {constitution?.version || 0} — The governing document of RCollab
          </p>
        </div>
      </div>

      <Tabs defaultValue="principles">
        <TabsList>
          <TabsTrigger value="principles"><Shield className="h-4 w-4 mr-1" />Principles</TabsTrigger>
          <TabsTrigger value="economic"><Scale className="h-4 w-4 mr-1" />Economic Rules</TabsTrigger>
          <TabsTrigger value="governance">Governance Rules</TabsTrigger>
          <TabsTrigger value="amendments"><History className="h-4 w-4 mr-1" />Amendments</TabsTrigger>
        </TabsList>

        <TabsContent value="principles">
          <Card>
            <CardHeader><CardTitle>Core Principles</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {principles.length === 0 && <p className="text-muted-foreground">No principles defined yet.</p>}
              {principles.map((p, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                  <Badge variant="outline" className="mt-0.5">{i + 1}</Badge>
                  <span className="text-sm text-foreground">{String(p)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economic">
          <Card>
            <CardHeader><CardTitle>Economic Rules</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {economicRules.length === 0 && <p className="text-muted-foreground">No economic rules defined yet.</p>}
              {economicRules.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">{String(r)}</div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <Card>
            <CardHeader><CardTitle>Governance Rules</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {governanceRules.length === 0 && <p className="text-muted-foreground">No governance rules defined yet.</p>}
              {governanceRules.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">{String(r)}</div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amendments">
          <Card>
            <CardHeader><CardTitle>Amendment History</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {amendments?.length === 0 && <p className="text-muted-foreground">No amendments proposed yet.</p>}
              {amendments?.map((a) => (
                <div key={a.id} className="p-4 rounded-lg border border-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{a.description}</span>
                    <Badge variant={a.approval_status === "approved" ? "default" : "secondary"}>
                      {a.approval_status}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>For: {a.votes_for}</span>
                    <span>Against: {a.votes_against}</span>
                    <span>{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

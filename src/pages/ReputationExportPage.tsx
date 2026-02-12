import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Shield, FileJson, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";

export default function ReputationExportPage() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  const { data: exports = [], refetch } = useQuery({
    queryKey: ["reputation-exports", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("portable_reputation_exports")
        .select("*")
        .eq("user_id", user.id)
        .order("generated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      // Fetch trust profile
      const { data: trust } = await supabase
        .from("user_trust_profiles")
        .select("trust_score, trust_tier")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("skills, full_name")
        .eq("id", user.id)
        .maybeSingle();

      const payload = {
        user_id: user.id,
        trust_score: trust?.trust_score ?? 0,
        skills: profile?.skills ?? [],
        generated_at: new Date().toISOString(),
      };

      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(JSON.stringify(payload)));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const exportHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const signature = `rcollab-v1-${exportHash.slice(0, 16)}`;

      const { error } = await supabase.from("portable_reputation_exports").insert({
        user_id: user.id,
        export_hash: exportHash,
        trust_score_snapshot: trust?.trust_score ?? 0,
        deal_history_snapshot: [],
        skills_snapshot: profile?.skills ?? [],
        verification_signature: signature,
      });

      if (error) throw error;
      toast.success("Reputation export generated!");
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadExport = (exp: any) => {
    const blob = new Blob([JSON.stringify(exp, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reputation-export-${exp.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Reputation Export</h1>
              <p className="text-muted-foreground">Portable, signed trust credentials</p>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate Export"}
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileJson className="h-5 w-5" /> Your Exports</CardTitle></CardHeader>
          <CardContent>
            {exports.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No exports yet. Generate your first portable reputation file.</p>
            ) : (
              <div className="space-y-3">
                {exports.map((exp: any) => (
                  <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-mono text-sm">{exp.verification_signature}</p>
                      <p className="text-xs text-muted-foreground">
                        Trust: {exp.trust_score_snapshot} · {new Date(exp.generated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Signed</Badge>
                      <Button variant="ghost" size="sm" onClick={() => downloadExport(exp)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, Clock, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getProofsOfExecution, PROOF_TYPES, CREDENTIAL_LEVELS } from "@/lib/innovation/proofOfExecution";

export default function ProofOfExecutionPage() {
  const { user } = useAuth();
  const { data: proofs = [], isLoading } = useQuery({
    queryKey: ["proof-of-execution", user?.id],
    queryFn: () => getProofsOfExecution(user?.id),
    enabled: !!user?.id,
  });

  const levelColor = (l: string) => {
    const m: Record<string, string> = { sovereign: "bg-purple-100 text-purple-800", institutional: "bg-blue-100 text-blue-800", verified: "bg-green-100 text-green-800" };
    return m[l] || "bg-muted text-muted-foreground";
  };

  const stats = {
    total: proofs.length,
    verified: proofs.filter((p: any) => p.verified_at).length,
    types: [...new Set(proofs.map((p: any) => p.proof_type))].length,
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Proof of Execution Protocol</h1>
          <p className="text-sm text-muted-foreground">Universal execution credential system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Proofs</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Verified</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{stats.verified}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Proof Types</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.types}</p></CardContent></Card>
      </div>

      {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading proofs…</div> : (
        <div className="space-y-3">
          {proofs.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {p.verified_at ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-medium text-sm">{p.title}</span>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={levelColor(p.credential_level)}>{p.credential_level}</Badge>
                    <Badge variant="outline">{p.proof_type.replace(/_/g, " ")}</Badge>
                  </div>
                </div>
                {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                  <span>Entity: {p.entity_type}</span>
                  {p.verification_hash && <span className="font-mono">Hash: {p.verification_hash.slice(0, 16)}…</span>}
                  {p.verified_at && <span className="text-green-600">Verified {new Date(p.verified_at).toLocaleDateString()}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
          {proofs.length === 0 && <div className="text-center py-12 text-muted-foreground">No execution proofs yet. Complete milestones to earn credentials.</div>}
        </div>
      )}
    </div>
  );
}

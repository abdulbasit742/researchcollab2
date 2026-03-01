import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMyResearchExecutions, useGenerateExecutionHash, useVerifyReproducibility, useAttachComputeProof } from "@/hooks/useResearchExecutions";
import { ShieldCheck, Hash, FlaskConical, Plus, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ResearchVerificationDashboardPage() {
  const { data: executions, isLoading } = useMyResearchExecutions();
  const generateHash = useGenerateExecutionHash();
  const verifyRepro = useVerifyReproducibility();
  const attachProof = useAttachComputeProof();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [dataset, setDataset] = useState("");
  const [env, setEnv] = useState("");

  const verified = executions?.filter((e: any) => e.status === "verified").length ?? 0;
  const recorded = executions?.length ?? 0;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    let envObj = {};
    try { envObj = env ? JSON.parse(env) : {}; } catch { envObj = { raw: env }; }
    await generateHash.mutateAsync({
      title,
      datasetSignature: dataset || undefined,
      environmentSnapshot: envObj,
    });
    setTitle(""); setDataset(""); setEnv(""); setShowForm(false);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Research Verification Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Cryptographic proof engine for research execution integrity</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Record Execution
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Executions</p>
            <p className="text-2xl font-bold">{recorded}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-green-600">{verified}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{recorded - verified}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Verification Rate</p>
            <p className="text-2xl font-bold">{recorded > 0 ? Math.round((verified / recorded) * 100) : 0}%</p>
          </CardContent></Card>
        </div>

        {/* New Execution Form */}
        {showForm && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Record New Research Execution</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Execution title" value={title} onChange={e => setTitle(e.target.value)} />
              <Input placeholder="Dataset signature (optional)" value={dataset} onChange={e => setDataset(e.target.value)} />
              <Textarea placeholder='Environment snapshot JSON (e.g. {"python":"3.11","gpu":"A100"})' value={env} onChange={e => setEnv(e.target.value)} rows={3} />
              <Button onClick={handleSubmit} disabled={generateHash.isPending || !title.trim()}>
                {generateHash.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Hash className="h-4 w-4 mr-1" />}
                Generate SHA-256 Proof
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Executions List */}
        <div className="space-y-3">
          {executions?.map((exec: any) => (
            <Card key={exec.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{exec.title}</span>
                      <Badge variant={exec.status === "verified" ? "default" : exec.status === "failed" ? "destructive" : "secondary"}>
                        {exec.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                      Hash: {exec.execution_hash?.slice(0, 24)}…
                    </p>
                    {exec.reproducibility_hash && (
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                        Repro: {exec.reproducibility_hash?.slice(0, 24)}…
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(exec.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyRepro.mutate(exec.id)}
                      disabled={verifyRepro.isPending}
                    >
                      {exec.status === "verified" ? (
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <ShieldCheck className="h-3 w-3 mr-1" />
                      )}
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => attachProof.mutate({
                        executionId: exec.id,
                        computeMetadata: { verified_at: new Date().toISOString(), type: "manual" },
                      })}
                      disabled={attachProof.isPending}
                    >
                      Attach Proof
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {recorded === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              No research executions recorded yet. Use the form above to create your first cryptographic proof.
            </CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

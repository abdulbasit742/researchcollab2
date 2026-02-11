import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReputationPassport } from "@/hooks/useReputationPassport";
import { Download, Shield, FileText, Code, Copy, CheckCircle, RefreshCw, ExternalLink, Clock, QrCode } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PassportPage() {
  const { latest, latestLoading, history, generate, generating, verify, logExport } = useReputationPassport();
  const [copied, setCopied] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const handleGenerate = async () => {
    try { await generate(); } catch {}
  };

  const handleCopyHash = () => {
    if (!latest?.signed_hash) return;
    navigator.clipboard.writeText(latest.signed_hash);
    setCopied(true);
    toast.success("Hash copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (!latest) return;
    try {
      const result = await verify({ passport_id: latest.id, signed_hash: latest.signed_hash });
      setVerifyResult(result);
      toast.success(result.valid ? "Passport verified" : "Verification failed");
    } catch { toast.error("Verification failed"); }
  };

  const handleExportJSON = async () => {
    if (!latest) return;
    const blob = new Blob([JSON.stringify(latest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `passport-v${latest.passport_version}.json`; a.click();
    URL.revokeObjectURL(url);
    await logExport({ passport_id: latest.id, export_type: "JSON" });
    toast.success("Passport exported as JSON");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sovereign Reputation Passport</h1>
            <p className="text-muted-foreground mt-1">Your portable, verifiable professional identity</p>
          </div>
          <Button onClick={handleGenerate} disabled={generating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`} />
            {latest ? "Refresh Passport" : "Generate Passport"}
          </Button>
        </div>

        {latestLoading ? (
          <Card className="animate-pulse"><CardContent className="p-6"><div className="h-48 bg-muted rounded" /></CardContent></Card>
        ) : !latest ? (
          <Card><CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">No Passport Yet</h3>
            <p className="text-muted-foreground mt-2">Generate your first Sovereign Reputation Passport to create a verifiable professional identity.</p>
            <Button className="mt-4" onClick={handleGenerate} disabled={generating}>Generate Passport</Button>
          </CardContent></Card>
        ) : (
          <>
            {/* Passport Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Passport v{latest.passport_version}
                    </CardTitle>
                    <Badge variant="outline" className="text-green-600 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Trust Score</p>
                      <p className="text-2xl font-bold">{latest.trust_score_snapshot}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Visibility</p>
                      <p className="text-2xl font-bold">{latest.visibility_score_snapshot}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Deals</p>
                      <p className="text-2xl font-bold">{(latest.outcome_summary as any)?.total_deals ?? 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Affiliations</p>
                      <p className="text-2xl font-bold">{(latest.institutional_affiliations as any[])?.length ?? 0}</p>
                    </div>
                  </div>

                  {/* Signed Hash */}
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground font-medium">Cryptographic Signature</span>
                      <Button variant="ghost" size="sm" onClick={handleCopyHash}>
                        {copied ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <code className="text-xs break-all text-muted-foreground">{latest.signed_hash}</code>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Issued: {new Date(latest.issued_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Expires: {new Date(latest.expires_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <Tabs defaultValue="export">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="export"><Download className="h-4 w-4 mr-1" /> Export</TabsTrigger>
                <TabsTrigger value="verify"><Shield className="h-4 w-4 mr-1" /> Verify</TabsTrigger>
                <TabsTrigger value="history"><FileText className="h-4 w-4 mr-1" /> History</TabsTrigger>
              </TabsList>

              <TabsContent value="export" className="space-y-3 mt-4">
                <Card><CardContent className="p-4 space-y-3">
                  <Button className="w-full" onClick={handleExportJSON}>
                    <Code className="h-4 w-4 mr-2" /> Download JSON
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => toast.info("PDF export coming soon")}>
                    <FileText className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                  <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3">
                    <QrCode className="h-10 w-10 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Quick Verification</p>
                      <p className="text-xs text-muted-foreground">Share QR code for instant verification</p>
                    </div>
                  </div>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="verify" className="space-y-3 mt-4">
                <Card><CardContent className="p-4 space-y-3">
                  <Button className="w-full" onClick={handleVerify}>
                    <Shield className="h-4 w-4 mr-2" /> Verify Current Passport
                  </Button>
                  {verifyResult && (
                    <div className={`p-3 rounded-lg ${verifyResult.valid ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                      <p className="font-medium">{verifyResult.valid ? "✓ Verified" : "✗ Verification Failed"}</p>
                      <p className="text-xs mt-1">Status: {verifyResult.integrity_status}</p>
                    </div>
                  )}
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-2 mt-4">
                {history.map((p: any) => (
                  <Card key={p.id}><CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Version {p.passport_version}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.issued_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Trust: {p.trust_score_snapshot}</Badge>
                      <Badge variant="outline">Vis: {p.visibility_score_snapshot}</Badge>
                    </div>
                  </CardContent></Card>
                ))}
                {history.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No passport history yet</p>}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

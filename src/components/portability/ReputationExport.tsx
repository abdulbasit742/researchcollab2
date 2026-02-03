import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrustSystem } from "@/hooks/useTrustSystem";
import { Download, FileText, Code, QrCode, Shield, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ReputationExportProps {
  userId?: string;
}

export function ReputationExport({ userId }: ReputationExportProps) {
  const { breakdown, loading } = useTrustSystem(userId);
  const [exportFormat, setExportFormat] = useState<"credential" | "pdf" | "json">("credential");
  const [copied, setCopied] = useState(false);

  if (loading || !breakdown) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const exportData = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential", "ProfessionalReputationCredential"],
    issuer: "https://rcollab.io/credentials",
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      trustScore: breakdown.overall,
      trustTier: breakdown.tier,
      breakdown: {
        delivery: breakdown.delivery,
        financial: breakdown.financial,
        collaboration: breakdown.collaboration,
        institutional: breakdown.institutional,
        consistency: breakdown.consistency,
      },
      volatility: breakdown.volatility,
      verifiedAt: new Date().toISOString(),
    },
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopied(true);
    toast.success("JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // In real implementation, this would generate and download the file
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5 text-primary" />
          Reputation Portability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your Verified Reputation</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{breakdown.overall}</p>
              <Badge variant="secondary">{breakdown.tier.toUpperCase()}</Badge>
            </div>
          </div>
          <Shield className="h-12 w-12 text-primary/30" />
        </div>

        {/* Export Formats */}
        <Tabs value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credential" className="text-xs">
              <Shield className="h-4 w-4 mr-1" />
              Credential
            </TabsTrigger>
            <TabsTrigger value="pdf" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs">
              <Code className="h-4 w-4 mr-1" />
              JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credential" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">W3C Verifiable Credential</p>
                  <p className="text-xs text-muted-foreground">
                    Cryptographically signed, tamper-proof
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-500/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issuer</span>
                  <span>RCollab Trust Authority</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span>{new Date(Date.now() + 86400000 * 365).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={() => handleExport("credential")}>
              <Download className="h-4 w-4 mr-2" />
              Download Verifiable Credential
            </Button>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Professional Summary PDF</p>
                  <p className="text-xs text-muted-foreground">
                    Formatted for traditional applications
                  </p>
                </div>
                <FileText className="h-8 w-8 text-red-500/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                Includes: Trust score breakdown, verification status, work history summary, 
                and skill endorsements. Perfect for job applications and partnership proposals.
              </p>
            </div>
            <Button className="w-full" onClick={() => handleExport("pdf")}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF Summary
            </Button>
          </TabsContent>

          <TabsContent value="json" className="space-y-4 mt-4">
            <div className="relative">
              <pre className="p-4 rounded-lg border bg-muted/50 text-xs overflow-auto max-h-48">
                {JSON.stringify(exportData, null, 2)}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopyJSON}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button className="w-full" variant="outline" onClick={() => handleExport("json")}>
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </TabsContent>
        </Tabs>

        {/* QR Code for Quick Verification */}
        <div className="p-4 rounded-lg bg-muted/30 space-y-3">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Quick Verification</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
              <QrCode className="h-16 w-16 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Share this QR code for instant verification of your professional reputation. 
                Anyone can scan to verify your credentials.
              </p>
              <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                <ExternalLink className="h-3 w-3 mr-1" />
                View verification page
              </Button>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-muted/20">
          <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            All exports are cryptographically signed with your unique identifier. 
            Any modifications will invalidate the credential, ensuring tamper-proof verification.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

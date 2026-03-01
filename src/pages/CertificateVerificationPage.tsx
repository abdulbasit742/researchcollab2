import { useState } from "react";
import { useVerifyCertificate } from "@/hooks/useAccreditation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Shield, Search } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function CertificateVerificationPage() {
  const { certificateId } = useParams<{ certificateId?: string }>();
  const [hash, setHash] = useState(certificateId ?? "");
  const verify = useVerifyCertificate();

  useEffect(() => {
    if (certificateId) {
      verify.mutate(certificateId);
    }
  }, [certificateId]);

  const handleVerify = () => {
    if (hash.trim()) verify.mutate(hash.trim());
  };

  const result = verify.data;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Certificate Verification</h1>
          <p className="text-sm text-muted-foreground mt-1">Verify the authenticity of an RCollab certificate or credential</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter verification hash..."
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="font-mono text-sm"
              />
              <Button onClick={handleVerify} disabled={!hash.trim() || verify.isPending}>
                <Search className="h-4 w-4 mr-1.5" />
                Verify
              </Button>
            </div>

            {verify.isPending && (
              <p className="text-sm text-muted-foreground text-center">Verifying...</p>
            )}

            {result && (
              <div className="text-center py-4">
                {result.valid ? (
                  <div className="space-y-3">
                    <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-lg font-bold text-foreground">Certificate Valid</p>
                    <div className="space-y-1">
                      <Badge variant="secondary">{(result as any).type} certificate</Badge>
                      {(result as any).certification_type && (
                        <p className="text-sm text-muted-foreground">Type: {(result as any).certification_type}</p>
                      )}
                      {(result as any).issued_at && (
                        <p className="text-sm text-muted-foreground">
                          Issued: {new Date((result as any).issued_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <code className="text-[10px] text-muted-foreground font-mono block break-all">
                      {(result as any).verification_hash || (result as any).certificate_hash || (result as any).credential_hash}
                    </code>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <XCircle className="h-12 w-12 text-destructive mx-auto" />
                    <p className="text-lg font-bold text-foreground">Certificate Not Found</p>
                    <p className="text-sm text-muted-foreground">
                      The provided hash does not match any certificate in the system.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-[10px] text-muted-foreground text-center">
          No financial data is exposed through this verification endpoint. Only certification metadata is shown.
        </p>
      </div>
    </div>
  );
}

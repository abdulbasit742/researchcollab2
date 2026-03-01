import { useState } from "react";
import { useNationalCertVerify } from "@/hooks/useNationalDeployment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search } from "lucide-react";
import { useParams } from "react-router-dom";

export default function NationalCertificateVerifyPage() {
  const { certificateId: paramId } = useParams();
  const [query, setQuery] = useState(paramId ?? "");
  const [searchId, setSearchId] = useState(paramId ?? "");
  const { data: cert, isLoading } = useNationalCertVerify(searchId || undefined);

  const handleSearch = () => { setSearchId(query.trim()); };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> National Certificate Verification
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Verify institutional outcomes at the national level</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter certificate ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={!query.trim()}>
          <Search className="h-4 w-4 mr-1" /> Verify
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground text-center">Verifying...</p>}

      {searchId && !isLoading && !cert && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">Certificate not found. Please check the ID and try again.</p>
          </CardContent>
        </Card>
      )}

      {cert && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified Institutional Outcome
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-emerald-600">Verified</Badge>
              <Badge variant="outline">{cert.certificate_type}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificate ID</span>
                <span className="font-mono text-foreground">{cert.certificate_id}</span>
              </div>
              {cert.holder_display_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holder</span>
                  <span className="text-foreground">{cert.holder_display_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issuing Institution</span>
                <span className="text-foreground">{cert.issuing_institution_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issued</span>
                <span className="text-foreground">{new Date(cert.issued_at).toLocaleDateString()}</span>
              </div>
              {cert.certificate_hash && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hash</span>
                  <span className="font-mono text-[10px] text-muted-foreground truncate max-w-48">{cert.certificate_hash}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground pt-2">No private financial or identity data is exposed in this verification.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

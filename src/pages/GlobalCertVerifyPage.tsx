import { useState } from "react";
import { useGlobalCertVerify } from "@/hooks/useGlobalFederation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search } from "lucide-react";
import { useParams } from "react-router-dom";

export default function GlobalCertVerifyPage() {
  const { certHash: paramHash } = useParams();
  const [query, setQuery] = useState(paramHash ?? "");
  const [searchHash, setSearchHash] = useState(paramHash ?? "");
  const { data: cert, isLoading } = useGlobalCertVerify(searchHash || undefined);

  const handleSearch = () => setSearchHash(query.trim());

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> Global Certificate Verification
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Verify institutional outcomes across the global federation</p>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Enter certificate hash" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
        <Button onClick={handleSearch} disabled={!query.trim()}>
          <Search className="h-4 w-4 mr-1" /> Verify
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground text-center">Verifying across federation...</p>}

      {searchHash && !isLoading && !cert && (
        <Card><CardContent className="py-8 text-center"><p className="text-sm text-destructive">Certificate not found in the global federation registry.</p></CardContent></Card>
      )}

      {cert && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified Institutional Outcome
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge className="bg-emerald-600 text-primary-foreground">Federation Verified</Badge>
            <div className="space-y-2 text-sm">
              {[
                { label: "Certificate ID", value: cert.certificate_id },
                ...(cert.holder_display_name ? [{ label: "Holder", value: cert.holder_display_name }] : []),
                { label: "Issuing Institution", value: cert.issuing_institution_name },
                { label: "Type", value: cert.certificate_type },
                { label: "Issued", value: new Date(cert.issued_at).toLocaleDateString() },
              ].map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="text-foreground">{r.value}</span>
                </div>
              ))}
              {cert.certificate_hash && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hash</span>
                  <span className="font-mono text-[10px] text-muted-foreground truncate max-w-48">{cert.certificate_hash}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground pt-2">No private financial or identity data is exposed. Metadata-only verification.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

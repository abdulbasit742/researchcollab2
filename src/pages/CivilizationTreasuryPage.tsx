import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinancialRails, useTreatyRegistry, useRegulatoryPartners } from "@/hooks/useCivilizationInterface";
import { Landmark, Globe, Building2, FileText, Banknote } from "lucide-react";

const CivilizationTreasuryPage = () => {
  const { data: rails } = useFinancialRails();
  const { data: treaties } = useTreatyRegistry();
  const { data: partners } = useRegulatoryPartners();

  return (
    <MainLayout>
      <Helmet><title>Civilization Treasury | RCollab</title></Helmet>
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Landmark className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Civilization Interface</h1>
            <p className="text-muted-foreground">Financial rails, institutional treaties, and regulatory compliance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><Banknote className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Financial Rails</span></div><p className="text-3xl font-bold">{(rails || []).length}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Active Treaties</span></div><p className="text-3xl font-bold">{(treaties || []).filter(t => t.status === "active").length}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Regulatory Partners</span></div><p className="text-3xl font-bold">{(partners || []).length}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Financial Rails</CardTitle><CardDescription>Supported settlement channels</CardDescription></CardHeader>
          <CardContent>
            {(rails || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No financial rails configured yet.</p>
            ) : (
              <div className="space-y-3">
                {(rails || []).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{r.rail_name}</div>
                      <div className="text-xs text-muted-foreground">{r.region} · Settlement: {r.settlement_time_hours}h</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{r.rail_type.replace(/_/g, " ")}</Badge>
                      <span className="text-xs text-muted-foreground">{(r.supported_currencies || []).join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Institutional Treaties</CardTitle></CardHeader>
          <CardContent>
            {(treaties || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No treaties registered.</p>
            ) : (
              <div className="space-y-3">
                {(treaties || []).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{t.treaty_name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{t.treaty_type?.replace(/_/g, " ")}</div>
                    </div>
                    <Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CivilizationTreasuryPage;

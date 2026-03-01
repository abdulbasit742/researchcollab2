import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyResearchAssets, useValidatedAssets } from "@/hooks/useResearchAssets";
import { useMyResearchExecutions } from "@/hooks/useResearchExecutions";
import { Gem, ShieldCheck, TrendingUp, FileText } from "lucide-react";

export default function ResearchAssetRegistryPage() {
  const { data: myAssets, isLoading: loadingMy } = useMyResearchAssets();
  const { data: validatedAssets, isLoading: loadingValidated } = useValidatedAssets();
  const { data: executions } = useMyResearchExecutions();

  const myList = myAssets ?? [];
  const validatedList = validatedAssets ?? [];
  const executionCount = executions?.length ?? 0;

  const totalValuation = myList.reduce((s: number, a) => s + (a.valuation_score || 0), 0);
  const validatedCount = myList.filter(a => a.validation_status === "validated").length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Gem className="h-8 w-8 text-primary" />
            Research Asset Registry
          </h1>
          <p className="text-muted-foreground mt-1">Verified research converted into institutional-grade capital assets</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{myList.length}</p>
            <p className="text-xs text-muted-foreground">My Assets</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <ShieldCheck className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{validatedCount}</p>
            <p className="text-xs text-muted-foreground">Validated</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{totalValuation}</p>
            <p className="text-xs text-muted-foreground">Total Valuation</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Gem className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{executionCount}</p>
            <p className="text-xs text-muted-foreground">Linked Executions</p>
          </CardContent></Card>
        </div>

        {/* My Assets */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">My Research Assets</h2>
          {myList.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{asset.title}</span>
                      <Badge variant={asset.validation_status === "validated" ? "default" : "secondary"}>
                        {asset.validation_status}
                      </Badge>
                      <Badge variant="outline">{asset.asset_type}</Badge>
                    </div>
                    {asset.description && <p className="text-xs text-muted-foreground mt-1">{asset.description}</p>}
                    {asset.reproducibility_hash && (
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">
                        Hash: {asset.reproducibility_hash.slice(0, 32)}…
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold">{asset.valuation_score}</p>
                      <p className="text-[10px] text-muted-foreground">Valuation</p>
                    </div>
                    <Badge variant="outline">{asset.ip_status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {myList.length === 0 && !loadingMy && (
            <Card><CardContent className="p-6 text-center text-muted-foreground">
              No research assets registered yet. Verify research executions to create assets.
            </CardContent></Card>
          )}
        </div>

        {/* Validated Assets (Global) */}
        {validatedList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Top Validated Assets (Global)</h2>
            {validatedList.slice(0, 10).map((asset) => (
              <Card key={asset.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{asset.title}</span>
                      <Badge variant="outline">{asset.asset_type}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{asset.valuation_score}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {asset.validation_count} validations
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

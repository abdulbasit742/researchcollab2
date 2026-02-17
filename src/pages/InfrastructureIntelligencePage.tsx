import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useInfrastructureRegistry, useProductionCapacityMetrics, useInfrastructureRiskSignals } from "@/hooks/useInfrastructureSync";
import { Building2, Factory, AlertTriangle, Gauge, Zap } from "lucide-react";

const InfrastructureIntelligencePage = () => {
  const { data: infrastructure = [] } = useInfrastructureRegistry();
  const { data: capacityMetrics = [] } = useProductionCapacityMetrics();
  const { data: riskSignals = [] } = useInfrastructureRiskSignals();

  const typeIcons: Record<string, string> = {
    energy: '⚡', manufacturing: '🏭', logistics: '🚛',
    research_center: '🔬', development_project: '🏗️', public_program: '📋',
  };

  return (
    <>
      <Helmet><title>Infrastructure Intelligence | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Infrastructure Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">Global infrastructure synchronization & production capacity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Factory className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{infrastructure.length}</p>
                    <p className="text-xs text-muted-foreground">Active Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-2xl font-bold">{capacityMetrics.length}</p>
                    <p className="text-xs text-muted-foreground">Capacity Readings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold">{riskSignals.length}</p>
                    <p className="text-xs text-muted-foreground">Active Risk Signals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="registry">
            <TabsList>
              <TabsTrigger value="registry">Infrastructure Registry</TabsTrigger>
              <TabsTrigger value="capacity">Production Capacity</TabsTrigger>
              <TabsTrigger value="risks">Risk Signals</TabsTrigger>
            </TabsList>

            <TabsContent value="registry" className="mt-4">
              <div className="grid gap-3">
                {infrastructure.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No infrastructure registered yet.</CardContent></Card>
                ) : infrastructure.map((item: any) => (
                  <Card key={item.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            <span>{typeIcons[item.infrastructure_type] || '🏢'}</span>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">Region: {item.region_code} · {item.regulatory_jurisdiction || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.currency} {item.capital_requirement?.toLocaleString()}</p>
                          <Badge variant="secondary">{item.infrastructure_type.replace(/_/g, ' ')}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="capacity" className="mt-4">
              <div className="grid gap-3">
                {capacityMetrics.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No capacity metrics recorded.</CardContent></Card>
                ) : capacityMetrics.map((m: any) => (
                  <Card key={m.id}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Efficiency</p>
                          <Progress value={m.production_efficiency_score} className="mt-1" />
                          <p className="text-xs">{m.production_efficiency_score}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilization</p>
                          <Progress value={m.capacity_utilization_pct} className="mt-1" />
                          <p className="text-xs">{m.capacity_utilization_pct}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Strain Risk</p>
                          <Badge variant={m.infrastructure_strain_risk === 'critical' ? 'destructive' : 'secondary'}>
                            {m.infrastructure_strain_risk}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="risks" className="mt-4">
              <div className="grid gap-3">
                {riskSignals.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No active risk signals.</CardContent></Card>
                ) : riskSignals.map((r: any) => (
                  <Card key={r.id}>
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{r.signal_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">AI Confidence: {r.ai_confidence}%</p>
                        {r.recommended_action && <p className="text-xs mt-1">{r.recommended_action}</p>}
                      </div>
                      <Badge variant={r.severity === 'critical' ? 'destructive' : r.severity === 'high' ? 'destructive' : 'secondary'}>
                        {r.severity}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default InfrastructureIntelligencePage;

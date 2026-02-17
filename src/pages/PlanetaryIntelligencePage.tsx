import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { usePlanetaryNodeRegistry, useColonyViabilityScores, useResourceProductivityMetrics, useInterplanetaryTreaties } from "@/hooks/usePlanetaryCoordination";
import { Orbit, Rocket, Globe2, ScrollText } from "lucide-react";

const celestialEmoji: Record<string, string> = {
  earth: '🌍', orbital: '🛰️', lunar: '🌙', mars: '🔴', deep_sea: '🌊', habitat: '🏠',
};

const PlanetaryIntelligencePage = () => {
  const { data: nodes = [] } = usePlanetaryNodeRegistry();
  const { data: viability = [] } = useColonyViabilityScores();
  const { data: resources = [] } = useResourceProductivityMetrics();
  const { data: treaties = [] } = useInterplanetaryTreaties();

  return (
    <>
      <Helmet><title>Planetary Intelligence | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Orbit className="h-8 w-8 text-primary" />
              Planetary Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">Interplanetary economic coordination & colony viability</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Rocket className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{nodes.length}</p>
                <p className="text-xs text-muted-foreground">Planetary Nodes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Globe2 className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                <p className="text-2xl font-bold">{viability.length}</p>
                <p className="text-xs text-muted-foreground">Viability Assessments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{resources.length}</p>
                <p className="text-xs text-muted-foreground">Resource Readings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <ScrollText className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <p className="text-2xl font-bold">{treaties.length}</p>
                <p className="text-xs text-muted-foreground">Interplanetary Treaties</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="nodes">
            <TabsList>
              <TabsTrigger value="nodes">Planetary Nodes</TabsTrigger>
              <TabsTrigger value="viability">Colony Viability</TabsTrigger>
              <TabsTrigger value="treaties">Treaties</TabsTrigger>
            </TabsList>

            <TabsContent value="nodes" className="mt-4">
              <div className="grid gap-3">
                {nodes.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No planetary nodes registered.</CardContent></Card>
                ) : nodes.map((node: any) => (
                  <Card key={node.id}>
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          <span className="text-lg">{celestialEmoji[node.celestial_body] || '🌐'}</span>
                          {node.node_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Latency: {node.communication_latency_band} · Pop: {node.population_estimate?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge>{node.celestial_body}</Badge>
                        <Badge variant={node.status === 'active' ? 'default' : 'destructive'}>{node.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="viability" className="mt-4">
              <div className="grid gap-4">
                {viability.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No viability data.</CardContent></Card>
                ) : viability.map((v: any) => (
                  <Card key={v.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-sm">Node {v.planetary_node_id?.slice(0, 8)}</p>
                        <Badge variant={v.governance_fragmentation_risk === 'low' ? 'default' : 'destructive'}>
                          Fragmentation: {v.governance_fragmentation_risk}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Viability</p>
                          <Progress value={v.overall_viability} className="mt-1" />
                          <p className="text-xs">{v.overall_viability}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Capital Independence</p>
                          <Progress value={v.capital_independence_pct} className="mt-1" />
                          <p className="text-xs">{v.capital_independence_pct}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Earth Reliance</p>
                          <Progress value={v.resource_earth_reliance_pct} className="mt-1" />
                          <p className="text-xs">{v.resource_earth_reliance_pct}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Talent Retention</p>
                          <Progress value={v.talent_retention_probability} className="mt-1" />
                          <p className="text-xs">{v.talent_retention_probability}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="treaties" className="mt-4">
              <div className="grid gap-3">
                {treaties.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No interplanetary treaties.</CardContent></Card>
                ) : treaties.map((t: any) => (
                  <Card key={t.id}>
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{t.treaty_name}</p>
                        <p className="text-xs text-muted-foreground">{t.treaty_type.replace(/_/g, ' ')} · {t.participating_nodes?.length || 0} nodes</p>
                      </div>
                      <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{t.status}</Badge>
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

export default PlanetaryIntelligencePage;

import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useFederationRegistry, useCrossNodeCapitalFlows, useNodeReputationScores, useMultiNodeIndexData, useFederationArbitration } from "@/hooks/useFederationNetwork";
import { Globe, Network, Shield, TrendingUp, AlertTriangle, Zap } from "lucide-react";

const FederationIntelligencePage = () => {
  const { data: federations = [], isLoading: fedLoading } = useFederationRegistry();
  const { data: capitalFlows = [] } = useCrossNodeCapitalFlows();
  const { data: nodeScores = [] } = useNodeReputationScores();
  const { data: indexData = [] } = useMultiNodeIndexData();
  const { data: arbitrations = [] } = useFederationArbitration();

  const activeFlows = capitalFlows.filter((f: any) => f.status === 'active');
  const openArbitrations = arbitrations.filter((a: any) => a.status === 'open' || a.status === 'arbitrating');

  return (
    <>
      <Helmet><title>Federation Intelligence | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              Federation Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">Multi-civilization economic network overview</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Network className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{federations.length}</p>
                    <p className="text-xs text-muted-foreground">Active Federations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-2xl font-bold">{activeFlows.length}</p>
                    <p className="text-xs text-muted-foreground">Active Capital Flows</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{nodeScores.length}</p>
                    <p className="text-xs text-muted-foreground">Scored Nodes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold">{openArbitrations.length}</p>
                    <p className="text-xs text-muted-foreground">Open Arbitrations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="nodes">
            <TabsList>
              <TabsTrigger value="nodes">Node Reputation</TabsTrigger>
              <TabsTrigger value="capital">Capital Flows</TabsTrigger>
              <TabsTrigger value="indices">Multi-Node Indices</TabsTrigger>
              <TabsTrigger value="arbitration">Arbitration</TabsTrigger>
            </TabsList>

            <TabsContent value="nodes" className="mt-4">
              <div className="grid gap-4">
                {nodeScores.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No node reputation data available yet.</CardContent></Card>
                ) : nodeScores.map((node: any) => (
                  <Card key={node.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Node {node.node_id?.slice(0, 8)}</h3>
                        <Badge variant={node.isolation_risk === 'none' ? 'default' : 'destructive'}>
                          {node.isolation_risk} risk
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Overall</p>
                          <Progress value={node.overall_score} className="mt-1" />
                          <p className="text-xs mt-1">{node.overall_score}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trust</p>
                          <Progress value={node.trust_reliability} className="mt-1" />
                          <p className="text-xs mt-1">{node.trust_reliability}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Capital</p>
                          <Progress value={node.capital_compliance} className="mt-1" />
                          <p className="text-xs mt-1">{node.capital_compliance}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Governance</p>
                          <Progress value={node.governance_integrity} className="mt-1" />
                          <p className="text-xs mt-1">{node.governance_integrity}/100</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="capital" className="mt-4">
              <div className="grid gap-3">
                {capitalFlows.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No cross-node capital flows recorded.</CardContent></Card>
                ) : capitalFlows.slice(0, 20).map((flow: any) => (
                  <Card key={flow.id}>
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{flow.flow_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">{flow.currency} {flow.amount?.toLocaleString()}</p>
                      </div>
                      <Badge variant={flow.status === 'active' ? 'default' : 'secondary'}>{flow.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="indices" className="mt-4">
              <div className="grid gap-3">
                {indexData.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No multi-node index data available.</CardContent></Card>
                ) : indexData.slice(0, 20).map((idx: any) => (
                  <Card key={idx.id}>
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm capitalize">{idx.index_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">Period: {idx.period}</p>
                      </div>
                      <span className="text-lg font-bold">{idx.index_value}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="arbitration" className="mt-4">
              <div className="grid gap-3">
                {arbitrations.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No arbitration cases.</CardContent></Card>
                ) : arbitrations.map((arb: any) => (
                  <Card key={arb.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{arb.dispute_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground">AI fault probability: {arb.ai_fault_probability ?? 'N/A'}%</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={arb.severity === 'critical' ? 'destructive' : 'secondary'}>{arb.severity}</Badge>
                          <Badge>{arb.status}</Badge>
                        </div>
                      </div>
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

export default FederationIntelligencePage;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Server, Shield, Search, Link2, AlertTriangle, CheckCircle, Lock, Activity } from "lucide-react";
import { useKnowledgeFederation } from "@/hooks/useKnowledgeFederation";

export function FederatedKnowledgePanel() {
  const {
    nodes, agreements, searchResults, auditLogs, loading, stats,
    fetchNodes, fetchAgreements, fetchAuditLogs,
    createNode, createAgreement, activateAgreement, federatedSearch,
  } = useKnowledgeFederation();

  const [nodeName, setNodeName] = useState("");
  const [nodeRegion, setNodeRegion] = useState("");
  const [nodeOwnerType, setNodeOwnerType] = useState("university");
  const [nodeFedStatus, setNodeFedStatus] = useState("isolated");
  const [searchQuery, setSearchQuery] = useState("");
  const [srcNodeId, setSrcNodeId] = useState("");
  const [tgtNodeId, setTgtNodeId] = useState("");

  useEffect(() => { fetchNodes(); fetchAgreements(); fetchAuditLogs(); }, []);

  const handleCreateNode = async () => {
    if (!nodeName || !nodeRegion) return;
    await createNode({ node_name: nodeName, region: nodeRegion, owner_type: nodeOwnerType, federation_status: nodeFedStatus });
    setNodeName(""); setNodeRegion("");
  };

  const handleCreateAgreement = async () => {
    if (!srcNodeId || !tgtNodeId || srcNodeId === tgtNodeId) return;
    await createAgreement({ source_node_id: srcNodeId, target_node_id: tgtNodeId, agreement_type: "metadata_only" });
  };

  return (
    <Tabs defaultValue="nodes" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="nodes"><Server className="h-3 w-3 mr-1" />Nodes</TabsTrigger>
        <TabsTrigger value="federation"><Link2 className="h-3 w-3 mr-1" />Federation</TabsTrigger>
        <TabsTrigger value="search"><Search className="h-3 w-3 mr-1" />Search</TabsTrigger>
        <TabsTrigger value="audit"><Activity className="h-3 w-3 mr-1" />Audit</TabsTrigger>
      </TabsList>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 my-3">
        {[
          { label: "Total Nodes", value: stats.totalNodes },
          { label: "Active", value: stats.activeNodes },
          { label: "Federated", value: stats.federatedNodes },
          { label: "Isolated", value: stats.isolatedNodes },
          { label: "Agreements", value: stats.activeAgreements },
          { label: "Blocked", value: stats.blockedActions },
        ].map(s => (
          <Card key={s.label} className="p-2 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* NODES TAB */}
      <TabsContent value="nodes" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Deploy Sovereign Node</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Node name" value={nodeName} onChange={e => setNodeName(e.target.value)} />
              <Input placeholder="Region (e.g. PK, US, EU)" value={nodeRegion} onChange={e => setNodeRegion(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={nodeOwnerType} onValueChange={setNodeOwnerType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="foundation">Foundation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={nodeFedStatus} onValueChange={setNodeFedStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="isolated">Isolated</SelectItem>
                  <SelectItem value="federated">Federated</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateNode} disabled={!nodeName || !nodeRegion} className="w-full">
              <Server className="h-4 w-4 mr-1" /> Deploy Node
            </Button>
          </CardContent>
        </Card>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {nodes.map(node => (
              <Card key={node.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{node.node_name}</p>
                      <p className="text-xs text-muted-foreground">{node.owner_type} · {node.region}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={node.federation_status === "federated" ? "default" : "secondary"}>
                      {node.federation_status}
                    </Badge>
                    <Badge variant="outline">{node.trust_interoperability_level}</Badge>
                  </div>
                </div>
              </Card>
            ))}
            {nodes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No nodes deployed yet</p>}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* FEDERATION TAB */}
      <TabsContent value="federation" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Create Federation Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Select value={srcNodeId} onValueChange={setSrcNodeId}>
                <SelectTrigger><SelectValue placeholder="Source Node" /></SelectTrigger>
                <SelectContent>
                  {nodes.map(n => <SelectItem key={n.id} value={n.id}>{n.node_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={tgtNodeId} onValueChange={setTgtNodeId}>
                <SelectTrigger><SelectValue placeholder="Target Node" /></SelectTrigger>
                <SelectContent>
                  {nodes.map(n => <SelectItem key={n.id} value={n.id}>{n.node_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateAgreement} disabled={!srcNodeId || !tgtNodeId || srcNodeId === tgtNodeId} className="w-full">
              <Link2 className="h-4 w-4 mr-1" /> Create Agreement
            </Button>
          </CardContent>
        </Card>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {agreements.map(agr => {
              const src = nodes.find(n => n.id === agr.source_node_id);
              const tgt = nodes.find(n => n.id === agr.target_node_id);
              return (
                <Card key={agr.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{src?.node_name || "?"} ↔ {tgt?.node_name || "?"}</p>
                      <p className="text-xs text-muted-foreground">{agr.agreement_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={agr.status === "active" ? "default" : "secondary"}>{agr.status}</Badge>
                      {agr.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => activateAgreement(agr.id)}>Activate</Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
            {agreements.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No federation agreements</p>}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* SEARCH TAB */}
      <TabsContent value="search" className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input placeholder="Search federated claims..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <Button onClick={() => federatedSearch(searchQuery)} disabled={loading || !searchQuery}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {searchResults.map((claim, i) => (
              <Card key={i} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      {claim.is_restricted ? <Lock className="h-3 w-3 text-destructive" /> : <CheckCircle className="h-3 w-3 text-primary" />}
                      <p className="text-xs font-mono text-muted-foreground">{claim.global_claim_id}</p>
                    </div>
                    {claim.is_restricted ? (
                      <p className="text-xs text-destructive">{claim.message}</p>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {claim.topic_tags?.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{claim.institution_origin} · {claim.data_residency_tag}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Influence</p>
                    <p className="text-sm font-bold">{claim.influence_score?.toFixed(1)}</p>
                  </div>
                </div>
              </Card>
            ))}
            {searchResults.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Search the federated claim registry</p>}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* AUDIT TAB */}
      <TabsContent value="audit" className="space-y-4">
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-2">
            {auditLogs.map(log => (
              <Card key={log.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {log.was_blocked ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Shield className="h-4 w-4 text-primary" />}
                    <div>
                      <p className="text-sm font-medium">{log.action_type}</p>
                      <p className="text-xs text-muted-foreground">{log.resource_type || "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.was_blocked ? "destructive" : "default"}>
                      {log.was_blocked ? "Blocked" : "Allowed"}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {log.block_reason && <p className="text-xs text-destructive mt-1">{log.block_reason}</p>}
              </Card>
            ))}
            {auditLogs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No audit entries yet</p>}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}

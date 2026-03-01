import { useState } from "react";
import {
  usePlatformNodes, useNodeGovernanceMetrics, useFederationMetadata,
  useFederatedDiscovery, useInteroperabilityEndpoints,
  useFederatedIdentityLinks, useFederationComplianceFlags,
} from "@/hooks/useFederation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Server, Shield, Link2, Eye, Info, Activity, CheckCircle,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function sc(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

function dot(v: number) {
  if (v >= 75) return "bg-emerald-500";
  if (v >= 50) return "bg-amber-500";
  return "bg-destructive";
}

export default function FederationControlPanelPage() {
  const { data: nodes = [] } = usePlatformNodes();
  const [selectedNode, setSelectedNode] = useState<string>("");
  const activeNode = selectedNode || nodes[0]?.id;

  const { data: govMetrics } = useNodeGovernanceMetrics(activeNode);
  const { data: metadata = [] } = useFederationMetadata(activeNode);
  const { data: discovery = [] } = useFederatedDiscovery(activeNode);
  const { data: endpoints = [] } = useInteroperabilityEndpoints(activeNode);
  const { data: identityLinks = [] } = useFederatedIdentityLinks();
  const { data: compliance } = useFederationComplianceFlags(activeNode);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Federation Control Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Node management, cross-node metadata, and federation health</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] gap-1 cursor-help">
                <Info className="h-2.5 w-2.5" /> No Cross-Node Financial Access
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              Federation is metadata-only. No cross-node escrow, wallet, or financial data is shared or mutated.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Node Selector + Summary */}
      <div className="flex items-center gap-4">
        <Select value={activeNode || ""} onValueChange={setSelectedNode}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Select node..." /></SelectTrigger>
          <SelectContent>
            {nodes.map((n: any) => (
              <SelectItem key={n.id} value={n.id}>
                {n.node_name} ({n.region})
              </SelectItem>
            ))}
            {nodes.length === 0 && <SelectItem value="none" disabled>No nodes registered</SelectItem>}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{nodes.length} registered node(s)</span>
      </div>

      {/* Nodes Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" /> Registered Nodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nodes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No nodes registered. Default single-node operation active.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nodes.map((n: any) => (
                <div key={n.id} className={`p-3 rounded-lg border ${n.id === activeNode ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">{n.node_name}</span>
                    <Badge variant={n.is_active ? "default" : "secondary"} className="text-[10px]">
                      {n.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{n.region}</span>
                    <span>·</span>
                    <span>{n.deployment_type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Node Governance Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Node Governance Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {govMetrics ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${dot(govMetrics.governance_stability_score)}`} />
                  <span className={`text-2xl font-bold ${sc(govMetrics.governance_stability_score)}`}>
                    {govMetrics.governance_stability_score.toFixed(0)}
                  </span>
                  <span className="text-xs text-muted-foreground">Stability Score</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Anomaly", value: govMetrics.anomaly_density, invert: true },
                    { label: "Disputes", value: govMetrics.dispute_ratio, invert: true },
                    { label: "Review", value: govMetrics.review_integrity_score },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-2 rounded bg-muted/30">
                      <p className={`text-sm font-bold ${sc(m.invert ? 100 - m.value : m.value)}`}>{m.value.toFixed(0)}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">Generated: {new Date(govMetrics.generated_at).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No governance data for this node.</p>
            )}
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Federation Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {compliance ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded bg-muted/30">
                    <p className={`text-xl font-bold ${sc(compliance.compliance_score)}`}>{compliance.compliance_score.toFixed(0)}%</p>
                    <p className="text-[10px] text-muted-foreground">Compliance</p>
                  </div>
                  <div className="text-center p-3 rounded bg-muted/30">
                    <p className={`text-xl font-bold ${sc(compliance.audit_completeness)}`}>{compliance.audit_completeness.toFixed(0)}%</p>
                    <p className="text-[10px] text-muted-foreground">Audit Complete</p>
                  </div>
                </div>
                {compliance.risk_flag !== "none" && (
                  <Badge variant="destructive" className="text-[10px]">Risk: {compliance.risk_flag}</Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No compliance data.</p>
            )}
          </CardContent>
        </Card>

        {/* Metadata Registry */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Metadata Registry
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metadata.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No metadata entries.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {metadata.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{m.entity_type}</Badge>
                      <span className="font-mono text-[10px]">{m.entity_id?.slice(0, 10)}...</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{m.federation_visibility}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discovery Index */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Discovery Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            {discovery.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No discoverable entities.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {discovery.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{d.entity_type}</Badge>
                      <span className="font-mono text-[10px]">{d.entity_id?.slice(0, 10)}...</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{d.visibility_level}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interop Endpoints */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Interoperability Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {endpoints.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No endpoints configured.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {endpoints.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                    <div>
                      <span className="text-xs font-medium text-foreground">{e.endpoint_name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{e.endpoint_type}</span>
                    </div>
                    <Badge variant={e.is_active ? "default" : "secondary"} className="text-[10px]">{e.access_scope}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Identity Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" /> Federated Identity Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            {identityLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No identity links.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {identityLinks.map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                    <span className="font-mono text-[10px]">{l.local_user_id?.slice(0, 8)}... → {l.external_user_reference}</span>
                    <Badge variant={l.verification_status === "verified" ? "default" : "secondary"} className="text-[10px]">
                      {l.verification_status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Zap, TrendingUp, AlertTriangle, Clock, Shield } from "lucide-react";
import { getAgentRuns, getAgentPerformance, getPolicyFlags, getDeliveryLogs } from "@/lib/omnichannel/operatorService";
import { toast } from "sonner";

export default function OmniAgentPerformancePage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAgentRuns({ limit: 50 }).then(setRuns),
      getAgentPerformance().then(setPerformance),
      getPolicyFlags().then(setFlags),
      getDeliveryLogs().then(setDeliveryLogs),
    ]).catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  // Compute stats from runs
  const agentTypes = [...new Set(runs.map(r => r.agent_type))];
  const avgConfidence = runs.length > 0 ? runs.reduce((s, r) => s + (r.confidence_score || 0), 0) / runs.length : 0;
  const avgLatency = runs.length > 0 ? runs.reduce((s, r) => s + (r.latency_ms || 0), 0) / runs.length : 0;
  const escalationRate = runs.length > 0 ? runs.filter(r => r.should_escalate).length / runs.length : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Performance</h1>
          <p className="text-sm text-muted-foreground">Monitor AI agent quality, latency, and policy compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold">{runs.length}</p>
          <p className="text-xs text-muted-foreground">Total Runs</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold">{(avgConfidence * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">Avg Confidence</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold">{avgLatency.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Avg Latency (ms)</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold text-red-500">{(escalationRate * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">Escalation Rate</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">Agent Runs</TabsTrigger>
          <TabsTrigger value="by-agent">By Agent Type</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Logs</TabsTrigger>
          <TabsTrigger value="policy">Policy Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="mt-4 space-y-2">
          {runs.map(r => (
            <Card key={r.id}><CardContent className="pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.agent_type}</Badge>
                {r.sub_agent && <Badge variant="secondary" className="text-[9px]">{r.sub_agent}</Badge>}
                <span className="text-xs">{r.intent_detected || "unknown"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium">{((r.confidence_score || 0) * 100).toFixed(0)}%</span>
                {r.latency_ms && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{r.latency_ms}ms</span>}
                {r.should_escalate && <Badge variant="destructive" className="text-[9px]">Escalated</Badge>}
                <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
              </div>
            </CardContent></Card>
          ))}
          {runs.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No agent runs recorded yet</CardContent></Card>}
        </TabsContent>

        <TabsContent value="by-agent" className="mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {agentTypes.map(type => {
              const typeRuns = runs.filter(r => r.agent_type === type);
              const typeConf = typeRuns.reduce((s, r) => s + (r.confidence_score || 0), 0) / (typeRuns.length || 1);
              const typeLat = typeRuns.reduce((s, r) => s + (r.latency_ms || 0), 0) / (typeRuns.length || 1);
              return (
                <Card key={type}><CardContent className="pt-4">
                  <h3 className="text-sm font-semibold capitalize mb-2">{type.replace(/_/g, " ")} Agent</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Runs:</span> {typeRuns.length}</div>
                    <div><span className="text-muted-foreground">Confidence:</span> {(typeConf * 100).toFixed(0)}%</div>
                    <div><span className="text-muted-foreground">Latency:</span> {typeLat.toFixed(0)}ms</div>
                    <div><span className="text-muted-foreground">Escalations:</span> {typeRuns.filter(r => r.should_escalate).length}</div>
                  </div>
                </CardContent></Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="mt-4 space-y-2">
          {deliveryLogs.map(d => (
            <Card key={d.id}><CardContent className="pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{d.channel_type}</Badge>
                <Badge variant={d.delivery_state === "delivered" ? "secondary" : d.delivery_state === "failed" ? "destructive" : "default"}>{d.delivery_state}</Badge>
              </div>
              <div className="flex items-center gap-2">
                {d.retry_count > 0 && <span className="text-[10px] text-muted-foreground">Retries: {d.retry_count}</span>}
                <span className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleString()}</span>
              </div>
            </CardContent></Card>
          ))}
          {deliveryLogs.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No delivery logs</CardContent></Card>}
        </TabsContent>

        <TabsContent value="policy" className="mt-4 space-y-2">
          {flags.map(f => (
            <Card key={f.id}><CardContent className="pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${f.severity === "critical" ? "text-red-500" : "text-yellow-500"}`} />
                <span className="text-sm font-medium">{f.flag_type}</span>
                <Badge variant={f.severity === "critical" ? "destructive" : "secondary"}>{f.severity}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{f.reason}</span>
                {f.resolved && <Badge className="bg-green-100 text-green-700 text-[9px]">Resolved</Badge>}
              </div>
            </CardContent></Card>
          ))}
          {flags.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground flex items-center justify-center gap-2"><Shield className="h-5 w-5 text-green-500" />No policy incidents</CardContent></Card>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

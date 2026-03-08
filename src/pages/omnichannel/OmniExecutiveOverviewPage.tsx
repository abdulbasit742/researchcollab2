import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Bot, Zap, Shield, Radio, TrendingUp, AlertTriangle, CheckCircle, Globe, Phone, Mail } from "lucide-react";
import { getAgentRuns, getAgentPerformance, getChannelHealth, getPolicyFlags } from "@/lib/omnichannel/operatorService";
import { getConversationStats } from "@/lib/omnichannel/analyticsService";
import { getLeadStats } from "@/lib/omnichannel/leadService";
import { getTicketStats } from "@/lib/omnichannel/ticketService";
import { toast } from "sonner";

export default function OmniExecutiveOverviewPage() {
  const [convStats, setConvStats] = useState<any>(null);
  const [leadStats, setLeadStats] = useState<any>(null);
  const [ticketStats, setTicketStats] = useState<any>(null);
  const [channelHealth, setChannelHealth] = useState<any[]>([]);
  const [policyFlags, setPolicyFlags] = useState<any[]>([]);
  const [agentRuns, setAgentRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getConversationStats().then(setConvStats),
      getLeadStats().then(setLeadStats),
      getTicketStats().then(setTicketStats),
      getChannelHealth().then(setChannelHealth),
      getPolicyFlags({ resolved: false }).then(setPolicyFlags),
      getAgentRuns({ limit: 20 }).then(setAgentRuns),
    ]).catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const CHANNEL_ICONS: Record<string, any> = { webchat: Globe, whatsapp: Phone, email: Mail };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Overview</h1>
          <p className="text-sm text-muted-foreground">Platform-wide AI agent ecosystem intelligence</p>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold">{convStats?.total || 0}</p>
          <p className="text-xs text-muted-foreground">Conversations</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold text-green-600">{convStats?.aiHandled || 0}</p>
          <p className="text-xs text-muted-foreground">AI Handled</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold text-red-500">{convStats?.escalated || 0}</p>
          <p className="text-xs text-muted-foreground">Escalations</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold">{leadStats?.total || 0}</p>
          <p className="text-xs text-muted-foreground">Leads</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold text-green-600">${((leadStats?.totalPipelineValue || 0) / 1000).toFixed(0)}K</p>
          <p className="text-xs text-muted-foreground">Pipeline Value</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold">{ticketStats?.open || 0}</p>
          <p className="text-xs text-muted-foreground">Open Tickets</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channel Health</TabsTrigger>
          <TabsTrigger value="agents">Agent Activity</TabsTrigger>
          <TabsTrigger value="policy">Policy Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Lead Pipeline Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leadStats && Object.entries(leadStats.byStage).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-xs capitalize">{stage.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${((count as number) / (leadStats.total || 1)) * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium w-6 text-right">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bot className="h-4 w-4" />Channel Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {convStats && Object.entries(convStats.byChannel).map(([ch, count]) => (
                    <div key={ch} className="flex items-center justify-between">
                      <span className="text-xs capitalize">{ch}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${((count as number) / (convStats.total || 1)) * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium w-6 text-right">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" />Support Overview</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ticketStats && Object.entries(ticketStats.byCategory).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-xs capitalize">{cat}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />AI Containment</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-green-600">
                    {convStats && convStats.total > 0 ? ((convStats.aiHandled / convStats.total) * 100).toFixed(0) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">of conversations handled by AI without escalation</p>
                </div>
                <div className="flex justify-between text-xs mt-4">
                  <div className="text-center"><p className="font-bold">{convStats?.aiHandled || 0}</p><p className="text-muted-foreground">AI</p></div>
                  <div className="text-center"><p className="font-bold">{convStats?.humanHandled || 0}</p><p className="text-muted-foreground">Human</p></div>
                  <div className="text-center"><p className="font-bold">{convStats?.escalated || 0}</p><p className="text-muted-foreground">Escalated</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {channelHealth.length === 0 ? (
              ["webchat", "whatsapp", "email", "instagram", "linkedin"].map(ch => (
                <Card key={ch}><CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{ch}</span>
                    <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Channel connector configured. Awaiting webhook integration.</p>
                </CardContent></Card>
              ))
            ) : channelHealth.map(ch => (
              <Card key={ch.id}><CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">{ch.channel_type}</span>
                  <Badge variant={ch.status === "healthy" ? "secondary" : "destructive"}>{ch.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Sent 24h:</span> {ch.messages_sent_24h}</div>
                  <div><span className="text-muted-foreground">Received 24h:</span> {ch.messages_received_24h}</div>
                  <div><span className="text-muted-foreground">Errors 24h:</span> {ch.error_count_24h}</div>
                  <div><span className="text-muted-foreground">Avg Latency:</span> {ch.avg_delivery_ms}ms</div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <div className="space-y-2">
            {agentRuns.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No agent runs recorded yet. Start a conversation to generate activity.</CardContent></Card>
            ) : agentRuns.map(r => (
              <Card key={r.id}><CardContent className="pt-3 pb-2 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.agent_type}</Badge>
                    {r.sub_agent && <Badge variant="secondary" className="text-[9px]">{r.sub_agent}</Badge>}
                    <span className="text-xs text-muted-foreground">{r.intent_detected || "unknown intent"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{(r.confidence_score * 100).toFixed(0)}% confidence</span>
                  {r.latency_ms && <span className="text-[10px] text-muted-foreground">{r.latency_ms}ms</span>}
                  {r.should_escalate && <Badge variant="destructive" className="text-[9px]">Escalated</Badge>}
                </div>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="policy" className="mt-4">
          <div className="space-y-2">
            {policyFlags.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No active policy alerts. System is compliant.</CardContent></Card>
            ) : policyFlags.map(f => (
              <Card key={f.id}><CardContent className="pt-3 pb-2 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${f.severity === "critical" ? "text-red-500" : "text-yellow-500"}`} />
                    <span className="text-sm font-medium">{f.flag_type}</span>
                    <Badge variant={f.severity === "critical" ? "destructive" : "secondary"}>{f.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{f.reason}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</span>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

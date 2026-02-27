import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, AlertTriangle, Loader2, Scan, Scale, CheckCircle, XCircle, Eye } from "lucide-react";
import { useResearchGovernance } from "@/hooks/useResearchGovernance";

const SEVERITY_COLORS: Record<string, string> = {
  low: "secondary", medium: "default", high: "destructive", critical: "destructive",
};

const EVENT_ICONS: Record<string, string> = {
  trust_anomaly: "🔍", citation_inflation: "📈", funding_misuse: "💰",
  collusion: "🤝", bias_pattern: "⚖️", ai_misuse: "🤖",
  policy_manipulation: "📜", systemic_risk: "🌐",
};

export function ResearchGovernancePanel() {
  const {
    events, appeals, loading, stats,
    fetchEvents, fetchAppeals,
    runScan, submitAppeal, resolveAppeal, resolveEvent,
  } = useResearchGovernance();

  const [appealReason, setAppealReason] = useState("");
  const [appealEventId, setAppealEventId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  useEffect(() => { fetchEvents(); fetchAppeals(); }, []);

  return (
    <Tabs defaultValue="events" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="events"><Shield className="h-3 w-3 mr-1" />Events</TabsTrigger>
        <TabsTrigger value="scan"><Scan className="h-3 w-3 mr-1" />Scan</TabsTrigger>
        <TabsTrigger value="appeals"><Scale className="h-3 w-3 mr-1" />Appeals</TabsTrigger>
      </TabsList>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 my-3">
        {[
          { label: "Total Events", value: stats.totalEvents },
          { label: "Open", value: stats.openEvents },
          { label: "Critical", value: stats.criticalEvents },
          { label: "High", value: stats.highEvents },
          { label: "Pending Appeals", value: stats.pendingAppeals },
          { label: "Resolved", value: stats.resolvedEvents },
        ].map(s => (
          <Card key={s.label} className="p-2 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* EVENTS TAB */}
      <TabsContent value="events" className="space-y-4">
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-2">
            {events.map(evt => (
              <Card key={evt.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{EVENT_ICONS[evt.event_type] || "⚠️"}</span>
                    <div>
                      <p className="text-sm font-medium">{evt.event_type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">{evt.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {evt.related_entity_type}/{evt.related_entity_id} · {evt.detection_source} · {new Date(evt.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={SEVERITY_COLORS[evt.severity_level] as any}>{evt.severity_level}</Badge>
                    <Badge variant="outline" className="text-[10px]">{evt.status}</Badge>
                    <div className="flex gap-1 mt-1">
                      {evt.status === "open" && (
                        <>
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => resolveEvent(evt.id)}>
                            <CheckCircle className="h-3 w-3 mr-0.5" />Resolve
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => setAppealEventId(evt.id)}>
                            <Scale className="h-3 w-3 mr-0.5" />Appeal
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {events.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">No governance events — system integrity intact</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Appeal Dialog */}
        <Dialog open={!!appealEventId} onOpenChange={() => setAppealEventId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit Appeal</DialogTitle></DialogHeader>
            <Textarea placeholder="Explain why this governance event should be reconsidered..." value={appealReason} onChange={e => setAppealReason(e.target.value)} className="min-h-[100px]" />
            <Button onClick={() => { if (appealEventId && appealReason) { submitAppeal(appealEventId, appealReason); setAppealEventId(null); setAppealReason(""); } }} disabled={!appealReason}>
              Submit Appeal
            </Button>
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* SCAN TAB */}
      <TabsContent value="scan" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Run Integrity Scan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              AI-powered scan for trust anomalies, citation inflation, funding misuse, collusion, bias patterns, and policy manipulation.
            </p>
            <Button onClick={() => runScan()} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Scan className="h-4 w-4 mr-1" />}
              Run Full Governance Scan
            </Button>
          </CardContent>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium mb-2">Scan Coverage</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {["Trust Anomaly Detection", "Citation Inflation", "Funding Misuse", "Collusion Detection", "Bias & Systemic Risk", "AI Misuse Oversight", "Policy Manipulation", "Cross-Node Integrity"].map(item => (
              <div key={item} className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>

      {/* APPEALS TAB */}
      <TabsContent value="appeals" className="space-y-4">
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-2">
            {appeals.map(appeal => (
              <Card key={appeal.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{appeal.appeal_reason}</p>
                    <p className="text-[10px] text-muted-foreground">Event: {appeal.governance_event_id.slice(0, 8)}... · {new Date(appeal.created_at).toLocaleString()}</p>
                    {appeal.resolution_notes && <p className="text-xs text-muted-foreground mt-1">Resolution: {appeal.resolution_notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={appeal.status === "overturned" ? "default" : appeal.status === "upheld" ? "destructive" : "secondary"}>
                      {appeal.status}
                    </Badge>
                    {appeal.status === "pending" && (
                      <div className="flex gap-1 mt-1">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"
                          onClick={() => resolveAppeal(appeal.id, "overturned", "Appeal accepted after review")}>
                          <CheckCircle className="h-3 w-3 mr-0.5" />Overturn
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                          onClick={() => resolveAppeal(appeal.id, "upheld", "Original finding upheld")}>
                          <XCircle className="h-3 w-3 mr-0.5" />Uphold
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {appeals.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No appeals submitted</p>}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Loader2 } from "lucide-react";
import { runAgent, getRecentEvents, getKnowledgeReports } from "@/lib/intelligence/agentNetwork";

export default function OperatorAssistantPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ["aian-recent-events"],
    queryFn: () => getRecentEvents(20),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["aian-knowledge-reports"],
    queryFn: () => getKnowledgeReports(),
  });

  const askOperator = async () => {
    setLoading(true);
    try {
      const res = await runAgent("operator_assistant", {
        query,
        recentEvents: events.slice(0, 10),
      });
      setResult(res);
      toast.success("Analysis complete");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" /> Operator Assistant
        </h1>
        <p className="text-muted-foreground mt-1">AI-powered platform operations intelligence</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Ask the AI Operator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="E.g., Summarize platform activity, detect anomalies, suggest growth actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
          />
          <Button onClick={askOperator} disabled={loading || !query.trim()}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {loading ? "Analyzing..." : "Run Analysis"}
          </Button>
        </CardContent>
      </Card>

      {result?.insights?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">AI Insights ({result.insights.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {result.insights.map((i: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-muted/50 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{i.title}</h3>
                  <Badge variant="outline">{i.insight_type}</Badge>
                  <Badge variant="secondary">{i.confidence_score}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{i.summary}</p>
                {i.action_suggested && <p className="text-sm text-primary">→ {i.action_suggested}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Events ({events.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {events.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{e.event_type}</Badge>
                  <span className="text-muted-foreground">{e.entity_type}</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
            {events.length === 0 && <p className="text-muted-foreground text-sm">No events tracked yet.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Knowledge Reports ({reports.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {reports.map((r: any) => (
              <div key={r.id} className="p-3 rounded-lg bg-muted/30">
                <h4 className="font-medium text-foreground text-sm">{r.title}</h4>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{r.domain}</Badge>
                  <Badge variant="secondary" className="text-xs">{r.report_type}</Badge>
                </div>
              </div>
            ))}
            {reports.length === 0 && <p className="text-muted-foreground text-sm">No reports generated yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

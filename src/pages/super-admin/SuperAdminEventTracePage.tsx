import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SuperAdminEventTracePage() {
  const { traceId: paramTraceId } = useParams();
  const [traceId, setTraceId] = useState(paramTraceId ?? "");
  const [searchInput, setSearchInput] = useState(paramTraceId ?? "");
  const [traceData, setTraceData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  const loadTrace = async (id: string) => {
    if (!id) return;
    const [traceRes, eventsRes] = await Promise.all([
      (supabase as any).from("request_traces").select("*").eq("trace_id", id).maybeSingle(),
      (supabase as any).from("system_event_telemetry").select("*").eq("trace_id", id).order("created_at", { ascending: true }),
    ]);
    setTraceData(traceRes.data);
    setEvents(eventsRes.data ?? []);
  };

  useEffect(() => {
    if (paramTraceId) loadTrace(paramTraceId);
  }, [paramTraceId]);

  const severityColor = (s: string) => {
    switch (s) {
      case "critical": return "destructive";
      case "error": return "destructive";
      case "warning": return "secondary";
      default: return "outline";
    }
  };

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Event Trace</h1>
            <p className="text-sm text-muted-foreground">Distributed event correlation view</p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter trace ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-md"
            />
            <Button size="sm" onClick={() => { setTraceId(searchInput); loadTrace(searchInput); }}>
              <Search className="h-4 w-4 mr-1" /> Trace
            </Button>
          </div>

          {traceData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Request Trace</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Route:</span> <span className="font-medium">{traceData.route}</span></div>
                  <div><span className="text-muted-foreground">Method:</span> <Badge variant="outline">{traceData.method}</Badge></div>
                  <div><span className="text-muted-foreground">Duration:</span> <span className="font-medium">{traceData.duration_ms}ms</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={traceData.error_flag ? "destructive" : "default"}>{traceData.response_status}</Badge></div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Correlated Events ({events.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  {traceId ? "No events found for this trace" : "Enter a trace ID to search"}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {events.map((e: any, i: number) => (
                    <div key={e.id} className="flex items-start gap-3 border-b pb-2">
                      <div className="text-[10px] text-muted-foreground min-w-[60px]">
                        {new Date(e.created_at).toLocaleTimeString()}
                      </div>
                      <Badge variant={severityColor(e.severity_level) as any} className="text-[10px]">
                        {e.severity_level}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{e.event_type}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {e.entity_type && `${e.entity_type}:${e.entity_id?.slice(0, 8)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}

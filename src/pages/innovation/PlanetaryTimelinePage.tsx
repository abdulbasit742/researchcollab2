import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Sparkles } from "lucide-react";
import { getTimelineEvents, TIMELINE_DOMAINS } from "@/lib/innovation/planetaryTimeline";

export default function PlanetaryTimelinePage() {
  const [domain, setDomain] = useState(TIMELINE_DOMAINS[0]);
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["research-timeline", domain],
    queryFn: () => getTimelineEvents(domain),
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Planetary Research Timeline</h1>
          <p className="text-sm text-muted-foreground">Scientific progress timeline with future predictions</p>
        </div>
      </div>

      <Select value={domain} onValueChange={setDomain}>
        <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
        <SelectContent>{TIMELINE_DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
      </Select>

      {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading timeline…</div> : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-4">
            {events.map((e: any) => (
              <div key={e.id} className="relative pl-14">
                <div className={`absolute left-4 w-4 h-4 rounded-full border-2 ${e.is_prediction ? "bg-primary/20 border-primary" : "bg-primary border-primary"}`} />
                <Card className={e.is_prediction ? "border-dashed border-primary/30" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg font-bold">{e.event_year}</span>
                      <div className="flex gap-1">
                        {e.is_prediction && <Badge variant="outline" className="text-[10px] flex items-center gap-1"><Sparkles className="h-3 w-3" />Prediction</Badge>}
                        <Badge variant="secondary" className="text-[10px]">{e.event_type}</Badge>
                      </div>
                    </div>
                    <h3 className="font-medium text-sm">{e.title}</h3>
                    {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
                    {e.is_prediction && e.confidence != null && (
                      <p className="text-[10px] text-muted-foreground mt-1">Confidence: {Math.round(Number(e.confidence) * 100)}%</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
            {events.length === 0 && <div className="text-center py-12 text-muted-foreground pl-14">No timeline events for {domain} yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Handshake, Search } from "lucide-react";
import { getCollaborationMapNodes, getCollaborationSuggestions } from "@/lib/innovation/globalCollaborationMap";

export default function GlobalCollaborationMapPage() {
  const [search, setSearch] = useState("");
  const { data: nodes = [] } = useQuery({ queryKey: ["collab-map-nodes"], queryFn: () => getCollaborationMapNodes() });
  const { data: suggestions = [] } = useQuery({ queryKey: ["collab-suggestions"], queryFn: () => getCollaborationSuggestions() });

  const filteredNodes = nodes.filter((n: any) =>
    n.label?.toLowerCase().includes(search.toLowerCase()) || n.domain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MapPin className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Global Collaboration Map</h1>
          <p className="text-sm text-muted-foreground">Research activity clusters and collaboration flows</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Nodes</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{nodes.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Teams</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{nodes.reduce((s: number, n: any) => s + (n.active_teams || 0), 0)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Collaboration Suggestions</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-primary">{suggestions.length}</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search nodes…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNodes.map((n: any) => (
          <Card key={n.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{n.label}</span>
                {n.country_code && <Badge variant="outline">{n.country_code}</Badge>}
              </div>
              {n.domain && <Badge variant="secondary" className="text-[10px]">{n.domain}</Badge>}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{n.active_teams} teams</span>
                <span>{n.active_projects} projects</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Handshake className="h-5 w-5" />Suggested Collaborations</h2>
          {suggestions.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <p className="text-sm">{s.reason || "Complementary expertise detected"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">Score: {Number(s.compatibility_score).toFixed(0)}%</Badge>
                  {(s.shared_domains || []).map((d: string) => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

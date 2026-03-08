import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, Users, GitBranch, Handshake } from "lucide-react";
import { getTalentGraphEdges, RELATIONSHIP_TYPES } from "@/lib/innovation/talentGraph";
import { toast } from "sonner";

export default function TalentGraphPage() {
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [relType, setRelType] = useState("");

  useEffect(() => { loadEdges(); }, []);

  async function loadEdges() {
    setLoading(true);
    try { setEdges(await getTalentGraphEdges()); }
    catch { toast.error("Failed to load talent graph"); }
    finally { setLoading(false); }
  }

  const filtered = edges.filter(e => !relType || e.relationship_type === relType);
  const uniqueUsers = new Set([...filtered.map(e => e.source_user_id), ...filtered.map(e => e.target_user_id)]);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Network className="h-8 w-8 text-primary" /> Global Talent Graph
          </h1>
          <p className="text-muted-foreground mt-1">Execution-based professional network visualization</p>
        </div>
        <Select value={relType} onValueChange={setRelType}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Relationships" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {RELATIONSHIP_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Connections", value: filtered.length, icon: GitBranch },
          { label: "Unique Professionals", value: uniqueUsers.size, icon: Users },
          { label: "Avg Trust Weight", value: filtered.length ? (filtered.reduce((s,e) => s + (e.trust_weighted_score || 0), 0) / filtered.length).toFixed(1) : "0", icon: Handshake },
          { label: "Shared Domains", value: new Set(filtered.flatMap(e => e.shared_domains || [])).size, icon: Network },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 flex items-center gap-3">
              <m.icon className="h-8 w-8 text-primary" />
              <div><p className="text-2xl font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="animate-pulse h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No talent graph edges yet. Connections form through verified execution.</p>
        </CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Talent Connections</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filtered.map(e => (
                <div key={e.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition">
                  <GitBranch className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge>{e.relationship_type?.replace("_", " ")}</Badge>
                      <span className="text-xs text-muted-foreground">{e.shared_projects || 0} shared projects</span>
                    </div>
                    {(e.shared_domains || []).length > 0 && (
                      <div className="flex gap-1 mt-1">{e.shared_domains.map((d: string) => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{e.trust_weighted_score?.toFixed(1) || 0}</p>
                    <p className="text-xs text-muted-foreground">Trust Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

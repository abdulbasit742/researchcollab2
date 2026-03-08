import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { UserSearch, Search, Milestone, BookOpen, Globe } from "lucide-react";
import { getTalentProfiles } from "@/lib/innovation/talentDiscovery";

export default function TalentDiscoveryPage() {
  const [search, setSearch] = useState("");
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["talent-profiles"],
    queryFn: () => getTalentProfiles(),
  });

  const filtered = profiles.filter((p: any) =>
    (p.top_skills || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase())) ||
    (p.domains || []).some((d: string) => d.toLowerCase().includes(search.toLowerCase()))
  );

  const display = search ? filtered : profiles;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <UserSearch className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Global Talent Discovery</h1>
          <p className="text-sm text-muted-foreground">Discover talent through execution graphs, not resumes</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by skill or domain…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? <div className="text-center py-12 text-muted-foreground">Discovering talent…</div> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {display.map((p: any) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">User {p.user_id?.slice(0, 8)}…</span>
                  <Badge variant={p.availability === "open" ? "default" : "secondary"}>{p.availability}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Discovery Score</span>
                    <span className="font-medium">{Number(p.discovery_score).toFixed(0)}</span>
                  </div>
                  <Progress value={Number(p.discovery_score)} className="h-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Milestone className="h-3 w-3" />{p.completed_milestones} milestones</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{p.knowledge_contributions} contributions</span>
                  <span>{p.peer_endorsements} endorsements</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{p.cross_border_collaborations} cross-border</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(p.top_skills || []).slice(0, 4).map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(p.domains || []).map((d: string) => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
                </div>
              </CardContent>
            </Card>
          ))}
          {display.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No talent profiles found.</div>}
        </div>
      )}
    </div>
  );
}

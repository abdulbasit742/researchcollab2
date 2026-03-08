import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, TrendingUp, DollarSign, Search } from "lucide-react";
import { getResearchOpportunities } from "@/lib/innovation/researchOpportunityEngine";

export default function ResearchOpportunityExplorerPage() {
  const [search, setSearch] = useState("");
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["research-opportunities"],
    queryFn: () => getResearchOpportunities(),
  });

  const filtered = opportunities.filter((o: any) =>
    o.title?.toLowerCase().includes(search.toLowerCase()) ||
    o.domain?.toLowerCase().includes(search.toLowerCase())
  );

  const potentialColor = (p: string) => p === "high" ? "text-green-600" : p === "medium" ? "text-yellow-600" : "text-muted-foreground";

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Research Opportunity Explorer</h1>
          <p className="text-sm text-muted-foreground">AI-detected research gaps and emerging opportunities</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by title or domain…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Scanning opportunities…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o: any) => (
            <Card key={o.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{o.title}</CardTitle>
                {o.domain && <Badge variant="secondary" className="w-fit">{o.domain}</Badge>}
              </CardHeader>
              <CardContent className="space-y-3">
                {o.description && <p className="text-xs text-muted-foreground line-clamp-3">{o.description}</p>}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Research Gap Score</span>
                    <span className="font-medium">{o.research_gap_score}/100</span>
                  </div>
                  <Progress value={o.research_gap_score} className="h-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className={potentialColor(o.market_potential)}>Market: {o.market_potential}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span className={potentialColor(o.funding_interest)}>Funding: {o.funding_interest}</span>
                  </div>
                </div>
                {o.region && <p className="text-[10px] text-muted-foreground">Region: {o.region}</p>}
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">No opportunities found.</div>
          )}
        </div>
      )}
    </div>
  );
}

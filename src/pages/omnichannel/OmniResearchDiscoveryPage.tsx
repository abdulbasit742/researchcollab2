import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Microscope, TrendingUp, Globe, Lightbulb, ExternalLink } from "lucide-react";
import { getDiscoveries, DISCOVERY_TYPES, RESEARCH_DOMAINS } from "@/lib/omnichannel/researchDiscoveryService";
import { toast } from "sonner";

export default function OmniResearchDiscoveryPage() {
  const [discoveries, setDiscoveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");

  useEffect(() => { load(); }, [typeFilter, domainFilter]);

  async function load() {
    setLoading(true);
    try {
      const filters: any = {};
      if (typeFilter !== "all") filters.discovery_type = typeFilter;
      if (domainFilter !== "all") filters.research_domain = domainFilter;
      setDiscoveries(await getDiscoveries(filters));
    } catch { toast.error("Failed to load discoveries"); }
    finally { setLoading(false); }
  }

  const typeIcon = (t: string) => {
    const map: Record<string, any> = { trend: TrendingUp, paper: Microscope, technology: Lightbulb, patent: Globe };
    const Icon = map[t] || Microscope;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Microscope className="h-7 w-7 text-primary" /> AI Research Discovery
          </h1>
          <p className="text-sm text-muted-foreground">Emerging research opportunities, trends & technologies</p>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DISCOVERY_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Domain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {RESEARCH_DOMAINS.map(d => <SelectItem key={d} value={d} className="capitalize">{d.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Total Discoveries", value: discoveries.length, icon: Microscope },
          { label: "High Relevance", value: discoveries.filter(d => (d.relevance_score || 0) >= 70).length, icon: TrendingUp },
          { label: "New", value: discoveries.filter(d => d.status === "new").length, icon: Lightbulb },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 flex items-center gap-3">
              <m.icon className="h-7 w-7 text-primary" />
              <div><p className="text-xl font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Card key={i} className="animate-pulse h-20" />)}</div>
      ) : discoveries.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No discoveries yet. The AI engine will populate findings as it scans global research data.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {discoveries.map(d => (
            <Card key={d.id} className="hover:shadow transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {typeIcon(d.discovery_type)}
                    <CardTitle className="text-sm font-semibold">{d.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] capitalize">{d.discovery_type?.replace("_", " ")}</Badge>
                    {d.research_domain && <Badge className="text-[10px] capitalize" variant="secondary">{d.research_domain.replace("_", " ")}</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {d.summary && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{d.summary}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Relevance: <strong>{d.relevance_score ?? 0}%</strong></span>
                    {d.keywords?.length > 0 && <span>• {d.keywords.slice(0, 3).join(", ")}</span>}
                  </div>
                  {d.source_url && (
                    <Button variant="ghost" size="sm" className="h-6 px-2" asChild>
                      <a href={d.source_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

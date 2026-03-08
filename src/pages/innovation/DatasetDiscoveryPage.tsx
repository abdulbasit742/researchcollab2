import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Search, Target, ArrowRight } from "lucide-react";
import { discoverAssets, getRecommendations, DKE_DOMAINS } from "@/lib/innovation/datasetKnowledgeExchange";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function DatasetDiscoveryPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    if (user) loadExisting();
  }, [user]);

  async function loadExisting() {
    if (!user) return;
    setLoading(true);
    try { setRecommendations(await getRecommendations(user.id)); }
    catch { /* no recommendations yet */ }
    finally { setLoading(false); }
  }

  async function handleDiscover() {
    if (!user) return;
    setDiscovering(true);
    try {
      const result = await discoverAssets(user.id, domain, projectDesc);
      if (result?.recommendations) {
        setRecommendations(result.recommendations);
        toast.success(`Found ${result.recommendations.length} recommendations`);
      }
    } catch (e: any) { toast.error(e?.message || "Discovery failed"); }
    finally { setDiscovering(false); }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" /> AI Dataset Discovery
        </h1>
        <p className="text-sm text-muted-foreground">AI-powered recommendations based on your research context</p>
      </div>

      {/* Discovery Form */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4" /> Describe Your Research Needs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Research domain (e.g. AI & Machine Learning)" value={domain} onChange={e => setDomain(e.target.value)} />
          <Textarea placeholder="Describe your project or research question..." value={projectDesc} onChange={e => setProjectDesc(e.target.value)} rows={3} />
          <Button onClick={handleDiscover} disabled={discovering} className="w-full">
            {discovering ? "AI Analyzing..." : "Discover Relevant Assets"}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recommendations ({recommendations.length})</h2>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Card key={i} className="animate-pulse h-20" />)}</div>
        ) : recommendations.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Describe your research to get AI-powered dataset recommendations</p>
          </CardContent></Card>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-3">
              {recommendations.map((r: any, i: number) => (
                <Card key={r.asset_id || i} className="hover:shadow transition-shadow">
                  <CardContent className="pt-4 flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{r.asset_title}</p>
                        <Badge variant="outline" className="text-[10px]">{r.asset_type}</Badge>
                      </div>
                      {r.match_reasons && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(Array.isArray(r.match_reasons) ? r.match_reasons : []).map((reason: string, j: number) => (
                            <Badge key={j} variant="secondary" className="text-[10px]">{reason}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{r.match_score}%</p>
                        <p className="text-[10px] text-muted-foreground">match</p>
                      </div>
                      <Button size="sm" variant="outline"><ArrowRight className="h-3 w-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Building, Plus, Search, Brain, BarChart3, MapPin, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  getInstitutionNodes, registerInstitutionNode, getCollaborations, getGINAnalytics,
  runInstitutionDiscovery, INSTITUTION_TYPES,
} from "@/lib/network/institutionNetwork";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444"];

export default function InstitutionNetworkPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [countryFilter, setCountryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [instType, setInstType] = useState("university");
  const [domains, setDomains] = useState("");
  const [website, setWebsite] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ["gin-nodes", countryFilter, typeFilter],
    queryFn: () => getInstitutionNodes({
      ...(countryFilter ? { country: countryFilter } : {}),
      ...(typeFilter && typeFilter !== "all" ? { type: typeFilter } : {}),
    }),
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ["gin-collabs"],
    queryFn: () => getCollaborations(),
  });

  const { data: analytics } = useQuery({
    queryKey: ["gin-analytics"],
    queryFn: getGINAnalytics,
  });

  const registerMut = useMutation({
    mutationFn: registerInstitutionNode,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gin-nodes"] });
      toast.success("Institution registered");
      setShowRegister(false);
      setName(""); setCountry(""); setDomains(""); setWebsite("");
    },
  });

  const discoverAI = async () => {
    setAiLoading(true);
    try {
      const res = await runInstitutionDiscovery("discover", {
        institutions: institutions.slice(0, 15).map((i: any) => ({
          name: i.institution_name, country: i.country, domains: i.domains_of_expertise, reputation: i.reputation_score,
        })),
      });
      setAiResults(res);
      toast.success(`${res.recommendations?.length || 0} recommendations generated`);
    } catch (e: any) {
      toast.error(e.message || "AI discovery failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" /> Global Institution Network
          </h1>
          <p className="text-muted-foreground mt-1">Sovereign institutional nodes coordinating research globally</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={discoverAI} disabled={aiLoading}>
            <Brain className="h-4 w-4 mr-2" /> {aiLoading ? "Analyzing..." : "AI Discover"}
          </Button>
          <Dialog open={showRegister} onOpenChange={setShowRegister}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Register Institution</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register Institution Node</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Institution name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                <Select value={instType} onValueChange={setInstType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Domains (comma separated)" value={domains} onChange={(e) => setDomains(e.target.value)} />
                <Input placeholder="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} />
                <Button className="w-full" disabled={!name || !country || registerMut.isPending}
                  onClick={() => registerMut.mutate({
                    institution_name: name, country, institution_type: instType,
                    domains_of_expertise: domains.split(",").map((s) => s.trim()).filter(Boolean),
                    website_url: website || undefined, registered_by: user?.id || "",
                  })}>
                  {registerMut.isPending ? "Registering..." : "Register"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.totalInstitutions ?? 0}</p>
          <p className="text-sm text-muted-foreground">Institutions</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-primary">{analytics?.totalCollaborations ?? 0}</p>
          <p className="text-sm text-muted-foreground">Collaborations</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.totalChallenges ?? 0}</p>
          <p className="text-sm text-muted-foreground">Challenges</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">${(analytics?.totalFunding ?? 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Challenge Funding</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.avgReputation ?? 0}</p>
          <p className="text-sm text-muted-foreground">Avg Reputation</p>
        </CardContent></Card>
      </div>

      {aiResults?.recommendations?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4" /> AI Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {aiResults.recommendations.map((r: any, i: number) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{r.title}</h3>
                  <Badge variant="secondary">{r.confidence}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{r.description}</p>
                {r.suggested_action && <p className="text-sm text-primary">→ {r.suggested_action}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="institutions">
        <TabsList>
          <TabsTrigger value="institutions"><Building className="h-4 w-4 mr-1" /> Institutions</TabsTrigger>
          <TabsTrigger value="collaborations"><Globe className="h-4 w-4 mr-1" /> Collaborations</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="institutions" className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Filter by country..." value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="max-w-xs" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {INSTITUTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? <p className="text-muted-foreground">Loading...</p> : institutions.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No institutions registered yet.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {institutions.map((inst: any) => (
                <Card key={inst.id}>
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{inst.institution_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {inst.country}{inst.region ? `, ${inst.region}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{inst.reputation_score}</p>
                        <p className="text-xs text-muted-foreground">Reputation</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="outline">{inst.institution_type?.replace("_", " ")}</Badge>
                      <Badge variant={inst.verification_status === "verified" ? "default" : "secondary"}>
                        <Shield className="h-3 w-3 mr-1" /> {inst.verification_status}
                      </Badge>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {(inst.domains_of_expertise || []).slice(0, 4).map((d: string) => (
                        <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{inst.total_projects} projects</span>
                      <span>${(inst.total_funding_received || 0).toLocaleString()} funded</span>
                      <span>{inst.total_datasets} datasets</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collaborations" className="space-y-4">
          {collaborations.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No collaborations yet.</CardContent></Card>
          ) : collaborations.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {c.institution_a?.institution_name || "Institution A"} ↔ {c.institution_b?.institution_name || "Institution B"}
                  </h3>
                  {c.title && <p className="text-sm text-muted-foreground">{c.title}</p>}
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{c.collaboration_type?.replace("_", " ")}</Badge>
                    <Badge variant="secondary">{c.project_count} projects</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{c.strength_score}</p>
                  <p className="text-xs text-muted-foreground">Strength</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Institutions by Country</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics?.byCountry || []}>
                    <XAxis dataKey="country" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">By Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={analytics?.byType || []} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                      {(analytics?.byType || []).map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

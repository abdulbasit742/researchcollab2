import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, BookOpen, Plus, Search, Download, Star, Shield, DollarSign, BarChart3 } from "lucide-react";
import { getDatasets, getKnowledgeObjects, createDataset, createKnowledgeObject, getDKEAnalytics, DKE_DOMAINS, DKE_DATA_TYPES, DKE_LICENSE_TYPES, DKE_OBJECT_TYPES, DKE_ACCESS_LEVELS } from "@/lib/innovation/datasetKnowledgeExchange";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function DatasetRegistryPage() {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<any[]>([]);
  const [knowledgeObjs, setKnowledgeObjs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<"dataset" | "knowledge">("dataset");
  const [dsForm, setDsForm] = useState({ title: "", description: "", domain_category: "", data_type: "tabular", license_type: "research_only", access_level: "public", price_amount: "0", tags: "" });
  const [koForm, setKoForm] = useState({ title: "", description: "", object_type: "report", domain: "", license_type: "open_access", price_amount: "0", tags: "" });

  useEffect(() => { loadAll(); }, [domainFilter]);

  async function loadAll() {
    setLoading(true);
    try {
      const filters: any = {};
      if (domainFilter !== "all") filters.domain_category = domainFilter;
      const [ds, ko, an] = await Promise.all([
        getDatasets(filters),
        getKnowledgeObjects(domainFilter !== "all" ? { domain: domainFilter } : undefined),
        getDKEAnalytics(),
      ]);
      setDatasets(ds);
      setKnowledgeObjs(ko);
      setAnalytics(an);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }

  async function handleCreateDataset() {
    if (!user || !dsForm.title || !dsForm.domain_category) return;
    try {
      await createDataset({
        title: dsForm.title, description: dsForm.description, domain_category: dsForm.domain_category,
        data_type: dsForm.data_type, license_type: dsForm.license_type, access_level: dsForm.access_level,
        price_amount: parseFloat(dsForm.price_amount) || 0, creator_id: user.id,
        tags: dsForm.tags ? dsForm.tags.split(",").map(t => t.trim()) : [],
      });
      toast.success("Dataset registered");
      setIsCreateOpen(false);
      loadAll();
    } catch { toast.error("Failed to create dataset"); }
  }

  async function handleCreateKO() {
    if (!user || !koForm.title || !koForm.object_type) return;
    try {
      await createKnowledgeObject({
        title: koForm.title, description: koForm.description, object_type: koForm.object_type,
        domain: koForm.domain, license_type: koForm.license_type,
        price_amount: parseFloat(koForm.price_amount) || 0, author_id: user.id,
        tags: koForm.tags ? koForm.tags.split(",").map(t => t.trim()) : [],
      });
      toast.success("Knowledge object registered");
      setIsCreateOpen(false);
      loadAll();
    } catch { toast.error("Failed to create knowledge object"); }
  }

  const filteredDs = datasets.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredKo = knowledgeObjs.filter(k => !search || k.title?.toLowerCase().includes(search.toLowerCase()));
  const domainData = analytics ? Object.entries(analytics.datasets.byDomain).map(([name, value]) => ({ name: name.substring(0, 15), value })) : [];
  const koTypeData = analytics ? Object.entries(analytics.knowledge.byType).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-7 w-7 text-primary" /> Dataset & Knowledge Exchange
          </h1>
          <p className="text-sm text-muted-foreground">Research asset registry, licensing, and discovery — 20% platform fee</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Register Asset</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Register Research Asset</DialogTitle></DialogHeader>
            <Tabs value={createType} onValueChange={v => setCreateType(v as any)}>
              <TabsList className="w-full"><TabsTrigger value="dataset" className="flex-1">Dataset</TabsTrigger><TabsTrigger value="knowledge" className="flex-1">Knowledge Object</TabsTrigger></TabsList>
              <TabsContent value="dataset" className="space-y-3 mt-3">
                <Input placeholder="Dataset title" value={dsForm.title} onChange={e => setDsForm(f => ({ ...f, title: e.target.value }))} />
                <Textarea placeholder="Description" value={dsForm.description} onChange={e => setDsForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                <Select value={dsForm.domain_category} onValueChange={v => setDsForm(f => ({ ...f, domain_category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
                  <SelectContent>{DKE_DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={dsForm.data_type} onValueChange={v => setDsForm(f => ({ ...f, data_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DKE_DATA_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={dsForm.license_type} onValueChange={v => setDsForm(f => ({ ...f, license_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DKE_LICENSE_TYPES.map(l => <SelectItem key={l} value={l}>{l.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={dsForm.access_level} onValueChange={v => setDsForm(f => ({ ...f, access_level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DKE_ACCESS_LEVELS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Price ($)" value={dsForm.price_amount} onChange={e => setDsForm(f => ({ ...f, price_amount: e.target.value }))} />
                </div>
                <Input placeholder="Tags (comma-separated)" value={dsForm.tags} onChange={e => setDsForm(f => ({ ...f, tags: e.target.value }))} />
                <Button onClick={handleCreateDataset} className="w-full">Register Dataset</Button>
              </TabsContent>
              <TabsContent value="knowledge" className="space-y-3 mt-3">
                <Input placeholder="Title" value={koForm.title} onChange={e => setKoForm(f => ({ ...f, title: e.target.value }))} />
                <Textarea placeholder="Description" value={koForm.description} onChange={e => setKoForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={koForm.object_type} onValueChange={v => setKoForm(f => ({ ...f, object_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DKE_OBJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={koForm.domain} onValueChange={v => setKoForm(f => ({ ...f, domain: v }))}>
                    <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
                    <SelectContent>{DKE_DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={koForm.license_type} onValueChange={v => setKoForm(f => ({ ...f, license_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DKE_LICENSE_TYPES.map(l => <SelectItem key={l} value={l}>{l.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Price ($)" value={koForm.price_amount} onChange={e => setKoForm(f => ({ ...f, price_amount: e.target.value }))} />
                </div>
                <Input placeholder="Tags (comma-separated)" value={koForm.tags} onChange={e => setKoForm(f => ({ ...f, tags: e.target.value }))} />
                <Button onClick={handleCreateKO} className="w-full">Register Knowledge Object</Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Datasets", value: analytics?.datasets.total || 0, icon: Database },
          { label: "Knowledge Objects", value: analytics?.knowledge.total || 0, icon: BookOpen },
          { label: "Downloads", value: (analytics?.datasets.totalDownloads || 0) + (analytics?.knowledge.totalDownloads || 0), icon: Download },
          { label: "Avg Quality", value: `${analytics?.datasets.avgQuality || 0}%`, icon: Star },
          { label: "Licenses Sold", value: analytics?.licensing.totalTransactions || 0, icon: Shield },
          { label: "Revenue", value: `$${(analytics?.licensing.totalRevenue || 0).toLocaleString()}`, icon: DollarSign },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-3 flex items-center gap-2">
              <m.icon className="h-5 w-5 text-primary shrink-0" />
              <div><p className="text-lg font-bold">{m.value}</p><p className="text-[10px] text-muted-foreground">{m.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Domain" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {DKE_DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="datasets">
        <TabsList>
          <TabsTrigger value="datasets">Datasets ({filteredDs.length})</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge ({filteredKo.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <Card key={i} className="animate-pulse h-44" />)}</div>
          ) : filteredDs.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No datasets found. Register the first one.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDs.map(d => (
                <Card key={d.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm">{d.title}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{d.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">{d.description || "No description"}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[10px]">{d.domain_category}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{d.data_type}</Badge>
                      <Badge variant="outline" className="text-[10px]">{d.license_type?.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {d.download_count}</span>
                      {d.quality_score && <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {d.quality_score}%</span>}
                      <span className="font-semibold text-foreground">{Number(d.price_amount) === 0 ? "Free" : `$${d.price_amount}`}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="knowledge" className="mt-4">
          {filteredKo.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No knowledge objects found.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKo.map(k => (
                <Card key={k.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm">{k.title}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{k.object_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">{k.description || "No description"}</p>
                    <div className="flex flex-wrap gap-1">
                      {k.domain && <Badge variant="secondary" className="text-[10px]">{k.domain}</Badge>}
                      <Badge variant="outline" className="text-[10px]">{k.license_type?.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {k.download_count}</span>
                      <span className="font-semibold text-foreground">{Number(k.price_amount) === 0 ? "Free" : `$${k.price_amount}`}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Datasets by Domain</CardTitle></CardHeader>
              <CardContent>
                {domainData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={domainData}><XAxis dataKey="name" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground text-center py-8">No data</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Knowledge by Type</CardTitle></CardHeader>
              <CardContent>
                {koTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={koTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                        {koTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground text-center py-8">No data</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

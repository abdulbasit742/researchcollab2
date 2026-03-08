import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BookOpen, Download, Star, DollarSign, Plus, Search } from "lucide-react";
import { fetchKnowledgeListings, getExchangeAnalytics, createKnowledgeListing } from "@/lib/innovation/knowledgeExchange";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CATEGORIES = ["methodology", "protocol", "framework", "dataset_schema", "analysis_template", "review_criteria"];

export default function KnowledgeExchangePage() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ title: "", description: "", category: "methodology", domain: "AI", price: "0", is_open_access: false });

  const { data: listings = [], refetch } = useQuery({
    queryKey: ["knowledge-listings"],
    queryFn: () => fetchKnowledgeListings(),
  });

  const analytics = getExchangeAnalytics(listings);
  const categoryData = Object.entries(analytics.byCategory).map(([name, value]) => ({ name, value }));
  const filtered = listings.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreate = async () => {
    if (!user) return;
    try {
      await createKnowledgeListing({
        author_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        domain: form.domain,
        content_type: form.category,
        price: parseFloat(form.price) || 0,
        is_open_access: form.is_open_access,
        status: "published",
      });
      toast.success("Listing published");
      setIsCreateOpen(false);
      refetch();
    } catch { toast.error("Failed to create listing"); }
  };

  return (
    <>
      <Helmet><title>Knowledge Exchange | RCollab</title></Helmet>
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Knowledge Exchange</h1>
            <p className="text-muted-foreground">Cross-institution marketplace for research protocols and methodologies</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Publish Knowledge</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Publish to Exchange</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.domain} onValueChange={v => setForm(f => ({ ...f, domain: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["AI", "Biotech", "Climate", "Healthcare", "Engineering", "Physics"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Price ($0 = free)" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                <Button onClick={handleCreate} className="w-full">Publish</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Listings", value: analytics.totalListings, icon: BookOpen },
            { label: "Total Downloads", value: analytics.totalDownloads.toLocaleString(), icon: Download },
            { label: "Open Access", value: analytics.openAccessCount, icon: Star },
            { label: "Categories", value: Object.keys(analytics.byCategory).length, icon: DollarSign },
          ].map(kpi => (
            <Card key={kpi.label}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><kpi.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm text-muted-foreground">{kpi.label}</p><p className="text-2xl font-bold text-foreground">{kpi.value}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="browse">
          <TabsList><TabsTrigger value="browse">Browse</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>
          <TabsContent value="browse" className="space-y-4">
            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Search knowledge assets..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            {filtered.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No listings found. Publish your first knowledge asset.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(listing => (
                  <Card key={listing.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 space-y-3">
                      <h3 className="font-semibold text-foreground">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">{listing.domain}</Badge>
                        <Badge variant="outline">{listing.category.replace(/_/g, " ")}</Badge>
                        {listing.is_open_access && <Badge className="bg-green-500/10 text-green-600">Open Access</Badge>}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-muted-foreground"><Download className="inline h-3 w-3 mr-1" />{listing.download_count}</span>
                        <span className="font-semibold text-foreground">{Number(listing.price) === 0 ? "Free" : `$${listing.price}`}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="analytics">
            <Card><CardHeader><CardTitle>Listings by Category</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

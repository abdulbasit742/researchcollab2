import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Microscope, MapPin, Star, Clock, DollarSign, Plus, Search, Beaker, Cpu, Building2, TrendingUp } from "lucide-react";
import { getListings, createListing, computeMarketplaceAnalytics, SIM_CATEGORIES, RESOURCE_TYPES } from "@/lib/infrastructure/scientificMarketplace";

export default function ScientificMarketplacePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newListing, setNewListing] = useState({ title: "", description: "", category: "Lab Equipment", resource_type: "lab_equipment", daily_rate: 0, location_city: "", location_country: "" });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["sim-listings", categoryFilter],
    queryFn: () => getListings(categoryFilter ? { category: categoryFilter } : undefined),
  });

  const analytics = computeMarketplaceAnalytics(listings);

  const createMutation = useMutation({
    mutationFn: () => createListing({ ...newListing, owner_id: user?.id }),
    onSuccess: () => { toast.success("Listing created"); setShowCreate(false); queryClient.invalidateQueries({ queryKey: ["sim-listings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = listings.filter((l: any) => !searchTerm || l.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  const categoryIcons: Record<string, any> = { "Lab Equipment": Beaker, "Compute Resources": Cpu, "Research Facilities": Building2, "Specialized Instruments": Microscope };

  return (
    <MainLayout>
      <Helmet><title>Scientific Infrastructure Marketplace | RCollab</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Scientific Infrastructure Marketplace</h1>
            <p className="text-muted-foreground mt-1">Share and access lab equipment, compute resources, and research facilities</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />List Resource</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>List Scientific Resource</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={newListing.title} onChange={e => setNewListing(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Electron Microscope SEM-500" /></div>
                <div><Label>Description</Label><Textarea value={newListing.description} onChange={e => setNewListing(p => ({ ...p, description: e.target.value }))} placeholder="Describe capabilities, specifications..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Category</Label><Select value={newListing.category} onValueChange={v => setNewListing(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SIM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Resource Type</Label><Select value={newListing.resource_type} onValueChange={v => setNewListing(p => ({ ...p, resource_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RESOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Daily Rate ($)</Label><Input type="number" value={newListing.daily_rate} onChange={e => setNewListing(p => ({ ...p, daily_rate: +e.target.value }))} /></div>
                  <div><Label>City</Label><Input value={newListing.location_city} onChange={e => setNewListing(p => ({ ...p, location_city: e.target.value }))} /></div>
                  <div><Label>Country</Label><Input value={newListing.location_country} onChange={e => setNewListing(p => ({ ...p, location_country: e.target.value }))} /></div>
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!newListing.title || createMutation.isPending}>{createMutation.isPending ? "Creating..." : "Create Listing"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><Microscope className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{analytics.totalListings}</p><p className="text-xs text-muted-foreground">Listed Resources</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><Clock className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{analytics.totalBookings}</p><p className="text-xs text-muted-foreground">Total Bookings</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><DollarSign className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">${analytics.avgDailyRate}</p><p className="text-xs text-muted-foreground">Avg Daily Rate</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Revenue</p></div></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search resources..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-48"><SelectValue placeholder="All Categories" /></SelectTrigger><SelectContent><SelectItem value="">All Categories</SelectItem>{SIM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        </div>

        {/* Listings Grid */}
        <Tabs defaultValue="grid">
          <TabsList><TabsTrigger value="grid">Grid View</TabsTrigger><TabsTrigger value="categories">By Category</TabsTrigger></TabsList>
          <TabsContent value="grid">
            {isLoading ? <p className="text-muted-foreground text-center py-12">Loading marketplace...</p> : filtered.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><Microscope className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No resources listed yet. Be the first to share your lab equipment!</p></CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((l: any) => {
                  const Icon = categoryIcons[l.category] || Microscope;
                  return (
                    <Card key={l.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /><CardTitle className="text-base line-clamp-1">{l.title}</CardTitle></div>
                          <Badge variant={l.availability_status === "available" ? "default" : "secondary"}>{l.availability_status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {l.description && <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>}
                        <div className="flex items-center gap-4 text-sm">
                          {l.location_city && <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{l.location_city}{l.location_country ? `, ${l.location_country}` : ""}</span>}
                          {l.rating_avg > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{l.rating_avg.toFixed(1)}</span>}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div><span className="text-lg font-bold">${l.daily_rate || 0}</span><span className="text-xs text-muted-foreground">/day</span></div>
                          <Button size="sm">Book Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="categories">
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(analytics.byCategory).map(([cat, count]) => {
                const Icon = categoryIcons[cat] || Microscope;
                return (
                  <Card key={cat} className="cursor-pointer hover:shadow-md" onClick={() => setCategoryFilter(cat)}>
                    <CardContent className="p-5 flex items-center gap-4"><Icon className="h-10 w-10 text-primary" /><div><p className="font-semibold">{cat}</p><p className="text-sm text-muted-foreground">{count as number} resource{(count as number) !== 1 ? "s" : ""}</p></div></CardContent>
                  </Card>
                );
              })}
              {Object.keys(analytics.byCategory).length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">No categories available yet</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

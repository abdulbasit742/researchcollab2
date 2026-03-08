import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Download, Star, Search, ShoppingCart } from "lucide-react";
import { getDatasetListings, DATASET_CATEGORIES } from "@/lib/innovation/datasetMarketplace";
import { toast } from "sonner";

export default function DatasetMarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadListings();
  }, [category]);

  async function loadListings() {
    setLoading(true);
    try {
      const data = await getDatasetListings(category || undefined);
      setListings(data);
    } catch { toast.error("Failed to load datasets"); }
    finally { setLoading(false); }
  }

  const filtered = listings.filter(d =>
    !search || d.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" /> Dataset Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">High-value research datasets • 20% marketplace fee</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1">{filtered.length} Datasets</Badge>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search datasets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {DATASET_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Card key={i} className="animate-pulse h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No datasets available yet. Be the first to list one.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => (
            <Card key={d.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{d.title}</CardTitle>
                  <Badge>{d.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{d.description || "No description"}</p>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {d.rating_avg?.toFixed(1) || "N/A"}</span>
                  <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {d.download_count || 0}</span>
                  <span className="font-semibold text-primary">${d.price_amount || 0}</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{d.data_format || "CSV"}</Badge>
                  <Badge variant="secondary">{d.license_type || "Research"}</Badge>
                  {d.record_count && <Badge variant="secondary">{(d.record_count/1000).toFixed(0)}K records</Badge>}
                </div>
                <Button size="sm" className="w-full"><ShoppingCart className="h-4 w-4 mr-1" /> Acquire Dataset</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

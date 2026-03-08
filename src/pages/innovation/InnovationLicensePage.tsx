import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, Lightbulb, DollarSign, ShoppingCart } from "lucide-react";
import { getInnovationLicenses, INNOVATION_TYPES } from "@/lib/innovation/innovationLicensing";
import { toast } from "sonner";

export default function InnovationLicensePage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");

  useEffect(() => { loadLicenses(); }, [type]);

  async function loadLicenses() {
    setLoading(true);
    try { setLicenses(await getInnovationLicenses(type || undefined)); }
    catch { toast.error("Failed to load licenses"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ScrollText className="h-8 w-8 text-primary" /> Innovation License Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">License technologies developed on RCollab • Platform commission applies</p>
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {INNOVATION_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Available Licenses", value: licenses.length, icon: ScrollText },
          { label: "Total Revenue", value: `$${licenses.reduce((s,l) => s + (l.total_revenue || 0), 0).toLocaleString()}`, icon: DollarSign },
          { label: "Total Sold", value: licenses.reduce((s,l) => s + (l.total_licenses_sold || 0), 0), icon: Lightbulb },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <Card key={i} className="animate-pulse h-40" />)}</div>
      ) : licenses.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No innovation licenses listed yet.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {licenses.map(l => (
            <Card key={l.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{l.title}</CardTitle>
                  <Badge>{l.innovation_type?.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{l.description || "No description"}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Badge variant="secondary">{l.license_model}</Badge>
                    {l.royalty_percentage && <Badge variant="outline">{l.royalty_percentage}% royalty</Badge>}
                  </div>
                  <span className="text-lg font-bold text-primary">${l.price_amount || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{l.total_licenses_sold || 0} licenses sold</span>
                  <span>Revenue: ${(l.total_revenue || 0).toLocaleString()}</span>
                </div>
                <Button size="sm" className="w-full"><ShoppingCart className="h-4 w-4 mr-1" /> Acquire License</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

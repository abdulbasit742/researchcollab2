import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, BarChart3, Target } from "lucide-react";
import { getRevenueStreams, getRevenueStats, STREAM_TYPES, REVENUE_STATUSES } from "@/lib/omnichannel/revenueService";
import { toast } from "sonner";

export default function OmniRevenuePage() {
  const [streams, setStreams] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  async function load() {
    setLoading(true);
    try {
      const filters: any = {};
      if (typeFilter !== "all") filters.stream_type = typeFilter;
      if (statusFilter !== "all") filters.status = statusFilter;
      const [s, st] = await Promise.all([getRevenueStreams(filters), getRevenueStats()]);
      setStreams(s);
      setStats(st);
    } catch { toast.error("Failed to load revenue data"); }
    finally { setLoading(false); }
  }

  const fmt = (n: number) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-background p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary" /> AI Revenue Engine
          </h1>
          <p className="text-sm text-muted-foreground">Revenue pipeline optimization & forecasting</p>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Stream Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {STREAM_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {REVENUE_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: "Total Pipeline", value: stats ? fmt(stats.totalPipeline) : "—", icon: BarChart3 },
          { label: "Won Revenue", value: stats ? fmt(stats.wonRevenue) : "—", icon: DollarSign },
          { label: "Active Streams", value: streams.length, icon: TrendingUp },
          { label: "Conversion Rate", value: stats && stats.byStatus ? `${Math.round(((stats.byStatus.won || 0) / Math.max(Object.values(stats.byStatus as Record<string, number>).reduce((a: number, b: number) => a + b, 0), 1)) * 100)}%` : "—", icon: Target },
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
        <div className="space-y-2">{[1, 2, 3].map(i => <Card key={i} className="animate-pulse h-16" />)}</div>
      ) : streams.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No revenue streams yet. The AI engine will track opportunities as they emerge from conversations.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {streams.map(s => (
            <Card key={s.id} className="hover:shadow transition-shadow">
              <CardContent className="pt-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{s.stream_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {s.omni_contacts?.display_name && <span>{s.omni_contacts.display_name}</span>}
                    {s.channel && <span>• {s.channel}</span>}
                    {s.conversion_source && <span>• {s.conversion_source}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{fmt(s.amount || 0)}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{s.stream_type?.replace("_", " ")}</Badge>
                  <Badge className="text-[10px] capitalize" variant={s.status === "won" ? "default" : "secondary"}>{s.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

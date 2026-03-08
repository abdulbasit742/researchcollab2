import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Phone, Mail, Globe, Instagram, Linkedin, TrendingUp, Clock, Bot, Users } from "lucide-react";
import { getConversationStats, getAnalyticsEvents } from "@/lib/omnichannel/analyticsService";
import { toast } from "sonner";

export default function OmniAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([getConversationStats(), getAnalyticsEvents({ days: 30 })]);
      setStats(s);
      setEvents(e);
    } catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  }

  const channelData = stats ? Object.entries(stats.byChannel).map(([ch, count]) => ({ channel: ch, count })) : [];
  const statusData = stats ? Object.entries(stats.byStatus).map(([st, count]) => ({ status: st, count })) : [];
  const containmentRate = stats && stats.total > 0 ? Math.round((stats.aiHandled / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" /> Omnichannel Analytics
        </h1>
        <p className="text-sm text-muted-foreground">Conversation intelligence across all channels</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Card key={i} className="animate-pulse h-24" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: "Total Conversations", value: stats?.total || 0, icon: Users },
              { label: "AI Containment", value: `${containmentRate}%`, icon: Bot },
              { label: "Human Handoffs", value: stats?.humanHandled || 0, icon: TrendingUp },
              { label: "Escalated", value: stats?.escalated || 0, icon: Clock },
              { label: "Events (30d)", value: events.length, icon: BarChart3 },
            ].map(m => (
              <Card key={m.label}>
                <CardContent className="pt-4 flex items-center gap-3">
                  <m.icon className="h-7 w-7 text-primary" />
                  <div><p className="text-xl font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3">By Channel</h3>
                {channelData.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
                  <div className="space-y-2">
                    {channelData.map(d => {
                      const pct = stats.total > 0 ? ((d.count as number) / stats.total) * 100 : 0;
                      const icons: Record<string, any> = { webchat: Globe, whatsapp: Phone, email: Mail, instagram: Instagram, linkedin: Linkedin };
                      const Icon = icons[d.channel] || Globe;
                      return (
                        <div key={d.channel} className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm w-20 capitalize">{d.channel}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{d.count as number}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3">By Status</h3>
                {statusData.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
                  <div className="space-y-2">
                    {statusData.map(d => (
                      <div key={d.status} className="flex items-center justify-between">
                        <Badge variant={d.status === "escalated" ? "destructive" : d.status === "resolved" ? "secondary" : "default"} className="capitalize">
                          {d.status}
                        </Badge>
                        <span className="text-sm font-bold">{d.count as number}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-3">Recent Events</h3>
              <div className="space-y-1 max-h-60 overflow-auto">
                {events.slice(0, 20).map(e => (
                  <div key={e.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span className="font-mono text-xs">{e.event_type}</span>
                    <span className="text-xs text-muted-foreground">{e.channel || "—"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                  </div>
                ))}
                {events.length === 0 && <p className="text-sm text-muted-foreground">No events recorded yet</p>}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

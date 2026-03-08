import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus, Play, Pause, Mail, Phone, Globe, Instagram } from "lucide-react";
import { getCampaigns, CAMPAIGN_TYPES } from "@/lib/omnichannel/campaignService";
import { toast } from "sonner";

export default function OmniCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCampaigns(); }, []);

  async function loadCampaigns() {
    setLoading(true);
    try { setCampaigns(await getCampaigns()); }
    catch { toast.error("Failed to load campaigns"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-primary" /> Campaign Engine
          </h1>
          <p className="text-sm text-muted-foreground">Compliant omnichannel campaigns for lead nurturing and conversion</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1" /> New Campaign</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: "Total Campaigns", value: campaigns.length },
          { label: "Active", value: campaigns.filter(c => c.status === "active").length },
          { label: "Total Sent", value: campaigns.reduce((s, c) => s + (c.total_sent || 0), 0) },
          { label: "Total Converted", value: campaigns.reduce((s, c) => s + (c.total_converted || 0), 0) },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4">
              <p className="text-xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <Card key={i} className="animate-pulse h-20" />)}</div>
      ) : campaigns.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No campaigns created yet. Launch your first nurture campaign.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => {
            const channelIcons: Record<string, any> = { email: Mail, whatsapp: Phone, webchat: Globe, instagram: Instagram };
            const Icon = channelIcons[c.channel] || Globe;
            const convRate = c.total_sent > 0 ? ((c.total_converted / c.total_sent) * 100).toFixed(1) : "0";
            return (
              <Card key={c.id} className="hover:shadow transition-shadow">
                <CardContent className="pt-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{c.campaign_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{c.campaign_type?.replace("_", " ")} • {c.channel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs">
                      <p>Sent: {c.total_sent} • Replied: {c.total_replied} • Converted: {c.total_converted}</p>
                      <p className="text-muted-foreground">Conv rate: {convRate}%</p>
                    </div>
                    <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                    <Button size="icon" variant="ghost">
                      {c.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

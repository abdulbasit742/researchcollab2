import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, Mail, Phone, Globe, Instagram, Linkedin, Star } from "lucide-react";
import { getContacts, LEAD_STATUSES, CONTACT_TYPES } from "@/lib/omnichannel/contactService";
import { toast } from "sonner";

export default function OmniCRMPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => { loadContacts(); }, [statusFilter, typeFilter]);

  async function loadContacts() {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== "all") filters.lead_status = statusFilter;
      if (typeFilter !== "all") filters.contact_type = typeFilter;
      setContacts(await getContacts(filters));
    } catch { toast.error("Failed to load contacts"); }
    finally { setLoading(false); }
  }

  const channelIcon = (ch: string) => {
    const map: Record<string, any> = { whatsapp: Phone, email: Mail, webchat: Globe, instagram: Instagram, linkedin: Linkedin };
    const Icon = map[ch] || Globe;
    return <Icon className="h-3 w-3" />;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" /> Omnichannel CRM
          </h1>
          <p className="text-sm text-muted-foreground">Unified contact timeline across all channels</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Lead Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {LEAD_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace("_"," ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Contact Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {CONTACT_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_"," ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: "Total Contacts", value: contacts.length, icon: Users },
          { label: "Qualified Leads", value: contacts.filter(c => c.lead_status === "qualified").length, icon: TrendingUp },
          { label: "Avg Lead Score", value: contacts.length ? Math.round(contacts.reduce((s,c) => s + (c.lead_score || 0), 0) / contacts.length) : 0, icon: Star },
          { label: "Won", value: contacts.filter(c => c.lead_status === "won").length, icon: TrendingUp },
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
        <div className="space-y-2">{[1,2,3].map(i => <Card key={i} className="animate-pulse h-16" />)}</div>
      ) : contacts.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No contacts yet</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {contacts.map(c => (
            <Card key={c.id} className="hover:shadow transition-shadow">
              <CardContent className="pt-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {(c.display_name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.display_name || "Unknown"}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {c.email && <span>{c.email}</span>}
                      {c.phone && <span>{c.phone}</span>}
                      {c.country && <span>{c.country}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.preferred_channel && channelIcon(c.preferred_channel)}
                  <Badge variant="outline" className="capitalize text-[10px]">{c.contact_type}</Badge>
                  <Badge className="text-[10px]" variant={c.lead_status === "won" ? "default" : "secondary"}>{c.lead_status}</Badge>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{c.lead_score}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Headphones, Plus, Clock, CheckCircle, AlertTriangle, BarChart } from "lucide-react";
import { getTickets, createTicket, updateTicket, getTicketStats, TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/lib/omnichannel/ticketService";
import { toast } from "sonner";

export default function OmniSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", description: "", category: "general", priority: "medium" });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        getTickets(filterStatus !== "all" ? { status: filterStatus } : undefined),
        getTicketStats(),
      ]);
      setTickets(t);
      setStats(s);
    } catch { toast.error("Failed to load tickets"); }
    finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!newTicket.subject.trim()) return;
    try {
      await createTicket(newTicket);
      toast.success("Ticket created");
      setShowCreate(false);
      setNewTicket({ subject: "", description: "", category: "general", priority: "medium" });
      loadData();
    } catch { toast.error("Failed to create ticket"); }
  }

  async function handleResolve(id: string) {
    try {
      await updateTicket(id, { status: "resolved", resolved_at: new Date().toISOString() });
      toast.success("Ticket resolved");
      loadData();
    } catch { toast.error("Failed to resolve"); }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Headphones className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support Dashboard</h1>
            <p className="text-sm text-muted-foreground">AI-powered support ticket management</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />New Ticket</Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Card><CardContent className="pt-4 flex items-center gap-3"><BarChart className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Tickets</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><Clock className="h-8 w-8 text-yellow-500" /><div><p className="text-2xl font-bold">{stats.open}</p><p className="text-xs text-muted-foreground">Open</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{stats.resolved}</p><p className="text-xs text-muted-foreground">Resolved</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">{stats.byPriority?.critical || 0}</p><p className="text-xs text-muted-foreground">Critical</p></div></CardContent></Card>
        </div>
      )}

      {showCreate && (
        <Card className="mb-4">
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Subject" value={newTicket.subject} onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))} />
            <Textarea placeholder="Description" value={newTicket.description} onChange={e => setNewTicket(p => ({ ...p, description: e.target.value }))} />
            <div className="flex gap-2">
              <Select value={newTicket.category} onValueChange={v => setNewTicket(p => ({ ...p, category: v }))}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{TICKET_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={newTicket.priority} onValueChange={v => setNewTicket(p => ({ ...p, priority: v }))}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{TICKET_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={handleCreate}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-4">
        {["all", "open", "in_progress", "resolved", "closed"].map(s => (
          <Button key={s} size="sm" variant={filterStatus === s ? "default" : "outline"} onClick={() => { setFilterStatus(s); }}
            className="text-xs capitalize">{s.replace("_", " ")}</Button>
        ))}
      </div>

      <div className="space-y-2">
        {tickets.map(t => (
          <Card key={t.id} className="hover:shadow-md transition">
            <CardContent className="pt-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{t.subject}</p>
                  <Badge variant={t.priority === "critical" ? "destructive" : t.priority === "high" ? "default" : "secondary"} className="text-[10px]">{t.priority}</Badge>
                  <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t.description?.slice(0, 100) || "No description"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{t.omni_contacts?.display_name || "Unassigned"}</span>
                  <span className="text-[10px] text-muted-foreground">• {new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{t.status}</Badge>
                {t.status !== "resolved" && t.status !== "closed" && (
                  <Button size="sm" variant="outline" onClick={() => handleResolve(t.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />Resolve
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

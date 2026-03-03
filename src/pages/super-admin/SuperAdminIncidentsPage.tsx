import { useState, useMemo } from "react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, Clock, Eye, Plus, Shield, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

const STATUS_ICONS: Record<string, typeof AlertTriangle> = {
  open: AlertTriangle,
  investigating: Clock,
  mitigated: Shield,
  resolved: CheckCircle,
};

export default function SuperAdminIncidentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: "", description: "", incident_type: "other", severity_level: "medium" });

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents", statusFilter, severityFilter],
    queryFn: async () => {
      let q = supabase.from("incident_registry").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      if (severityFilter !== "all") q = q.eq("severity_level", severityFilter);
      const { data } = await q;
      return data ?? [];
    },
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["incident-metrics-all"],
    queryFn: async () => {
      const { data } = await supabase.from("incident_metrics").select("*");
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("incident_registry").insert({
        title: newIncident.title,
        description: newIncident.description,
        incident_type: newIncident.incident_type,
        severity_level: newIncident.severity_level,
        detected_by: "admin",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setShowCreate(false);
      setNewIncident({ title: "", description: "", incident_type: "other", severity_level: "medium" });
      toast.success("Incident created");
    },
  });

  const avgMTTR = useMemo(() => {
    const resolved = metrics.filter(m => m.time_to_resolution_minutes);
    if (resolved.length === 0) return 0;
    return Math.round(resolved.reduce((s, m) => s + (m.time_to_resolution_minutes ?? 0), 0) / resolved.length);
  }, [metrics]);

  const severityDist = useMemo(() => {
    const map: Record<string, number> = {};
    incidents.forEach(i => { map[i.severity_level] = (map[i.severity_level] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const statusDist = useMemo(() => {
    const map: Record<string, number> = {};
    incidents.forEach(i => { map[i.status] = (map[i.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const COLORS = ["hsl(var(--destructive))", "hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--accent))"];

  const openCount = incidents.filter(i => i.status !== "resolved").length;
  const resolvedCount = incidents.filter(i => i.status === "resolved").length;

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Incident Response Center</h1>
              <p className="text-sm text-muted-foreground">Track, classify, and resolve platform incidents</p>
            </div>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Report Incident</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Report New Incident</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Incident title" value={newIncident.title} onChange={e => setNewIncident(p => ({ ...p, title: e.target.value }))} />
                  <Textarea placeholder="Description" value={newIncident.description} onChange={e => setNewIncident(p => ({ ...p, description: e.target.value }))} />
                  <Select value={newIncident.incident_type} onValueChange={v => setNewIncident(p => ({ ...p, incident_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["performance", "security", "sla", "integrity", "infrastructure", "other"].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newIncident.severity_level} onValueChange={v => setNewIncident(p => ({ ...p, severity_level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["low", "medium", "high", "critical"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => createMutation.mutate()} disabled={!newIncident.title}>Create Incident</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Open Incidents</p>
              <p className="text-2xl font-bold">{openCount}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold">{resolvedCount}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Avg MTTR</p>
              <p className="text-2xl font-bold">{avgMTTR}m</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{incidents.length}</p>
            </CardContent></Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Severity Distribution</CardTitle></CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={severityDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name}: ${value}`}>
                    {severityDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle className="text-sm">Status Breakdown</CardTitle></CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDist}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {["open", "investigating", "mitigated", "resolved"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                {["low", "medium", "high", "critical"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Incident Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map(inc => {
                  const Icon = STATUS_ICONS[inc.status] || AlertTriangle;
                  return (
                    <TableRow key={inc.id}>
                      <TableCell><div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /><span className="text-xs capitalize">{inc.status}</span></div></TableCell>
                      <TableCell className="font-medium text-sm">{inc.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{inc.incident_type}</Badge></TableCell>
                      <TableCell><Badge variant={SEVERITY_COLORS[inc.severity_level] as any} className="text-[10px]">{inc.severity_level}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{inc.detected_by}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(inc.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/super-admin/incidents/${inc.id}`)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {incidents.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No incidents found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}

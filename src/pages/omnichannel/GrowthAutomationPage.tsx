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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Zap, Users, Play, Pause, Plus, Mail, MessageSquare, ArrowRight } from "lucide-react";
import { fetchSequences, createSequence, updateSequence, fetchEnrollments, getAutomationAnalytics } from "@/lib/omnichannel/growthAutomation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#8b5cf6"];
const TRIGGER_TYPES = ["manual", "new_contact", "lead_qualified", "inactivity", "milestone_completed", "demo_scheduled"];
const CHANNELS = ["email", "whatsapp", "webchat", "instagram", "linkedin"];
const SEGMENTS = ["all", "students", "researchers", "sponsors", "institutions", "enterprise", "new_leads", "dormant"];

export default function GrowthAutomationPage() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", trigger_type: "manual", target_segment: "all", channel: "email" });

  const { data: sequences = [], refetch } = useQuery({ queryKey: ["automation-sequences"], queryFn: fetchSequences });
  const { data: enrollments = [] } = useQuery({ queryKey: ["automation-enrollments"], queryFn: () => fetchEnrollments() });

  const analytics = getAutomationAnalytics(sequences, enrollments);
  const channelData = Object.entries(analytics.byChannel).map(([name, value]) => ({ name, value }));
  const statusData = [
    { name: "Active", value: analytics.activeEnrollments },
    { name: "Completed", value: analytics.completedEnrollments },
    { name: "Paused", value: analytics.totalEnrollments - analytics.activeEnrollments - analytics.completedEnrollments },
  ];

  const handleCreate = async () => {
    if (!user) return;
    try {
      await createSequence({ ...form, created_by: user.id, is_active: false });
      toast.success("Sequence created");
      setIsCreateOpen(false);
      refetch();
    } catch { toast.error("Failed to create sequence"); }
  };

  const toggleActive = async (seq: any) => {
    try {
      await updateSequence(seq.id, { is_active: !seq.is_active });
      toast.success(seq.is_active ? "Sequence paused" : "Sequence activated");
      refetch();
    } catch { toast.error("Failed to update sequence"); }
  };

  return (
    <>
      <Helmet><title>Growth Automation | RCollab</title></Helmet>
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Growth Automation Engine</h1>
            <p className="text-muted-foreground">Automated nurture sequences, follow-ups, and engagement workflows</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Create Sequence</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Automation Sequence</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Sequence Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <Select value={form.trigger_type} onValueChange={v => setForm(f => ({ ...f, trigger_type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Trigger" /></SelectTrigger>
                  <SelectContent>{TRIGGER_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.target_segment} onValueChange={v => setForm(f => ({ ...f, target_segment: v }))}>
                  <SelectTrigger><SelectValue placeholder="Target Segment" /></SelectTrigger>
                  <SelectContent>{SEGMENTS.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.channel} onValueChange={v => setForm(f => ({ ...f, channel: v }))}>
                  <SelectTrigger><SelectValue placeholder="Channel" /></SelectTrigger>
                  <SelectContent>{CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={handleCreate} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Active Sequences", value: analytics.active, icon: Zap },
            { label: "Total Enrollments", value: analytics.totalEnrollments, icon: Users },
            { label: "Active Contacts", value: analytics.activeEnrollments, icon: Play },
            { label: "Completed", value: analytics.completedEnrollments, icon: ArrowRight },
          ].map(kpi => (
            <Card key={kpi.label}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><kpi.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm text-muted-foreground">{kpi.label}</p><p className="text-2xl font-bold text-foreground">{kpi.value}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="sequences">
          <TabsList><TabsTrigger value="sequences">Sequences</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>
          <TabsContent value="sequences" className="space-y-4">
            {sequences.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No sequences created. Build your first automation to grow engagement.</CardContent></Card>
            ) : sequences.map((seq: any) => (
              <Card key={seq.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-lg">{seq.name}</h3>
                        <Badge variant={seq.is_active ? "default" : "secondary"}>{seq.is_active ? "Active" : "Paused"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{seq.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline"><MessageSquare className="inline h-3 w-3 mr-1" />{seq.channel}</Badge>
                        <Badge variant="outline"><Zap className="inline h-3 w-3 mr-1" />{seq.trigger_type?.replace(/_/g, " ")}</Badge>
                        <Badge variant="outline"><Users className="inline h-3 w-3 mr-1" />{seq.target_segment}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`toggle-${seq.id}`} className="text-sm text-muted-foreground">{seq.is_active ? "Active" : "Paused"}</Label>
                        <Switch id={`toggle-${seq.id}`} checked={seq.is_active} onCheckedChange={() => toggleActive(seq)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle>Sequences by Channel</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Enrollment Status</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart><Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name }) => name}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

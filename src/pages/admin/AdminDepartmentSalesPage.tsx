import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Building2, Users, Phone, Calendar, FileText } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

type Stage = "lead" | "demo_requested" | "demo_scheduled" | "proposal_sent" | "trial" | "negotiation" | "won" | "lost";

interface Lead {
  id: string;
  university: string;
  department: string;
  contact: string;
  email: string;
  students: number;
  process: string;
  painPoints: string;
  notes: string;
  followUp: string;
  stage: Stage;
  value: number;
}

const STAGES: { id: Stage; label: string; color: string }[] = [
  { id: "lead", label: "New leads", color: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
  { id: "demo_requested", label: "Demo requested", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { id: "demo_scheduled", label: "Demo scheduled", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" },
  { id: "proposal_sent", label: "Proposal sent", color: "bg-violet-500/10 text-violet-700 dark:text-violet-400" },
  { id: "trial", label: "Trial active", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  { id: "negotiation", label: "Negotiation", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  { id: "won", label: "Won", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { id: "lost", label: "Lost", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
];

const SAMPLE: Lead[] = [
  { id: "L-001", university: "NUST", department: "CS", contact: "Dr. Ahmed Khan", email: "ak@nust.edu.pk", students: 220, process: "Manual Excel tracking", painPoints: "Defense scheduling chaos", notes: "HOD champion", followUp: "2026-06-25", stage: "trial", value: 540000 },
  { id: "L-002", university: "LUMS", department: "EE", contact: "Dr. Sarah Malik", email: "sm@lums.edu.pk", students: 145, process: "Google Sheets", painPoints: "Supervisor allocation", notes: "Budget approved", followUp: "2026-06-24", stage: "proposal_sent", value: 432000 },
  { id: "L-003", university: "FAST", department: "SE", contact: "Dr. Bilal Raza", email: "br@fast.edu.pk", students: 180, process: "Custom portal", painPoints: "Wants AI assist", notes: "Demo next week", followUp: "2026-06-27", stage: "demo_scheduled", value: 480000 },
  { id: "L-004", university: "COMSATS", department: "CS", contact: "Dr. Imran Ali", email: "ia@comsats.edu.pk", students: 320, process: "None", painPoints: "Scaling problem", notes: "Email reply pending", followUp: "2026-06-26", stage: "demo_requested", value: 720000 },
  { id: "L-005", university: "IBA", department: "MIS", contact: "Dr. Faisal Hussain", email: "fh@iba.edu.pk", students: 90, process: "Word docs", painPoints: "Audit trail missing", notes: "Inbound from website", followUp: "2026-06-28", stage: "lead", value: 270000 },
  { id: "L-006", university: "UET", department: "Civil", contact: "Dr. Naveed Ahmad", email: "na@uet.edu.pk", students: 250, process: "Manual", painPoints: "Rubric inconsistency", notes: "Signed!", followUp: "2026-07-01", stage: "won", value: 600000 },
  { id: "L-007", university: "GIKI", department: "ME", contact: "Dr. Hassan Tariq", email: "ht@giki.edu.pk", students: 110, process: "ERP", painPoints: "Budget rejected", notes: "Try Q4", followUp: "2026-10-01", stage: "lost", value: 0 },
  { id: "L-008", university: "ITU", department: "AI", contact: "Dr. Asma Khan", email: "asma@itu.edu.pk", students: 75, process: "Notion", painPoints: "Need analytics", notes: "Counter-offer sent", followUp: "2026-06-25", stage: "negotiation", value: 360000 },
];

export default function AdminDepartmentSalesPage() {
  const [leads, setLeads] = useState<Lead[]>(SAMPLE);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Lead | null>(null);

  const moveStage = (id: string, stage: Stage) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    toast.success(`Moved to ${STAGES.find(s => s.id === stage)?.label}`);
  };

  const pipelineValue = leads.filter(l => l.stage !== "lost" && l.stage !== "won").reduce((s, l) => s + l.value, 0);
  const wonValue = leads.filter(l => l.stage === "won").reduce((s, l) => s + l.value, 0);

  return (
    <>
      <Helmet><title>Department Sales — Admin</title></Helmet>
      <div className="container max-w-[1600px] mx-auto py-8 px-4 space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Department Sales CRM</h1>
            <p className="text-sm text-muted-foreground">University leads & enterprise pipeline</p>
          </div>
          <Button onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> New lead</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="pt-5"><div className="text-xs text-muted-foreground">Total leads</div><div className="text-2xl font-bold">{leads.length}</div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="text-xs text-muted-foreground">Pipeline value</div><div className="text-2xl font-bold">PKR {(pipelineValue / 1000).toFixed(0)}K</div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="text-xs text-muted-foreground">Won this year</div><div className="text-2xl font-bold text-emerald-600">PKR {(wonValue / 1000).toFixed(0)}K</div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="text-xs text-muted-foreground">Trials active</div><div className="text-2xl font-bold">{leads.filter(l => l.stage === "trial").length}</div></CardContent></Card>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-4">
            {STAGES.map(s => {
              const items = leads.filter(l => l.stage === s.id);
              return (
                <div key={s.id} className="w-72 shrink-0">
                  <div className={`px-3 py-2 rounded-t-md text-xs font-semibold flex justify-between ${s.color}`}>
                    <span>{s.label}</span><span>{items.length}</span>
                  </div>
                  <div className="bg-muted/30 rounded-b-md p-2 space-y-2 min-h-[200px]">
                    {items.map(l => (
                      <Card key={l.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetail(l)}>
                        <CardContent className="p-3 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-semibold text-sm">{l.university}</div>
                            <Badge variant="outline" className="text-[10px]">{l.department}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">{l.contact}</div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Users className="h-3 w-3" /> {l.students}
                            <Calendar className="h-3 w-3 ml-1" /> {l.followUp.slice(5)}
                          </div>
                          {l.value > 0 && <div className="text-xs font-mono text-emerald-600">PKR {(l.value / 1000).toFixed(0)}K</div>}
                        </CardContent>
                      </Card>
                    ))}
                    {items.length === 0 && <div className="text-[11px] text-muted-foreground text-center py-6">Empty</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New lead */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New lead</DialogTitle><DialogDescription>Add a university to the pipeline</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="University" />
            <Field label="Department" />
            <Field label="Contact name" />
            <Field label="Email" />
            <Field label="# Students" />
            <Field label="Follow-up date" type="date" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Lead added (demo)"); setOpen(false); }}>Add lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />{detail.university} — {detail.department}</DialogTitle>
                <DialogDescription>{detail.contact} · {detail.email}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info icon={Users} label="Students" value={detail.students.toString()} />
                <Info icon={Calendar} label="Follow-up" value={detail.followUp} />
                <Info icon={FileText} label="Current process" value={detail.process} />
                <Info icon={Phone} label="Deal value" value={`PKR ${detail.value.toLocaleString()}`} />
              </div>
              <div className="space-y-2">
                <div><div className="text-xs font-medium text-muted-foreground">Pain points</div><div className="text-sm">{detail.painPoints}</div></div>
                <div><div className="text-xs font-medium text-muted-foreground">Notes</div><div className="text-sm">{detail.notes}</div></div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Move to stage</Label>
                <div className="flex gap-1 flex-wrap">
                  {STAGES.map(s => (
                    <Button key={s.id} size="sm" variant={detail.stage === s.id ? "default" : "outline"} className="h-7 text-xs"
                      onClick={() => { moveStage(detail.id, s.id); setDetail({ ...detail, stage: s.id }); }}>
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast("Proposal generator coming soon")}>Generate proposal</Button>
                <Button onClick={() => setDetail(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return <div><Label className="text-xs">{label}</Label><Input type={type} /></div>;
}
function Info({ icon: Icon, label, value }: any) {
  return (
    <div className="border rounded-md p-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Icon className="h-3 w-3" /> {label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

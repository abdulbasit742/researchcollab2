import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Building2, Phone, Mail, FileText, CheckCircle2, Clock, Plus, TrendingUp, Download } from "lucide-react";
import { useState } from "react";

interface UniversityLead {
  name: string;
  department: string;
  region: string;
  fypCount: number;
  status: "contacted" | "meeting_booked" | "proposal_sent" | "pilot_approved" | "onboarding" | "active";
  lastAction: string;
  nextStep: string;
}

const INITIAL_LEADS: UniversityLead[] = [
  { name: "FAST-NUCES Islamabad", department: "CS & SE", region: "Islamabad", fypCount: 120, status: "proposal_sent", lastAction: "Proposal sent Feb 12", nextStep: "Follow-up call Feb 19" },
  { name: "NUST", department: "Engineering", region: "Islamabad", fypCount: 200, status: "meeting_booked", lastAction: "Meeting booked Feb 20", nextStep: "Prepare demo" },
  { name: "LUMS", department: "SSE", region: "Lahore", fypCount: 80, status: "contacted", lastAction: "Cold email sent Feb 10", nextStep: "Follow-up email" },
  { name: "COMSATS Islamabad", department: "CS", region: "Islamabad", fypCount: 150, status: "contacted", lastAction: "LinkedIn outreach Feb 14", nextStep: "Schedule intro call" },
  { name: "IBA Karachi", department: "CS & BBA", region: "Karachi", fypCount: 60, status: "meeting_booked", lastAction: "Intro call done", nextStep: "Send customized proposal" },
];

const STATUS_CONFIG: Record<string, { label: string; variant: "secondary" | "warning" | "info" | "success" | "default" }> = {
  contacted: { label: "Contacted", variant: "secondary" },
  meeting_booked: { label: "Meeting Booked", variant: "warning" },
  proposal_sent: { label: "Proposal Sent", variant: "info" },
  pilot_approved: { label: "Pilot Approved", variant: "success" },
  onboarding: { label: "Onboarding", variant: "success" },
  active: { label: "Active", variant: "default" },
};

const PIPELINE_STAGES = ["contacted", "meeting_booked", "proposal_sent", "pilot_approved", "onboarding", "active"];

// Pilot offer generator fields
const OFFER_FIELDS = [
  { key: "uniName", label: "University Name" },
  { key: "deptName", label: "Department Name" },
  { key: "fypCount", label: "Estimated FYP Count" },
  { key: "region", label: "Region" },
  { key: "facultyCount", label: "Faculty Count" },
];

export default function UniversityAcquisitionPage() {
  const [leads] = useState<UniversityLead[]>(INITIAL_LEADS);
  const [offerData, setOfferData] = useState<Record<string, string>>({});
  const [offerGenerated, setOfferGenerated] = useState(false);

  const pipelineCounts = PIPELINE_STAGES.map((stage) => ({
    stage,
    count: leads.filter((l) => l.status === stage).length,
    label: STATUS_CONFIG[stage]?.label || stage,
  }));

  const totalContacted = leads.length;
  const totalMeetings = leads.filter((l) => PIPELINE_STAGES.indexOf(l.status) >= 1).length;
  const totalProposals = leads.filter((l) => PIPELINE_STAGES.indexOf(l.status) >= 2).length;
  const totalApproved = leads.filter((l) => PIPELINE_STAGES.indexOf(l.status) >= 3).length;

  const fypEstimate = Number(offerData.fypCount) || 100;
  const projectedCapital = fypEstimate * 60000 * 0.4;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            University Acquisition Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Close 1 university pilot within 30 days</p>
        </div>

        {/* Pipeline Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Universities Contacted", value: totalContacted, icon: Building2 },
            { label: "Meetings Booked", value: totalMeetings, icon: Phone },
            { label: "Proposals Sent", value: totalProposals, icon: Mail },
            { label: "Pilots Approved", value: totalApproved, icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="p-4 text-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="pipeline">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="pipeline">Sales Pipeline</TabsTrigger>
            <TabsTrigger value="offer">Pilot Offer Generator</TabsTrigger>
            <TabsTrigger value="success">Success Metrics</TabsTrigger>
          </TabsList>

          {/* Pipeline */}
          <TabsContent value="pipeline" className="mt-4 space-y-3">
            {/* Pipeline bar */}
            <div className="flex gap-1 h-8">
              {pipelineCounts.map((p) => (
                <div
                  key={p.stage}
                  className="flex-1 rounded bg-primary/10 flex items-center justify-center text-[10px] font-medium"
                  style={{ opacity: 0.4 + p.count * 0.3 }}
                >
                  {p.label} ({p.count})
                </div>
              ))}
            </div>

            {leads.map((lead) => (
              <Card key={lead.name}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{lead.name}</h3>
                        <Badge variant={STATUS_CONFIG[lead.status]?.variant || "secondary"} className="text-[10px]">
                          {STATUS_CONFIG[lead.status]?.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{lead.department} · {lead.region} · ~{lead.fypCount} FYPs/year</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {lead.lastAction}</span>
                        <span className="text-xs text-primary font-medium flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {lead.nextStep}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Pilot Offer Generator */}
          <TabsContent value="offer" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Generate Pilot Proposal</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {OFFER_FIELDS.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <Label className="text-xs">{f.label}</Label>
                      <Input
                        value={offerData[f.key] || ""}
                        onChange={(e) => setOfferData((p) => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.label}
                      />
                    </div>
                  ))}
                  <Button className="w-full mt-2" onClick={() => setOfferGenerated(true)}>
                    <FileText className="h-4 w-4 mr-2" /> Generate Proposal
                  </Button>
                </CardContent>
              </Card>

              {offerGenerated && (
                <Card className="bg-muted/30 border-primary/20">
                  <CardHeader><CardTitle className="text-base">Proposal Preview</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="font-bold">{offerData.uniName || "University"} × RCollab Pilot</p>
                    <p className="text-muted-foreground">Department: {offerData.deptName || "—"} · Region: {offerData.region || "—"}</p>
                    <div className="space-y-2 mt-3">
                      {[
                        { label: "Estimated FYPs", value: fypEstimate },
                        { label: "Projected Funded FYPs", value: Math.round(fypEstimate * 0.4) },
                        { label: "Projected Capital", value: `PKR ${projectedCapital.toLocaleString()}` },
                        { label: "Employment Uplift", value: `${Math.round(fypEstimate * 0.1)} students` },
                        { label: "Pilot Duration", value: "60 days" },
                        { label: "Cost to University", value: "FREE (pilot)" },
                      ].map((r) => (
                        <div key={r.label} className="flex justify-between p-2 rounded border bg-background">
                          <span className="text-muted-foreground">{r.label}</span>
                          <span className="font-bold text-primary">{r.value}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-2">
                      <Download className="h-4 w-4 mr-2" /> Export as PDF
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Success Metrics */}
          <TabsContent value="success" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">60-Day Success Targets (First University)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: "FYPs Onboarded", target: "30+", current: 0 },
                    { metric: "FYPs Funded", target: "10+", current: 0 },
                    { metric: "Projects Completed", target: "3+", current: 0 },
                    { metric: "Escrow Functioning", target: "Yes", current: "Pending" },
                    { metric: "Faculty Positive Feedback", target: "3+ testimonials", current: 0 },
                    { metric: "Student Testimonials", target: "5+", current: 0 },
                    { metric: "Sponsor Re-engagement", target: "1+ repeat", current: 0 },
                  ].map((m) => (
                    <div key={m.metric} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                      <span className="text-sm font-medium">{m.metric}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Current: {m.current}</span>
                        <Badge variant="outline">{m.target}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

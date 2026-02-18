import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Download, FileText, TrendingUp, Building2, AlertTriangle, CheckCircle2, ChevronRight, Lightbulb } from "lucide-react";
import { useState } from "react";
import { formatPKR } from "@/lib/currency";

const OBJECTIONS = [
  {
    q: "Students can't afford escrow.",
    a: "Students never pay escrow. Corporate sponsors fund projects through our secure escrow system. Students only contribute their skills and execution.",
    solution: "The escrow is funded 100% by corporate sponsors who gain access to vetted student talent and project outcomes.",
    risk: "Zero financial risk to students. Sponsors deposit funds before project begins.",
  },
  {
    q: "Faculty won't adopt new tools.",
    a: "Our supervisor dashboard is designed for minimal friction — faculty see student progress, milestones, and deliverables in one place. No complex training required.",
    solution: "We provide 1-hour faculty onboarding and a dedicated support channel during the pilot period.",
    risk: "Pilot starts with 2-3 willing faculty members. Success stories drive organic adoption.",
  },
  {
    q: "We already have a supervision process.",
    a: "RCollab enhances your existing process by adding corporate funding, structured milestones, and employment tracking — not replacing academic supervision.",
    solution: "Integration layer sits alongside your existing LMS/system. Supervisors continue their normal review process.",
    risk: "No disruption to academic calendar. RCollab adds funding and outcomes on top.",
  },
  {
    q: "IP concerns with corporate sponsors.",
    a: "Our IP preference system lets universities and sponsors agree on IP terms before funding begins. Options range from full student ownership to shared IP.",
    solution: "Pre-configured IP templates: Student-owned, Shared, Licensed, or Sponsor-assigned. Defined in MoU before project starts.",
    risk: "Legal template reviewed. University retains veto on IP terms per project.",
  },
  {
    q: "Too complex to implement.",
    a: "Our 60-day pilot requires only admin account setup, student roster import, and faculty assignment. We handle everything else.",
    solution: "Dedicated pilot manager assists with setup. Typically live within 5 business days.",
    risk: "Free pilot with zero commitment. Cancel anytime within 60 days.",
  },
];

const PILOT_WEEKS = [
  { week: "Week 1–2", title: "Admin Onboarding", tasks: ["Create institution account", "Import student roster", "Assign FYP coordinator", "Configure departments"] },
  { week: "Week 3–4", title: "Faculty & Student Setup", tasks: ["Faculty training session (1hr)", "Student onboarding webinar", "First FYP batch creation", "Connect 2-3 sponsors"] },
  { week: "Week 5–6", title: "Sponsor Funding", tasks: ["Problem statement matching", "Escrow deposits initiated", "Milestone structure approved", "First funded projects live"] },
  { week: "Week 7–8", title: "Execution & Milestones", tasks: ["Milestone submissions begin", "Supervisor reviews active", "Progress tracking live", "Mid-pilot check-in"] },
  { week: "Week 9–10", title: "Completion Tracking", tasks: ["First project completions", "Escrow releases", "Student feedback collected", "Sponsor satisfaction survey"] },
  { week: "Week 11–12", title: "Impact Report", tasks: ["Generate pilot impact report", "Document hiring cases", "Faculty testimonials", "Renewal decision meeting"] },
];

export default function UniversityROICalculatorPage() {
  const [fyps, setFyps] = useState(100);
  const [avgBudget, setAvgBudget] = useState(60000);
  const [sponsorInterest, setSponsorInterest] = useState(40);
  const [completionRate, setCompletionRate] = useState(70);
  const [employmentRate, setEmploymentRate] = useState(25);

  const fundedFYPs = Math.round(fyps * (sponsorInterest / 100));
  const totalCapital = fundedFYPs * avgBudget;
  const completedProjects = Math.round(fundedFYPs * (completionRate / 100));
  const hiredStudents = Math.round(completedProjects * (employmentRate / 100));
  const startupEstimate = Math.max(1, Math.round(completedProjects * 0.05));
  const credibilityScore = Math.min(100, Math.round((fundedFYPs * 0.3 + completedProjects * 0.4 + hiredStudents * 0.3) * 2));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            University Acquisition System
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">ROI Calculator, Objection Playbook & Pilot Structure</p>
        </div>

        <Tabs defaultValue="roi">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
            <TabsTrigger value="objections">Objection Playbook</TabsTrigger>
            <TabsTrigger value="pilot">60-Day Pilot Plan</TabsTrigger>
          </TabsList>

          {/* ROI Calculator */}
          <TabsContent value="roi" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Inputs</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "FYPs per Year", value: fyps, set: setFyps, min: 10, max: 1000 },
                    { label: "Avg Budget/FYP (PKR)", value: avgBudget, set: setAvgBudget, min: 10000, max: 500000 },
                    { label: "Sponsor Interest (%)", value: sponsorInterest, set: setSponsorInterest, min: 5, max: 100 },
                    { label: "Completion Rate (%)", value: completionRate, set: setCompletionRate, min: 10, max: 100 },
                    { label: "Employment Rate (%)", value: employmentRate, set: setEmploymentRate, min: 5, max: 80 },
                  ].map((inp) => (
                    <div key={inp.label} className="space-y-1">
                      <Label className="text-xs">{inp.label}</Label>
                      <Input
                        type="number"
                        min={inp.min}
                        max={inp.max}
                        value={inp.value}
                        onChange={(e) => inp.set(Number(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-muted/30 border-primary/20">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Projected Outcomes</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Total Capital Injected", value: formatPKR(totalCapital) },
                    { label: "Funded FYPs", value: fundedFYPs.toString() },
                    { label: "Completed Projects", value: completedProjects.toString() },
                    { label: "Employment Uplift", value: `${hiredStudents} students hired` },
                    { label: "Startup Creation Estimate", value: `${startupEstimate} spin-offs` },
                    { label: "Institutional Credibility Score", value: `${credibilityScore}/100` },
                  ].map((out) => (
                    <div key={out.label} className="flex justify-between items-center p-2.5 rounded-lg border bg-background">
                      <span className="text-sm text-muted-foreground">{out.label}</span>
                      <span className="font-bold text-primary">{out.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Objection Playbook */}
          <TabsContent value="objections" className="mt-4 space-y-3">
            {OBJECTIONS.map((obj, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-sm">"{obj.q}"</p>
                      <p className="text-sm text-muted-foreground">{obj.a}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-[10px] font-semibold text-primary uppercase">Solution</p>
                          <p className="text-xs text-muted-foreground">{obj.solution}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                          <p className="text-[10px] font-semibold text-emerald-600 uppercase">Risk Reduction</p>
                          <p className="text-xs text-muted-foreground">{obj.risk}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 60-Day Pilot Plan */}
          <TabsContent value="pilot" className="mt-4 space-y-3">
            {PILOT_WEEKS.map((phase, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="shrink-0 mt-0.5">{phase.week}</Badge>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{phase.title}</p>
                      <ul className="mt-1.5 space-y-1">
                        {phase.tasks.map((t, j) => (
                          <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ChevronRight className="h-3 w-3 text-primary" />{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IndustryChallengeWorkflowPanel } from "@/components/projects/IndustryChallengeWorkflowPanel";
import { Award, BriefcaseBusiness, CheckCircle2, FileText, Lock, PenLine, ShieldCheck, Sparkles, Target } from "lucide-react";

const resumeSections = [
  { id: "summary", label: "Professional summary", readiness: 86, status: "Ready", note: "Can be generated from portfolio, skill gaps, and target route." },
  { id: "projects", label: "Project experience", readiness: 82, status: "Ready", note: "Showcase projects and outcome evidence are strong enough for bullets." },
  { id: "skills", label: "Skills section", readiness: 78, status: "Needs Review", note: "SQL/data basics and testing skills need clearer proof." },
  { id: "education", label: "Education details", readiness: 70, status: "Needs Review", note: "Degree, semester, institution, and dates should be confirmed." },
  { id: "links", label: "Portfolio links", readiness: 62, status: "Needs Review", note: "Public profile privacy controls should be finalized before sharing." },
];

const bulletSuggestions = [
  { label: "Research bullet", status: "Ready", text: "Built structured literature and methodology evidence for AI-assisted academic workflows." },
  { label: "Frontend bullet", status: "Ready", text: "Designed dashboard components with role-aware project, funding, and team views." },
  { label: "Evidence bullet", status: "Needs Review", text: "Linked project claims to rubrics, outcomes, supervisor notes, and portfolio proof." },
  { label: "Testing bullet", status: "Gap", text: "Add validation logs and smoke-test evidence before using this as a strong resume claim." },
];

const resumeChecks = [
  { label: "ATS clarity", status: "Ready", helper: "Sections are scannable and role-focused." },
  { label: "Measurable proof", status: "Needs Review", helper: "Add numbers, outcomes, and validation results where possible." },
  { label: "Privacy review", status: "Needs Review", helper: "Avoid exposing team, supervisor, or private project details." },
  { label: "Export package", status: "Locked", helper: "PDF/DOCX export is demo-only for now." },
];

const statusClass = (status: string) => {
  if (status === "Ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Gap") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function CVResumeHelperPanel() {
  const readySections = resumeSections.filter((section) => section.status === "Ready").length;
  const reviewItems = [...resumeSections, ...bulletSuggestions, ...resumeChecks].filter((item) => item.status === "Needs Review").length;
  const gaps = bulletSuggestions.filter((item) => item.status === "Gap").length;
  const averageReadiness = Math.round(resumeSections.reduce((total, section) => total + section.readiness, 0) / resumeSections.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Sections" value={resumeSections.length.toString()} helper="Resume blocks" />
        <MetricCard label="Ready" value={readySections.toString()} helper="Sections" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Score" value={`${averageReadiness}%`} helper="Readiness" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Resume Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> CV / Resume Helper
              </CardTitle>
              <CardDescription>
                Turn portfolio projects, skill gaps, route goals, and evidence links into resume-ready sections and bullets.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <PenLine className="mr-2 h-4 w-4" /> Rewrite Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Export Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Resume readiness</span>
              <span>{averageReadiness}%</span>
            </div>
            <Progress value={averageReadiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo CV/resume helper only. Production export should verify user approval, factual evidence, privacy settings, and revision history.
          </div>
          <ResumeSections />
          <div className="grid gap-4 xl:grid-cols-2">
            <BulletSuggestions gaps={gaps} />
            <ResumeChecks />
          </div>
        </CardContent>
      </Card>
      <IndustryChallengeWorkflowPanel />
    </div>
  );
}

function ResumeSections() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><BriefcaseBusiness className="h-4 w-4 text-primary" /> Resume Sections</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{resumeSections.map((section) => <div key={section.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(section.status)}>{section.status}</Badge><Badge variant="outline">{section.readiness}%</Badge></div><p className="mt-2 font-medium">{section.label}</p><Progress value={section.readiness} className="mt-3 h-2" /><p className="mt-2 text-muted-foreground">{section.note}</p></div>)}</div></div>;
}

function BulletSuggestions({ gaps }: { gaps: number }) {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-primary" /> Bullet Suggestions</p><p className="mt-1 text-xs text-muted-foreground">{gaps} bullet needs stronger proof before use.</p><div className="mt-3 space-y-3">{bulletSuggestions.map((bullet) => <div key={bullet.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(bullet.status)}>{bullet.status}</Badge><Badge variant="outline">{bullet.label}</Badge></div><p className="mt-2 text-muted-foreground">{bullet.text}</p></div>)}</div></div>;
}

function ResumeChecks() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Resume Checks</p><div className="mt-3 space-y-3">{resumeChecks.map((check) => <div key={check.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(check.status)}>{check.status}</Badge><p className="font-medium">{check.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{check.helper}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><Target className="h-3 w-3" /> Role fit</span><span className="inline-flex items-center gap-1"><Award className="h-3 w-3" /> Proof</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Review</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}

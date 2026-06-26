import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CertificateVerificationPlaceholderPanel } from "@/components/projects/CertificateVerificationPlaceholderPanel";
import { BriefcaseBusiness, Building2, CheckCircle2, ClipboardCheck, FileText, Lock, Rocket, ShieldCheck, Users } from "lucide-react";

const challengeBriefs = [
  { id: "challenge-ai", title: "AI Campus Support Bot", sponsor: "Demo EdTech Partner", readiness: 84, status: "Ready", team: "AI + Frontend", note: "Strong match with AI tools hub, literature assistant, and dashboard evidence." },
  { id: "challenge-data", title: "Student Success Analytics", sponsor: "Demo Data Studio", readiness: 73, status: "Needs Review", team: "Data + Research", note: "Needs stronger SQL/data proof before submission." },
  { id: "challenge-lab", title: "Prototype Validation Kit", sponsor: "Demo Hardware Lab", readiness: 61, status: "Needs Review", team: "QA + Prototype", note: "Validation logs and testing proof need improvement." },
  { id: "challenge-social", title: "Research Impact Story", sponsor: "Demo Impact Network", readiness: 88, status: "Ready", team: "Writing + Portfolio", note: "Good fit with portfolio builder, outcome mapping, and report sections." },
];

const workflowSteps = [
  { label: "Select challenge", status: "Ready", helper: "Shortlist based on route fit and evidence strength." },
  { label: "Prepare concept note", status: "Ready", helper: "Use proposal builder and portfolio proof." },
  { label: "Attach evidence pack", status: "Needs Review", helper: "Add rubrics, screenshots, validation notes, and outcome links." },
  { label: "Team review", status: "Needs Review", helper: "Supervisor/team review should happen before final submit." },
  { label: "Submission audit", status: "Locked", helper: "Production submit requires timestamps, permissions, and official rules." },
];

const submissionAssets = [
  { label: "Concept note", status: "Ready", count: 1 },
  { label: "Portfolio proof", status: "Ready", count: 4 },
  { label: "Demo screenshots", status: "Needs Review", count: 3 },
  { label: "Validation logs", status: "Gap", count: 1 },
  { label: "Team approvals", status: "Needs Review", count: 2 },
];

const statusClass = (status: string) => {
  if (status === "Ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Gap") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function IndustryChallengeWorkflowPanel() {
  const readyChallenges = challengeBriefs.filter((challenge) => challenge.status === "Ready").length;
  const reviewItems = [...challengeBriefs, ...workflowSteps, ...submissionAssets].filter((item) => item.status === "Needs Review").length;
  const gaps = submissionAssets.filter((asset) => asset.status === "Gap").length;
  const assets = submissionAssets.reduce((total, asset) => total + asset.count, 0);
  const averageReadiness = Math.round(challengeBriefs.reduce((total, challenge) => total + challenge.readiness, 0) / challengeBriefs.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Challenges" value={challengeBriefs.length.toString()} helper="Demo briefs" />
        <MetricCard label="Ready" value={readyChallenges.toString()} helper="Submissions" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Gaps" value={gaps.toString()} helper="Assets" danger={gaps > 0} />
        <MetricCard label="Readiness" value={`${averageReadiness}%`} helper="Average" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Challenge Workflow Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-primary" /> Industry Challenge Workflow
              </CardTitle>
              <CardDescription>
                Plan industry challenge briefs, team fit, evidence packs, submission steps, and locked final actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Rocket className="mr-2 h-4 w-4" /> Start Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Submit Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Average challenge readiness</span>
              <span>{averageReadiness}%</span>
            </div>
            <Progress value={averageReadiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo industry challenge workflow only. Production submissions should verify official challenge rules, team consent, sponsor terms, timestamps, and evidence ownership.
          </div>
          <ChallengeBriefs />
          <div className="grid gap-4 xl:grid-cols-2">
            <WorkflowSteps />
            <SubmissionAssets assets={assets} />
          </div>
        </CardContent>
      </Card>
      <CertificateVerificationPlaceholderPanel />
    </div>
  );
}

function ChallengeBriefs() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Building2 className="h-4 w-4 text-primary" /> Challenge Briefs</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{challengeBriefs.map((challenge) => <div key={challenge.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(challenge.status)}>{challenge.status}</Badge><Badge variant="outline">{challenge.team}</Badge></div><p className="mt-2 font-medium">{challenge.title}</p><p className="text-xs text-muted-foreground">{challenge.sponsor}</p><Progress value={challenge.readiness} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{challenge.readiness}% ready</p><p className="mt-2 text-muted-foreground">{challenge.note}</p></div>)}</div></div>;
}

function WorkflowSteps() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ClipboardCheck className="h-4 w-4 text-primary" /> Workflow Steps</p><div className="mt-3 space-y-3">{workflowSteps.map((step) => <div key={step.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(step.status)}>{step.status}</Badge><p className="font-medium">{step.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{step.helper}</p></div>)}</div></div>;
}

function SubmissionAssets({ assets }: { assets: number }) {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4 text-primary" /> Submission Assets</p><p className="mt-1 text-xs text-muted-foreground">{assets} demo assets are listed for the evidence pack.</p><div className="mt-3 space-y-3">{submissionAssets.map((asset) => <div key={asset.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(asset.status)}>{asset.status}</Badge><Badge variant="outline">{asset.count} items</Badge></div><p className="mt-2 font-medium">{asset.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Team</span><span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Rules</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Review</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}

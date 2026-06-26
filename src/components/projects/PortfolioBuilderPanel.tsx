import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BriefcaseBusiness, Eye, FileText, Globe2, Image, Link2, Lock, ShieldCheck, Sparkles, Trophy } from "lucide-react";

const portfolioProjects = [
  { id: "portfolio-ai", title: "AI Literature Helper", type: "Research Tool", readiness: 86, status: "Showcase Ready", evidence: 6, note: "Strong abstract, methodology, literature matrix, and saved AI output evidence." },
  { id: "portfolio-lab", title: "Smart Lab Assistant", type: "Prototype", readiness: 74, status: "Needs Review", evidence: 5, note: "Prototype and budget story are good; validation log needs stronger proof." },
  { id: "portfolio-viva", title: "Defense Readiness Pack", type: "Academic Pack", readiness: 91, status: "Showcase Ready", evidence: 7, note: "Viva prep, report builder, rubric preview, and outcome mapping are aligned." },
  { id: "portfolio-ethics", title: "Ethics and Safety Notes", type: "Trust Evidence", readiness: 58, status: "Incomplete", evidence: 2, note: "Privacy, consent, and public-share boundaries need completion before publishing." },
];

const skillBadges = [
  { label: "Research Writing", status: "Ready", score: 88 },
  { label: "React UI", status: "Ready", score: 82 },
  { label: "AI Prompting", status: "Ready", score: 86 },
  { label: "Data Evidence", status: "Needs Review", score: 68 },
  { label: "Validation Testing", status: "Needs Review", score: 59 },
];

const publishChecks = [
  { label: "Hero summary", status: "Ready", helper: "Profile intro can be generated from project overview." },
  { label: "Project evidence", status: "Needs Review", helper: "Some validation evidence is still weak." },
  { label: "Public privacy review", status: "Incomplete", helper: "Sensitive project/team details must be hidden before publishing." },
  { label: "Contact preference", status: "Needs Review", helper: "Public contact and inquiry settings are not connected yet." },
  { label: "Export package", status: "Locked", helper: "PDF/web export remains demo-only for now." },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Showcase Ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Incomplete") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function PortfolioBuilderPanel() {
  const readyProjects = portfolioProjects.filter((project) => project.status === "Showcase Ready").length;
  const reviewItems = [...portfolioProjects, ...skillBadges, ...publishChecks].filter((item) => item.status === "Needs Review").length;
  const incompleteItems = [...portfolioProjects, ...publishChecks].filter((item) => item.status === "Incomplete").length;
  const evidenceCount = portfolioProjects.reduce((total, project) => total + project.evidence, 0);
  const averageReadiness = Math.round(portfolioProjects.reduce((total, project) => total + project.readiness, 0) / portfolioProjects.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Projects" value={portfolioProjects.length.toString()} helper="Showcase cards" />
        <MetricCard label="Ready" value={readyProjects.toString()} helper="Public-ready" />
        <MetricCard label="Evidence" value={evidenceCount.toString()} helper="Linked items" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Incomplete" value={incompleteItems.toString()} helper="Privacy gaps" danger={incompleteItems > 0} />
        <MetricCard label="Readiness" value={`${averageReadiness}%`} helper="Portfolio" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Portfolio Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-primary" /> Portfolio Builder
              </CardTitle>
              <CardDescription>
                Build a public-ready portfolio from projects, evidence, skills, outcomes, viva readiness, and privacy checks.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Eye className="mr-2 h-4 w-4" /> Preview Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Publish Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Portfolio readiness</span>
              <span>{averageReadiness}%</span>
            </div>
            <Progress value={averageReadiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo portfolio builder only. Production publishing should verify privacy settings, user consent, public-share rules, asset ownership, timestamps, and revision history.
          </div>

          <PortfolioProjects />
          <div className="grid gap-4 xl:grid-cols-2">
            <SkillBadges />
            <PublishChecks />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PortfolioProjects() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Trophy className="h-4 w-4 text-primary" /> Showcase Projects
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {portfolioProjects.map((project) => (
          <div key={project.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(project.status)}>{project.status}</Badge>
              <Badge variant="outline">{project.type}</Badge>
              <Badge variant="secondary" className="gap-1"><Link2 className="h-3 w-3" /> {project.evidence} evidence</Badge>
            </div>
            <p className="mt-2 font-medium">{project.title}</p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Showcase readiness</span>
                <span>{project.readiness}%</span>
              </div>
              <Progress value={project.readiness} className="h-2" />
            </div>
            <p className="mt-2 text-muted-foreground">{project.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillBadges() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 text-primary" /> Skill Badges
      </p>
      <div className="mt-3 space-y-3">
        {skillBadges.map((skill) => (
          <div key={skill.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(skill.status)}>{skill.status}</Badge>
              <Badge variant="outline">{skill.score}%</Badge>
            </div>
            <p className="mt-2 font-medium">{skill.label}</p>
            <Progress value={skill.score} className="mt-3 h-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PublishChecks() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Publish Checks
      </p>
      <div className="mt-3 space-y-3">
        {publishChecks.map((check) => (
          <div key={check.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(check.status)}>{check.status}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
        <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" /> Public page</span>
        <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> PDF export</span>
        <span className="inline-flex items-center gap-1"><Image className="h-3 w-3" /> Media proof</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-amber-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

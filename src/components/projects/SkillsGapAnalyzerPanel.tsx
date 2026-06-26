import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, BookOpenCheck, BrainCircuit, FileText, Lock, Route, ShieldCheck, Target, Trophy } from "lucide-react";

const targetTracks = [
  { id: "track-ai", title: "AI Research Assistant", match: 82, status: "Strong Fit", gaps: 2, note: "Research writing, AI prompting, and methodology evidence are strong." },
  { id: "track-frontend", title: "Frontend Product Builder", match: 78, status: "Needs Review", gaps: 3, note: "React UI is strong, but testing and deployment proof need improvement." },
  { id: "track-data", title: "Data Analyst Intern", match: 71, status: "Needs Review", gaps: 4, note: "Dashboard evidence exists; SQL and data storytelling need more proof." },
  { id: "track-lab", title: "Prototype Validation Role", match: 58, status: "Gap", gaps: 5, note: "Validation logs and test documentation need major improvement." },
];

const skillGaps = [
  { label: "Research writing", current: 88, target: 85, status: "Ready", action: "Use report builder examples as portfolio proof." },
  { label: "React UI", current: 82, target: 80, status: "Ready", action: "Show workspace dashboards and responsive components." },
  { label: "SQL / data basics", current: 54, target: 75, status: "Needs Practice", action: "Add sample queries, charts, and data-cleaning evidence." },
  { label: "Testing and QA", current: 49, target: 78, status: "Gap", action: "Add test cases, smoke checks, and validation logs." },
  { label: "Communication", current: 73, target: 80, status: "Needs Practice", action: "Add viva answers, summary pitch, and project story." },
];

const learningActions = [
  { label: "Add validation log", priority: "High", status: "Gap", helper: "Improves testing, prototype proof, and portfolio trust." },
  { label: "Create data mini-case", priority: "High", status: "Needs Practice", helper: "Improves SQL/data track readiness." },
  { label: "Polish portfolio summary", priority: "Medium", status: "Needs Practice", helper: "Improves public profile and role-fit story." },
  { label: "Attach rubric evidence", priority: "Medium", status: "Ready", helper: "Connects evaluation proof to skill claims." },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Strong Fit") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review" || status === "Needs Practice") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Gap") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function SkillsGapAnalyzerPanel() {
  const readySkills = skillGaps.filter((skill) => skill.status === "Ready").length;
  const practiceSkills = skillGaps.filter((skill) => skill.status === "Needs Practice").length;
  const gapSkills = skillGaps.filter((skill) => skill.status === "Gap").length;
  const averageMatch = Math.round(targetTracks.reduce((total, track) => total + track.match, 0) / targetTracks.length);
  const totalActions = learningActions.length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Tracks" value={targetTracks.length.toString()} helper="Role paths" />
        <MetricCard label="Ready" value={readySkills.toString()} helper="Skills" />
        <MetricCard label="Practice" value={practiceSkills.toString()} helper="Skills" danger={practiceSkills > 0} />
        <MetricCard label="Gaps" value={gapSkills.toString()} helper="Critical" danger={gapSkills > 0} />
        <MetricCard label="Avg Match" value={`${averageMatch}%`} helper="Readiness" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Skill Readiness Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Skills Gap Analyzer
              </CardTitle>
              <CardDescription>
                Compare portfolio evidence with target tracks, current skill level, missing proof, and recommended learning actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Route className="mr-2 h-4 w-4" /> Plan Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Save Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Average track match</span>
              <span>{averageMatch}%</span>
            </div>
            <Progress value={averageMatch} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo skills-gap analyzer only. Production recommendations should verify user goals, evidence quality, privacy settings, and revision history.
          </div>

          <TargetTracks />
          <SkillGapCards />
          <div className="grid gap-4 xl:grid-cols-2">
            <LearningActions />
            <ReadinessChecklist totalActions={totalActions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TargetTracks() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Target className="h-4 w-4 text-primary" /> Target Tracks
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {targetTracks.map((track) => (
          <div key={track.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(track.status)}>{track.status}</Badge>
              <Badge variant="outline">{track.gaps} gaps</Badge>
            </div>
            <p className="mt-2 font-medium">{track.title}</p>
            <Progress value={track.match} className="mt-3 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">{track.match}% match</p>
            <p className="mt-2 text-muted-foreground">{track.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillGapCards() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <BrainCircuit className="h-4 w-4 text-primary" /> Skill Gaps
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {skillGaps.map((skill) => (
          <div key={skill.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(skill.status)}>{skill.status}</Badge>
              <Badge variant="outline">Current {skill.current}%</Badge>
              <Badge variant="secondary">Target {skill.target}%</Badge>
            </div>
            <p className="mt-2 font-medium">{skill.label}</p>
            <Progress value={skill.current} className="mt-3 h-2" />
            <p className="mt-2 text-muted-foreground">{skill.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearningActions() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <BookOpenCheck className="h-4 w-4 text-primary" /> Learning Actions
      </p>
      <div className="mt-3 space-y-3">
        {learningActions.map((action) => (
          <div key={action.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(action.status)}>{action.status}</Badge>
              <Badge variant="outline">{action.priority}</Badge>
            </div>
            <p className="mt-2 font-medium">{action.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{action.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadinessChecklist({ totalActions }: { totalActions: number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Readiness Checklist
      </p>
      <div className="mt-3 grid gap-3 text-sm">
        <InfoRow icon={Trophy} label="Portfolio proof" value="Connected" />
        <InfoRow icon={FileText} label="Evidence notes" value="Needs review" />
        <InfoRow icon={BookOpenCheck} label="Learning actions" value={`${totalActions} planned`} />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
      <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /> {label}</span>
      <Badge variant="outline">{value}</Badge>
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

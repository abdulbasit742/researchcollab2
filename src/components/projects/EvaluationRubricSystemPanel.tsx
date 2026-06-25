import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, FileCheck2, Lock, PenLine, Scale, ShieldCheck, Star } from "lucide-react";

const rubricCriteria = [
  { id: "criteria-problem", title: "Problem Understanding", weight: 15, score: 13, status: "Strong", note: "Problem statement is clear and aligned with FYP scope." },
  { id: "criteria-method", title: "Methodology", weight: 20, score: 15, status: "Needs Review", note: "Methodology is mostly complete but validation details need more evidence." },
  { id: "criteria-implementation", title: "Implementation Quality", weight: 25, score: 18, status: "Needs Review", note: "Prototype is promising; test log and demo reliability need confirmation." },
  { id: "criteria-documentation", title: "Documentation", weight: 15, score: 12, status: "Strong", note: "Report sections and evidence links are mostly organized." },
  { id: "criteria-viva", title: "Viva Readiness", weight: 15, score: 11, status: "Needs Review", note: "Practice answers exist but weak-area questions need more detail." },
  { id: "criteria-ethics", title: "Ethics and Safety", weight: 10, score: 6, status: "At Risk", note: "Privacy, consent, and sponsor/funding boundary notes need final review." },
];

const evaluatorNotes = [
  { label: "Supervisor note", status: "Needs Review", helper: "Budget and evidence comments should be resolved before final scoring." },
  { label: "Panel note", status: "Draft", helper: "Panel-specific observations are not finalized yet." },
  { label: "Student response", status: "Ready", helper: "Team has responded to most comments." },
  { label: "Audit log", status: "Missing", helper: "Production scoring audit trail is not connected yet." },
];

const gradeBands = [
  { label: "Excellent", range: "85-100", status: "Target" },
  { label: "Good", range: "70-84", status: "Current" },
  { label: "Needs Improvement", range: "50-69", status: "Backup" },
  { label: "Not Ready", range: "0-49", status: "Risk" },
];

const statusClass = (status: string) => {
  if (status === "Strong" || status === "Ready" || status === "Target") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review" || status === "Draft" || status === "Current") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "At Risk" || status === "Missing" || status === "Risk") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
};

export function EvaluationRubricSystemPanel() {
  const totalWeight = rubricCriteria.reduce((total, criteria) => total + criteria.weight, 0);
  const totalScore = rubricCriteria.reduce((total, criteria) => total + criteria.score, 0);
  const scorePercent = Math.round((totalScore / totalWeight) * 100);
  const needsReview = rubricCriteria.filter((criteria) => criteria.status === "Needs Review").length;
  const atRisk = rubricCriteria.filter((criteria) => criteria.status === "At Risk").length;
  const missingNotes = evaluatorNotes.filter((note) => note.status === "Missing").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Score" value={`${totalScore}/${totalWeight}`} helper="Demo marks" />
        <MetricCard label="Percent" value={`${scorePercent}%`} helper="Preview grade" />
        <MetricCard label="Criteria" value={rubricCriteria.length.toString()} helper="Rubric items" />
        <MetricCard label="Review" value={needsReview.toString()} helper="Criteria" danger={needsReview > 0} />
        <MetricCard label="At Risk" value={atRisk.toString()} helper="Criteria" danger={atRisk > 0} />
        <MetricCard label="Missing Notes" value={missingNotes.toString()} helper="Audit gap" danger={missingNotes > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Rubric Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> Evaluation Rubric System
              </CardTitle>
              <CardDescription>
                Preview weighted criteria, score bands, evaluator notes, review gaps, and locked final grading actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <PenLine className="mr-2 h-4 w-4" /> Add Score Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Finalize Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Overall rubric score</span>
              <span>{scorePercent}%</span>
            </div>
            <Progress value={scorePercent} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo rubric preview only. Production evaluation should verify official rubrics, evaluator permissions, grade release rules, timestamps, moderation, and audit history.
          </div>

          <RubricCriteria />
          <div className="grid gap-4 xl:grid-cols-2">
            <EvaluatorNotes />
            <GradeBands />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RubricCriteria() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ClipboardCheck className="h-4 w-4 text-primary" /> Weighted Criteria
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {rubricCriteria.map((criteria) => {
          const percent = Math.round((criteria.score / criteria.weight) * 100);
          return (
            <div key={criteria.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusClass(criteria.status)}>{criteria.status}</Badge>
                <Badge variant="outline">Weight {criteria.weight}</Badge>
                <Badge variant="secondary">Score {criteria.score}</Badge>
              </div>
              <p className="mt-2 font-medium">{criteria.title}</p>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Criterion performance</span>
                  <span>{percent}%</span>
                </div>
                <Progress value={percent} className="h-2" />
              </div>
              <p className="mt-2 text-muted-foreground">{criteria.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EvaluatorNotes() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <FileCheck2 className="h-4 w-4 text-primary" /> Evaluator Notes
      </p>
      <div className="mt-3 space-y-3">
        {evaluatorNotes.map((note) => (
          <div key={note.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(note.status)}>{note.status}</Badge>
              <p className="font-medium">{note.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{note.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GradeBands() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Grade Bands
      </p>
      <div className="mt-3 space-y-3">
        {gradeBands.map((band) => (
          <div key={band.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(band.status)}>{band.status}</Badge>
              <Badge variant="outline">{band.range}</Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 font-medium">
              <Star className="h-4 w-4 text-primary" /> {band.label}
            </p>
          </div>
        ))}
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

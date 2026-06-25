import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileCheck2, GitBranch, Link2, Lock, Map, ShieldCheck, Target } from "lucide-react";

const outcomeMaps = [
  { id: "outcome-1", code: "PLO-1", title: "Engineering / Computing Knowledge", attainment: 84, status: "Mapped", evidence: 5, note: "Problem brief, methodology, and implementation evidence support this outcome." },
  { id: "outcome-2", code: "PLO-2", title: "Problem Analysis", attainment: 78, status: "Mapped", evidence: 4, note: "Research gap and validation plan support analysis outcome." },
  { id: "outcome-3", code: "PLO-3", title: "Design and Development", attainment: 69, status: "Needs Review", evidence: 3, note: "Prototype design is present but test log needs stronger evidence." },
  { id: "outcome-4", code: "PLO-4", title: "Investigation and Validation", attainment: 52, status: "At Risk", evidence: 2, note: "Validation evidence is incomplete and needs supervisor review." },
  { id: "outcome-5", code: "PLO-6", title: "Ethics and Professional Practice", attainment: 48, status: "Gap", evidence: 1, note: "Privacy, consent, and sponsor boundary documentation is missing." },
];

const evidenceLinks = [
  { label: "Final report sections", outcome: "PLO-1, PLO-2", status: "Linked", helper: "Report builder sections are mapped to knowledge and analysis outcomes." },
  { label: "Prototype screenshots", outcome: "PLO-3", status: "Needs Review", helper: "Screenshots need captions and supervisor confirmation." },
  { label: "Validation test log", outcome: "PLO-4", status: "Missing", helper: "Test log is required before investigation outcome can be marked ready." },
  { label: "Ethics and privacy note", outcome: "PLO-6", status: "Missing", helper: "Privacy and consent boundaries are not documented yet." },
];

const mappingChecks = [
  { label: "Outcome coverage", status: "Needs Review", helper: "Two outcomes are below target attainment." },
  { label: "Evidence linkage", status: "Needs Review", helper: "Some outcomes need stronger linked evidence." },
  { label: "Rubric alignment", status: "Linked", helper: "Evaluation rubric score preview is connected conceptually." },
  { label: "Accreditation export", status: "Locked", helper: "Production export format is not connected yet." },
  { label: "Audit history", status: "Missing", helper: "Production mappings need timestamps and reviewer identity." },
];

const statusClass = (status: string) => {
  if (status === "Mapped" || status === "Linked") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "At Risk" || status === "Gap" || status === "Missing") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function OutcomeMappingPanel() {
  const mapped = outcomeMaps.filter((outcome) => outcome.status === "Mapped").length;
  const gaps = outcomeMaps.filter((outcome) => outcome.status === "Gap" || outcome.status === "At Risk").length;
  const evidenceCount = outcomeMaps.reduce((total, outcome) => total + outcome.evidence, 0);
  const missingEvidence = evidenceLinks.filter((link) => link.status === "Missing").length;
  const averageAttainment = Math.round(outcomeMaps.reduce((total, outcome) => total + outcome.attainment, 0) / outcomeMaps.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Outcomes" value={outcomeMaps.length.toString()} helper="Mapped PLOs" />
        <MetricCard label="Mapped" value={mapped.toString()} helper="Ready" />
        <MetricCard label="Gaps" value={gaps.toString()} helper="Needs work" danger={gaps > 0} />
        <MetricCard label="Evidence" value={evidenceCount.toString()} helper="Links" />
        <MetricCard label="Missing" value={missingEvidence.toString()} helper="Evidence" danger={missingEvidence > 0} />
        <MetricCard label="Avg Attain" value={`${averageAttainment}%`} helper="Preview" danger={averageAttainment < 70} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Outcome Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" /> Outcome Mapping
              </CardTitle>
              <CardDescription>
                Map project evidence, rubric results, report sections, and viva readiness to program-level outcome attainment.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <GitBranch className="mr-2 h-4 w-4" /> Auto Map Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Publish Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Average outcome attainment</span>
              <span>{averageAttainment}%</span>
            </div>
            <Progress value={averageAttainment} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo outcome mapping only. Production mapping should verify official outcome definitions, approved rubrics, evidence ownership, reviewer permissions, and audit history.
          </div>

          <OutcomeCards />
          <div className="grid gap-4 xl:grid-cols-2">
            <EvidenceLinks />
            <MappingChecks />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OutcomeCards() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Target className="h-4 w-4 text-primary" /> Program Outcome Attainment
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {outcomeMaps.map((outcome) => (
          <div key={outcome.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(outcome.status)}>{outcome.status}</Badge>
              <Badge variant="outline">{outcome.code}</Badge>
              <Badge variant="secondary">{outcome.evidence} evidence links</Badge>
            </div>
            <p className="mt-2 font-medium">{outcome.title}</p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Attainment preview</span>
                <span>{outcome.attainment}%</span>
              </div>
              <Progress value={outcome.attainment} className="h-2" />
            </div>
            <p className="mt-2 text-muted-foreground">{outcome.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceLinks() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Link2 className="h-4 w-4 text-primary" /> Evidence Links
      </p>
      <div className="mt-3 space-y-3">
        {evidenceLinks.map((link) => (
          <div key={link.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(link.status)}>{link.status}</Badge>
              <Badge variant="outline">{link.outcome}</Badge>
            </div>
            <p className="mt-2 font-medium">{link.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{link.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MappingChecks() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Mapping Checks
      </p>
      <div className="mt-3 space-y-3">
        {mappingChecks.map((check) => (
          <div key={check.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(check.status)}>{check.status}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
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

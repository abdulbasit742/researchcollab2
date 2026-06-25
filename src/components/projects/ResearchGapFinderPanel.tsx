import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  RESEARCH_GAP_CANDIDATES,
  getResearchGapConfidenceClass,
  getResearchGapCounts,
  getResearchGapEvidenceClass,
  getResearchGapPriorityClass,
  getResearchGapReadiness,
  type ResearchGapCandidate,
} from "@/config/researchGapFinder";
import { BrainCircuit, CheckCircle2, Lightbulb, Lock, Microscope, SearchCheck, Sparkles } from "lucide-react";

type ResearchGapFinderPanelProps = {
  candidates?: ResearchGapCandidate[];
};

export function ResearchGapFinderPanel({ candidates = RESEARCH_GAP_CANDIDATES }: ResearchGapFinderPanelProps) {
  const readiness = getResearchGapReadiness(candidates);
  const counts = getResearchGapCounts(candidates);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Gap Readiness" value={`${readiness}%`} helper="Confidence + evidence" danger={readiness < 70} />
        <MetricCard label="Candidates" value={counts.total.toString()} helper="Possible gaps" />
        <MetricCard label="Strong" value={counts.strong.toString()} helper="Proposal-ready direction" />
        <MetricCard label="Needs Sources" value={counts.needsSources.toString()} helper="Verify before use" danger={counts.needsSources > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SearchCheck className="h-5 w-5 text-primary" />
                Research Gap Finder
              </CardTitle>
              <CardDescription>
                Turn literature matrix limitations into careful, evidence-backed gap candidates for proposal and report writing.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Sparkles className="mr-2 h-4 w-4" /> Analyze Matrix
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Promote Gap
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Gap finder readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is read-only planning support. Real gap finding should use verified papers, source excerpts, supervisor review, and citation-safe evidence before adding claims to proposal/report text.
          </div>

          <div className="grid gap-4">
            {candidates.map((candidate) => (
              <ResearchGapCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResearchGapCard({ candidate }: { candidate: ResearchGapCandidate }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getResearchGapConfidenceClass(candidate.confidence)}>{candidate.confidence} confidence</Badge>
            <Badge className={getResearchGapPriorityClass(candidate.priority)}>{candidate.priority}</Badge>
            <Badge className={getResearchGapEvidenceClass(candidate.evidenceStatus)}>{candidate.evidenceStatus.replace("_", " ")}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{candidate.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{candidate.gapStatement}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-56">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <BrainCircuit className="h-3 w-3" /> Proposal Use
          </p>
          <p className="mt-1 font-medium">{candidate.proposalUse}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Source Signals" icon={Microscope} items={candidate.sourceSignals} />
        <Checklist title="Evidence Needed" icon={CheckCircle2} items={candidate.evidenceNeeded} />
      </div>

      <div className="rounded-lg border bg-primary/5 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <Lightbulb className="h-4 w-4 text-primary" /> Supervisor Question
        </p>
        <p className="mt-1 text-muted-foreground">{candidate.supervisorQuestion}</p>
      </div>
    </div>
  );
}

function Checklist({ title, icon: Icon, items }: { title: string; icon: typeof Microscope; items: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {item}
          </p>
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
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

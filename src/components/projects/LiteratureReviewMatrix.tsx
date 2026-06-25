import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_LITERATURE_MATRIX,
  getLiteratureEvidenceClass,
  getLiteratureMatrixGapCount,
  getLiteratureMatrixReadiness,
  getLiteratureRelevanceClass,
  type LiteratureMatrixEntry,
} from "@/config/literatureMatrix";
import { BookOpenCheck, FileSpreadsheet, Lightbulb, PlusCircle, SearchCheck, Tags } from "lucide-react";

type LiteratureReviewMatrixProps = {
  entries?: LiteratureMatrixEntry[];
};

export function LiteratureReviewMatrix({ entries = DEMO_LITERATURE_MATRIX }: LiteratureReviewMatrixProps) {
  const readiness = getLiteratureMatrixReadiness(entries);
  const highRelevance = entries.filter((entry) => entry.relevance === "high").length;
  const completeEvidence = entries.filter((entry) => entry.evidenceStatus === "complete").length;
  const gapCount = getLiteratureMatrixGapCount(entries);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Matrix Readiness" value={`${readiness}%`} helper="Relevance + evidence" />
        <MetricCard label="Sources" value={entries.length.toString()} helper="Reviewed entries" />
        <MetricCard label="High Relevance" value={highRelevance.toString()} helper="Core sources" />
        <MetricCard label="Gaps Found" value={gapCount.toString()} helper="Gap statements" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Literature Review Matrix
              </CardTitle>
              <CardDescription>
                Compare sources by method, context, findings, limitations, and research gap contribution.
              </CardDescription>
            </div>
            <Button variant="outline" disabled>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Source
            </Button>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Matrix readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This matrix is currently read-only demo data. Source import, citation manager sync, file attachments, and supervisor review can connect in later features.
          </div>

          <div className="grid gap-4">
            {entries.map((entry, index) => (
              <LiteratureEntryCard key={entry.id} entry={entry} number={index + 1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function LiteratureEntryCard({ entry, number }: { entry: LiteratureMatrixEntry; number: number }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Source {number}</Badge>
            <Badge variant="secondary">{entry.year}</Badge>
            <Badge variant="outline">{entry.sourceType}</Badge>
            <Badge className={getLiteratureRelevanceClass(entry.relevance)}>{entry.relevance} relevance</Badge>
            <Badge className={getLiteratureEvidenceClass(entry.evidenceStatus)}>{entry.evidenceStatus} evidence</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{entry.citation}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{entry.topic}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 md:max-w-xs md:justify-end">
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 text-xs">
              <Tags className="h-3 w-3" /> {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoBlock icon={SearchCheck} title="Method / Context" lines={[entry.method, entry.datasetOrContext]} />
        <InfoBlock icon={BookOpenCheck} title="Finding / Limitation" lines={[entry.keyFinding, entry.limitation]} />
      </div>

      <div className="rounded-lg border bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Lightbulb className="h-4 w-4 text-primary" /> Gap Contribution
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{entry.gapContribution}</p>
      </div>
    </div>
  );
}

function InfoBlock({ icon: Icon, title, lines }: { icon: typeof SearchCheck; title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </p>
      <div className="mt-2 space-y-2">
        {lines.map((line) => (
          <p key={line} className="text-sm text-muted-foreground">{line}</p>
        ))}
      </div>
    </div>
  );
}

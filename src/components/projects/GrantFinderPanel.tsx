import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_GRANT_FINDER,
  getGrantDeadlineStatusClass,
  getGrantDeadlineStatusLabel,
  getGrantFinderCounts,
  getGrantFitStatusClass,
  getGrantFitStatusLabel,
  getGrantRequirementStatusClass,
  getGrantRequirementStatusLabel,
  getGrantSourceTypeLabel,
  type GrantFinderSummary,
  type GrantOpportunity,
  type GrantRequirement,
} from "@/config/grantFinder";
import { BookMarked, FileSearch, Lock, Search, ShieldCheck, Sparkles } from "lucide-react";

type GrantFinderPanelProps = {
  summary?: GrantFinderSummary;
};

export function GrantFinderPanel({ summary = DEMO_GRANT_FINDER }: GrantFinderPanelProps) {
  const counts = getGrantFinderCounts(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Grants" value={counts.grants.toString()} helper="Demo matches" />
        <MetricCard label="Strong Fits" value={counts.strongFits.toString()} helper="Best targets" />
        <MetricCard label="Open" value={counts.openGrants.toString()} helper="Can prepare" />
        <MetricCard label="Missing Reqs" value={counts.missingRequirements.toString()} helper="Need documents" danger={counts.missingRequirements > 0} />
        <MetricCard label="Avg Score" value={`${counts.averageScore}%`} helper="Match quality" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{summary.filterLabel}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/30">Finder Preview</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-primary" />
                Grant Finder
              </CardTitle>
              <CardDescription>
                Discover grant opportunities for the selected project using fit score, source type, deadline status, and requirement readiness.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Search className="mr-2 h-4 w-4" /> Refresh Search
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Start Application
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {summary.safetyNote}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Project" value={summary.projectTitle} />
            <InfoCard label="Owner" value={summary.owner} />
            <InfoCard label="Search query" value={summary.searchQuery} />
          </div>

          <div className="grid gap-4">
            {summary.opportunities.map((grant) => (
              <GrantCard key={grant.id} grant={grant} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GrantCard({ grant }: { grant: GrantOpportunity }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getGrantFitStatusClass(grant.fitStatus)}>{getGrantFitStatusLabel(grant.fitStatus)}</Badge>
            <Badge className={getGrantDeadlineStatusClass(grant.deadlineStatus)}>{getGrantDeadlineStatusLabel(grant.deadlineStatus)}</Badge>
            <Badge variant="outline">{getGrantSourceTypeLabel(grant.sourceType)}</Badge>
            <Badge variant="secondary">{grant.amountLabel}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{grant.title}</h4>
            <p className="text-xs text-muted-foreground">{grant.provider} · {grant.category} · {grant.deadlineLabel}</p>
            <p className="mt-2 text-sm text-muted-foreground">{grant.summary}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-48">
          <p className="text-xs text-muted-foreground">Match Score</p>
          <p className="mt-1 text-2xl font-bold">{grant.matchScore}%</p>
          <Progress value={grant.matchScore} className="mt-2 h-2" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border bg-primary/5 p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <Sparkles className="h-4 w-4 text-primary" /> Best For
          </p>
          <p className="mt-1 text-muted-foreground">{grant.bestFor}</p>
        </div>
        <GrantRequirements requirements={grant.requirements} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled>
          <BookMarked className="mr-2 h-4 w-4" /> Save Grant
        </Button>
        <Button disabled>
          <Lock className="mr-2 h-4 w-4" /> Apply Locked
        </Button>
      </div>
    </div>
  );
}

function GrantRequirements({ requirements }: { requirements: GrantRequirement[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Eligibility Requirements
      </p>
      <div className="mt-3 space-y-2">
        {requirements.map((requirement) => (
          <div key={requirement.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getGrantRequirementStatusClass(requirement.status)}>{getGrantRequirementStatusLabel(requirement.status)}</Badge>
              <p className="font-medium">{requirement.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{requirement.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
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

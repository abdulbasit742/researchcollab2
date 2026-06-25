import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  VERSION_HISTORY_ITEMS,
  getLatestVersion,
  getVersionAreaCount,
  getVersionStatusClass,
  getVersionStatusLabel,
  type VersionHistoryItem,
} from "@/config/versionHistory";
import { Download, FileClock, GitBranch, History, RotateCcw, Tags } from "lucide-react";

type VersionHistoryPanelProps = {
  items?: VersionHistoryItem[];
};

export function VersionHistoryPanel({ items = VERSION_HISTORY_ITEMS }: VersionHistoryPanelProps) {
  const latest = getLatestVersion(items);
  const finalReportCount = getVersionAreaCount("final_report", items);
  const proposalCount = getVersionAreaCount("proposal", items);
  const methodologyCount = getVersionAreaCount("methodology", items);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Versions" value={items.length.toString()} helper="Tracked snapshots" />
        <MetricCard label="Latest" value={latest?.version ?? "—"} helper={latest?.areaLabel ?? "No snapshot"} />
        <MetricCard label="Report" value={finalReportCount.toString()} helper="Report versions" />
        <MetricCard label="Method/Proposal" value={`${methodologyCount}/${proposalCount}`} helper="Method / proposal" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Version History Placeholder
              </CardTitle>
              <CardDescription>
                Track report, proposal, methodology, and workspace snapshots before enabling real document versioning.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <RotateCcw className="mr-2 h-4 w-4" /> Restore Version
              </Button>
              <Button disabled>
                <Download className="mr-2 h-4 w-4" /> Download Snapshot
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is a read-only placeholder. Real version history should connect to saved section drafts, export files, reviewer notes, and audit-safe restore events.
          </div>

          <div className="grid gap-4">
            {items.map((item) => (
              <VersionHistoryCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VersionHistoryCard({ item }: { item: VersionHistoryItem }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <GitBranch className="h-3 w-3" /> {item.version}
            </Badge>
            <Badge variant="secondary">{item.areaLabel}</Badge>
            <Badge className={getVersionStatusClass(item.status)}>{getVersionStatusLabel(item.status)}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{item.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{item.changeSummary}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-48">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileClock className="h-3 w-3" /> Snapshot
          </p>
          <p className="mt-1 font-semibold">{item.author}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.createdLabel}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {item.changedSections.map((section) => (
          <Badge key={section} variant="outline" className="gap-1 text-xs">
            <Tags className="h-3 w-3" /> {section}
          </Badge>
        ))}
      </div>

      {item.reviewerNote ? (
        <div className="rounded-lg border bg-primary/5 p-3 text-sm">
          <p className="font-medium">Reviewer note</p>
          <p className="mt-1 text-muted-foreground">{item.reviewerNote}</p>
        </div>
      ) : null}
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

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  TRACKED_REPORT_SECTIONS,
  getAreaSections,
  getReportStatusCounts,
  getReportStatusScore,
  getTrackedStatusClass,
  getTrackedStatusLabel,
  type TrackedReportArea,
  type TrackedReportSection,
} from "@/config/reportStatusTracking";
import { ClipboardCheck, FileCheck2, FileText, Layers3, Microscope } from "lucide-react";

const trackedAreas: { area: TrackedReportArea; label: string; icon: typeof FileText }[] = [
  { area: "final_report", label: "Final Report", icon: FileText },
  { area: "proposal", label: "Proposal", icon: Microscope },
  { area: "methodology", label: "Methodology", icon: Layers3 },
];

type ReportSectionStatusTrackerProps = {
  sections?: TrackedReportSection[];
};

export function ReportSectionStatusTracker({ sections = TRACKED_REPORT_SECTIONS }: ReportSectionStatusTrackerProps) {
  const score = getReportStatusScore(sections);
  const counts = getReportStatusCounts(sections);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Overall Status" value={`${score}%`} helper="All tracked sections" />
        <MetricCard label="Complete" value={counts.complete.toString()} helper="Ready sections" />
        <MetricCard label="In Review" value={counts.review.toString()} helper="Awaiting feedback" />
        <MetricCard label="Not Started" value={counts.notStarted.toString()} helper="Needs owner" danger={counts.notStarted > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Report Section Status Tracking
          </CardTitle>
          <CardDescription>
            Unified tracking across final report, research proposal, and methodology sections.
          </CardDescription>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Tracked section readiness</span>
              <span>{score}%</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {trackedAreas.map((area) => (
              <AreaStatusCard key={area.area} area={area.area} label={area.label} icon={area.icon} sections={sections} />
            ))}
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Next Step</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{section.areaLabel}</TableCell>
                    <TableCell>{section.title}</TableCell>
                    <TableCell>
                      <Badge className={getTrackedStatusClass(section.status)}>{getTrackedStatusLabel(section.status)}</Badge>
                    </TableCell>
                    <TableCell>{section.owner}</TableCell>
                    <TableCell>{section.evidenceCount}</TableCell>
                    <TableCell className="max-w-xs text-muted-foreground">{section.nextStep}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AreaStatusCard({ area, label, icon: Icon, sections }: { area: TrackedReportArea; label: string; icon: typeof FileText; sections: TrackedReportSection[] }) {
  const areaSections = getAreaSections(area, sections);
  const score = getReportStatusScore(areaSections);
  const counts = getReportStatusCounts(areaSections);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-medium">
          <Icon className="h-4 w-4 text-primary" /> {label}
        </p>
        <Badge variant="outline">{score}%</Badge>
      </div>
      <Progress value={score} className="mt-3 h-2" />
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <span>{counts.complete} complete</span>
        <span>{counts.review} review</span>
        <span>{counts.notStarted} missing</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-red-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-red-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

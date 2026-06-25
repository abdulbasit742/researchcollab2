import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileSpreadsheet, Lock, ShieldCheck, TableProperties, UploadCloud, UsersRound } from "lucide-react";

const importRows = [
  { id: "row-1", name: "Ayesha Khan", rollNo: "CS-2026-001", email: "ayesha@example.edu", group: "CS 2026-A", status: "Ready", issue: "All required fields mapped." },
  { id: "row-2", name: "Bilal Ahmed", rollNo: "CS-2026-002", email: "bilal@example.edu", group: "CS 2026-A", status: "Ready", issue: "Ready for preview import." },
  { id: "row-3", name: "Hina Shah", rollNo: "CS-2026-003", email: "", group: "CS 2026-B", status: "Missing", issue: "Email field is missing." },
  { id: "row-4", name: "Usman Ali", rollNo: "CS-2026-002", email: "usman@example.edu", group: "CS 2026-B", status: "Duplicate", issue: "Roll number already appears in preview file." },
  { id: "row-5", name: "Sara Noor", rollNo: "CS-2026-005", email: "sara@example.edu", group: "Extra Teams", status: "Needs Review", issue: "Group needs coordinator confirmation." },
];

const fieldMappings = [
  { source: "Full Name", target: "student_name", status: "Mapped" },
  { source: "Roll Number", target: "roll_no", status: "Mapped" },
  { source: "Email", target: "email", status: "Needs Review" },
  { source: "Batch Group", target: "batch_group", status: "Mapped" },
  { source: "Supervisor", target: "supervisor_id", status: "Missing" },
];

const validationChecks = [
  { label: "Required fields", status: "Needs Review", helper: "One row is missing email." },
  { label: "Duplicate roll numbers", status: "Blocked", helper: "One duplicate roll number found." },
  { label: "Batch group mapping", status: "Needs Review", helper: "Extra Teams group needs confirmation." },
  { label: "Supervisor mapping", status: "Missing", helper: "Supervisor column is not mapped yet." },
  { label: "Demo safety label", status: "Ready", helper: "Import is locked and preview-only." },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Mapped") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Duplicate" || status === "Blocked" || status === "Missing") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function StudentImportPlaceholderPanel() {
  const readyRows = importRows.filter((row) => row.status === "Ready").length;
  const issueRows = importRows.length - readyRows;
  const mappedFields = fieldMappings.filter((field) => field.status === "Mapped").length;
  const readiness = Math.round((readyRows / importRows.length) * 100);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Rows" value={importRows.length.toString()} helper="Preview file" />
        <MetricCard label="Ready" value={readyRows.toString()} helper="Importable" />
        <MetricCard label="Issues" value={issueRows.toString()} helper="Fix first" danger={issueRows > 0} />
        <MetricCard label="Mapped Fields" value={`${mappedFields}/${fieldMappings.length}`} helper="Columns" />
        <MetricCard label="Readiness" value={`${readiness}%`} helper="Preview score" danger={readiness < 80} />
        <MetricCard label="Locked" value="Yes" helper="Demo only" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Import Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" /> Student Import Placeholder
              </CardTitle>
              <CardDescription>
                Preview CSV-style student rows, field mapping, validation checks, duplicates, and locked import actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Upload CSV Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Import Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Import readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo import preview only. Production import should validate approved records, consent/privacy rules, duplicate checks, role permissions, rollback support, and audit logs.
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <FieldMappings />
            <ValidationChecks />
          </div>
          <ImportRows />
        </CardContent>
      </Card>
    </div>
  );
}

function FieldMappings() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <TableProperties className="h-4 w-4 text-primary" /> Field Mapping
      </p>
      <div className="mt-3 space-y-3">
        {fieldMappings.map((field) => (
          <div key={field.source} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(field.status)}>{field.status}</Badge>
              <p className="font-medium">{field.source}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Target: {field.target}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidationChecks() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Validation Checks
      </p>
      <div className="mt-3 space-y-3">
        {validationChecks.map((check) => (
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

function ImportRows() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <UsersRound className="h-4 w-4 text-primary" /> Import Row Preview
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {importRows.map((row) => (
          <div key={row.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(row.status)}>{row.status}</Badge>
              <Badge variant="outline">{row.group}</Badge>
            </div>
            <p className="mt-2 font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.rollNo} · {row.email || "No email"}</p>
            <p className="mt-1 text-muted-foreground">{row.issue}</p>
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

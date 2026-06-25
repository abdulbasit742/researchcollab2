import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";

type DiagnosticStatus = "ok" | "warning" | "manual";

type DiagnosticItem = {
  id: string;
  area: string;
  check: string;
  status: DiagnosticStatus;
  value: string;
  recommendation: string;
};

const diagnostics: DiagnosticItem[] = [
  {
    id: "build-check",
    area: "Build",
    check: "Production build",
    status: "manual",
    value: "Run required",
    recommendation: "Run npm run build after each major feature pass.",
  },
  {
    id: "lint-check",
    area: "Build",
    check: "Lint review",
    status: "manual",
    value: "Recommended",
    recommendation: "Run lint before a demo or release branch.",
  },
  {
    id: "route-check",
    area: "Routes",
    check: "Route safety map",
    status: "ok",
    value: "Visible",
    recommendation: "Use the Routes tab to review public, admin, and demo routes.",
  },
  {
    id: "blocker-check",
    area: "Release",
    check: "Production blockers",
    status: "warning",
    value: "Open items exist",
    recommendation: "Use the Blockers tab before any production decision.",
  },
  {
    id: "demo-labels",
    area: "Trust",
    check: "Demo labels",
    status: "warning",
    value: "Needs review",
    recommendation: "Keep funding, wallet, billing, and escrow-style flows clearly marked as demo-only.",
  },
  {
    id: "type-check",
    area: "Types",
    check: "Generated data types",
    status: "warning",
    value: "Fallback active",
    recommendation: "Replace fallback types with generated project types before production.",
  },
  {
    id: "mobile-check",
    area: "UX",
    check: "Mobile admin layout",
    status: "ok",
    value: "Responsive cards",
    recommendation: "Use mobile viewport testing before pilot demos.",
  },
  {
    id: "empty-states",
    area: "UX",
    check: "Empty/error states",
    status: "warning",
    value: "Needs ongoing review",
    recommendation: "Avoid blank screens when data tables or remote calls are unavailable.",
  },
];

const getStatusLabel = (status: DiagnosticStatus) => {
  switch (status) {
    case "ok":
      return "OK";
    case "warning":
      return "Warning";
    case "manual":
      return "Manual";
    default:
      return "Unknown";
  }
};

const getStatusClass = (status: DiagnosticStatus) => {
  switch (status) {
    case "ok":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "warning":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "manual":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function AppDiagnosticsPanel() {
  const okItems = diagnostics.filter((item) => item.status === "ok");
  const warningItems = diagnostics.filter((item) => item.status === "warning");
  const manualItems = diagnostics.filter((item) => item.status === "manual");
  const diagnosticScore = Math.round(
    diagnostics.reduce((total, item) => {
      if (item.status === "ok") return total + 100;
      if (item.status === "warning") return total + 60;
      return total + 45;
    }, 0) / diagnostics.length
  );

  return (
    <div className="space-y-4">
      <Card className="border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            App Diagnostics Panel
          </CardTitle>
          <CardDescription>
            Static admin diagnostics for build, routes, blockers, demo labels, types, mobile UX, and empty states.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Diagnostic Score</p>
              <p className="text-2xl font-bold">{diagnosticScore}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">OK</p>
              <p className="text-2xl font-bold text-green-600">{okItems.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold text-amber-600">{warningItems.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Manual</p>
              <p className="text-2xl font-bold text-blue-600">{manualItems.length}</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            This panel is a static checklist. The real proof is still build, lint, QA testing, and pilot feedback.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnostics Matrix</CardTitle>
          <CardDescription>Quick checks for admin release review.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Check</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnostics.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.area}</TableCell>
                    <TableCell>{item.check}</TableCell>
                    <TableCell>
                      <Badge className={getStatusClass(item.status)}>{getStatusLabel(item.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.value}</TableCell>
                    <TableCell className="max-w-lg text-sm text-muted-foreground">{item.recommendation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Safe Diagnostic Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Show only operational checklist information.</p>
          <p>Do not display private user records or raw configuration values in admin diagnostics.</p>
          <p>Use diagnostics as a guide, not as a replacement for testing.</p>
        </CardContent>
      </Card>
    </div>
  );
}

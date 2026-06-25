import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, ClipboardCheck, Rocket } from "lucide-react";

type RCStatus = "done" | "review" | "manual" | "blocked";
type RCCategory = "Build" | "Auth" | "Data" | "Routes" | "Trust" | "UX" | "Docs" | "Launch";

type ReleaseCandidateCheck = {
  id: string;
  category: RCCategory;
  check: string;
  status: RCStatus;
  evidence: string;
  action: string;
};

const releaseCandidateChecks: ReleaseCandidateCheck[] = [
  {
    id: "build-command",
    category: "Build",
    check: "Production build command reviewed",
    status: "manual",
    evidence: "Build command is documented in admin build/version panels.",
    action: "Run npm run build in Lovable, local, or CI before release candidate approval.",
  },
  {
    id: "lint-command",
    category: "Build",
    check: "Lint command reviewed",
    status: "manual",
    evidence: "Lint command is documented for release review.",
    action: "Run npm run lint and fix warnings that affect reliability or accessibility.",
  },
  {
    id: "route-safety",
    category: "Routes",
    check: "Route safety matrix visible",
    status: "done",
    evidence: "Routes tab includes route groups, access levels, blockers, and next actions.",
    action: "Review public, admin, finance-demo, institution, and verification routes before demo.",
  },
  {
    id: "broken-links",
    category: "Routes",
    check: "Broken link scanner visible",
    status: "review",
    evidence: "Static scanner highlights placeholder links, legacy domains, and finance route risks.",
    action: "Fix README placeholder and legacy domain references before public release.",
  },
  {
    id: "auth-roles",
    category: "Auth",
    check: "Role-based route enforcement",
    status: "review",
    evidence: "Admin pages have frontend protection, but role-aware ProtectedRoute still needs expansion.",
    action: "Add allowedRoles support and pair it with backend data rules.",
  },
  {
    id: "rls-review",
    category: "Data",
    check: "Backend data protection review",
    status: "blocked",
    evidence: "Production blockers panel marks backend policy verification as critical.",
    action: "Do not approve production until data access rules are designed, tested, and documented.",
  },
  {
    id: "generated-types",
    category: "Data",
    check: "Generated project types",
    status: "review",
    evidence: "Fallback data types are active for compile resilience.",
    action: "Generate real project types from staging before production freeze.",
  },
  {
    id: "demo-money-labels",
    category: "Trust",
    check: "Money-facing modules labelled demo-only",
    status: "review",
    evidence: "Build and blockers panels flag funding, billing, wallet, escrow, payout, and refund copy.",
    action: "Add shared demo labels to all money-facing pages before investor or university demos.",
  },
  {
    id: "ai-safety-copy",
    category: "Trust",
    check: "AI and trust copy reviewed",
    status: "review",
    evidence: "Production blockers panel flags AI safety and trust copy for review.",
    action: "Avoid unsupported claims and add clear limitations for AI-assisted research workflows.",
  },
  {
    id: "mobile-admin",
    category: "UX",
    check: "Admin dashboard mobile layout",
    status: "done",
    evidence: "Admin panels use responsive cards, flex wrapping tabs, and overflow tables.",
    action: "Manually test key admin tabs on mobile viewport before pilot.",
  },
  {
    id: "empty-states",
    category: "UX",
    check: "Empty and error states reviewed",
    status: "manual",
    evidence: "Diagnostics panel marks empty/error state review as ongoing.",
    action: "Check pages that rely on remote data and ensure they do not show blank screens.",
  },
  {
    id: "release-notes",
    category: "Docs",
    check: "Release notes prepared",
    status: "manual",
    evidence: "Version panel recommends release notes after feature batches.",
    action: "Create a short release note after every 10 pushed features.",
  },
  {
    id: "readme-cleanup",
    category: "Docs",
    check: "README and project links cleaned",
    status: "review",
    evidence: "Broken link scanner flags placeholder Lovable link and legacy domain references.",
    action: "Update README with real project purpose, local setup, and final project URL when available.",
  },
  {
    id: "launch-decision",
    category: "Launch",
    check: "Release candidate decision",
    status: "blocked",
    evidence: "Critical production blockers remain open.",
    action: "Approve demo/pilot only, not production, until critical blockers are resolved.",
  },
];

const getStatusLabel = (status: RCStatus) => {
  switch (status) {
    case "done":
      return "Done";
    case "review":
      return "Review";
    case "manual":
      return "Manual";
    case "blocked":
      return "Blocked";
    default:
      return "Unknown";
  }
};

const getStatusClass = (status: RCStatus) => {
  switch (status) {
    case "done":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "review":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "manual":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "blocked":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function ReleaseCandidateChecklistPanel() {
  const doneChecks = releaseCandidateChecks.filter((check) => check.status === "done");
  const reviewChecks = releaseCandidateChecks.filter((check) => check.status === "review");
  const manualChecks = releaseCandidateChecks.filter((check) => check.status === "manual");
  const blockedChecks = releaseCandidateChecks.filter((check) => check.status === "blocked");
  const rcScore = Math.round(
    releaseCandidateChecks.reduce((total, check) => {
      if (check.status === "done") return total + 100;
      if (check.status === "review") return total + 60;
      if (check.status === "manual") return total + 45;
      return total;
    }, 0) / releaseCandidateChecks.length
  );

  return (
    <div className="space-y-4">
      <Card className={blockedChecks.length > 0 ? "border-red-500/40" : "border-green-500/30"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {blockedChecks.length > 0 ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
            Release Candidate Checklist
          </CardTitle>
          <CardDescription>
            Admin release-gate checklist for build, auth, data, routes, trust, UX, docs, and launch decision readiness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">RC Score</p>
              <p className="text-2xl font-bold">{rcScore}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Done</p>
              <p className="text-2xl font-bold text-green-600">{doneChecks.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Review</p>
              <p className="text-2xl font-bold text-amber-600">{reviewChecks.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Manual</p>
              <p className="text-2xl font-bold text-blue-600">{manualChecks.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{blockedChecks.length}</p>
            </div>
          </div>

          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">
            Current recommendation: demo or pilot review only. Production approval should wait until blocked data, policy, and release-decision items are resolved.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            RC Checklist Matrix
          </CardTitle>
          <CardDescription>
            Use this checklist as a quick founder/admin release-candidate review before sharing the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Check</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {releaseCandidateChecks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell className="font-medium">{check.category}</TableCell>
                    <TableCell className="min-w-56">{check.check}</TableCell>
                    <TableCell>
                      <Badge className={getStatusClass(check.status)}>{getStatusLabel(check.status)}</Badge>
                    </TableCell>
                    <TableCell className="min-w-72 text-sm text-muted-foreground">{check.evidence}</TableCell>
                    <TableCell className="min-w-72 text-sm">{check.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-500" />
            Release Decision Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Demo candidate: allowed when demo labels, basic routing, and admin checks are clear.</p>
          <p>Pilot candidate: requires manual build/lint checks and reviewed user-facing copy.</p>
          <p>Production candidate: requires resolved blockers, tested data access rules, and final launch approval.</p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";

type BlockerSeverity = "Critical" | "High" | "Medium" | "Low";
type BlockerStatus = "Open" | "Needs Review" | "Planned" | "Demo Safe";

type ProductionBlocker = {
  id: string;
  title: string;
  module: string;
  severity: BlockerSeverity;
  status: BlockerStatus;
  impact: string;
  recommendedFix: string;
  owner: string;
};

const productionBlockers: ProductionBlocker[] = [
  {
    id: "edge-functions-jwt",
    title: "Supabase edge functions need JWT/security review",
    module: "Supabase / Edge Functions",
    severity: "Critical",
    status: "Open",
    impact: "Unauthenticated functions can expose AI, analytics, audit, or workflow actions if promoted to production without review.",
    recommendedFix: "Review every verify_jwt=false function, enable JWT where required, add rate limits, and document public-only exceptions.",
    owner: "Backend/Security",
  },
  {
    id: "demo-finance-safety",
    title: "Finance, escrow, payouts, and funding must remain demo-only",
    module: "Billing / Wallet / Funding / Marketplace",
    severity: "Critical",
    status: "Needs Review",
    impact: "Users may assume real payments, escrow, refunds, payouts, or invoices are active.",
    recommendedFix: "Add shared demo finance labels to every money-facing page and avoid real payment claims until providers/legal review exist.",
    owner: "Product/Compliance",
  },
  {
    id: "rls-not-verified",
    title: "Backend RLS policies are not verified for production",
    module: "Database / Supabase",
    severity: "Critical",
    status: "Open",
    impact: "Frontend role checks alone cannot protect private student, project, report, admin, institution, or financial-demo records.",
    recommendedFix: "Create and test RLS policies for profiles, roles, projects, messages, reports, admin tables, and tenant data.",
    owner: "Backend/Security",
  },
  {
    id: "generated-types-pending",
    title: "Generated Supabase Database types are pending",
    module: "Type Safety",
    severity: "High",
    status: "Planned",
    impact: "Fallback types protect compilation but hide table/column mismatches that real generated types would catch.",
    recommendedFix: "Generate staging Supabase types and replace the fallback Database type before production.",
    owner: "Engineering",
  },
  {
    id: "role-route-hardening",
    title: "ProtectedRoute does not enforce allowed roles globally",
    module: "Auth / Routing",
    severity: "High",
    status: "Needs Review",
    impact: "Authenticated users may reach role-specific screens if only generic login protection is applied.",
    recommendedFix: "Add allowedRoles to ProtectedRoute and pair it with backend RLS/admin authorization.",
    owner: "Frontend/Security",
  },
  {
    id: "seo-domain-placeholder",
    title: "Legacy Lovable domain and placeholder project links remain",
    module: "SEO / Branding / README",
    severity: "High",
    status: "Open",
    impact: "Investors, testers, universities, and crawlers may land on old preview links or invalid Lovable placeholders.",
    recommendedFix: "Replace old preview domain and README placeholder with the approved final domain/project URL.",
    owner: "Product/Launch",
  },
  {
    id: "build-ci-missing",
    title: "Automated CI build check is not yet verified",
    module: "DevOps / Release",
    severity: "Medium",
    status: "Planned",
    impact: "Missing imports, lazy route default export errors, and lint/build failures can reach main unnoticed.",
    recommendedFix: "Add GitHub Actions workflow for npm ci, npm run build, and npm run lint.",
    owner: "Engineering",
  },
  {
    id: "privacy-trust-copy",
    title: "Trust, privacy, and AI safety copy needs final review",
    module: "Trust Center / AI / Public Pages",
    severity: "Medium",
    status: "Needs Review",
    impact: "Strong claims around security, escrow, AI, accreditation, or partnerships can reduce trust if not clearly marked as demo/planned.",
    recommendedFix: "Use demo/planned language, add limitations, and avoid official claims unless verified.",
    owner: "Product/Compliance",
  },
];

const getSeverityClass = (severity: BlockerSeverity) => {
  switch (severity) {
    case "Critical":
      return "bg-red-600/10 text-red-700 border-red-600/30";
    case "High":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "Medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "Low":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusClass = (status: BlockerStatus) => {
  switch (status) {
    case "Open":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "Needs Review":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "Planned":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "Demo Safe":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function ProductionBlockersPanel() {
  const criticalBlockers = productionBlockers.filter((blocker) => blocker.severity === "Critical");
  const highBlockers = productionBlockers.filter((blocker) => blocker.severity === "High");
  const openBlockers = productionBlockers.filter((blocker) => blocker.status === "Open");
  const reviewBlockers = productionBlockers.filter((blocker) => blocker.status === "Needs Review");
  const productionReadinessScore = Math.max(
    0,
    100 - criticalBlockers.length * 18 - highBlockers.length * 10 - reviewBlockers.length * 4
  );

  return (
    <div className="space-y-4">
      <Card className={criticalBlockers.length > 0 ? "border-red-500/40" : "border-green-500/30"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {criticalBlockers.length > 0 ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
            Admin Production Blockers Panel
          </CardTitle>
          <CardDescription>
            Founder/admin release gate for security, backend, demo-finance, routing, CI, SEO, and trust-copy blockers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Production Score</p>
              <p className="text-2xl font-bold">{productionReadinessScore}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-red-600">{criticalBlockers.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">High</p>
              <p className="text-2xl font-bold text-red-500">{highBlockers.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-red-600">{openBlockers.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Review</p>
              <p className="text-2xl font-bold text-amber-600">{reviewBlockers.length}</p>
            </div>
          </div>

          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">
            Do not launch production while critical blockers are open. Demo/pilot mode is acceptable only when finance, AI, privacy, and admin limitations are clearly labeled.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Production Blocker Matrix
          </CardTitle>
          <CardDescription>
            Track the most important blockers before production, investor demos, or university pilots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blocker</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Recommended Fix</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionBlockers.map((blocker) => (
                  <TableRow key={blocker.id}>
                    <TableCell className="min-w-52 font-medium">{blocker.title}</TableCell>
                    <TableCell className="min-w-44 text-sm text-muted-foreground">{blocker.module}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityClass(blocker.severity)}>{blocker.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusClass(blocker.status)}>{blocker.status}</Badge>
                    </TableCell>
                    <TableCell className="min-w-72 text-sm text-muted-foreground">{blocker.impact}</TableCell>
                    <TableCell className="min-w-72 text-sm">{blocker.recommendedFix}</TableCell>
                    <TableCell className="min-w-36 text-sm">{blocker.owner}</TableCell>
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

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Link2, Route, Shield } from "lucide-react";

type RouteHealthStatus = "ready" | "review" | "blocked" | "public";

type RouteHealthCheck = {
  id: string;
  module: string;
  path: string;
  access: "Public" | "Authenticated" | "Admin" | "Institution" | "Verification";
  status: RouteHealthStatus;
  evidence: string;
  nextAction: string;
};

type BrokenLinkStatus = "ok" | "review" | "broken" | "external";

type BrokenLinkCheck = {
  id: string;
  source: string;
  link: string;
  status: BrokenLinkStatus;
  risk: "Low" | "Medium" | "High" | "Critical";
  evidence: string;
  fix: string;
};

type ImportExportStatus = "safe" | "watch" | "risk" | "manual";

type ImportExportCheck = {
  id: string;
  area: string;
  pattern: string;
  status: ImportExportStatus;
  risk: "Low" | "Medium" | "High" | "Critical";
  evidence: string;
  fix: string;
};

const routeHealthChecks: RouteHealthCheck[] = [
  {
    id: "landing",
    module: "Marketing",
    path: "/",
    access: "Public",
    status: "public",
    evidence: "Landing page is intentionally public.",
    nextAction: "Keep public CTAs clear and avoid unsupported production claims.",
  },
  {
    id: "auth",
    module: "Auth",
    path: "/auth",
    access: "Public",
    status: "public",
    evidence: "Auth route is public so users can sign in or sign up.",
    nextAction: "Keep signup roles limited to safe public roles.",
  },
  {
    id: "home-dashboard",
    module: "Dashboard",
    path: "/home",
    access: "Authenticated",
    status: "ready",
    evidence: "Dashboard route is wrapped in ProtectedRoute.",
    nextAction: "Add onboarding-complete guard after role routing is finalized.",
  },
  {
    id: "projects-core",
    module: "Projects",
    path: "/deals, /workroom/:dealId, /project/:projectId/activity",
    access: "Authenticated",
    status: "review",
    evidence: "Core execution routes are authenticated but role-level checks are not centralized yet.",
    nextAction: "Add allowedRoles to project, supervisor, and sponsor routes.",
  },
  {
    id: "messages",
    module: "Messaging",
    path: "/messages, /messages/:threadId",
    access: "Authenticated",
    status: "review",
    evidence: "Messages routes are authenticated but backend membership/RLS must enforce thread privacy.",
    nextAction: "Verify conversation_participants RLS before production.",
  },
  {
    id: "research-ai",
    module: "AI & Research",
    path: "/research-gaps, /ai-prompts, /tools",
    access: "Authenticated",
    status: "review",
    evidence: "AI/research routes are protected but AI safety acknowledgement is not guaranteed globally.",
    nextAction: "Add AI safety acknowledgement and unsafe-output reporting flow.",
  },
  {
    id: "finance",
    module: "Finance Demo",
    path: "/billing, /checkout, /wallet, /subscriptions",
    access: "Authenticated",
    status: "blocked",
    evidence: "Finance-like routes must remain demo-only until real providers and legal review exist.",
    nextAction: "Add shared DemoFinanceBadge to every finance-facing route.",
  },
  {
    id: "admin-core",
    module: "Admin",
    path: "/admin/*",
    access: "Admin",
    status: "review",
    evidence: "Admin routes are behind ProtectedRoute and AdminLayout, but backend RLS is still required.",
    nextAction: "Upgrade ProtectedRoute with allowedRoles and add RLS policies.",
  },
  {
    id: "super-admin",
    module: "Super Admin",
    path: "/super-admin/*",
    access: "Admin",
    status: "review",
    evidence: "Super-admin pages exist but frontend role isolation is not enough for production.",
    nextAction: "Restrict with super_admin role in frontend and backend RLS.",
  },
  {
    id: "institution",
    module: "Institution",
    path: "/institution/*",
    access: "Institution",
    status: "review",
    evidence: "Institution routes need tenant/institution boundary enforcement.",
    nextAction: "Add institution_id/tenant_id filters and tenant RLS before pilots.",
  },
  {
    id: "certificate-verify",
    module: "Verification",
    path: "/verify, /verify/:certificateId",
    access: "Verification",
    status: "public",
    evidence: "Verification pages can be public, but certificate data must not expose private records.",
    nextAction: "Use public-safe verification payloads only.",
  },
  {
    id: "not-found",
    module: "Fallback",
    path: "*",
    access: "Public",
    status: "ready",
    evidence: "NotFound fallback route exists in the app router.",
    nextAction: "Keep fallback helpful with links back to safe public pages.",
  },
];

const brokenLinkChecks: BrokenLinkCheck[] = [
  {
    id: "readme-handoff-docs",
    source: "README / release docs",
    link: "README.md, RELEASE_CHECKLIST.md, DEPLOYMENT_GUIDE.md",
    status: "ok",
    risk: "Low",
    evidence: "README now points maintainers to local release, deployment, security, issue, PR, and owner-review docs.",
    fix: "Keep handoff docs synchronized whenever release or deployment flow changes.",
  },
  {
    id: "production-domain-readiness",
    source: "SEO / canonical / sitemap / structured data",
    link: "Final production domain",
    status: "review",
    risk: "Medium",
    evidence: "Admin QA no longer hardcodes old preview domains, but final production SEO URLs still need owner confirmation.",
    fix: "Set canonical URLs, sitemap entries, structured data, and Supabase redirects to the approved production domain before launch.",
  },
  {
    id: "admin-links",
    source: "Admin navigation",
    link: "/admin/*",
    status: "review",
    risk: "Medium",
    evidence: "Admin links exist and are protected by frontend checks, but role/RLS enforcement still needs backend verification.",
    fix: "Add role-aware ProtectedRoute and Supabase RLS for admin-only data.",
  },
  {
    id: "finance-links",
    source: "Billing / checkout / wallet / subscriptions",
    link: "/billing, /checkout, /wallet, /subscriptions",
    status: "review",
    risk: "Critical",
    evidence: "Finance-like routes can look real if demo labels are missing or inconsistent.",
    fix: "Add DemoFinanceBadge and no-real-payment copy to every finance-facing route.",
  },
  {
    id: "public-verify-links",
    source: "Certificate verification",
    link: "/verify, /verify/:certificateId",
    status: "ok",
    risk: "Low",
    evidence: "Public verification routes are intentional but should only expose public-safe certificate data.",
    fix: "Keep private student/project details out of public verification payloads.",
  },
  {
    id: "external-docs-links",
    source: "Documentation / setup links",
    link: "External docs links",
    status: "external",
    risk: "Medium",
    evidence: "External links can change and should be checked manually before investor/university demos.",
    fix: "Add rel=noopener for target blank links and verify external docs during release QA.",
  },
  {
    id: "fallback-route",
    source: "Unknown routes",
    link: "*",
    status: "ok",
    risk: "Low",
    evidence: "Fallback route exists, so unknown internal links should land on NotFound instead of a blank page.",
    fix: "Keep NotFound page helpful with safe links back to home, help, and login.",
  },
];

const importExportChecks: ImportExportCheck[] = [
  {
    id: "auth-redirect-export",
    area: "AuthContext exports",
    pattern: "getRoleBasedRedirect",
    status: "safe",
    risk: "Low",
    evidence: "The role redirect helper is exported from AuthContext and can be imported by AuthPage.",
    fix: "Keep this export stable while role routing is expanded.",
  },
  {
    id: "supabase-types-fallback",
    area: "Supabase types",
    pattern: "Database / Json",
    status: "watch",
    risk: "Medium",
    evidence: "Database and Json are available through fallback types, but real generated types are still pending.",
    fix: "Generate Supabase types from staging and replace the fallback before production.",
  },
  {
    id: "lazy-route-imports",
    area: "App.tsx lazy imports",
    pattern: "lazy(() => import('./pages/...'))",
    status: "manual",
    risk: "High",
    evidence: "The app has many lazy page imports. A missing default export will only fail during build/runtime.",
    fix: "Run npm run build after every route/page addition and keep every lazy page as a default export.",
  },
  {
    id: "ui-component-exports",
    area: "shadcn/ui imports",
    pattern: "@/components/ui/*",
    status: "safe",
    risk: "Low",
    evidence: "Admin health panels use existing Card, Badge, Tabs, and Table component exports.",
    fix: "Use existing UI exports instead of creating duplicate component names.",
  },
  {
    id: "admin-panel-exports",
    area: "Admin panels",
    pattern: "named component exports",
    status: "watch",
    risk: "Medium",
    evidence: "New admin panels should use named exports when imported into an existing page.",
    fix: "Match named imports exactly, for example import { RouteHealthPanel } from '@/components/admin/RouteHealthPanel'.",
  },
  {
    id: "alias-resolution",
    area: "Path aliases",
    pattern: "@/",
    status: "safe",
    risk: "Low",
    evidence: "Vite config defines @ as src, so alias imports should resolve in Lovable and local builds.",
    fix: "Avoid deep relative paths when shared aliases already exist.",
  },
  {
    id: "barrel-exports",
    area: "Index/barrel files",
    pattern: "index.ts exports",
    status: "manual",
    risk: "Medium",
    evidence: "Large apps often break when a component is moved but barrel exports are not updated.",
    fix: "When moving shared components, update barrel exports or import from the direct file path.",
  },
  {
    id: "icon-imports",
    area: "Lucide icons",
    pattern: "lucide-react named icons",
    status: "watch",
    risk: "Medium",
    evidence: "Lucide named imports must match available icon names in the installed package.",
    fix: "Prefer already-used icons or run npm run build after adding new icon imports.",
  },
];

const getRouteStatusLabel = (status: RouteHealthStatus) => {
  switch (status) {
    case "ready":
      return "Ready";
    case "review":
      return "Needs Review";
    case "blocked":
      return "Blocker";
    case "public":
      return "Public OK";
    default:
      return "Unknown";
  }
};

const getRouteStatusClass = (status: RouteHealthStatus) => {
  switch (status) {
    case "ready":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "review":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "blocked":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "public":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getBrokenLinkStatusLabel = (status: BrokenLinkStatus) => {
  switch (status) {
    case "ok":
      return "OK";
    case "review":
      return "Review";
    case "broken":
      return "Broken";
    case "external":
      return "External";
    default:
      return "Unknown";
  }
};

const getBrokenLinkStatusClass = (status: BrokenLinkStatus) => {
  switch (status) {
    case "ok":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "review":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "broken":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "external":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getImportExportStatusLabel = (status: ImportExportStatus) => {
  switch (status) {
    case "safe":
      return "Safe";
    case "watch":
      return "Watch";
    case "risk":
      return "Risk";
    case "manual":
      return "Manual";
    default:
      return "Unknown";
  }
};

const getImportExportStatusClass = (status: ImportExportStatus) => {
  switch (status) {
    case "safe":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "watch":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "risk":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "manual":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getRiskClass = (risk: BrokenLinkCheck["risk"] | ImportExportCheck["risk"]) => {
  switch (risk) {
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

export function RouteHealthPanel() {
  const readyRoutes = routeHealthChecks.filter((check) => check.status === "ready");
  const reviewRoutes = routeHealthChecks.filter((check) => check.status === "review");
  const blockedRoutes = routeHealthChecks.filter((check) => check.status === "blocked");
  const publicRoutes = routeHealthChecks.filter((check) => check.status === "public");
  const brokenLinks = brokenLinkChecks.filter((check) => check.status === "broken");
  const reviewLinks = brokenLinkChecks.filter((check) => check.status === "review");
  const okLinks = brokenLinkChecks.filter((check) => check.status === "ok");
  const externalLinks = brokenLinkChecks.filter((check) => check.status === "external");
  const importExportSafe = importExportChecks.filter((check) => check.status === "safe");
  const importExportWatch = importExportChecks.filter((check) => check.status === "watch");
  const importExportRisk = importExportChecks.filter((check) => check.status === "risk");
  const importExportManual = importExportChecks.filter((check) => check.status === "manual");
  const importExportScore = Math.round(
    importExportChecks.reduce((total, check) => {
      if (check.status === "safe") return total + 100;
      if (check.status === "watch") return total + 65;
      if (check.status === "manual") return total + 45;
      return total;
    }, 0) / importExportChecks.length
  );
  const linkReadinessScore = Math.round(
    brokenLinkChecks.reduce((total, check) => {
      if (check.status === "ok") return total + 100;
      if (check.status === "external") return total + 70;
      if (check.status === "review") return total + 45;
      return total;
    }, 0) / brokenLinkChecks.length
  );
  const routeReadinessScore = Math.round(
    routeHealthChecks.reduce((total, check) => {
      if (check.status === "ready") return total + 100;
      if (check.status === "public") return total + 85;
      if (check.status === "review") return total + 55;
      return total;
    }, 0) / routeHealthChecks.length
  );

  return (
    <div className="space-y-4">
      <Card className={blockedRoutes.length > 0 ? "border-red-500/40" : "border-green-500/30"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {blockedRoutes.length > 0 ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
            Route Health Checker
          </CardTitle>
          <CardDescription>
            Static route safety map for public, protected, admin, institution, finance-demo, and verification routes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Route Score</p>
              <p className="text-2xl font-bold">{routeReadinessScore}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Ready</p>
              <p className="text-2xl font-bold text-green-600">{readyRoutes.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Public OK</p>
              <p className="text-2xl font-bold text-blue-600">{publicRoutes.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Needs Review</p>
              <p className="text-2xl font-bold text-amber-600">{reviewRoutes.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Blockers</p>
              <p className="text-2xl font-bold text-red-600">{blockedRoutes.length}</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            Frontend route checks are only a UX layer. Production security still needs Supabase RLS, tenant filters, and backend authorization checks.
          </div>
        </CardContent>
      </Card>

      <Card className={brokenLinks.length > 0 ? "border-red-500/40" : "border-green-500/30"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {brokenLinks.length > 0 ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
            Broken Link Scanner
          </CardTitle>
          <CardDescription>
            Static link-readiness scan for release docs, production-domain readiness, external docs, admin links, and finance-demo routes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Link Score</p>
              <p className="text-2xl font-bold">{linkReadinessScore}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">OK</p>
              <p className="text-2xl font-bold text-green-600">{okLinks.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">External</p>
              <p className="text-2xl font-bold text-blue-600">{externalLinks.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Review</p>
              <p className="text-2xl font-bold text-amber-600">{reviewLinks.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Broken</p>
              <p className="text-2xl font-bold text-red-600">{brokenLinks.length}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Fix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brokenLinkChecks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell className="font-medium">{check.source}</TableCell>
                    <TableCell className="font-mono text-xs">{check.link}</TableCell>
                    <TableCell>
                      <Badge className={getBrokenLinkStatusClass(check.status)}>
                        <Link2 className="mr-1 h-3 w-3" />
                        {getBrokenLinkStatusLabel(check.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskClass(check.risk)}>{check.risk}</Badge>
                    </TableCell>
                    <TableCell className="max-w-sm text-sm text-muted-foreground">{check.evidence}</TableCell>
                    <TableCell className="max-w-sm text-sm">{check.fix}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            This scanner is a static admin QA checklist. For automated scanning, add a CI job later that crawls built routes and fails on invalid internal links.
          </div>
        </CardContent>
      </Card>

      <Card className={importExportRisk.length > 0 ? "border-red-500/40" : "border-amber-500/30"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {importExportRisk.length > 0 ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
            Missing Import/Export Detector
          </CardTitle>
          <CardDescription>
            Static import/export risk scanner for lazy routes, named exports, Supabase types, UI imports, path aliases, and icon imports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Import Score</p>
              <p className="text-2xl font-bold">{importExportScore}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Safe</p>
              <p className="text-2xl font-bold text-green-600">{importExportSafe.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Watch</p>
              <p className="text-2xl font-bold text-amber-600">{importExportWatch.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Manual</p>
              <p className="text-2xl font-bold text-blue-600">{importExportManual.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Risk</p>
              <p className="text-2xl font-bold text-red-600">{importExportRisk.length}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Fix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importExportChecks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell className="font-medium">{check.area}</TableCell>
                    <TableCell className="font-mono text-xs">{check.pattern}</TableCell>
                    <TableCell>
                      <Badge className={getImportExportStatusClass(check.status)}>
                        {getImportExportStatusLabel(check.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskClass(check.risk)}>{check.risk}</Badge>
                    </TableCell>
                    <TableCell className="max-w-sm text-sm text-muted-foreground">{check.evidence}</TableCell>
                    <TableCell className="max-w-sm text-sm">{check.fix}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            This detector is a static QA guard. The real source of truth is still <code className="rounded bg-background px-1 py-0.5">npm run build</code>, because TypeScript/Vite will catch missing imports, missing default exports, and unresolved aliases.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Route Safety Matrix
          </CardTitle>
          <CardDescription>
            Use this matrix before release to decide which route group is safe for demo, pilot, or production review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Next Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routeHealthChecks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell className="font-medium">{check.module}</TableCell>
                    <TableCell className="font-mono text-xs">{check.path}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="whitespace-nowrap">
                        <Shield className="mr-1 h-3 w-3" />
                        {check.access}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRouteStatusClass(check.status)}>{getRouteStatusLabel(check.status)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-sm text-sm text-muted-foreground">{check.evidence}</TableCell>
                    <TableCell className="max-w-sm text-sm">{check.nextAction}</TableCell>
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

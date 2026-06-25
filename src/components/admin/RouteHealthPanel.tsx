import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Route, Shield } from "lucide-react";

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

export function RouteHealthPanel() {
  const readyRoutes = routeHealthChecks.filter((check) => check.status === "ready");
  const reviewRoutes = routeHealthChecks.filter((check) => check.status === "review");
  const blockedRoutes = routeHealthChecks.filter((check) => check.status === "blocked");
  const publicRoutes = routeHealthChecks.filter((check) => check.status === "public");
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

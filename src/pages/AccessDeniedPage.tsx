import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Home, Lock, Shield } from "lucide-react";
import { RoleRequestPanel } from "@/components/auth/RoleRequestPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRoleDashboardPath, getRoleLabel } from "@/config/roles";
import { useAuth } from "@/contexts/AuthContext";

type AccessDeniedState = {
  from?: string;
  accessDenied?: boolean;
  requiredRoles?: string[];
  currentRole?: string;
};

type AccessDeniedPageProps = {
  deniedPath?: string;
  requiredRoles?: string[];
  currentRole?: string;
};

export default function AccessDeniedPage({ deniedPath, requiredRoles, currentRole }: AccessDeniedPageProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuth();
  const state = (location.state || {}) as AccessDeniedState;
  const currentRoleLabel = currentRole ?? state.currentRole ?? getRoleLabel(userRole?.role);
  const allowedRoleLabels = requiredRoles ?? state.requiredRoles ?? [];
  const dashboardPath = user ? getRoleDashboardPath(userRole?.role) : "/auth";
  const requestedPath = deniedPath ?? state.from ?? "the requested page";

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-red-500/30 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <Lock className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <Badge className="mb-3 bg-red-500/10 text-red-600 border-red-500/30">
                <Shield className="mr-1 h-3 w-3" /> Access Control
              </Badge>
              <CardTitle className="text-3xl">Access Denied</CardTitle>
              <CardDescription className="mt-2 text-base">
                You are signed in, but your current role does not have permission to open this page.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                <div>
                  <p className="font-medium">Requested page</p>
                  <p className="text-muted-foreground break-all">{requestedPath}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Current role</p>
                <p className="text-muted-foreground">{currentRoleLabel}</p>
              </div>
              {allowedRoleLabels.length ? (
                <div>
                  <p className="font-medium">Allowed roles</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {allowedRoleLabels.map((role) => (
                      <Badge key={role} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
              Frontend access checks improve user experience, but production security still requires backend authorization and data access rules.
            </div>

            <RoleRequestPanel sourcePath={requestedPath} requiredRoleLabels={allowedRoleLabels} />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={() => navigate(dashboardPath, { replace: true })}>
                <Home className="mr-2 h-4 w-4" /> Go to my dashboard
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go back
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Need access? Submit a role request or contact an administrator for urgent review.
            </p>
            <div className="text-center">
              <Link to="/" className="text-sm text-primary hover:underline">Return to public home</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

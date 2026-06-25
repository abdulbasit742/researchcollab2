import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRoleLabel, type AppRole } from "@/config/roles";
import { useAuth } from "@/contexts/AuthContext";
import AccessDeniedPage from "@/pages/AccessDeniedPage";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  redirectTo?: string;
  unauthorizedTo?: string;
}

function RouteLoadingState({ message = "Verifying session…" }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/auth",
  unauthorizedTo,
}: ProtectedRouteProps) {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoadingState />;
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles?.length) {
    if (!userRole) {
      return <RouteLoadingState message="Checking role access…" />;
    }

    const hasAllowedRole = allowedRoles.includes(userRole.role);

    if (!hasAllowedRole) {
      const requiredRoles = allowedRoles.map((role) => getRoleLabel(role));
      const currentRole = getRoleLabel(userRole.role);

      if (unauthorizedTo) {
        return (
          <Navigate
            to={unauthorizedTo}
            state={{
              from: location.pathname,
              accessDenied: true,
              requiredRoles,
              currentRole,
            }}
            replace
          />
        );
      }

      return (
        <AccessDeniedPage
          deniedPath={location.pathname}
          requiredRoles={requiredRoles}
          currentRole={currentRole}
        />
      );
    }
  }

  return <>{children}</>;
}

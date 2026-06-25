import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRoleLabel, ONBOARDING_PATH, type AppRole } from "@/config/roles";
import { useAuth } from "@/contexts/AuthContext";
import AccessDeniedPage from "@/pages/AccessDeniedPage";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  redirectTo?: string;
  unauthorizedTo?: string;
  requireOnboarding?: boolean;
  onboardingTo?: string;
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
  requireOnboarding = true,
  onboardingTo = ONBOARDING_PATH,
}: ProtectedRouteProps) {
  const { user, profile, userRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoadingState />;
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  const isOnboardingRoute = location.pathname === onboardingTo;
  const onboardingIncomplete = profile?.onboarding_completed !== true;

  if (requireOnboarding && onboardingIncomplete && !isOnboardingRoute) {
    return (
      <Navigate
        to={onboardingTo}
        state={{
          from: location.pathname,
          onboardingRequired: true,
        }}
        replace
      />
    );
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

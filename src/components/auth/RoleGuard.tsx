import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RoleGuardProps {
  children: ReactNode;
  /** Allowed roles — user must have at least one */
  allowedRoles: string[];
  /** Where to redirect if role check fails (default: /home) */
  fallback?: string;
}

/**
 * Role-based access guard.
 * Wraps inside <ProtectedRoute> — assumes user is already authenticated.
 */
export function RoleGuard({ children, allowedRoles, fallback = "/home" }: RoleGuardProps) {
  const { userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!userRole || !allowedRoles.includes(userRole.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

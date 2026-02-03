import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Redirect admin dashboard to the main admin portal
export default function AdminDashboard() {
  const { userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only allow admins to access admin dashboard
  if (userRole?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Redirect to main admin portal
  return <Navigate to="/admin" replace />;
}

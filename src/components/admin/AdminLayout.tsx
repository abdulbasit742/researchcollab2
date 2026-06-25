import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminSearchBar } from "./AdminSearchBar";
import { ADMIN_ROLES, getRoleDashboardPath, normalizeRole } from "@/config/roles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      if (userRole && ADMIN_ROLES.includes(userRole.role)) {
        setIsAdmin(true);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const resolvedRole = normalizeRole(data?.role);

      if (ADMIN_ROLES.includes(resolvedRole)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate(getRoleDashboardPath(resolvedRole));
      }
    };

    checkAdmin();
  }, [user, userRole, navigate]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4 md:px-6">
              <AdminMobileNav />
              <div className="flex-1 hidden md:block">
                <AdminSearchBar />
              </div>
              <div className="md:hidden flex-1">
                <AdminSearchBar />
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

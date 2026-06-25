import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoleRequestsPanel } from "@/components/admin/AdminRoleRequestsPanel";
import { ShieldCheck } from "lucide-react";

export default function AdminRoleRequestsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Role Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Review access requests submitted by users from protected role-gated workflows.
          </p>
        </div>

        <AdminRoleRequestsPanel />
      </div>
    </AdminLayout>
  );
}

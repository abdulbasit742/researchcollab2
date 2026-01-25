import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { commonBulkActions } from "@/components/admin/BulkActionsBar";
import { useAdminUsers, AdminUser } from "@/hooks/useAdminUsers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Shield, Ban, UserCheck, Eye, Download } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { exportToCSV, userColumns } from "@/lib/csvExport";
import { logAdminAction } from "@/hooks/useAdminAuditLog";

export default function AdminUsersPage() {
  const { users, loading, updateUserRole, blockUser, unblockUser } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const handleRoleChange = async (userId: string, role: "student" | "researcher" | "admin") => {
    const result = await updateUserRole(userId, role);
    if (result.success) {
      toast.success(`User role updated to ${role}`);
      logAdminAction("user_role_changed", "user", userId, { new_role: role });
    } else {
      toast.error(`Failed to update role: ${result.error}`);
    }
  };

  const handleBlock = async (userId: string) => {
    if (!currentUser) return;
    const result = await blockUser(userId, currentUser.id);
    if (result.success) {
      toast.success("User blocked successfully");
      logAdminAction("user_blocked", "user", userId);
    } else {
      toast.error(`Failed to block user: ${result.error}`);
    }
  };

  const handleUnblock = async (userId: string) => {
    if (!currentUser) return;
    const result = await unblockUser(userId, currentUser.id);
    if (result.success) {
      toast.success("User unblocked successfully");
      logAdminAction("user_unblocked", "user", userId);
    } else {
      toast.error(`Failed to unblock user: ${result.error}`);
    }
  };

  const handleExportUsers = () => {
    exportToCSV(users, "users-export", userColumns);
    toast.success("Users exported to CSV");
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (!currentUser) return;
    
    let successCount = 0;
    let failCount = 0;

    for (const userId of selectedIds) {
      try {
        if (actionId === "block") {
          const result = await blockUser(userId, currentUser.id);
          if (result.success) {
            successCount++;
            logAdminAction("user_blocked", "user", userId, { bulk: true });
          } else failCount++;
        } else if (actionId === "unblock") {
          const result = await unblockUser(userId, currentUser.id);
          if (result.success) {
            successCount++;
            logAdminAction("user_unblocked", "user", userId, { bulk: true });
          } else failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${actionId === "block" ? "Blocked" : "Unblocked"} ${successCount} user(s)`);
    }
    if (failCount > 0) {
      toast.error(`Failed to process ${failCount} user(s)`);
    }
  };

  const bulkActions = [
    commonBulkActions.block,
    commonBulkActions.unblock,
  ];

  const columns = [
    {
      key: "full_name",
      header: "Name",
      sortable: true,
      render: (user: AdminUser) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
            {(user.full_name || user.first_name || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">{user.university || "No university"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user: AdminUser) => (
        <Badge variant={user.user_role === "admin" ? "default" : user.user_role === "researcher" ? "secondary" : "outline"}>
          {user.user_role || user.role || "student"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      sortable: true,
      render: (user: AdminUser) => format(new Date(user.created_at), "MMM d, yyyy"),
    },
    {
      key: "status",
      header: "Status",
      render: (user: AdminUser) => (
        <div className="flex gap-1">
          {user.is_blocked && <Badge variant="destructive">Blocked</Badge>}
          {user.onboarding_completed && <Badge variant="secondary">Onboarded</Badge>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: AdminUser) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleRoleChange(user.id, "student")}>
              <UserCheck className="h-4 w-4 mr-2" />
              Make Student
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange(user.id, "researcher")}>
              <UserCheck className="h-4 w-4 mr-2" />
              Make Researcher
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
              <Shield className="h-4 w-4 mr-2" />
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.is_blocked ? (
              <DropdownMenuItem onClick={() => handleUnblock(user.id)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Unblock User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleBlock(user.id)} className="text-destructive">
                <Ban className="h-4 w-4 mr-2" />
                Block User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              View and manage all platform users
            </p>
          </div>
          <Button variant="outline" onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          searchKey="full_name"
          searchPlaceholder="Search users..."
          pageSize={15}
          selectable
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
        />

        {/* User Details Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Viewing details for {selectedUser?.full_name || "Unknown User"}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedUser.full_name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{selectedUser.user_role || selectedUser.role || "student"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">University</p>
                    <p className="font-medium">{selectedUser.university || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Department</p>
                    <p className="font-medium">{selectedUser.department || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedUser.location || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Joined</p>
                    <p className="font-medium">{format(new Date(selectedUser.created_at), "MMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  {selectedUser.is_blocked ? (
                    <Button onClick={() => { handleUnblock(selectedUser.id); setSelectedUser(null); }}>
                      Unblock User
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={() => { handleBlock(selectedUser.id); setSelectedUser(null); }}>
                      Block User
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

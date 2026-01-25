import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuditLog, AuditLogEntry } from "@/hooks/useAdminAuditLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Search, Filter, Clock, User, Activity } from "lucide-react";
import { exportToCSV, auditLogColumns } from "@/lib/csvExport";
import { formatDistanceToNow } from "date-fns";

const actionLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  user_blocked: { label: "User Blocked", variant: "destructive" },
  user_unblocked: { label: "User Unblocked", variant: "secondary" },
  user_role_changed: { label: "Role Changed", variant: "default" },
  verification_approved: { label: "Verification Approved", variant: "default" },
  verification_rejected: { label: "Verification Rejected", variant: "destructive" },
  dispute_resolved: { label: "Dispute Resolved", variant: "secondary" },
  tool_created: { label: "Tool Created", variant: "default" },
  tool_updated: { label: "Tool Updated", variant: "secondary" },
  tool_deleted: { label: "Tool Deleted", variant: "destructive" },
  project_deleted: { label: "Project Deleted", variant: "destructive" },
  settings_updated: { label: "Settings Updated", variant: "secondary" },
  order_fulfilled: { label: "Order Fulfilled", variant: "default" },
  subscription_cancelled: { label: "Subscription Cancelled", variant: "destructive" },
  subscription_extended: { label: "Subscription Extended", variant: "default" },
  report_resolved: { label: "Report Resolved", variant: "secondary" },
  report_dismissed: { label: "Report Dismissed", variant: "outline" },
};

const entityIcons: Record<string, React.ReactNode> = {
  user: <User className="h-4 w-4" />,
  verification: <Activity className="h-4 w-4" />,
  dispute: <Activity className="h-4 w-4" />,
  tool: <Activity className="h-4 w-4" />,
  project: <Activity className="h-4 w-4" />,
  settings: <Activity className="h-4 w-4" />,
  order: <Activity className="h-4 w-4" />,
  subscription: <Activity className="h-4 w-4" />,
  report: <Activity className="h-4 w-4" />,
};

export default function AdminAuditLogPage() {
  const { logs, loading, fetchLogs } = useAdminAuditLog();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.admin_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const handleExport = () => {
    exportToCSV(filteredLogs, "admin-audit-log", auditLogColumns);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
            <p className="text-muted-foreground">
              Track all admin actions for accountability
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  logs.filter(
                    (log) =>
                      new Date(log.created_at).toDateString() ===
                      new Date().toDateString()
                  ).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  logs.filter((log) => {
                    const logDate = new Date(log.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return logDate >= weekAgo;
                  }).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unique Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(logs.map((log) => log.admin_id)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.entries(actionLabels).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="dispute">Dispute</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardContent className="pt-6">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No activity logs found</h3>
                <p className="text-muted-foreground">
                  Admin actions will appear here once they occur
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.admin_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            actionLabels[log.action]?.variant || "secondary"
                          }
                        >
                          {actionLabels[log.action]?.label || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entityIcons[log.entity_type] || (
                            <Activity className="h-4 w-4" />
                          )}
                          <span className="capitalize">{log.entity_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                          {log.details && Object.keys(log.details).length > 0
                            ? JSON.stringify(log.details).slice(0, 50) + "..."
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

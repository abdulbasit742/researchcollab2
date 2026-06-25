import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Clock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRoleLabel, type AppRole } from "@/config/roles";
import { supabase } from "@/integrations/supabase/client";

type RoleRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

type RoleRequestRow = {
  id: string;
  user_id: string;
  current_role: AppRole | string;
  requested_role: AppRole | string;
  reason: string | null;
  source_path: string | null;
  status: RoleRequestStatus;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const getStatusClass = (status: RoleRequestStatus) => {
  switch (status) {
    case "pending":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "approved":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "rejected":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "cancelled":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getRoleDisplay = (role?: string | null) => {
  if (!role) return "Unknown";
  return getRoleLabel(role);
};

export function AdminRoleRequestsPanel() {
  const [requests, setRequests] = useState<RoleRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const pendingRequests = useMemo(() => requests.filter((request) => request.status === "pending"), [requests]);
  const reviewedRequests = useMemo(() => requests.filter((request) => request.status !== "pending"), [requests]);
  const approvedRequests = useMemo(() => requests.filter((request) => request.status === "approved"), [requests]);
  const rejectedRequests = useMemo(() => requests.filter((request) => request.status === "rejected"), [requests]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("role_requests")
      .select("id, user_id, current_role, requested_role, reason, source_path, status, admin_notes, created_at, reviewed_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Unable to load role requests. Apply the latest database migration first.");
      setRequests([]);
    } else {
      setRequests((data || []) as RoleRequestRow[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Admin Role Request Review
          </CardTitle>
          <CardDescription>
            Read-only placeholder queue for role access requests submitted from Access Denied screens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{pendingRequests.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedRequests.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Reviewed</p>
              <p className="text-2xl font-bold">{reviewedRequests.length}</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            Placeholder mode: this panel lists requests only. Final approve/reject actions should be enabled after the team confirms the review policy and audit flow.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Role Request Queue</CardTitle>
              <CardDescription>Latest 50 access requests submitted by users.</CardDescription>
            </div>
            <Button variant="outline" onClick={fetchRequests} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading role requests…
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No role requests found yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Review Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(request.created_at), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{request.user_id.slice(0, 8)}…</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getRoleDisplay(request.current_role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/10 text-primary border-primary/30">{getRoleDisplay(request.requested_role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusClass(request.status)}>{request.status}</Badge>
                      </TableCell>
                      <TableCell className="min-w-72 text-sm text-muted-foreground">{request.reason || "No reason provided"}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{request.source_path || "-"}</TableCell>
                      <TableCell className="min-w-64 text-sm text-muted-foreground">
                        {request.admin_notes || (request.status === "pending" ? "Awaiting admin review" : "No notes")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

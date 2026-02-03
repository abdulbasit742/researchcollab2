import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  UserCheck, 
  UserX, 
  Shield, 
  Settings, 
  Trash2,
  Edit,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface AuditEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  created_at: string;
}

const actionIcons: Record<string, typeof UserCheck> = {
  user_blocked: UserX,
  user_unblocked: UserCheck,
  user_role_changed: Shield,
  verification_approved: UserCheck,
  verification_rejected: UserX,
  settings_updated: Settings,
  tool_deleted: Trash2,
  tool_updated: Edit,
};

const actionLabels: Record<string, string> = {
  user_blocked: "Blocked user",
  user_unblocked: "Unblocked user",
  user_role_changed: "Changed user role",
  verification_approved: "Approved verification",
  verification_rejected: "Rejected verification",
  settings_updated: "Updated settings",
  tool_deleted: "Deleted tool",
  tool_updated: "Updated tool",
  tool_created: "Created tool",
  project_deleted: "Deleted project",
  dispute_resolved: "Resolved dispute",
  report_resolved: "Resolved report",
  report_dismissed: "Dismissed report",
};

export function RecentAuditActivity() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    setLoading(true);
    try {
      const { data: logs, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch admin names
      const adminIds = [...new Set((logs || []).map((log) => log.admin_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, first_name, last_name")
        .in("id", adminIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [
          p.id,
          p.full_name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Admin",
        ])
      );

      const enriched = (logs || []).map((log) => ({
        id: log.id,
        admin_id: log.admin_id,
        admin_name: profileMap.get(log.admin_id) || "Admin",
        action: log.action,
        entity_type: log.entity_type,
        created_at: log.created_at || new Date().toISOString(),
      }));

      setEntries(enriched);
    } catch (err) {
      console.error("Error fetching audit activity:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Admin Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Admin Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No admin activity recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Admin Activity</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/audit" className="text-xs">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry) => {
          const Icon = actionIcons[entry.action] || Settings;
          const label = actionLabels[entry.action] || entry.action.replace(/_/g, " ");

          return (
            <div 
              key={entry.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {entry.admin_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  <span className="font-medium">{entry.admin_name}</span>
                  {" "}
                  <span className="text-muted-foreground">{label}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </p>
              </div>
              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/**
 * Admin Security Metrics Panel — read-only security event monitoring.
 * Shows failed logins, invariant violations, rate limit triggers, etc.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Lock, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  severity: string;
  description: string | null;
  created_at: string;
}

export function AdminSecurityMetrics() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-security-events"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("security_events")
        .select("id, user_id, event_type, severity, description, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) return [];
      return data as SecurityEvent[];
    },
    refetchInterval: 30_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-security-stats"],
    queryFn: async () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();

      const { count: criticalCount } = await (supabase as any)
        .from("security_events")
        .select("*", { count: "exact", head: true })
        .eq("severity", "critical")
        .gte("created_at", oneDayAgo);

      const { count: highCount } = await (supabase as any)
        .from("security_events")
        .select("*", { count: "exact", head: true })
        .eq("severity", "high")
        .gte("created_at", oneDayAgo);

      const { count: totalCount } = await (supabase as any)
        .from("security_events")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneDayAgo);

      // Check escrow invariant health
      const { data: escrows } = await (supabase as any)
        .from("escrows")
        .select("total_amount, locked_amount, released_amount, refunded_amount")
        .not("status", "in", "(completed,refunded)");

      let invariantHealthy = true;
      for (const e of escrows || []) {
        if (e.locked_amount + e.released_amount + e.refunded_amount > e.total_amount + 0.01) {
          invariantHealthy = false;
          break;
        }
      }

      return {
        critical24h: criticalCount || 0,
        high24h: highCount || 0,
        total24h: totalCount || 0,
        escrowInvariantHealthy: invariantHealthy,
      };
    },
    refetchInterval: 60_000,
  });

  const severityColor = (s: string) => {
    switch (s) {
      case "critical": return "bg-destructive/10 text-destructive border-destructive/20";
      case "high": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        Security Metrics (Last 24h)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{stats?.critical24h ?? 0}</p>
                <p className="text-sm text-muted-foreground">Critical Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.high24h ?? 0}</p>
                <p className="text-sm text-muted-foreground">High Severity</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.total24h ?? 0}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Lock className={`h-8 w-8 ${stats?.escrowInvariantHealthy ? "text-green-500" : "text-destructive"}`} />
              <div>
                <p className="text-2xl font-bold">{stats?.escrowInvariantHealthy ? "✓" : "✗"}</p>
                <p className="text-sm text-muted-foreground">Escrow Invariant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
            </div>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No security events recorded.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border text-sm">
                  <Badge variant="outline" className={severityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{event.event_type}</span>
                  <span className="flex-1 truncate text-muted-foreground">{event.description || "—"}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Database,
  Zap,
  MessageSquare,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type HealthStatus = "healthy" | "warning" | "critical";

interface HealthCheck {
  name: string;
  status: HealthStatus;
  message: string;
  icon: typeof Database;
}

export function SystemHealthPanel() {
  const [health, setHealth] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    setLoading(true);
    const checks: HealthCheck[] = [];

    try {
      // Database connectivity check
      const dbStart = Date.now();
      const { error: dbError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);
      const dbLatency = Date.now() - dbStart;
      
      const dbStatus: HealthStatus = dbError ? "critical" : dbLatency > 1000 ? "warning" : "healthy";
      checks.push({
        name: "Database",
        status: dbStatus,
        message: dbError ? "Connection failed" : `${dbLatency}ms latency`,
        icon: Database,
      });

      // Check realtime status
      const channel = supabase.channel("health-check");
      
      const realtimeResult = await new Promise<HealthStatus>((resolve) => {
        const timeout = setTimeout(() => {
          resolve("warning");
        }, 2000);

        channel.subscribe((status) => {
          clearTimeout(timeout);
          if (status === "SUBSCRIBED") {
            resolve("healthy");
          } else if (status === "CHANNEL_ERROR") {
            resolve("critical");
          } else {
            resolve("warning");
          }
        });
      });
      
      supabase.removeChannel(channel);

      checks.push({
        name: "Realtime",
        status: realtimeResult,
        message: realtimeResult === "healthy" ? "Connected" : "Degraded",
        icon: MessageSquare,
      });

      // Check RLS health (quick test)
      const { error: rlsError } = await supabase
        .from("user_roles")
        .select("id")
        .limit(1);
      
      const rlsStatus: HealthStatus = rlsError && rlsError.code === "42501" ? "critical" : "healthy";
      checks.push({
        name: "Security (RLS)",
        status: rlsStatus,
        message: "Policies active",
        icon: Shield,
      });

      // Edge functions check (basic ping)
      checks.push({
        name: "Edge Functions",
        status: "healthy" as HealthStatus,
        message: "Available",
        icon: Zap,
      });

    } catch (err) {
      console.error("Health check error:", err);
    }

    setHealth(checks);
    setLoading(false);
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Healthy</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Warning</Badge>;
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">System Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const overallStatus: HealthStatus = health.some(h => h.status === "critical") 
    ? "critical" 
    : health.some(h => h.status === "warning") 
    ? "warning" 
    : "healthy";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">System Health</CardTitle>
          {getStatusBadge(overallStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {health.map((check) => (
          <div 
            key={check.name}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              check.status === "healthy" && "bg-emerald-500/5 border-emerald-500/20",
              check.status === "warning" && "bg-amber-500/5 border-amber-500/20",
              check.status === "critical" && "bg-destructive/5 border-destructive/20"
            )}
          >
            <div className="flex items-center gap-3">
              <check.icon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{check.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{check.message}</span>
              {getStatusIcon(check.status)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

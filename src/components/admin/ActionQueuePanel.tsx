import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShieldCheck, 
  Flag, 
  Scale, 
  CreditCard, 
  AlertTriangle,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActionItem {
  type: string;
  count: number;
  label: string;
  href: string;
  icon: typeof ShieldCheck;
  priority: "high" | "medium" | "low";
}

export function ActionQueuePanel() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActionQueue();
  }, []);

  const fetchActionQueue = async () => {
    setLoading(true);
    const items: ActionItem[] = [];

    try {
      // Pending Verifications
      const { count: verifyCount } = await supabase
        .from("verification_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (verifyCount && verifyCount > 0) {
        items.push({
          type: "verifications",
          count: verifyCount,
          label: "Pending Verifications",
          href: "/admin/verifications",
          icon: ShieldCheck,
          priority: verifyCount > 10 ? "high" : "medium",
        });
      }

      // Open Reports
      const { count: reportCount } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (reportCount && reportCount > 0) {
        items.push({
          type: "reports",
          count: reportCount,
          label: "Open Reports",
          href: "/admin/reports",
          icon: Flag,
          priority: "high",
        });
      }

      // Active Disputes
      const { count: disputeCount } = await supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "under_review"]);

      if (disputeCount && disputeCount > 0) {
        items.push({
          type: "disputes",
          count: disputeCount,
          label: "Active Disputes",
          href: "/admin/finance",
          icon: Scale,
          priority: "high",
        });
      }

      // Failed Payments (orders with failed status)
      const { count: failedPayments } = await supabase
        .from("tool_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed");

      if (failedPayments && failedPayments > 0) {
        items.push({
          type: "payments",
          count: failedPayments,
          label: "Failed Payments",
          href: "/admin/finance",
          icon: CreditCard,
          priority: "medium",
        });
      }

      // Check for active crisis mode
      const { data: crisisMode } = await supabase
        .from("crisis_modes")
        .select("*")
        .is("deactivated_at", null)
        .limit(1)
        .maybeSingle();

      if (crisisMode) {
        items.push({
          type: "crisis",
          count: 1,
          label: "Crisis Mode Active",
          href: "/admin/governance",
          icon: AlertTriangle,
          priority: "high",
        });
      }
    } catch (err) {
      console.error("Error fetching action queue:", err);
    }

    // Sort by priority
    items.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setActions(items);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Action Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Action Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">No pending actions require attention</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Action Queue</CardTitle>
          <Badge variant="destructive">{actions.length} pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link key={action.type} to={action.href}>
            <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  action.priority === "high" 
                    ? "bg-red-500/10 text-red-500" 
                    : action.priority === "medium"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-blue-500/10 text-blue-500"
                }`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{action.label}</p>
                  <p className="text-sm text-muted-foreground">{action.count} item(s)</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

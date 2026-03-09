import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, DollarSign, Star, Users, MessageSquare, Briefcase, Bell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const typeConfig: Record<string, { icon: any; color: string }> = {
  deal_update: { icon: Briefcase, color: "bg-blue-500/10 text-blue-600" },
  deal_invitation: { icon: Briefcase, color: "bg-blue-500/10 text-blue-600" },
  milestone_update: { icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
  milestone_approved: { icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
  escrow_funded: { icon: DollarSign, color: "bg-green-500/10 text-green-600" },
  escrow_released: { icon: DollarSign, color: "bg-green-500/10 text-green-600" },
  payment: { icon: DollarSign, color: "bg-green-500/10 text-green-600" },
  trust_update: { icon: Star, color: "bg-amber-500/10 text-amber-600" },
  new_message: { icon: MessageSquare, color: "bg-purple-500/10 text-purple-600" },
  message_received: { icon: MessageSquare, color: "bg-purple-500/10 text-purple-600" },
  connection: { icon: Users, color: "bg-violet-500/10 text-violet-600" },
  new_match: { icon: Users, color: "bg-violet-500/10 text-violet-600" },
};

const fallbackConfig = { icon: Bell, color: "bg-muted text-muted-foreground" };

export function RecentActivityWidget() {
  const { notifications, loading } = useNotifications();
  const recent = notifications.slice(0, 6);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent Activity
          </CardTitle>
          {recent.length > 0 && (
            <Link to="/notifications" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
              View all
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : recent.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No recent activity yet. Start by exploring projects or completing your profile.
          </p>
        ) : (
          recent.map((item, i) => {
            const cfg = typeConfig[item.type] || fallbackConfig;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3"
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug font-medium">{item.title}</p>
                  {item.message && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{item.message}</p>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>
                {!item.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

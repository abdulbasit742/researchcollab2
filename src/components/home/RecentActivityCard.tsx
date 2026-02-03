import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CheckCircle,
  XCircle,
  DollarSign,
  Shield,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "project_completed" | "project_failed" | "escrow_released" | "trust_change" | "verification";
  title: string;
  amount?: number;
  trustDelta?: number;
  createdAt: string;
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const activityConfig = {
  project_completed: { icon: CheckCircle, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
  project_failed: { icon: XCircle, color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  escrow_released: { icon: DollarSign, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
  trust_change: { icon: TrendingUp, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  verification: { icon: Shield, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
};

export function RecentActivityCard({ activities, loading }: RecentActivityCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No activity yet. Complete your first project to see it here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-xs gap-1 h-7">
            <Link to="/feed">
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {activities.slice(0, 5).map((activity) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`p-1.5 rounded-full ${config.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {activity.amount && activity.amount > 0 && (
                  <Badge variant="secondary" className="text-[10px] text-emerald-600">
                    +${activity.amount.toLocaleString()}
                  </Badge>
                )}
                {activity.trustDelta !== undefined && activity.trustDelta !== 0 && (
                  <div className={`text-xs font-medium flex items-center gap-0.5 ${
                    activity.trustDelta > 0 ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {activity.trustDelta > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {activity.trustDelta > 0 ? "+" : ""}{activity.trustDelta}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

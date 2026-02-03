import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  ArrowRight,
  Activity,
} from "lucide-react";

interface WorkLedgerSummaryProps {
  projectsCompleted: number;
  projectsFailed: number;
  projectsInProgress: number;
  totalEarned: number;
  escrowSuccessRate: number;
  onTimeRate: number;
  trustScore: number;
  trustTrend: "up" | "down" | "stable";
  loading?: boolean;
}

export function WorkLedgerSummary({
  projectsCompleted = 0,
  projectsFailed = 0,
  projectsInProgress = 0,
  totalEarned = 0,
  escrowSuccessRate = 0,
  onTimeRate = 0,
  trustScore = 0,
  trustTrend = "stable",
  loading = false,
}: WorkLedgerSummaryProps) {
  const totalProjects = projectsCompleted + projectsFailed + projectsInProgress;
  const successRate = totalProjects > 0 
    ? Math.round((projectsCompleted / (projectsCompleted + projectsFailed)) * 100) || 0
    : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Work Ledger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
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
            <Activity className="h-4 w-4 text-primary" />
            Work Ledger
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Permanent Record
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600">
              <CheckCircle className="h-3.5 w-3.5" />
              <span className="font-bold text-lg">{projectsCompleted}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-bold text-lg">{projectsInProgress}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">In Progress</p>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 text-center">
            <div className="flex items-center justify-center gap-1 text-red-600">
              <XCircle className="h-3.5 w-3.5" />
              <span className="font-bold text-lg">{projectsFailed}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Failed</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-3">
          {/* Success Rate */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-medium">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-1.5" />
          </div>

          {/* On-Time Delivery */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">On-Time Delivery</span>
              <span className="font-medium">{onTimeRate}%</span>
            </div>
            <Progress value={onTimeRate} className="h-1.5" />
          </div>

          {/* Escrow Success */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Escrow Success</span>
              <span className="font-medium">{escrowSuccessRate}%</span>
            </div>
            <Progress value={escrowSuccessRate} className="h-1.5" />
          </div>
        </div>

        {/* Earnings & Trust */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total Earned</p>
            <p className="font-bold text-lg flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {totalEarned.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              Trust Score
              {trustTrend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
              {trustTrend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
            </p>
            <p className="font-bold text-lg flex items-center gap-1 justify-end">
              <Shield className="h-4 w-4 text-primary" />
              {trustScore}
            </p>
          </div>
        </div>

        {/* View Full Ledger */}
        <Button variant="ghost" size="sm" className="w-full text-xs gap-1" asChild>
          <Link to="/profile">
            View Full Work Ledger
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

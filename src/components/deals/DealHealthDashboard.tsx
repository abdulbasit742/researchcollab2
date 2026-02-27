import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertTriangle, Clock, TrendingUp, MessageSquare, Calendar, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface DealHealth {
  id: string;
  title: string;
  counterparty: string;
  healthScore: number;
  status: "on_track" | "at_risk" | "delayed" | "critical";
  totalValue: number;
  completedValue: number;
  nextMilestone: string;
  daysToMilestone: number;
  lastCommunication: Date;
  communicationFrequency: "active" | "moderate" | "low" | "stale";
  predictedCompletion: Date;
  originalDeadline: Date;
  issues: string[];
}

export function DealHealthDashboard() {
  const { user } = useAuth();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deal-health", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: dealRooms, error } = await supabase
        .from("deal_rooms")
        .select("id, title, status, agreed_amount, escrow_amount, buyer_id, seller_id, created_at, updated_at, deadline")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .not("status", "in", '("completed","cancelled")')
        .order("updated_at", { ascending: false });

      if (error || !dealRooms) return [];

      return dealRooms.map((d: any): DealHealth => {
        const totalValue = d.agreed_amount || d.escrow_amount || 0;
        const completedValue = d.escrow_amount ? Math.min(d.escrow_amount, totalValue) : 0;
        const counterparty = d.buyer_id === user.id ? "Executor" : "Sponsor";
        const deadline = d.deadline ? new Date(d.deadline) : new Date(Date.now() + 30 * 86400000);
        const daysToDeadline = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
        
        const issues: string[] = [];
        let healthScore = 80;
        let status: DealHealth["status"] = "on_track";

        if (daysToDeadline < 0) {
          issues.push(`${Math.abs(daysToDeadline)} days overdue`);
          healthScore -= 30;
        }
        if (d.status === "disputed") {
          issues.push("Deal is disputed");
          healthScore -= 40;
        }

        if (healthScore <= 30) status = "critical";
        else if (healthScore <= 50) status = "delayed";
        else if (healthScore <= 70) status = "at_risk";

        return {
          id: d.id,
          title: d.title || "Untitled Deal",
          counterparty,
          healthScore: Math.max(0, healthScore),
          status,
          totalValue,
          completedValue: completedValue * 0.6, // approximate progress
          nextMilestone: d.status || "In Progress",
          daysToMilestone: daysToDeadline,
          lastCommunication: new Date(d.updated_at),
          communicationFrequency: daysToDeadline < -5 ? "stale" : daysToDeadline < 0 ? "low" : "active",
          predictedCompletion: deadline,
          originalDeadline: deadline,
          issues,
        };
      });
    },
    enabled: !!user,
  });

  const getHealthColor = (status: DealHealth["status"]) => {
    switch (status) {
      case "on_track": return "text-green-600";
      case "at_risk": return "text-yellow-600";
      case "delayed": return "text-orange-600";
      case "critical": return "text-red-600";
    }
  };

  const getHealthBg = (status: DealHealth["status"]) => {
    switch (status) {
      case "on_track": return "bg-green-500/10 border-green-500/30";
      case "at_risk": return "bg-yellow-500/10 border-yellow-500/30";
      case "delayed": return "bg-orange-500/10 border-orange-500/30";
      case "critical": return "bg-red-500/10 border-red-500/30";
    }
  };

  const getCommFreqColor = (freq: DealHealth["communicationFrequency"]) => {
    switch (freq) {
      case "active": return "text-green-600";
      case "moderate": return "text-blue-600";
      case "low": return "text-yellow-600";
      case "stale": return "text-red-600";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (deals.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-primary" />Deal Health Dashboard</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No active deals to monitor.</p></CardContent>
      </Card>
    );
  }

  const averageHealth = Math.round(deals.reduce((sum, d) => sum + d.healthScore, 0) / deals.length);
  const totalValue = deals.reduce((sum, d) => sum + d.totalValue, 0);
  const atRiskCount = deals.filter(d => d.status !== "on_track").length;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Deal Health Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">{deals.length}</p>
              <p className="text-xs text-muted-foreground">Active Deals</p>
            </div>
            <div className={`p-3 rounded-lg text-center ${averageHealth >= 75 ? "bg-green-500/10" : averageHealth >= 50 ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
              <p className={`text-2xl font-bold ${averageHealth >= 75 ? "text-green-600" : averageHealth >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                {averageHealth}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Health</p>
            </div>
            <div className={`p-3 rounded-lg text-center ${atRiskCount > 0 ? "bg-orange-500/10" : "bg-green-500/10"}`}>
              <p className={`text-2xl font-bold ${atRiskCount > 0 ? "text-orange-600" : "text-green-600"}`}>
                {atRiskCount}
              </p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {deals.map((deal, index) => (
        <motion.div
          key={deal.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`border ${getHealthBg(deal.status)}`}>
            <CardContent className="py-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{deal.title}</h3>
                  <p className="text-sm text-muted-foreground">with {deal.counterparty}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getHealthColor(deal.status)}`}>
                      {deal.healthScore}
                    </span>
                    {deal.status === "on_track" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className={`h-5 w-5 ${getHealthColor(deal.status)}`} />
                    )}
                  </div>
                  <Badge variant="outline" className={`text-xs ${getHealthColor(deal.status)} border-current mt-1`}>
                    {deal.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span>${deal.completedValue.toLocaleString()} / ${deal.totalValue.toLocaleString()}</span>
                </div>
                <Progress value={deal.totalValue > 0 ? (deal.completedValue / deal.totalValue) * 100 : 0} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-2 rounded-lg bg-background/50 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm font-medium ${deal.daysToMilestone < 0 ? "text-red-500" : ""}`}>
                      {deal.daysToMilestone < 0 ? `${Math.abs(deal.daysToMilestone)}d late` : `${deal.daysToMilestone}d`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Next Milestone</p>
                </div>
                <div className="p-2 rounded-lg bg-background/50 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm font-medium ${getCommFreqColor(deal.communicationFrequency)}`}>
                      {deal.communicationFrequency}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Communication</p>
                </div>
                <div className="p-2 rounded-lg bg-background/50 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm font-medium ${deal.predictedCompletion > deal.originalDeadline ? "text-orange-500" : "text-green-500"}`}>
                      {deal.predictedCompletion.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Est. Complete</p>
                </div>
              </div>

              {deal.issues.length > 0 && (
                <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 space-y-1">
                  <p className="text-xs font-medium text-orange-600">Issues Detected:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {deal.issues.map((issue, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>Next: {deal.nextMilestone}</span>
                </div>
                {deal.daysToMilestone > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Due in {deal.daysToMilestone} days
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertTriangle, Clock, TrendingUp, MessageSquare, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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

const MOCK_DEALS: DealHealth[] = [
  {
    id: "1",
    title: "AI Research Partnership",
    counterparty: "Dr. Sarah Chen",
    healthScore: 92,
    status: "on_track",
    totalValue: 25000,
    completedValue: 15000,
    nextMilestone: "Data Analysis Report",
    daysToMilestone: 5,
    lastCommunication: new Date(Date.now() - 86400000),
    communicationFrequency: "active",
    predictedCompletion: new Date(Date.now() + 86400000 * 21),
    originalDeadline: new Date(Date.now() + 86400000 * 25),
    issues: [],
  },
  {
    id: "2",
    title: "Platform Consulting",
    counterparty: "Tech Solutions Inc",
    healthScore: 65,
    status: "at_risk",
    totalValue: 15000,
    completedValue: 5000,
    nextMilestone: "Strategy Document",
    daysToMilestone: -2,
    lastCommunication: new Date(Date.now() - 86400000 * 4),
    communicationFrequency: "low",
    predictedCompletion: new Date(Date.now() + 86400000 * 35),
    originalDeadline: new Date(Date.now() + 86400000 * 28),
    issues: ["Milestone 2 days overdue", "Communication gap detected"],
  },
  {
    id: "3",
    title: "ML Model Development",
    counterparty: "DataCorp Analytics",
    healthScore: 45,
    status: "delayed",
    totalValue: 40000,
    completedValue: 10000,
    nextMilestone: "Model Training Complete",
    daysToMilestone: -8,
    lastCommunication: new Date(Date.now() - 86400000 * 7),
    communicationFrequency: "stale",
    predictedCompletion: new Date(Date.now() + 86400000 * 60),
    originalDeadline: new Date(Date.now() + 86400000 * 30),
    issues: ["Milestone 8 days overdue", "No response in 7 days", "Scope creep detected"],
  },
];

export function DealHealthDashboard() {
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

  const averageHealth = Math.round(MOCK_DEALS.reduce((sum, d) => sum + d.healthScore, 0) / MOCK_DEALS.length);
  const totalValue = MOCK_DEALS.reduce((sum, d) => sum + d.totalValue, 0);
  const atRiskCount = MOCK_DEALS.filter(d => d.status !== "on_track").length;

  return (
    <div className="space-y-6">
      {/* Overview */}
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
              <p className="text-2xl font-bold">{MOCK_DEALS.length}</p>
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

      {/* Deal Cards */}
      {MOCK_DEALS.map((deal, index) => (
        <motion.div
          key={deal.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`border ${getHealthBg(deal.status)}`}>
            <CardContent className="py-4 space-y-4">
              {/* Header */}
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

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span>${deal.completedValue.toLocaleString()} / ${deal.totalValue.toLocaleString()}</span>
                </div>
                <Progress value={(deal.completedValue / deal.totalValue) * 100} className="h-2" />
              </div>

              {/* Metrics */}
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

              {/* Issues */}
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

              {/* Next Milestone */}
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

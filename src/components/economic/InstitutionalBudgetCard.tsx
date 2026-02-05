/**
 * Institutional Budget Card Component
 * Shows budget allocation and ROI for institutions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInstitutionalFunding } from "@/hooks/useInstitutionalFunding";
import { formatPKR } from "@/lib/currency";
import { 
  Building2, 
  PieChart, 
  TrendingUp, 
  Target,
  Wallet,
  Award,
  ArrowRight
} from "lucide-react";

interface InstitutionalBudgetCardProps {
  institutionId: string;
  onCreateAllocation?: () => void;
}

export function InstitutionalBudgetCard({ 
  institutionId,
  onCreateAllocation 
}: InstitutionalBudgetCardProps) {
  const { budget, allocationUtilization, loading } = useInstitutionalFunding(institutionId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!budget) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Budget Data</h3>
          <p className="text-sm text-muted-foreground">
            Institutional budget information is not available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const utilizationPercent = ((budget.totalSpent + budget.totalCommitted) / budget.totalAllocated) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Institutional Funding
        </CardTitle>
        <CardDescription>
          Budget allocation and outcome tracking for {budget.fiscalYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Budget Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Total Allocated</p>
                <p className="text-lg font-bold">{formatPKR(budget.totalAllocated)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Spent</p>
                <p className="text-lg font-bold text-amber-600">{formatPKR(budget.totalSpent)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Committed</p>
                <p className="text-lg font-bold text-blue-600">{formatPKR(budget.totalCommitted)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="text-lg font-bold text-green-600">{formatPKR(budget.available)}</p>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Budget Utilization</span>
                <span className="text-sm text-muted-foreground">{utilizationPercent.toFixed(0)}%</span>
              </div>
              <div className="h-4 rounded-full bg-muted overflow-hidden flex">
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${(budget.totalSpent / budget.totalAllocated) * 100}%` }}
                />
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${(budget.totalCommitted / budget.totalAllocated) * 100}%` }}
                />
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span>Spent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>Committed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-muted" />
                  <span>Available</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {onCreateAllocation && (
              <Button onClick={onCreateAllocation} className="w-full">
                <Wallet className="h-4 w-4 mr-2" />
                Create New Allocation
              </Button>
            )}
          </TabsContent>

          <TabsContent value="allocations" className="space-y-3">
            {allocationUtilization.map((allocation) => (
              <div key={allocation.id} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{allocation.name}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {allocation.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPKR(allocation.remaining)}</p>
                    <p className="text-xs text-muted-foreground">remaining</p>
                  </div>
                </div>
                <Progress value={allocation.utilization} className="h-2 mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{allocation.utilization.toFixed(0)}% utilized</span>
                  <span>{allocation.outcomeCount} outcomes • {allocation.avgImpactScore.toFixed(0)} avg impact</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="roi" className="space-y-4">
            {/* ROI Summary */}
            <div className={`p-4 rounded-lg border ${budget.roi.roiPercentage >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall ROI</span>
                <Badge variant={budget.roi.roiPercentage >= 0 ? "default" : "destructive"}>
                  {budget.roi.roiPercentage >= 0 ? "+" : ""}{budget.roi.roiPercentage.toFixed(1)}%
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Invested</p>
                  <p className="font-medium">{formatPKR(budget.roi.totalInvested)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Measured Return</p>
                  <p className="font-medium">{formatPKR(budget.roi.measuredReturn)}</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Outcomes Achieved</span>
                </div>
                <p className="text-xl font-bold">{budget.roi.outcomesAchieved}</p>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Cost per Outcome</span>
                </div>
                <p className="text-xl font-bold">{formatPKR(budget.roi.avgCostPerOutcome)}</p>
              </div>
            </div>

            {/* Compared to Market */}
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Market Comparison</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your cost per outcome is{" "}
                <span className={budget.roi.comparedToMarket > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {Math.abs(budget.roi.comparedToMarket)}%{" "}
                  {budget.roi.comparedToMarket > 0 ? "lower" : "higher"}
                </span>{" "}
                than market average
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">ROI BY CATEGORY</p>
              {budget.roi.breakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between p-2 rounded-lg border">
                  <span className="text-sm">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatPKR(item.invested)} → {formatPKR(item.returned)}
                    </span>
                    <Badge variant={item.roi >= 0 ? "default" : "destructive"} className="text-xs">
                      {item.roi >= 0 ? "+" : ""}{item.roi.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * FundingPlanPanel — Research-to-Capital structuring UI.
 * Generate, view, simulate, and export funding plans from research synthesis.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Banknote, Target, BarChart3, Shield, Loader2, ChevronRight,
  TrendingUp, AlertTriangle, CheckCircle, Zap, FileText, DollarSign,
} from "lucide-react";
import {
  useWorkspaceFundingPlans,
  useFundingPlanDetail,
  useGenerateFundingPlan,
  useSimulateFeasibility,
  useConvertToEscrow,
  type FundingPlan,
} from "@/hooks/useFundingPlan";
import { formatPKR } from "@/lib/currency";

interface FundingPlanPanelProps {
  workspaceId: string;
}

export function FundingPlanPanel({ workspaceId }: FundingPlanPanelProps) {
  const { data: plans = [], isLoading } = useWorkspaceFundingPlans(workspaceId);
  const generatePlan = useGenerateFundingPlan();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planType, setPlanType] = useState("grant");
  const [planTitle, setPlanTitle] = useState("");
  const [durationMonths, setDurationMonths] = useState(12);

  const handleGenerate = () => {
    generatePlan.mutate({
      workspaceId,
      planType,
      title: planTitle || undefined,
      durationMonths,
    });
    setPlanTitle("");
  };

  return (
    <div className="space-y-4">
      {/* Generator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            Research → Capital Structuring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Plan title (optional)"
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
            />
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grant">Grant Proposal</SelectItem>
                <SelectItem value="startup">Startup Blueprint</SelectItem>
                <SelectItem value="enterprise_rnd">Enterprise R&D</SelectItem>
                <SelectItem value="policy">Policy Funding</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(durationMonths)} onValueChange={(v) => setDurationMonths(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
                <SelectItem value="36">36 months</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={generatePlan.isPending}>
              {generatePlan.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
              Generate Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      ) : plans.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <Banknote className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No funding plans yet. Extract claims and generate a plan from your research.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer hover:border-primary/50 transition-colors ${selectedPlanId === plan.id ? "border-primary" : ""}`}
              onClick={() => setSelectedPlanId(plan.id)}
            >
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{plan.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{plan.plan_type}</Badge>
                      <Badge variant={plan.status === "funded" ? "default" : "secondary"} className="text-[10px]">
                        {plan.status}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatPKR(plan.total_budget)}
                  </span>
                  <span>{plan.duration_months}mo</span>
                  {plan.feasibility_index != null && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {(plan.feasibility_index * 100).toFixed(0)}% feasible
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Plan Detail */}
      {selectedPlanId && <FundingPlanDetail planId={selectedPlanId} />}
    </div>
  );
}

function FundingPlanDetail({ planId }: { planId: string }) {
  const { data, isLoading } = useFundingPlanDetail(planId);
  const simulateFeasibility = useSimulateFeasibility();
  const convertToEscrow = useConvertToEscrow();

  if (isLoading || !data) {
    return <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>;
  }

  const { plan, milestones, budget } = data;
  const meta = plan.ai_generation_metadata || {};
  const simulation = meta.feasibility_simulation;
  const totalMilestoneBudget = milestones.reduce((s, m) => s + m.budget_amount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{plan.title}</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => simulateFeasibility.mutate({ fundingPlanId: planId })}
              disabled={simulateFeasibility.isPending}
            >
              {simulateFeasibility.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <BarChart3 className="h-3 w-3 mr-1" />}
              Simulate
            </Button>
            <Button
              size="sm"
              onClick={() => convertToEscrow.mutate({ planId })}
              disabled={convertToEscrow.isPending || plan.status !== "draft"}
            >
              {convertToEscrow.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
              Convert to Escrow
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones ({milestones.length})</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            {simulation && <TabsTrigger value="feasibility">Feasibility</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-3">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Budget", value: formatPKR(plan.total_budget), icon: DollarSign },
                { label: "Duration", value: `${plan.duration_months} months`, icon: Target },
                { label: "Milestones", value: milestones.length, icon: CheckCircle },
                { label: "Risk", value: plan.risk_score != null ? `${(plan.risk_score * 100).toFixed(0)}%` : "—", icon: AlertTriangle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    {label}
                  </div>
                  <p className="text-lg font-bold mt-1">{value}</p>
                </div>
              ))}
            </div>

            {plan.problem_statement && (
              <div>
                <h4 className="text-sm font-medium mb-1">Problem Statement</h4>
                <p className="text-sm text-muted-foreground">{plan.problem_statement}</p>
              </div>
            )}
            {plan.proposed_solution && (
              <div>
                <h4 className="text-sm font-medium mb-1">Proposed Solution</h4>
                <p className="text-sm text-muted-foreground">{plan.proposed_solution}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="milestones" className="mt-3">
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-3">
                {milestones.map((ms, i) => (
                  <div key={ms.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                          {ms.milestone_title}
                        </h4>
                        {ms.milestone_description && (
                          <p className="text-xs text-muted-foreground mt-1">{ms.milestone_description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatPKR(ms.budget_amount)}</p>
                        <Badge variant={ms.risk_level === "low" ? "default" : ms.risk_level === "high" ? "destructive" : "secondary"} className="text-[10px]">
                          {ms.risk_level}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Duration:</span> {ms.expected_duration_days}d
                      </div>
                      {ms.deliverable_description && (
                        <div>
                          <span className="font-medium">Deliverable:</span> {ms.deliverable_description}
                        </div>
                      )}
                      {ms.performance_metric && (
                        <div>
                          <span className="font-medium">Metric:</span> {ms.performance_metric}
                        </div>
                      )}
                    </div>
                    {/* Budget bar */}
                    <Progress value={totalMilestoneBudget > 0 ? (ms.budget_amount / totalMilestoneBudget) * 100 : 0} className="h-1" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="budget" className="mt-3">
            <div className="space-y-2">
              {budget.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Badge variant="outline" className="text-xs capitalize">{item.category}</Badge>
                    {item.justification_text && (
                      <p className="text-xs text-muted-foreground mt-1">{item.justification_text}</p>
                    )}
                  </div>
                  <p className="font-bold text-sm">{formatPKR(item.amount)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between p-3 font-bold">
                <span>Total</span>
                <span>{formatPKR(plan.total_budget)}</span>
              </div>
            </div>
          </TabsContent>

          {simulation && (
            <TabsContent value="feasibility" className="mt-3 space-y-4">
              {/* Feasibility Index */}
              <div className="p-4 rounded-lg border text-center">
                <p className="text-xs text-muted-foreground mb-1">Capital Feasibility Index</p>
                <p className="text-3xl font-bold text-primary">{((simulation.feasibility_index || 0) * 100).toFixed(0)}%</p>
                <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Budget: {simulation.budget_adequacy}</span>
                  <span>Timeline: {simulation.timeline_realism}</span>
                </div>
              </div>

              {/* Scenarios */}
              <div className="grid grid-cols-3 gap-3">
                {["optimistic", "neutral", "conservative"].map((scenario) => {
                  const s = simulation.scenarios?.[scenario];
                  if (!s) return null;
                  return (
                    <div key={scenario} className="p-3 rounded-lg border text-center">
                      <p className="text-xs font-medium capitalize mb-1">{scenario}</p>
                      <p className="text-lg font-bold">{((s.completion_probability || 0) * 100).toFixed(0)}%</p>
                      <p className="text-[10px] text-muted-foreground">
                        Budget Δ{s.budget_variance_pct > 0 ? "+" : ""}{s.budget_variance_pct}%
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Recommendations */}
              {simulation.recommendations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {simulation.recommendations.map((r: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resource Gaps */}
              {simulation.resource_gaps?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Resource Gaps</h4>
                  <ul className="space-y-1">
                    {simulation.resource_gaps.map((g: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

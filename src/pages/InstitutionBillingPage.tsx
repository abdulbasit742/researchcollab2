import {
  useInstitutionSubscription, useSubscriptionPlans,
  useInstitutionUsageMetrics, useUpgradeRecommendations, useFeatureAccessLogs,
} from "@/hooks/useMonetization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Zap, BarChart3, Lightbulb, Shield, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const INST_ID = "00000000-0000-0000-0000-000000000001";

export default function InstitutionBillingPage() {
  const { data: subscription } = useInstitutionSubscription(INST_ID);
  const { data: plans = [] } = useSubscriptionPlans();
  const { data: usage = [] } = useInstitutionUsageMetrics(INST_ID);
  const { data: recommendations = [] } = useUpgradeRecommendations(INST_ID);
  const { data: accessLogs = [] } = useFeatureAccessLogs(INST_ID);

  const currentPlan = subscription?.institution_subscription_plans as any;
  const latestUsage = usage[0] as any | undefined;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Billing & Subscription
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your institution's plan, usage, and feature access</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-foreground">
                {currentPlan?.plan_name ?? "No Active Plan"}
              </p>
              <p className="text-sm text-muted-foreground">
                {subscription?.billing_cycle ?? "monthly"} billing
                {subscription?.renewal_date && ` · Renews ${new Date(subscription.renewal_date).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info("Contact enterprise sales for upgrades.")}>
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Request Upgrade
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Enterprise sales: enterprise@rcollab.com")}>
                Contact Sales
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Feature Access */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Feature Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Advanced Analytics", key: "advanced_analytics_enabled" },
                { label: "AI Features", key: "ai_features_enabled" },
                { label: "Certification Module", key: "certification_module_enabled" },
                { label: "Executive Dashboard", key: "executive_dashboard_enabled" },
                { label: "Data Export", key: "export_enabled" },
              ].map((f) => {
                const enabled = currentPlan?.[f.key] ?? false;
                return (
                  <div key={f.key} className="flex items-center justify-between p-2 rounded hover:bg-muted/30">
                    <span className="text-sm text-foreground">{f.label}</span>
                    <Badge variant={enabled ? "default" : "secondary"} className="text-[10px]">
                      {enabled ? "Enabled" : "Locked"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Usage Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Usage Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestUsage ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Active Users", value: latestUsage.active_users },
                  { label: "Projects Created", value: latestUsage.projects_created },
                  { label: "Milestones Created", value: latestUsage.milestones_created },
                  { label: "AI Requests", value: latestUsage.ai_requests_count },
                ].map((m) => (
                  <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-foreground">{m.value ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No usage data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Available Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((p: any) => {
              const isCurrent = currentPlan?.plan_name === p.plan_name;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-lg border ${isCurrent ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-foreground">{p.plan_name}</p>
                    {isCurrent && <Badge className="text-[10px]">Current</Badge>}
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {p.monthly_price_pkr > 0 ? `PKR ${p.monthly_price_pkr.toLocaleString()}` : "Free"}
                    <span className="text-xs text-muted-foreground font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.max_projects === -1 ? "Unlimited" : p.max_projects} projects
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Upgrade Recommendations
              <Badge variant="outline" className="text-[10px] ml-auto">Advisory</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((r: any) => (
                <div key={r.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{r.recommended_plan}</Badge>
                  </div>
                  <p className="text-sm text-foreground">{r.reason}</p>
                  {r.projected_benefit && (
                    <p className="text-xs text-muted-foreground mt-1">{r.projected_benefit}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

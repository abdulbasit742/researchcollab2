import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle, AlertTriangle, XCircle, Rocket,
  Users, DollarSign, Target, Shield, FileText, Activity,
} from "lucide-react";

interface CheckResult {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

function useReadinessChecks() {
  return useQuery({
    queryKey: ["launch-readiness"],
    queryFn: async () => {
      const checks: CheckResult[] = [];

      // 1. FYP Topics exist
      const { count: topicCount } = await (supabase as any).from("fyp_topics").select("*", { count: "exact", head: true });
      checks.push({
        name: "FYP Topics Created",
        status: (topicCount ?? 0) > 0 ? "pass" : "fail",
        detail: `${topicCount ?? 0} topics in system`,
      });

      // 2. Open topics available
      const { count: openCount } = await (supabase as any).from("fyp_topics").select("*", { count: "exact", head: true }).eq("status", "open");
      checks.push({
        name: "Open Topics for Teams",
        status: (openCount ?? 0) > 0 ? "pass" : "warn",
        detail: `${openCount ?? 0} open topics`,
      });

      // 3. Profiles exist
      const { count: profileCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      checks.push({
        name: "User Profiles",
        status: (profileCount ?? 0) > 2 ? "pass" : (profileCount ?? 0) > 0 ? "warn" : "fail",
        detail: `${profileCount ?? 0} registered users`,
      });

      // 4. Deal rooms created
      const { count: dealCount } = await supabase.from("deal_rooms").select("*", { count: "exact", head: true });
      checks.push({
        name: "Deal Rooms Active",
        status: (dealCount ?? 0) > 0 ? "pass" : "warn",
        detail: `${dealCount ?? 0} deal rooms`,
      });

      // 5. Escrow transactions
      const { count: escrowCount } = await supabase.from("escrow_transactions").select("*", { count: "exact", head: true });
      checks.push({
        name: "Escrow Transactions",
        status: (escrowCount ?? 0) > 0 ? "pass" : "warn",
        detail: `${escrowCount ?? 0} transactions`,
      });

      // 6. Applications
      const { count: appCount } = await (supabase as any).from("fyp_applications").select("*", { count: "exact", head: true });
      checks.push({
        name: "FYP Applications Submitted",
        status: (appCount ?? 0) > 0 ? "pass" : "warn",
        detail: `${appCount ?? 0} applications`,
      });

      // 7. Sponsorships
      const { count: sponsorCount } = await (supabase as any).from("fyp_sponsorships").select("*", { count: "exact", head: true });
      checks.push({
        name: "Sponsorships Pledged",
        status: (sponsorCount ?? 0) > 0 ? "pass" : "warn",
        detail: `${sponsorCount ?? 0} sponsorships`,
      });

      // 8. Organizations
      const { count: orgCount } = await supabase.from("organizations").select("*", { count: "exact", head: true });
      checks.push({
        name: "Institutions Onboarded",
        status: (orgCount ?? 0) > 0 ? "pass" : "warn",
        detail: `${orgCount ?? 0} organizations`,
      });

      // 9. Milestone templates
      const { count: milestoneCount } = await (supabase as any).from("fyp_milestones_template").select("*", { count: "exact", head: true });
      checks.push({
        name: "Milestone Templates",
        status: (milestoneCount ?? 0) > 0 ? "pass" : "warn",
        detail: `${milestoneCount ?? 0} milestones defined`,
      });

      // 10. Wallet system
      const { count: walletCount } = await supabase.from("wallets").select("*", { count: "exact", head: true });
      checks.push({
        name: "Wallet System",
        status: (walletCount ?? 0) > 0 ? "pass" : "warn",
        detail: `${walletCount ?? 0} wallets`,
      });

      const passCount = checks.filter((c) => c.status === "pass").length;
      const score = Math.round((passCount / checks.length) * 100);

      return { checks, score, passCount, total: checks.length };
    },
    staleTime: 60_000,
  });
}

const statusIcon = {
  pass: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  warn: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  fail: <XCircle className="h-4 w-4 text-destructive" />,
};

export default function LaunchReadinessPage() {
  const { data, isLoading } = useReadinessChecks();

  const scoreColor = (data?.score ?? 0) >= 80 ? "text-emerald-500" : (data?.score ?? 0) >= 50 ? "text-amber-500" : "text-destructive";

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Rocket className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Launch Readiness</h1>
            <p className="text-sm text-muted-foreground">Core execution loop health and platform readiness score</p>
          </div>
        </div>

        {/* Score */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Platform Readiness Score</p>
                <p className={`text-4xl font-bold ${scoreColor}`}>{data?.score ?? 0}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Checks Passed</p>
                <p className="text-lg font-bold">{data?.passCount ?? 0}/{data?.total ?? 0}</p>
              </div>
            </div>
            <Progress value={data?.score ?? 0} className="h-3" />
          </CardContent>
        </Card>

        {/* Core Loop */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Core Execution Loop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {[
                { label: "Post Problem", icon: FileText },
                { label: "Create Challenge", icon: Target },
                { label: "Teams Apply", icon: Users },
                { label: "Team Selected", icon: CheckCircle },
                { label: "Milestones Execute", icon: Activity },
                { label: "Escrow Released", icon: Shield },
                { label: "Results Published", icon: Rocket },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  {i > 0 && <span className="text-muted-foreground mx-1">→</span>}
                  <step.icon className="h-3.5 w-3.5 text-primary" />
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Checks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Checks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Running readiness checks...</p>
            ) : (
              <div className="space-y-3">
                {data?.checks.map((check) => (
                  <div key={check.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {statusIcon[check.status]}
                      <div>
                        <p className="text-sm font-medium">{check.name}</p>
                        <p className="text-xs text-muted-foreground">{check.detail}</p>
                      </div>
                    </div>
                    <Badge variant={check.status === "pass" ? "default" : check.status === "warn" ? "secondary" : "destructive"}>
                      {check.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

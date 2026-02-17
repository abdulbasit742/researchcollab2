import { Helmet } from "react-helmet-async";
import { MainLayout as AppLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCreditProfile } from "@/hooks/useCapitalEngine";
import { Shield, TrendingUp, AlertTriangle, Award, BarChart3, Clock } from "lucide-react";

const BAND_CONFIG: Record<string, { label: string; color: string; tier: string }> = {
  C1: { label: "C1 — High Risk", color: "bg-red-500", tier: "High Risk" },
  C2: { label: "C2 — Elevated Risk", color: "bg-orange-500", tier: "Elevated" },
  B1: { label: "B1 — Moderate", color: "bg-yellow-500", tier: "Moderate" },
  B2: { label: "B2 — Standard", color: "bg-blue-400", tier: "Standard" },
  A1: { label: "A1 — Low Risk", color: "bg-emerald-500", tier: "Low Risk" },
  A2: { label: "A2 — Prime", color: "bg-green-600", tier: "Prime" },
};

const CreditProfilePage = () => {
  const { data: profile, isLoading } = useCreditProfile();
  const band = profile?.credit_band || "C1";
  const config = BAND_CONFIG[band] || BAND_CONFIG.C1;

  const metrics = [
    { label: "Deal Completion Reliability", value: profile?.deal_completion_reliability || 0, icon: TrendingUp },
    { label: "Revenue Volatility", value: profile?.revenue_volatility || 0, icon: BarChart3, inverted: true },
    { label: "Escrow Dispute Rate", value: profile?.escrow_dispute_rate || 0, icon: AlertTriangle, inverted: true },
    { label: "Avg Milestone Size", value: profile?.avg_milestone_size || 0, icon: Clock, format: "currency" },
    { label: "Income Diversification", value: profile?.income_diversification_index || 0, icon: Award },
    { label: "Institutional Backing", value: profile?.institutional_backing_score || 0, icon: Shield },
  ];

  return (
    <AppLayout>
      <Helmet><title>Credit Profile | RCollab Capital</title></Helmet>
      <div className="container max-w-5xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Professional Credit Profile</h1>
            <p className="text-muted-foreground mt-1">Your financial predictability score — separate from Trust.</p>
          </div>
          <Badge className={`${config.color} text-white text-lg px-4 py-2`}>{config.label}</Badge>
        </div>

        {/* Credit Score Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Credit Score</CardTitle>
            <CardDescription>Composite financial predictability rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">{Number(profile?.credit_score || 0).toFixed(0)}</div>
                <div className="text-sm text-muted-foreground mt-1">/ 100</div>
              </div>
              <div className="flex-1 space-y-2">
                <Progress value={Number(profile?.credit_score || 0)} className="h-4" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>C1 High Risk</span><span>B1 Moderate</span><span>A2 Prime</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Default Probability</div>
                <div className="text-2xl font-semibold">{((Number(profile?.probability_of_default || 0)) * 100).toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Factor Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <Card key={m.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <m.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{m.label}</span>
                </div>
                <div className="text-2xl font-bold">
                  {m.format === "currency" 
                    ? `PKR ${Number(m.value).toLocaleString()}`
                    : `${Number(m.value).toFixed(1)}${m.format !== "currency" ? "%" : ""}`
                  }
                </div>
                {!m.format && (
                  <Progress 
                    value={m.inverted ? 100 - Number(m.value) : Number(m.value)} 
                    className="h-2 mt-2" 
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Evolution Timeline</CardTitle>
            <CardDescription>Your credit band changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <p>Credit history will appear as your profile evolves through deals and milestones.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreditProfilePage;

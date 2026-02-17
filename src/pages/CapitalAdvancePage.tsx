import { Helmet } from "react-helmet-async";
import { MainLayout as AppLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCapitalAdvances, useCreditProfile } from "@/hooks/useCapitalEngine";
import { Banknote, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_BADGES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  requested: { variant: "outline", icon: Clock },
  under_review: { variant: "secondary", icon: Clock },
  approved: { variant: "default", icon: CheckCircle },
  disbursed: { variant: "default", icon: Banknote },
  repaying: { variant: "secondary", icon: ArrowRight },
  repaid: { variant: "default", icon: CheckCircle },
  defaulted: { variant: "destructive", icon: XCircle },
  rejected: { variant: "destructive", icon: AlertTriangle },
};

const CapitalAdvancePage = () => {
  const { data: credit } = useCreditProfile();
  const { advances, isLoading } = useCapitalAdvances();

  const maxAdvancePercent = (() => {
    switch (credit?.credit_band) {
      case "A2": return 80;
      case "A1": return 65;
      case "B2": return 50;
      case "B1": return 35;
      case "C2": return 20;
      default: return 10;
    }
  })();

  return (
    <AppLayout>
      <Helmet><title>Revenue Advance | RCollab Capital</title></Helmet>
      <div className="container max-w-5xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Advance</h1>
          <p className="text-muted-foreground mt-1">Unlock capital against your signed, escrow-backed deals.</p>
        </div>

        {/* Eligibility Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5" /> Advance Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Credit Band</div>
                <div className="text-2xl font-bold">{credit?.credit_band || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Max Advance %</div>
                <div className="text-2xl font-bold">{maxAdvancePercent}%</div>
                <p className="text-xs text-muted-foreground">of escrow-backed milestones</p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Default Probability</div>
                <div className="text-2xl font-bold">{((Number(credit?.probability_of_default || 0)) * 100).toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                "Only active, verified deals with escrow are eligible",
                "Credit band determines maximum advance percentage",
                "AI risk engine calculates discount rate",
                "Auto-repayment triggers on milestone release",
                "No leverage stacking or synthetic credit layers",
                "All advances are logged and auditable",
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advance History */}
        <Card>
          <CardHeader>
            <CardTitle>Advance History</CardTitle>
            <CardDescription>{advances.length} total requests</CardDescription>
          </CardHeader>
          <CardContent>
            {advances.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Banknote className="h-12 w-12 mb-3 opacity-30" />
                <p>No advance requests yet.</p>
                <p className="text-sm">Complete deals to build credit and unlock capital advances.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {advances.map((adv) => {
                  const statusCfg = STATUS_BADGES[adv.status] || STATUS_BADGES.requested;
                  const Icon = statusCfg.icon;
                  return (
                    <div key={adv.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">PKR {Number(adv.requested_amount).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(adv.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {adv.approved_amount && (
                          <span className="text-sm text-muted-foreground">
                            Approved: PKR {Number(adv.approved_amount).toLocaleString()}
                          </span>
                        )}
                        <Badge variant={statusCfg.variant}>{adv.status.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CapitalAdvancePage;

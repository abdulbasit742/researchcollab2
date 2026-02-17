import { Helmet } from "react-helmet-async";
import { MainLayout as AppLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFundingPools } from "@/hooks/useCapitalEngine";
import { Landmark, TrendingUp, AlertTriangle, Wallet } from "lucide-react";

const POOL_TYPE_LABELS: Record<string, string> = {
  university_innovation: "University Innovation Fund",
  corporate_acceleration: "Corporate Talent Acceleration",
  regional_growth: "Regional Growth Pool",
  custom: "Custom Pool",
};

const RISK_COLORS: Record<string, string> = {
  conservative: "bg-green-500",
  moderate: "bg-yellow-500",
  aggressive: "bg-red-500",
};

const FundingPoolsPage = () => {
  const { data: pools, isLoading } = useFundingPools();

  const totalCapital = (pools || []).reduce((s, p) => s + Number(p.total_capital || 0), 0);
  const totalDeployed = (pools || []).reduce((s, p) => s + Number(p.deployed_capital || 0), 0);
  const totalYield = (pools || []).reduce((s, p) => s + Number(p.total_yield || 0), 0);

  return (
    <AppLayout>
      <Helmet><title>Funding Pools | RCollab Capital</title></Helmet>
      <div className="container max-w-6xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institutional Funding Pools</h1>
          <p className="text-muted-foreground mt-1">Trust-weighted, risk-tiered pooled capital for professional advancement.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Capital", value: `PKR ${totalCapital.toLocaleString()}`, icon: Landmark },
            { label: "Deployed", value: `PKR ${totalDeployed.toLocaleString()}`, icon: Wallet },
            { label: "Utilization", value: `${totalCapital > 0 ? ((totalDeployed / totalCapital) * 100).toFixed(1) : 0}%`, icon: TrendingUp },
            { label: "Total Yield", value: `PKR ${totalYield.toLocaleString()}`, icon: TrendingUp },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(pools || []).length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Landmark className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No funding pools have been created yet.</p>
                <p className="text-sm">Institutions can create pools through the Capital Administration panel.</p>
              </CardContent>
            </Card>
          ) : (
            (pools || []).map((pool) => {
              const utilization = Number(pool.total_capital) > 0
                ? (Number(pool.deployed_capital) / Number(pool.total_capital)) * 100
                : 0;
              return (
                <Card key={pool.id} className="border-primary/10">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{pool.name}</CardTitle>
                        <CardDescription>{POOL_TYPE_LABELS[pool.pool_type] || pool.pool_type}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={pool.status === "active" ? "default" : "secondary"}>{pool.status}</Badge>
                        <div className={`w-3 h-3 rounded-full mt-1 ${RISK_COLORS[pool.risk_tier] || "bg-gray-400"}`} title={`Risk: ${pool.risk_tier}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Capital</span>
                        <div className="font-medium">PKR {Number(pool.total_capital).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Available</span>
                        <div className="font-medium">PKR {Number(pool.available_capital).toLocaleString()}</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Utilization</span>
                        <span>{utilization.toFixed(1)}%</span>
                      </div>
                      <Progress value={utilization} className="h-2" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Default Rate</span>
                      <span className="font-medium">{((Number(pool.default_rate) || 0) * 100).toFixed(2)}%</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default FundingPoolsPage;

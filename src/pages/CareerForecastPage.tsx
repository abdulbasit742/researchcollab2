import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSkillForecasts } from "@/hooks/useLIMSE";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";

const SIGNAL_ICON: Record<string, React.ReactNode> = {
  rising: <TrendingUp className="h-4 w-4 text-green-600" />,
  declining: <TrendingDown className="h-4 w-4 text-destructive" />,
  neutral: <Minus className="h-4 w-4 text-muted-foreground" />,
};

export default function CareerForecastPage() {
  const { data: forecasts, isLoading } = useSkillForecasts();
  const list = forecasts ?? [];

  const rising = list.filter(f => f.signal === "rising");
  const declining = list.filter(f => f.signal === "declining");

  const chartData = list.slice(0, 20).map(f => ({
    name: f.skill_name?.length > 10 ? f.skill_name.slice(0, 10) + "…" : f.skill_name,
    demand: f.predicted_demand_change,
    price: f.predicted_price_change,
  }));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Flame className="h-8 w-8 text-primary" />
            Opportunity Forecast Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered 30-day predictions for skill demand, pricing, and career trajectories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Skills Forecasted</p>
            <p className="text-2xl font-bold">{list.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Rising Skills</p>
            <p className="text-2xl font-bold text-green-600">{rising.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Declining Skills</p>
            <p className="text-2xl font-bold text-destructive">{declining.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
            <p className="text-2xl font-bold">
              {list.length ? Math.round(list.reduce((s, f) => s + f.confidence_score, 0) / list.length) : 0}%
            </p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Predicted Demand & Price Changes (%)</CardTitle></CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="demand" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="price" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No forecast data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forecast Cards */}
        <div className="space-y-3">
          {list.map(f => (
            <Card key={f.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {SIGNAL_ICON[f.signal] ?? SIGNAL_ICON.neutral}
                  <div>
                    <p className="font-medium">{f.skill_name}</p>
                    <p className="text-xs text-muted-foreground">{f.ai_reasoning ?? `${f.forecast_period} forecast`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Demand Δ</p>
                    <p className={f.predicted_demand_change > 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                      {f.predicted_demand_change > 0 ? "+" : ""}{f.predicted_demand_change}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Supply Δ</p>
                    <p className={f.predicted_supply_change > 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                      {f.predicted_supply_change > 0 ? "+" : ""}{f.predicted_supply_change}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Price Δ</p>
                    <p className={f.predicted_price_change > 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                      {f.predicted_price_change > 0 ? "+" : ""}{f.predicted_price_change}%
                    </p>
                  </div>
                  <Badge variant={f.signal === "rising" ? "default" : f.signal === "declining" ? "destructive" : "secondary"}>
                    {f.signal}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{Math.round(f.confidence_score)}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              No forecasts generated yet. Run the LIMSE compute engine to generate predictions.
            </CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

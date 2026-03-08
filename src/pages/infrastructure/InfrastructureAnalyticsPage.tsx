import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BarChart3, Brain, TrendingUp, Globe, Lightbulb } from "lucide-react";
import { getListings, computeMarketplaceAnalytics, invokeSimAdvisor } from "@/lib/infrastructure/scientificMarketplace";

export default function InfrastructureAnalyticsPage() {
  const [aiInsight, setAiInsight] = useState<any>(null);

  const { data: listings = [] } = useQuery({
    queryKey: ["sim-listings"],
    queryFn: () => getListings(),
  });

  const analytics = computeMarketplaceAnalytics(listings);

  const demandMutation = useMutation({
    mutationFn: () => invokeSimAdvisor("predict_demand", { current_listings: analytics.totalListings, categories: Object.keys(analytics.byCategory), regions: Object.keys(analytics.byCountry) }),
    onSuccess: (data) => setAiInsight(data),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout>
      <Helmet><title>Infrastructure Analytics | RCollab</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Infrastructure Analytics</h1>
            <p className="text-muted-foreground mt-1">Market intelligence for scientific resource sharing</p>
          </div>
          <Button onClick={() => demandMutation.mutate()} disabled={demandMutation.isPending}>
            <Brain className="h-4 w-4 mr-2" />{demandMutation.isPending ? "Analyzing..." : "AI Demand Forecast"}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><BarChart3 className="h-6 w-6 text-primary mb-2" /><p className="text-2xl font-bold">{analytics.totalListings}</p><p className="text-xs text-muted-foreground">Total Resources</p></CardContent></Card>
          <Card><CardContent className="p-4"><TrendingUp className="h-6 w-6 text-primary mb-2" /><p className="text-2xl font-bold">{analytics.totalBookings}</p><p className="text-xs text-muted-foreground">Total Bookings</p></CardContent></Card>
          <Card><CardContent className="p-4"><Globe className="h-6 w-6 text-primary mb-2" /><p className="text-2xl font-bold">{Object.keys(analytics.byCountry).length}</p><p className="text-xs text-muted-foreground">Countries</p></CardContent></Card>
          <Card><CardContent className="p-4"><Lightbulb className="h-6 w-6 text-primary mb-2" /><p className="text-2xl font-bold">{analytics.totalCapacity}</p><p className="text-xs text-muted-foreground">Total Capacity Units</p></CardContent></Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Category Distribution</CardTitle></CardHeader>
            <CardContent>
              {Object.entries(analytics.byCategory).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(analytics.byCategory).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-sm">{cat}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${((count as number) / analytics.totalListings) * 100}%` }} /></div>
                        <span className="text-sm font-medium w-6 text-right">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-center py-6">No data yet</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Geographic Distribution</CardTitle></CardHeader>
            <CardContent>
              {Object.entries(analytics.byCountry).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(analytics.byCountry).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-sm">{country}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-center py-6">No data yet</p>}
            </CardContent>
          </Card>
        </div>

        {/* AI Demand Forecast */}
        {aiInsight && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Demand Forecast</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {aiInsight.forecast_period && <p className="text-sm"><strong>Period:</strong> {aiInsight.forecast_period}</p>}
              {aiInsight.predicted_bookings && <p className="text-sm"><strong>Predicted Bookings:</strong> {aiInsight.predicted_bookings}</p>}
              {aiInsight.revenue_estimate && <p className="text-sm"><strong>Revenue Estimate:</strong> {aiInsight.revenue_estimate}</p>}
              {aiInsight.trending_categories?.length > 0 && (
                <div><p className="text-sm font-medium mb-1">Trending Categories:</p><div className="flex flex-wrap gap-1">{aiInsight.trending_categories.map((c: string) => <Badge key={c} variant="outline">{c}</Badge>)}</div></div>
              )}
              {aiInsight.peak_months?.length > 0 && (
                <div><p className="text-sm font-medium mb-1">Peak Months:</p><div className="flex flex-wrap gap-1">{aiInsight.peak_months.map((m: string) => <Badge key={m}>{m}</Badge>)}</div></div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

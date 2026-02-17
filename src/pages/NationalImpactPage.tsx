import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Globe, DollarSign, Users, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const NationalImpactPage = () => {
  const { data: signalIndex } = useQuery({
    queryKey: ["public-signal-index"],
    queryFn: async () => {
      const { data, error } = await supabase.from("national_signal_index").select("*").eq("is_public", true).order("computed_at", { ascending: false }).limit(12);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: warehouse } = useQuery({
    queryKey: ["public-warehouse"],
    queryFn: async () => {
      const { data, error } = await supabase.from("economic_warehouse").select("*").order("computed_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const totalFunding = (warehouse || []).reduce((s, w) => s + Number(w.funding_volume || 0), 0);
  const totalEmployment = (warehouse || []).reduce((s, w) => s + Number(w.employment_count || 0), 0);
  const totalStartups = (warehouse || []).reduce((s, w) => s + Number(w.startup_count || 0), 0);
  const latestSignal = signalIndex?.[0];

  const signalChart = (signalIndex || []).reverse().map(s => ({
    period: s.period,
    score: Number(s.signal_score),
  }));

  return (
    <MainLayout>
      <Helmet><title>National Innovation Impact | RCollab</title></Helmet>
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="text-center space-y-2">
          <Globe className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-3xl font-bold tracking-tight">National Innovation Impact</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Public transparency dashboard — aggregated, anonymized innovation metrics.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Capital Deployed", value: `PKR ${(totalFunding / 1e6).toFixed(1)}M`, icon: DollarSign },
            { label: "Students Employed", value: totalEmployment.toLocaleString(), icon: Users },
            { label: "Startups Created", value: totalStartups.toLocaleString(), icon: Zap },
            { label: "Signal Score", value: latestSignal ? Number(latestSignal.signal_score).toFixed(1) : "—", icon: TrendingUp },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="pt-6 text-center">
                <m.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {signalChart.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Innovation Signal Index Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={signalChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>About This Data</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All data shown is aggregated and anonymized. No individual student, university, or sponsor data is exposed.
              This portal serves as a public credibility builder for the national innovation ecosystem.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NationalImpactPage;

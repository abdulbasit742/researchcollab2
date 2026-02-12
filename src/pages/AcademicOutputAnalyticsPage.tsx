import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { GraduationCap, TrendingUp, DollarSign, Activity } from "lucide-react";

const institutionData = [
  { name: "NUST", fyps: 120, economic: 2400000, velocity: 85, trust: 78 },
  { name: "LUMS", fyps: 95, economic: 1900000, velocity: 80, trust: 82 },
  { name: "FAST", fyps: 150, economic: 2100000, velocity: 72, trust: 70 },
  { name: "COMSATS", fyps: 180, economic: 1800000, velocity: 68, trust: 65 },
  { name: "UET", fyps: 110, economic: 1500000, velocity: 75, trust: 72 },
];

const trendData = [
  { month: "Sep", completionRate: 0, output: 0 },
  { month: "Oct", completionRate: 5, output: 120000 },
  { month: "Nov", completionRate: 12, output: 350000 },
  { month: "Dec", completionRate: 25, output: 800000 },
  { month: "Jan", completionRate: 40, output: 1500000 },
  { month: "Feb", completionRate: 55, output: 2200000 },
];

export default function AcademicOutputAnalyticsPage() {
  const totalFYPs = institutionData.reduce((s, i) => s + i.fyps, 0);
  const totalEconomic = institutionData.reduce((s, i) => s + i.economic, 0);
  const avgVelocity = Math.round(institutionData.reduce((s, i) => s + i.velocity, 0) / institutionData.length);
  const avgTrust = Math.round(institutionData.reduce((s, i) => s + i.trust, 0) / institutionData.length);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Academic Output Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Institutional KPIs for FYP completion, economic output, and trust stability</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{totalFYPs}</p><p className="text-sm text-muted-foreground">Total FYPs</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-yellow-500" />
            <div><p className="text-2xl font-bold">PKR {(totalEconomic / 1000000).toFixed(1)}M</p><p className="text-sm text-muted-foreground">Economic Output</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div><p className="text-2xl font-bold">{avgVelocity}%</p><p className="text-sm text-muted-foreground">Avg Research Velocity</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-500" />
            <div><p className="text-2xl font-bold">{avgTrust}</p><p className="text-sm text-muted-foreground">Avg Trust Stability</p></div>
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>FYPs by Institution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={institutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="fyps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Completion & Output Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="completionRate" stroke="hsl(var(--primary))" strokeWidth={2} name="Completion %" />
                  <Line yAxisId="right" type="monotone" dataKey="output" stroke="#22c55e" strokeWidth={2} name="Economic Output (PKR)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Institution Leaderboard</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {institutionData.sort((a, b) => b.economic - a.economic).map((inst, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                    <div>
                      <p className="font-semibold">{inst.name}</p>
                      <p className="text-sm text-muted-foreground">{inst.fyps} FYPs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">PKR {(inst.economic / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-muted-foreground">Economic Output</p>
                    </div>
                    <Badge variant="outline" className={inst.velocity >= 75 ? "text-green-600" : inst.velocity >= 60 ? "text-yellow-600" : "text-red-600"}>
                      {inst.velocity}% velocity
                    </Badge>
                    <Badge variant="outline">Trust: {inst.trust}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

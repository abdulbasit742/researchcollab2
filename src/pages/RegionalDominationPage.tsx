import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Building, GraduationCap, TrendingUp, Users, Rocket } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

const flywheelData = [
  { month: "Q1", fyps: 8, escrow: 1.2, hires: 2, spinoffs: 0 },
  { month: "Q2", fyps: 18, escrow: 3.5, hires: 5, spinoffs: 1 },
  { month: "Q3", fyps: 35, escrow: 7.8, hires: 12, spinoffs: 2 },
  { month: "Q4", fyps: 62, escrow: 14.2, hires: 24, spinoffs: 4 },
  { month: "Q5", fyps: 110, escrow: 28, hires: 45, spinoffs: 7 },
  { month: "Q6", fyps: 185, escrow: 48, hires: 78, spinoffs: 11 },
  { month: "Q7", fyps: 320, escrow: 82, hires: 130, spinoffs: 16 },
  { month: "Q8", fyps: 500, escrow: 140, hires: 210, spinoffs: 22 },
];

const universities = [
  { name: "NUST", penetration: 45, fyps: 82, status: "integrated" },
  { name: "LUMS", penetration: 38, fyps: 64, status: "integrated" },
  { name: "FAST-NU", penetration: 32, fyps: 48, status: "onboarding" },
  { name: "COMSATS", penetration: 28, fyps: 35, status: "onboarding" },
  { name: "UET Lahore", penetration: 15, fyps: 18, status: "pilot" },
  { name: "IBA", penetration: 12, fyps: 14, status: "pilot" },
];

const dominanceChecklist = [
  { label: "500+ Funded FYPs", current: 185, target: 500, met: false },
  { label: "Recurring Corporate Capital", current: 12, target: 25, met: false },
  { label: "Government Interest Visible", current: 1, target: 1, met: true },
  { label: "Startup Spin-offs Measurable", current: 7, target: 10, met: false },
  { label: "Employment Conversion Proven", current: 78, target: 50, met: true },
  { label: "Positive Cash Flow Trajectory", current: 0, target: 1, met: false },
  { label: "Dispute Rate Manageable", current: 4, target: 5, met: true },
  { label: "Trust Scoring Stable", current: 1, target: 1, met: true },
];

const weeklyOps = [
  { metric: "New FYPs Created", value: 12 },
  { metric: "FYPs Funded", value: 8 },
  { metric: "Escrow Volume (PKR)", value: "3.2M" },
  { metric: "Disputes Opened", value: 1 },
  { metric: "Milestones Completed", value: 24 },
  { metric: "Corp Onboarding", value: 2 },
  { metric: "Revenue Growth %", value: "8.4%" },
  { metric: "Retention %", value: "86%" },
];

const RegionalDominationPage = () => (
  <>
    <Helmet><title>Regional Domination | RCollab</title></Helmet>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            Region-First Domination Blueprint
          </h1>
          <p className="text-muted-foreground mt-1">
            Build economic gravity in one region before expanding — scale proof, not vision
          </p>
        </div>

        <Tabs defaultValue="flywheel" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="flywheel">FYP Flywheel</TabsTrigger>
            <TabsTrigger value="universities">Universities</TabsTrigger>
            <TabsTrigger value="dominance">Dominance Gate</TabsTrigger>
            <TabsTrigger value="warroom">War Room</TabsTrigger>
          </TabsList>

          <TabsContent value="flywheel" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Funded FYP Flywheel Projection</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={flywheelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                    <Area type="monotone" dataKey="fyps" name="Funded FYPs" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="hires" name="Hires" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="spinoffs" name="Spin-offs" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="universities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> University Integration Status</CardTitle>
                <p className="text-sm text-muted-foreground">Target: 40%+ FYP penetration per university</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {universities.map((uni) => (
                  <div key={uni.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{uni.name}</p>
                        <p className="text-sm text-muted-foreground">{uni.fyps} FYPs routed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={uni.penetration} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{uni.penetration}% penetration</p>
                      </div>
                      <Badge variant={uni.status === "integrated" ? "default" : uni.status === "onboarding" ? "secondary" : "outline"}>
                        {uni.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dominance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5" /> Expansion Gate Conditions</CardTitle>
                <p className="text-sm text-muted-foreground">Do not expand until all conditions are met</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {dominanceChecklist.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.met ? "bg-chart-2" : "bg-muted"}`} />
                      <p className="font-medium text-foreground">{item.label}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{item.current} / {item.target}</span>
                      <Badge className={item.met ? "bg-chart-2/20 text-chart-2" : "bg-muted text-muted-foreground"}>
                        {item.met ? "MET" : "PENDING"}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">{dominanceChecklist.filter(c => c.met).length} / {dominanceChecklist.length} conditions met</p>
                  <p className="text-sm text-muted-foreground">Expansion NOT recommended yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warroom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Weekly War Room Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {weeklyOps.map((op) => (
                    <div key={op.metric} className="p-4 rounded-lg border border-border text-center">
                      <p className="text-2xl font-bold text-primary">{op.value}</p>
                      <p className="text-sm text-muted-foreground">{op.metric}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </>
);

export default RegionalDominationPage;

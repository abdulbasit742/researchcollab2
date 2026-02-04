import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Leaf, Zap, Droplets, Recycle, TrendingDown, Globe } from "lucide-react";

export function CarbonFootprintTracker() {
  const footprint = { total: 125000, scope1: 25000, scope2: 50000, scope3: 50000, trend: "decreasing" };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          Carbon Footprint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 rounded-lg bg-green-500/10">
          <p className="text-3xl font-bold text-green-600">{(footprint.total/1000).toFixed(0)} tCO₂e</p>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <TrendingDown className="h-4 w-4 text-green-600" /> Decreasing trend
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Scope 1 (Direct)</span>
            <span>{footprint.scope1.toLocaleString()} kg</span>
          </div>
          <Progress value={(footprint.scope1/footprint.total)*100} className="h-2" />
          <div className="flex justify-between text-sm">
            <span>Scope 2 (Energy)</span>
            <span>{footprint.scope2.toLocaleString()} kg</span>
          </div>
          <Progress value={(footprint.scope2/footprint.total)*100} className="h-2" />
          <div className="flex justify-between text-sm">
            <span>Scope 3 (Value Chain)</span>
            <span>{footprint.scope3.toLocaleString()} kg</span>
          </div>
          <Progress value={(footprint.scope3/footprint.total)*100} className="h-2" />
        </div>
        <Button variant="outline" className="w-full">Purchase Carbon Offsets</Button>
      </CardContent>
    </Card>
  );
}

export function ESGScoreCard() {
  const esg = { overall: 78, environmental: 82, social: 75, governance: 77 };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          ESG Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-4xl font-bold text-primary">{esg.overall}</p>
          <p className="text-sm text-muted-foreground">Overall Score</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-green-500/10">
            <p className="text-xl font-bold text-green-600">{esg.environmental}</p>
            <p className="text-xs text-muted-foreground">Environ.</p>
          </div>
          <div className="p-2 rounded bg-blue-500/10">
            <p className="text-xl font-bold text-blue-600">{esg.social}</p>
            <p className="text-xs text-muted-foreground">Social</p>
          </div>
          <div className="p-2 rounded bg-purple-500/10">
            <p className="text-xl font-bold text-purple-600">{esg.governance}</p>
            <p className="text-xs text-muted-foreground">Govern.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SustainabilityGoals() {
  const goals = [
    { title: "Net Zero by 2030", progress: 35, status: "on_track" },
    { title: "100% Renewable", progress: 65, status: "on_track" },
    { title: "Zero Waste", progress: 45, status: "at_risk" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Sustainability Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{goal.title}</span>
              <Badge variant={goal.status === "on_track" ? "default" : "destructive"} className="text-xs">
                {goal.status.replace("_", " ")}
              </Badge>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CircularEconomyMetrics() {
  const waste = { recycled: 70, composted: 10, landfill: 20 };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Recycle className="h-5 w-5 text-green-600" />
          Circular Economy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-green-600">{waste.recycled}%</p>
          <p className="text-sm text-muted-foreground">Recycling Rate</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              Recycled
            </span>
            <span>{waste.recycled}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              Composted
            </span>
            <span>{waste.composted}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Landfill
            </span>
            <span>{waste.landfill}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WaterUsageTracker() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          Water Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-4 rounded-lg bg-blue-500/10">
          <p className="text-3xl font-bold text-blue-600">125k gal</p>
          <p className="text-sm text-muted-foreground">This Month</p>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <span>vs Last Month</span>
          <span className="text-green-600">-12%</span>
        </div>
      </CardContent>
    </Card>
  );
}

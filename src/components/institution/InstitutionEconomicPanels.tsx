import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Users, Briefcase, GraduationCap, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EconomicPanelsProps {
  orgId: string;
  stats?: {
    totalEarnings: number;
    completedDeals: number;
    activeDeals: number;
    avgTrustScore: number;
    memberCount: number;
  };
}

const mockSkillData = [
  { skill: "Python", demand: 85, supply: 60 },
  { skill: "Data Science", demand: 78, supply: 45 },
  { skill: "ML/AI", demand: 90, supply: 35 },
  { skill: "Web Dev", demand: 65, supply: 70 },
  { skill: "Research", demand: 72, supply: 55 },
  { skill: "Writing", demand: 50, supply: 65 },
];

export function InstitutionEconomicPanels({ orgId, stats }: EconomicPanelsProps) {
  const s = stats || { totalEarnings: 0, completedDeals: 0, activeDeals: 0, avgTrustScore: 0, memberCount: 0 };
  const employabilityRate = s.memberCount > 0 ? Math.min(((s.completedDeals / Math.max(s.memberCount, 1)) * 100), 100) : 0;

  return (
    <div className="space-y-6">
      {/* Economic Output Panel */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Economic Output
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-xl font-bold">PKR {s.totalEarnings.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Completed Deals</p>
              <p className="text-xl font-bold">{s.completedDeals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Active Deals</p>
              <p className="text-xl font-bold">{s.activeDeals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Avg Trust Score</p>
              <p className="text-xl font-bold">{s.avgTrustScore}/100</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Talent Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Talent Distribution — Skill Demand vs Supply
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockSkillData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="demand" fill="hsl(var(--primary))" name="Demand" radius={[4, 4, 0, 0]} />
              <Bar dataKey="supply" fill="hsl(var(--muted-foreground))" name="Supply" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Student Employability Index */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Student Employability Index
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Students with Completed Deals</span>
                <span className="font-semibold">{employabilityRate.toFixed(0)}%</span>
              </div>
              <Progress value={employabilityRate} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Avg Time to First Deal</p>
                <p className="text-lg font-bold">14 days</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Trust Growth Rate</p>
                <p className="text-lg font-bold text-primary">+2.4/mo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faculty Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Faculty Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Research Collaborations</p>
                <p className="text-lg font-bold">12</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Deal Volume</p>
                <p className="text-lg font-bold">28</p>
              </div>
              <div className="p-3 border rounded-lg col-span-2">
                <p className="text-xs text-muted-foreground">Knowledge Output Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold">72/100</p>
                  <Badge variant="outline" className="text-primary">Good</Badge>
                </div>
                <Progress value={72} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

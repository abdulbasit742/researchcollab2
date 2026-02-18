import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Award, TrendingUp, Target, Briefcase, Users, FileCheck, Zap } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";

const trustTrajectory = [
  { month: "Jan", score: 22 }, { month: "Feb", score: 28 }, { month: "Mar", score: 35 },
  { month: "Apr", score: 42 }, { month: "May", score: 48 }, { month: "Jun", score: 55 },
  { month: "Jul", score: 60 }, { month: "Aug", score: 58 }, { month: "Sep", score: 63 },
  { month: "Oct", score: 70 }, { month: "Nov", score: 74 }, { month: "Dec", score: 78 },
];

const deliveryRadar = [
  { metric: "On-Time", value: 88 }, { metric: "Budget", value: 92 },
  { metric: "Quality", value: 85 }, { metric: "Rehire", value: 76 },
  { metric: "Low Dispute", value: 94 }, { metric: "Consistency", value: 82 },
];

const verifiedSkills = [
  { name: "React/TypeScript", badge: "enterprise_validated", milestones: 24, score: 95 },
  { name: "Machine Learning", badge: "high_performance", milestones: 12, score: 88 },
  { name: "Data Analysis", badge: "repeatedly_delivered", milestones: 8, score: 78 },
  { name: "API Design", badge: "demonstrated", milestones: 3, score: 65 },
];

const opportunityRoutes = [
  { type: "FYP Project", match: 94, trust: 78, skill: 96, status: "routed" },
  { type: "Research Grant", match: 87, trust: 78, skill: 82, status: "routed" },
  { type: "Startup Collab", match: 81, trust: 78, skill: 88, status: "pending" },
  { type: "Corporate Hire", match: 76, trust: 78, skill: 90, status: "pending" },
];

const hiringComparison = [
  { metric: "Trust Score", rcollab: 78, linkedin: 0 },
  { metric: "Escrow History", rcollab: 92, linkedin: 0 },
  { metric: "Delivery Rate", rcollab: 88, linkedin: 0 },
  { metric: "Skill Verified", rcollab: 85, linkedin: 40 },
  { metric: "Dispute Exposure", rcollab: 6, linkedin: 0 },
];

const badgeColors: Record<string, string> = {
  demonstrated: "bg-muted text-muted-foreground",
  repeatedly_delivered: "bg-primary/20 text-primary",
  high_performance: "bg-chart-4/20 text-chart-4",
  enterprise_validated: "bg-chart-2/20 text-chart-2",
};

const badgeLabels: Record<string, string> = {
  demonstrated: "Demonstrated",
  repeatedly_delivered: "Repeatedly Delivered",
  high_performance: "High Performance",
  enterprise_validated: "Enterprise Validated",
};

const ProfessionalIdentityPage = () => (
  <>
    <Helmet><title>Professional Identity Engine | RCollab</title></Helmet>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Verified Economic Identity
          </h1>
          <p className="text-muted-foreground mt-1">
            Proof-of-work profiles replace self-reported claims with escrow-verified delivery metrics
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="profile">Proof-of-Work</TabsTrigger>
            <TabsTrigger value="skills">Verified Skills</TabsTrigger>
            <TabsTrigger value="trust">Trust Trajectory</TabsTrigger>
            <TabsTrigger value="routing">Opportunity Routing</TabsTrigger>
            <TabsTrigger value="hiring">Corporate Hiring</TabsTrigger>
          </TabsList>

          {/* Proof-of-Work Profile */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Escrow Processed", value: "PKR 2.4M", icon: Zap },
                { label: "Projects Delivered", value: "18", icon: FileCheck },
                { label: "On-Time Delivery", value: "88%", icon: TrendingUp },
                { label: "Dispute Rate", value: "3.2%", icon: Shield },
              ].map((m) => (
                <Card key={m.label}>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <m.icon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{m.value}</p>
                      <p className="text-sm text-muted-foreground">{m.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle>Delivery Consistency Radar</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={deliveryRadar}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Professional Value Score */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Professional Economic Value Score</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Capital Handled", value: 82 },
                  { label: "Reliability", value: 88 },
                  { label: "Skill Depth", value: 85 },
                  { label: "Execution Speed", value: 76 },
                  { label: "Dispute Avoidance", value: 94 },
                  { label: "Trust Stability", value: 78 },
                ].map((f) => (
                  <div key={f.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-medium text-foreground">{f.value}/100</span>
                    </div>
                    <Progress value={f.value} className="h-2" />
                  </div>
                ))}
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Overall Value Score</span>
                    <span className="text-2xl font-bold text-primary">83.8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verified Skills */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verified Skill Engine</CardTitle>
                <p className="text-sm text-muted-foreground">Skills validated through milestone delivery, sponsor confirmation, and AI analysis</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {verifiedSkills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <Award className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{skill.name}</p>
                        <p className="text-sm text-muted-foreground">{skill.milestones} milestones delivered</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={skill.score} className="w-24 h-2" />
                      <span className="text-sm font-medium text-foreground w-8">{skill.score}</span>
                      <Badge className={badgeColors[skill.badge]}>{badgeLabels[skill.badge]}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trust Trajectory */}
          <TabsContent value="trust" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Trust Score Evolution Timeline</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={trustTrajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Performance Stability", value: "High", desc: "Consistent delivery over 12 months" },
                { label: "Recovery Events", value: "1", desc: "Aug dip recovered in 2 months" },
                { label: "Trajectory", value: "Rising", desc: "+56 points over 12 months" },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-primary">{s.value}</p>
                    <p className="font-medium text-foreground">{s.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Opportunity Routing */}
          <TabsContent value="routing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> AI Opportunity Routing</CardTitle>
                <p className="text-sm text-muted-foreground">System matches opportunities based on trust + performance — no applications needed</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {opportunityRoutes.map((opp) => (
                    <div key={opp.type} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{opp.type}</p>
                          <p className="text-sm text-muted-foreground">Skill match: {opp.skill}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{opp.match}%</p>
                          <p className="text-xs text-muted-foreground">Match Score</p>
                        </div>
                        <Badge variant={opp.status === "routed" ? "default" : "secondary"}>{opp.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Corporate Hiring */}
          <TabsContent value="hiring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Corporate Hiring Panel</CardTitle>
                <p className="text-sm text-muted-foreground">RCollab vs LinkedIn: Verified data vs self-reported claims</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={hiringComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                    <Legend />
                    <Bar dataKey="rcollab" name="RCollab" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="linkedin" name="LinkedIn" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Hiring Likelihood Engine</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-5xl font-bold text-primary">82%</p>
                  <p className="text-lg text-muted-foreground mt-2">Employment Probability</p>
                  <p className="text-sm text-muted-foreground mt-1">Based on skill validation, trust stability, and industry demand</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </>
);

export default ProfessionalIdentityPage;

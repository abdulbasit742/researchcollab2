import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Clock, Star, Building2 } from "lucide-react";

const studentRankings = [
  { rank: 1, name: "Aisha Noor", institution: "NUST", trustGrowth: 42, milestones: 18, score: 95 },
  { rank: 2, name: "Fatima Ali", institution: "FAST-NUCES", trustGrowth: 38, milestones: 15, score: 91 },
  { rank: 3, name: "Omar Farooq", institution: "LUMS", trustGrowth: 35, milestones: 14, score: 88 },
  { rank: 4, name: "Hassan Raza", institution: "COMSATS", trustGrowth: 30, milestones: 12, score: 82 },
  { rank: 5, name: "Zainab Khan", institution: "NUST", trustGrowth: 28, milestones: 11, score: 79 },
];

const supervisorRankings = [
  { rank: 1, name: "Dr. Usman Tariq", institution: "NUST", completionRate: 95, students: 15, rating: 4.9 },
  { rank: 2, name: "Dr. Ahmed Khan", institution: "FAST-NUCES", completionRate: 90, students: 12, rating: 4.7 },
  { rank: 3, name: "Prof. Sara Malik", institution: "LUMS", completionRate: 88, students: 10, rating: 4.6 },
];

const departmentRankings = [
  { rank: 1, dept: "Computer Science", institution: "NUST", output: 2500000, fyps: 45, trust: 78 },
  { rank: 2, dept: "Electrical Engineering", institution: "FAST-NUCES", output: 1800000, fyps: 32, trust: 72 },
  { rank: 3, dept: "Information Systems", institution: "LUMS", output: 1500000, fyps: 28, trust: 70 },
];

const medalColor = (rank: number) => rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-orange-600" : "text-muted-foreground";

export default function AcademicRankingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Trophy className="h-8 w-8 text-yellow-500" /> Academic Rankings</h1>
          <p className="text-muted-foreground mt-1">Competition drives excellence</p>
        </div>

        <Tabs defaultValue="students">
          <TabsList>
            <TabsTrigger value="students">Top Students</TabsTrigger>
            <TabsTrigger value="supervisors">Best Supervisors</TabsTrigger>
            <TabsTrigger value="departments">Top Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Students by Trust Growth</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {studentRankings.map(s => (
                  <div key={s.rank} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Trophy className={`h-5 w-5 ${medalColor(s.rank)}`} />
                      <div>
                        <p className="font-medium">#{s.rank} {s.name}</p>
                        <p className="text-sm text-muted-foreground">{s.institution}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">Trust +{s.trustGrowth}</Badge>
                      <Badge variant="outline">{s.milestones} milestones</Badge>
                      <span className="font-bold text-primary">{s.score}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supervisors" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" /> Most Reliable Supervisors</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {supervisorRankings.map(s => (
                  <div key={s.rank} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Trophy className={`h-5 w-5 ${medalColor(s.rank)}`} />
                      <div><p className="font-medium">#{s.rank} {s.name}</p><p className="text-sm text-muted-foreground">{s.institution}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{s.completionRate}% completion</Badge>
                      <Badge variant="outline">{s.students} students</Badge>
                      <span className="font-bold text-yellow-500">★ {s.rating}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Top Departments</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {departmentRankings.map(d => (
                  <div key={d.rank} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Trophy className={`h-5 w-5 ${medalColor(d.rank)}`} />
                      <div><p className="font-medium">#{d.rank} {d.dept}</p><p className="text-sm text-muted-foreground">{d.institution}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">PKR {(d.output / 1000000).toFixed(1)}M output</Badge>
                      <Badge variant="outline">{d.fyps} FYPs</Badge>
                      <Badge variant="outline">Trust {d.trust}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

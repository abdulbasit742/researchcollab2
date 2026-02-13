import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Star, Building2, Loader2 } from "lucide-react";
import { useTopStudents, useTopSupervisors } from "@/hooks/useAcademicData";

const medalColor = (rank: number) => rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-orange-600" : "text-muted-foreground";

export default function AcademicRankingsPage() {
  const { data: students, isLoading: loadingStudents } = useTopStudents();
  const { data: supervisors, isLoading: loadingSupervisors } = useTopSupervisors();

  const isLoading = loadingStudents || loadingSupervisors;

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

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
          </TabsList>

          <TabsContent value="students" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Students by Trust Growth</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(students || []).length === 0 && <p className="text-center text-muted-foreground py-8">No student performance data yet</p>}
                {(students || []).map((s, i) => (
                  <div key={s.student_id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Trophy className={`h-5 w-5 ${medalColor(i + 1)}`} />
                      <div>
                        <p className="font-medium">#{i + 1} Student</p>
                        <p className="text-sm text-muted-foreground">ID: {s.student_id?.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">Trust +{s.trust_growth ?? 0}</Badge>
                      <Badge variant="outline">Timeliness {s.milestone_timeliness ?? 0}%</Badge>
                      <span className="font-bold text-primary">{s.consistency_score ?? 0}</span>
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
                {(supervisors || []).length === 0 && <p className="text-center text-muted-foreground py-8">No supervisor performance data yet</p>}
                {(supervisors || []).map((s, i) => (
                  <div key={s.supervisor_id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Trophy className={`h-5 w-5 ${medalColor(i + 1)}`} />
                      <div>
                        <p className="font-medium">#{i + 1} Supervisor</p>
                        <p className="text-sm text-muted-foreground">ID: {s.supervisor_id?.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{s.student_completion_rate ?? 0}% completion</Badge>
                      <span className="font-bold text-yellow-500">★ {s.institutional_rating ?? 0}</span>
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

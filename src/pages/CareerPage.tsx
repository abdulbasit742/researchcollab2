import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCareerProfile, useCareerMilestones, useMentorship, useCareerRiskFlags } from "@/hooks/useCareerMentorship";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Award, Users, AlertCircle, Plus, Target, GraduationCap, TrendingUp, Heart } from "lucide-react";
import { format } from "date-fns";

export default function CareerPage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useCareerProfile();
  const { milestones, loading: milestonesLoading, addMilestone } = useCareerMilestones();
  const { relationships, asMentor, asMentee, loading: mentorshipLoading, requestMentorship, respondToRequest } = useMentorship();
  const { flags, loading: flagsLoading, acknowledgeFlag } = useCareerRiskFlags();

  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    milestone_type: "award_received" as const,
    title: "",
    description: "",
    institution: "",
    achieved_at: new Date().toISOString().split("T")[0],
    is_public: true,
  });

  const handleAddMilestone = async () => {
    const result = await addMilestone(newMilestone);
    if (result.success) {
      setMilestoneOpen(false);
      setNewMilestone({
        milestone_type: "award_received",
        title: "",
        description: "",
        institution: "",
        achieved_at: new Date().toISOString().split("T")[0],
        is_public: true,
      });
    }
  };

  const stageLabels: Record<string, string> = {
    undergraduate: "Undergraduate",
    masters: "Master's",
    phd: "PhD Candidate",
    postdoc: "Postdoctoral",
    faculty: "Faculty",
    senior_researcher: "Senior Researcher",
    emeritus: "Emeritus",
    industry: "Industry",
    independent: "Independent",
  };

  const milestoneTypeLabels: Record<string, string> = {
    degree_completed: "Degree Completed",
    first_publication: "First Publication",
    grant_awarded: "Grant Awarded",
    supervision_started: "Supervision Started",
    tenure: "Tenure",
    major_transition: "Major Transition",
    award_received: "Award Received",
    leadership_role: "Leadership Role",
    industry_collaboration: "Industry Collaboration",
    teaching_excellence: "Teaching Excellence",
    citation_milestone: "Citation Milestone",
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              Career & Mentorship
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your academic journey and mentorship relationships
            </p>
          </div>
        </div>

        {/* Profile Overview */}
        {profileLoading ? (
          <Skeleton className="h-32" />
        ) : profile ? (
          <Card>
            <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-6 py-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {stageLabels[profile.current_stage] || profile.current_stage}
                  </h2>
                  <p className="text-muted-foreground">
                    {profile.primary_domain || "No primary domain set"}
                  </p>
                  {profile.years_in_academia && (
                    <p className="text-sm text-muted-foreground">
                      {profile.years_in_academia} years in academia
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex flex-wrap gap-2">
                {profile.is_open_to_mentoring && (
                  <Badge variant="default">
                    <Heart className="h-3 w-3 mr-1" />
                    Open to Mentoring
                  </Badge>
                )}
                {profile.seeking_mentorship && (
                  <Badge variant="secondary">
                    <Target className="h-3 w-3 mr-1" />
                    Seeking Mentorship
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No career profile found</h3>
            <p className="text-muted-foreground">
              Create a scholar passport to set up your career profile
            </p>
          </Card>
        )}

        {/* Risk Flags */}
        {flags && flags.length > 0 && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                Career Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flags.map((flag) => (
                  <div key={flag.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-background">
                    <div>
                      <p className="font-medium capitalize">{flag.risk_type.replace(/_/g, " ")}</p>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                      )}
                    </div>
                    <Badge variant={
                      flag.severity === "high" ? "destructive" :
                      flag.severity === "medium" ? "secondary" : "outline"
                    }>
                      {flag.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="milestones" className="space-y-6">
          <TabsList>
            <TabsTrigger value="milestones">
              <Award className="h-4 w-4 mr-2" />
              Milestones
            </TabsTrigger>
            <TabsTrigger value="mentorship">
              <Users className="h-4 w-4 mr-2" />
              Mentorship
            </TabsTrigger>
          </TabsList>

          <TabsContent value="milestones" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={milestoneOpen} onOpenChange={setMilestoneOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Career Milestone</DialogTitle>
                    <DialogDescription>
                      Record a significant achievement in your career
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Milestone Type</Label>
                      <Select
                        value={newMilestone.milestone_type}
                        onValueChange={(v: any) => setNewMilestone({ ...newMilestone, milestone_type: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(milestoneTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                        placeholder="e.g., PhD Graduation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                        placeholder="Describe this achievement..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={newMilestone.institution}
                          onChange={(e) => setNewMilestone({ ...newMilestone, institution: e.target.value })}
                          placeholder="Institution name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newMilestone.achieved_at}
                          onChange={(e) => setNewMilestone({ ...newMilestone, achieved_at: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddMilestone} className="w-full">
                      Add Milestone
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {milestonesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : milestones.length === 0 ? (
              <Card className="p-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No milestones yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your career achievements
                </p>
                <Button onClick={() => setMilestoneOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Milestone
                </Button>
              </Card>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="relative pl-14">
                      <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                      <Card>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{milestone.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {milestoneTypeLabels[milestone.milestone_type] || milestone.milestone_type}
                              </p>
                              {milestone.institution && (
                                <p className="text-sm text-muted-foreground">{milestone.institution}</p>
                              )}
                              {milestone.description && (
                                <p className="text-sm mt-2">{milestone.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(milestone.achieved_at), "MMM yyyy")}
                              </p>
                              <Badge variant={
                                milestone.verification_status === "verified" ? "default" : "secondary"
                              }>
                                {milestone.verification_status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mentorship" className="space-y-6">
            {/* As Mentor */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                As Mentor ({asMentor.length})
              </h3>
              {mentorshipLoading ? (
                <Skeleton className="h-24" />
              ) : asMentor.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">
                    You're not currently mentoring anyone
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {asMentor.map((rel) => (
                    <Card key={rel.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>M</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium capitalize">{rel.mentorship_type} Mentorship</p>
                              <p className="text-sm text-muted-foreground">
                                Since {format(new Date(rel.start_date), "MMM yyyy")}
                              </p>
                            </div>
                          </div>
                          <Badge>{rel.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* As Mentee */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                As Mentee ({asMentee.length})
              </h3>
              {mentorshipLoading ? (
                <Skeleton className="h-24" />
              ) : asMentee.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">
                    You don't have any mentors yet
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {asMentee.map((rel) => (
                    <Card key={rel.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>M</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium capitalize">{rel.mentorship_type} Mentorship</p>
                              <p className="text-sm text-muted-foreground">
                                Since {format(new Date(rel.start_date), "MMM yyyy")}
                              </p>
                            </div>
                          </div>
                          <Badge>{rel.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, DollarSign, GraduationCap, Kanban, Users, 
  Zap, Calendar, Building, Sparkles, TrendingUp
} from "lucide-react";

// Platform Components
import {
  VerificationStatusBadge,
  TrustProfileCard,
  BadgesShowcase,
  FinancialStatCard,
  RevenueStreamsCard,
  FinancialGoalsTracker,
  CourseCard,
  CertificateCard,
  MentorMatchCard,
  LearningGoalCard,
  KanbanBoard,
  SprintOverview,
  JobPostingCard,
  CandidatePipelineCard,
  EmployeeCard,
  WorkflowCard,
  IntegrationCard,
  AutomationRuleCard,
  EventCard,
  SSOConfigPanel,
  RBACManager,
  AuditLogViewer,
} from "@/components/platform";

// Mock data for showcasing components
const mockTrustProfile = {
  id: "1",
  user_id: "user-1",
  trust_score: 85,
  verification_level: "verified",
  total_projects_completed: 24,
  total_projects_posted: 8,
  successful_rate: 0.92,
  response_time_hours: 4,
  is_verified_student: true,
  is_verified_researcher: true,
  is_verified_partner: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockBadges = [
  { id: "1", user_id: "1", badge_type: "achievement", badge_name: "Early Adopter", description: "Joined during beta", earned_at: new Date().toISOString() },
  { id: "2", user_id: "1", badge_type: "skill", badge_name: "Top Researcher", description: "Published 10+ papers", earned_at: new Date().toISOString() },
  { id: "3", user_id: "1", badge_type: "trust", badge_name: "Trusted Partner", description: "100% success rate", earned_at: new Date().toISOString() },
];

const categories = [
  { id: "verification", label: "Verification", icon: Shield, count: 4 },
  { id: "financial", label: "Financial", icon: DollarSign, count: 3 },
  { id: "learning", label: "Learning", icon: GraduationCap, count: 4 },
  { id: "project", label: "Project Mgmt", icon: Kanban, count: 2 },
  { id: "hr", label: "HR & Talent", icon: Users, count: 3 },
  { id: "automation", label: "Automation", icon: Zap, count: 3 },
  { id: "events", label: "Events", icon: Calendar, count: 1 },
  { id: "enterprise", label: "Enterprise", icon: Building, count: 3 },
];

function ComponentCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-muted/30">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}

export default function FeaturesShowcasePage() {
  const [activeCategory, setActiveCategory] = useState("verification");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Platform Components</h1>
              <p className="text-muted-foreground">Explore all available UI components across domains</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <Badge 
                key={cat.id} 
                variant={activeCategory === cat.id ? "default" : "outline"}
                className="cursor-pointer gap-1"
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="h-3 w-3" />
                {cat.label}
                <span className="ml-1 text-xs opacity-70">{cat.count}</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="hidden">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>{cat.label}</TabsTrigger>
            ))}
          </TabsList>

          {/* Verification Components */}
          <TabsContent value="verification" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="VerificationStatusBadge" description="Shows verification status with icon">
                <div className="flex flex-wrap gap-2">
                  <VerificationStatusBadge status="pending" />
                  <VerificationStatusBadge status="approved" />
                  <VerificationStatusBadge status="rejected" />
                  <VerificationStatusBadge status="requires_more_info" />
                </div>
              </ComponentCard>

              <div className="md:col-span-2">
                <ComponentCard title="TrustProfileCard" description="Complete trust profile overview">
                  <TrustProfileCard profile={mockTrustProfile} />
                </ComponentCard>
              </div>

              <ComponentCard title="BadgesShowcase" description="User badges and achievements">
                <BadgesShowcase badges={mockBadges} />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* Financial Components */}
          <TabsContent value="financial" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="FinancialStatCard" description="Key financial metrics">
                <div className="space-y-3">
                  <FinancialStatCard
                    title="Monthly Revenue"
                    value="PKR 250,000"
                    change={12}
                    trend="up"
                    icon={<TrendingUp className="h-5 w-5 text-primary" />}
                  />
                  <FinancialStatCard
                    title="Pending Payments"
                    value="PKR 45,000"
                    icon={<DollarSign className="h-5 w-5 text-amber-500" />}
                  />
                </div>
              </ComponentCard>

              <ComponentCard title="RevenueStreamsCard" description="Revenue breakdown by source">
                <RevenueStreamsCard
                  streams={[
                    { stream_id: "1", source: "consulting", monthly_average: 150000, volatility: 10, growth_rate: 12, dependency_risk: "low", diversification_score: 80 },
                    { stream_id: "2", source: "projects", monthly_average: 90000, volatility: 15, growth_rate: 8, dependency_risk: "medium", diversification_score: 70 },
                    { stream_id: "3", source: "royalties", monthly_average: 60000, volatility: 5, growth_rate: 5, dependency_risk: "low", diversification_score: 90 },
                  ]}
                />
              </ComponentCard>

              <ComponentCard title="FinancialGoalsTracker" description="Track financial targets">
                <FinancialGoalsTracker
                  goals={[
                    { goal_id: "1", goal_type: "savings", target_amount: 500000, current_progress: 350000, deadline: "2024-12-31", on_track: true, required_monthly_rate: 25000, projected_achievement_date: "2024-11-15" },
                    { goal_id: "2", goal_type: "income", target_amount: 400000, current_progress: 280000, deadline: "2024-06-30", on_track: true, required_monthly_rate: 40000, projected_achievement_date: "2024-06-15" },
                  ]}
                />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* Learning Components */}
          <TabsContent value="learning" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="CourseCard" description="Course display with progress">
                <CourseCard
                  course={{
                    id: "1",
                    title: "Advanced Machine Learning",
                    slug: "advanced-ml",
                    description: "Learn advanced ML concepts",
                    category: "Data Science",
                    level: "advanced",
                    language: "en",
                    thumbnail_url: null,
                    instructor_user_id: null,
                    instructor_org_id: null,
                    price: 0,
                    estimated_hours: 8,
                    is_published: true,
                    is_featured: true,
                    total_enrollments: 1250,
                    avg_rating: 4.8,
                    created_at: new Date().toISOString(),
                    instructor: { full_name: "Dr. Sarah Chen", avatar_url: null },
                  }}
                />
              </ComponentCard>

              <ComponentCard title="CertificateCard" description="Earned certifications">
                <CertificateCard
                  certificate={{
                    id: "1",
                    course_id: "course-1",
                    user_id: "user-1",
                    certificate_number: "DS-2024-001",
                    verification_hash: "abc123",
                    issued_at: new Date().toISOString(),
                    certificate_url: null,
                    is_revoked: false,
                  }}
                />
              </ComponentCard>

              <ComponentCard title="MentorMatchCard" description="Mentor recommendations">
                <MentorMatchCard
                  match={{
                    mentor_id: "mentor-1",
                    mentor_name: "Prof. Ahmed Khan",
                    expertise_alignment: 92,
                    communication_style_fit: 88,
                    availability_match: 85,
                    success_rate: 95,
                    mentees_currently: 3,
                    mentees_max: 5,
                    overall_fit_score: 90,
                    why_matched: ["AI expertise", "Available for mentorship"],
                  }}
                />
              </ComponentCard>

              <ComponentCard title="LearningGoalCard" description="Track learning objectives">
                <LearningGoalCard
                  goal={{
                    goal_id: "1",
                    title: "Master Python for Data Science",
                    category: "skill",
                    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    progress_percentage: 72,
                    milestones: [
                      { milestone: "Complete basics", due_date: "2024-01-15", completed: true },
                      { milestone: "Pandas mastery", due_date: "2024-02-15", completed: true },
                      { milestone: "ML fundamentals", due_date: "2024-03-15", completed: false },
                    ],
                    blockers: [],
                  }}
                />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* Project Management Components */}
          <TabsContent value="project" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComponentCard title="KanbanBoard" description="Task management board">
                <div className="h-[400px]">
                  <KanbanBoard />
                </div>
              </ComponentCard>

              <ComponentCard title="SprintOverview" description="Sprint progress and stats">
                <SprintOverview />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* HR & Talent Components */}
          <TabsContent value="hr" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="JobPostingCard" description="Job listing display">
                <JobPostingCard
                  job={{
                    id: "1",
                    title: "Senior Research Scientist",
                    department: "AI Research",
                    location: "Remote",
                    type: "full_time",
                    salary: { min: 400000, max: 600000, currency: "PKR" },
                    status: "open",
                    applications: 45,
                    views: 320,
                    postedAt: new Date().toISOString(),
                    closesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  }}
                />
              </ComponentCard>

              <ComponentCard title="CandidatePipelineCard" description="Recruitment funnel">
                <CandidatePipelineCard
                  metrics={{
                    totalApplications: 120,
                    inScreening: 45,
                    inInterview: 18,
                    offers: 5,
                    hired: 2,
                  }}
                />
              </ComponentCard>

              <ComponentCard title="EmployeeCard" description="Team member profile">
                <EmployeeCard
                  employee={{
                    id: "1",
                    name: "Fatima Ali",
                    email: "fatima@company.com",
                    title: "Data Scientist",
                    department: "Analytics",
                    manager: "John Doe",
                    startDate: "2023-03-15",
                    status: "active",
                    performanceRating: 4.5,
                    salary: 350000,
                  }}
                />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* Automation Components */}
          <TabsContent value="automation" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="WorkflowCard" description="Automation workflow">
                <WorkflowCard
                  workflow={{
                    id: "1",
                    name: "New Lead Processing",
                    description: "Process incoming leads automatically",
                    trigger: { type: "webhook", config: {} },
                    steps: [
                      { id: "1", type: "action", action: "send_notification", config: {}, nextSteps: [] }
                    ],
                    status: "active",
                    executions: 156,
                    lastExecuted: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                  }}
                />
              </ComponentCard>

              <ComponentCard title="IntegrationCard" description="Connected services">
                <IntegrationCard
                  integration={{
                    id: "1",
                    name: "Slack",
                    type: "communication",
                    status: "connected",
                    config: {},
                    lastSync: new Date().toISOString(),
                  }}
                />
              </ComponentCard>

              <ComponentCard title="AutomationRuleCard" description="Conditional automation">
                <AutomationRuleCard
                  rule={{
                    id: "1",
                    name: "Auto-assign high priority",
                    condition: "Priority = High",
                    action: "Assign to Senior Team",
                    enabled: true,
                    priority: 1,
                    triggerCount: 89,
                    lastTriggered: new Date().toISOString(),
                  }}
                />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* Events Components */}
          <TabsContent value="events" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="EventCard" description="Event display">
                <EventCard
                  event={{
                    id: "1",
                    title: "AI Research Summit 2024",
                    description: "Annual AI research conference",
                    event_type: "Conference",
                    mode: "virtual",
                    start_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    end_datetime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
                    timezone: "UTC",
                    location_text: "Virtual",
                    meeting_link: null,
                    organizer_user_id: null,
                    organizer_org_id: null,
                    group_id: null,
                    visibility: "public",
                    cover_image_url: null,
                    max_attendees: 500,
                    registration_url: null,
                    is_featured: true,
                    attendee_count: 450,
                    created_at: new Date().toISOString(),
                  }}
                />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* Enterprise Components */}
          <TabsContent value="enterprise" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComponentCard title="SSOConfigPanel" description="Single Sign-On setup">
                <SSOConfigPanel />
              </ComponentCard>

              <ComponentCard title="RBACManager" description="Role-based access control">
                <RBACManager />
              </ComponentCard>

              <div className="lg:col-span-2">
                <ComponentCard title="AuditLogViewer" description="Activity audit trail">
                  <AuditLogViewer />
                </ComponentCard>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

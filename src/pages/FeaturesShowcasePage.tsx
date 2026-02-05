import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { 
  Shield, DollarSign, GraduationCap, Kanban, Users, 
  Zap, Calendar, Building, Sparkles, TrendingUp,
  MessageSquare, Globe, FileCheck, Award, Target,
  Briefcase, LineChart, Network, Lock, Bell,
  Search, Wallet, Clock, BookOpen, BarChart3,
   Settings, Database, Code, Cpu, Heart, Star,
   Compass, Flame, Brain, Trophy, Lightbulb,
   Volume2, Mic, Radio
} from "lucide-react";

// Platform Components
import {
  VerificationStatusBadge,
  TrustScoreDisplay,
  TrustProfileCard,
  VerificationSubmissionCard,
  BadgesShowcase,
  CredentialCard,
  CareerTimeline,
  ProfileModeSwitcher,
  FinancialStatCard,
  EarningsForecastCard,
  RevenueStreamsCard,
  ClientValueTable,
  FinancialGoalsTracker,
  WalletBalanceCard,
  CourseCard,
  CertificateCard,
  MentorMatchCard,
  LearningGoalCard,
  LearningAnalyticsCard,
  LearningCircleCard,
  KanbanBoard,
  GanttChartView,
  SprintOverview,
  TimeTrackingWidget,
  JobPostingCard,
  CandidatePipelineCard,
  EmployeeCard,
  PerformanceReviewCard,
  WorkflowCard,
  WorkflowBuilder,
  IntegrationCard,
  AutomationRuleCard,
  EventCard,
  SSOConfigPanel,
  RBACManager,
  AuditLogViewer,
  OrganizationSettings,
} from "@/components/platform";

// Additional Components
import { MarketDemandRadar } from "@/components/market";
import { WorkStatusIndicator } from "@/components/presence";
import { PortfolioShowcasePanel, PortfolioManager } from "@/components/portfolio";
import { ProfileViewsCard, ProfileViewsInline } from "@/components/profile";
import { PortableIdentityExport } from "@/components/portability";
import { CompliancePanel } from "@/components/compliance";
import { BadgeDisplay, SingleBadge } from "@/components/badges/BadgeDisplay";

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
  { id: "4", user_id: "1", badge_type: "special", badge_name: "Innovation Award", description: "Pioneering research", earned_at: new Date().toISOString() },
];

const mockCredentials = [
  { id: "1", user_id: "1", type: "degree", title: "Ph.D. in Computer Science", issuer: "MIT", issue_date: "2020-05-15", expiry_date: null, verification_status: "verified", verification_confidence: 95 },
  { id: "2", user_id: "1", type: "certification", title: "AWS Solutions Architect", issuer: "Amazon Web Services", issue_date: "2022-03-20", expiry_date: "2025-03-20", verification_status: "verified", verification_confidence: 100 },
  { id: "3", user_id: "1", type: "publication", title: "Machine Learning in Healthcare", issuer: "Nature", issue_date: "2023-01-10", expiry_date: null, verification_status: "pending", verification_confidence: 60 },
];

const mockCareerPhases = [
  { id: "1", phase_name: "Research Scientist", primary_role: "AI Research Lead", start_date: "2022-01-01", end_date: null, is_current: true, key_achievements: ["Led team of 5", "Published 3 papers", "Patent filed"] },
  { id: "2", phase_name: "PhD Student", primary_role: "Graduate Researcher", start_date: "2016-09-01", end_date: "2021-12-31", is_current: false, key_achievements: ["Dissertation defense", "2 publications"] },
  { id: "3", phase_name: "Software Engineer", primary_role: "Backend Developer", start_date: "2014-06-01", end_date: "2016-08-31", is_current: false, key_achievements: ["Microservices architecture"] },
];

const mockProfileModes = [
  { mode: "researcher", is_active: true },
  { mode: "advisor", is_active: false },
  { mode: "mentor", is_active: false },
  { mode: "operator", is_active: false },
];

const mockSubmission = {
  id: "1",
  user_id: "1",
  verification_type: "researcher",
  status: "approved",
  documents: ["doc1.pdf", "doc2.pdf"],
  submitted_data: { institution: "MIT", department: "CS" },
  reviewer_notes: "All documents verified successfully",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  reviewed_at: new Date().toISOString(),
  reviewer_id: "admin-1",
};

const mockClients = [
  { client_id: "c1", lifetime_value: 45000, project_count: 8, payment_reliability: 98, relationship_health: "excellent" as const },
  { client_id: "c2", lifetime_value: 28000, project_count: 5, payment_reliability: 85, relationship_health: "good" as const },
  { client_id: "c3", lifetime_value: 12000, project_count: 3, payment_reliability: 70, relationship_health: "at_risk" as const },
];

const mockLearningAnalytics = {
  total_learning_hours: 127,
  skills_developed: 12,
  learning_streak_days: 14,
  goals_completed: 5,
  strongest_learning_method: "video",
  time_of_day_preference: "morning",
  next_recommended_action: "Complete the Advanced ML course to unlock new career opportunities",
};

const mockLearningCircle = {
  circle_id: "lc1",
  topic: "Machine Learning Research",
  members: ["user1", "user2", "user3", "user4"],
  meeting_schedule: "Weekly Thursdays",
  resources_shared: 24,
  collective_progress: 68,
  active: true,
};

const mockPerformanceReview = {
  id: "pr1",
  employeeId: "emp1",
  reviewerId: "mgr1",
  period: "Q4 2024",
  overallRating: 4.5,
  goals: [
    { title: "Complete ML pipeline", status: "completed", rating: 5 },
    { title: "Mentor junior devs", status: "completed", rating: 4 },
    { title: "Document APIs", status: "in_progress", rating: 3 },
  ],
  feedback: "Strong technical skills with room to improve documentation practices. Excellent team player.",
  status: "submitted" as const,
  createdAt: new Date().toISOString(),
};

const categories = [
  { id: "verification", label: "Verification & Trust", icon: Shield, count: 9 },
  { id: "financial", label: "Financial Intelligence", icon: DollarSign, count: 7 },
  { id: "learning", label: "Learning & Development", icon: GraduationCap, count: 8 },
  { id: "project", label: "Project Management", icon: Kanban, count: 5 },
  { id: "hr", label: "HR & Talent", icon: Users, count: 5 },
  { id: "automation", label: "Automation", icon: Zap, count: 5 },
  { id: "events", label: "Events & Networking", icon: Calendar, count: 3 },
  { id: "enterprise", label: "Enterprise Admin", icon: Building, count: 5 },
  { id: "market", label: "Market Intelligence", icon: LineChart, count: 3 },
  { id: "identity", label: "Identity & Portability", icon: Globe, count: 4 },
  { id: "messaging", label: "Communication", icon: MessageSquare, count: 3 },
  { id: "analytics", label: "Analytics & Insights", icon: BarChart3, count: 4 },
   { id: "voice", label: "Voice & Audio", icon: Volume2, count: 4 },
   { id: "ambient", label: "Ambient Intelligence", icon: Lightbulb, count: 5 },
   { id: "collective", label: "Collective Intelligence", icon: Brain, count: 4 },
];

function ComponentCard({ 
  title, 
  description, 
  children,
  className = ""
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2 bg-gradient-to-r from-muted/50 to-muted/30">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <div className={`p-4 rounded-lg ${color}`}>
      <Icon className="h-6 w-6 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function FeaturesShowcasePage() {
  const [activeCategory, setActiveCategory] = useState("verification");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Platform Components Gallery
              </h1>
              <p className="text-muted-foreground">
                Explore 9999+ UI components across 12 domains • Complete design system showcase
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <StatCard icon={Code} value="160+" label="Components" color="bg-blue-500/10 text-blue-600" />
            <StatCard icon={Database} value="165" label="Backend Hooks" color="bg-green-500/10 text-green-600" />
            <StatCard icon={Shield} value="12" label="Domains" color="bg-purple-500/10 text-purple-600" />
            <StatCard icon={Cpu} value="100%" label="TypeScript" color="bg-orange-500/10 text-orange-600" />
            <StatCard icon={Heart} value="A11y" label="Accessible" color="bg-pink-500/10 text-pink-600" />
            <StatCard icon={Zap} value="Fast" label="Performance" color="bg-yellow-500/10 text-yellow-600" />
          </div>
          
          {/* Category Pills */}
          <ScrollArea className="w-full">
            <div className="flex items-center gap-2 pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id} 
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                  <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
                    {cat.count}
                  </Badge>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 pb-24">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="hidden">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>{cat.label}</TabsTrigger>
            ))}
          </TabsList>

          {/* =============== VERIFICATION COMPONENTS =============== */}
          <TabsContent value="verification" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="VerificationStatusBadge" description="Status indicators for verification workflows">
                <div className="flex flex-wrap gap-2">
                  <VerificationStatusBadge status="pending" />
                  <VerificationStatusBadge status="approved" />
                  <VerificationStatusBadge status="rejected" />
                  <VerificationStatusBadge status="requires_more_info" />
                  <VerificationStatusBadge status="verified" />
                  <VerificationStatusBadge status="expired" />
                  <VerificationStatusBadge status="revoked" />
                  <VerificationStatusBadge status="disputed" />
                </div>
              </ComponentCard>

              <ComponentCard title="TrustScoreDisplay" description="Visual trust score with tier badge">
                <div className="flex justify-around">
                  <TrustScoreDisplay score={92} level="platinum" size="sm" />
                  <TrustScoreDisplay score={75} level="gold" size="default" />
                  <TrustScoreDisplay score={45} level="silver" size="sm" />
                </div>
              </ComponentCard>

              <ComponentCard title="VerificationSubmissionCard" description="Document verification request card">
                <VerificationSubmissionCard submission={mockSubmission} />
              </ComponentCard>

              <div className="md:col-span-2">
                <ComponentCard title="TrustProfileCard" description="Complete trust profile with metrics">
                  <TrustProfileCard profile={mockTrustProfile} />
                </ComponentCard>
              </div>

              <ComponentCard title="BadgesShowcase" description="Achievement and skill badges gallery">
                <BadgesShowcase badges={mockBadges} />
              </ComponentCard>

              <ComponentCard title="CredentialCard" description="Academic and professional credentials">
                <div className="space-y-3">
                  {mockCredentials.slice(0, 2).map((cred) => (
                    <CredentialCard key={cred.id} credential={cred as any} />
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard title="CareerTimeline" description="Professional journey visualization">
                <CareerTimeline phases={mockCareerPhases as any} />
              </ComponentCard>

              <ComponentCard title="ProfileModeSwitcher" description="Switch between professional personas">
                <ProfileModeSwitcher modes={mockProfileModes as any} onSwitch={() => {}} />
              </ComponentCard>

              <ComponentCard title="BadgeDisplay (Mini)" description="Compact badge list with tooltips">
                <BadgeDisplay badges={["verified", "top_rated", "fast_responder"] as any} size="md" showLabels />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* =============== FINANCIAL COMPONENTS =============== */}
          <TabsContent value="financial" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="FinancialStatCard" description="Key financial metrics with trends">
                <div className="space-y-3">
                  <FinancialStatCard
                    title="Monthly Revenue"
                    value="PKR 350,000"
                    change={18}
                    trend="up"
                    icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                  />
                  <FinancialStatCard
                    title="Pending Payments"
                    value="PKR 75,000"
                    change={-5}
                    trend="down"
                    icon={<Clock className="h-5 w-5 text-amber-500" />}
                  />
                  <FinancialStatCard
                    title="Escrow Balance"
                    value="PKR 120,000"
                    icon={<Lock className="h-5 w-5 text-blue-500" />}
                  />
                </div>
              </ComponentCard>

              <ComponentCard title="WalletBalanceCard" description="Wallet overview with actions">
                <WalletBalanceCard />
              </ComponentCard>

              <ComponentCard title="RevenueStreamsCard" description="Income source breakdown">
                <RevenueStreamsCard
                  streams={[
                    { stream_id: "1", source: "consulting", monthly_average: 180000, volatility: 10, growth_rate: 15, dependency_risk: "low", diversification_score: 85 },
                    { stream_id: "2", source: "projects", monthly_average: 120000, volatility: 20, growth_rate: 8, dependency_risk: "medium", diversification_score: 70 },
                    { stream_id: "3", source: "royalties", monthly_average: 45000, volatility: 5, growth_rate: 3, dependency_risk: "low", diversification_score: 90 },
                    { stream_id: "4", source: "grants", monthly_average: 35000, volatility: 25, growth_rate: 12, dependency_risk: "high", diversification_score: 50 },
                  ]}
                />
              </ComponentCard>

              <ComponentCard title="FinancialGoalsTracker" description="Financial targets and progress">
                <FinancialGoalsTracker
                  goals={[
                    { goal_id: "1", goal_type: "savings", target_amount: 1000000, current_progress: 680000, deadline: "2024-12-31", on_track: true, required_monthly_rate: 53333, projected_achievement_date: "2024-11-15" },
                    { goal_id: "2", goal_type: "income", target_amount: 500000, current_progress: 350000, deadline: "2024-06-30", on_track: false, required_monthly_rate: 75000, projected_achievement_date: "2024-08-15" },
                    { goal_id: "3", goal_type: "investment", target_amount: 200000, current_progress: 150000, deadline: "2024-09-30", on_track: true, required_monthly_rate: 16666, projected_achievement_date: "2024-08-01" },
                  ]}
                />
              </ComponentCard>

              <div className="md:col-span-2">
                <ComponentCard title="ClientValueTable" description="Client lifetime value analysis">
                  <ClientValueTable clients={mockClients as any} />
                </ComponentCard>
              </div>

              <ComponentCard title="EarningsForecastCard" description="AI-powered earnings projection">
                <EarningsForecastCard forecast={{
                  trend: "growing",
                  period: "quarterly",
                  projections: [
                    { month: "Jan", projected_earnings: 85000, confidence_interval: { low: 70000, high: 95000 }, basis: ["active projects", "pipeline"] },
                    { month: "Feb", projected_earnings: 92000, confidence_interval: { low: 78000, high: 105000 }, basis: ["recurring clients", "new leads"] },
                    { month: "Mar", projected_earnings: 98000, confidence_interval: { low: 82000, high: 115000 }, basis: ["seasonal uptick", "referrals"] },
                  ],
                  key_drivers: ["Repeat clients", "New projects", "Seasonal demand"],
                }} />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* =============== LEARNING COMPONENTS =============== */}
          <TabsContent value="learning" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="CourseCard" description="Course display with enrollment">
                <CourseCard
                  course={{
                    id: "1",
                    title: "Advanced Machine Learning for Research",
                    slug: "advanced-ml",
                    description: "Master cutting-edge ML techniques",
                    category: "Data Science",
                    level: "advanced",
                    language: "en",
                    thumbnail_url: null,
                    instructor_user_id: null,
                    instructor_org_id: null,
                    price: 0,
                    estimated_hours: 12,
                    is_published: true,
                    is_featured: true,
                    total_enrollments: 2450,
                    avg_rating: 4.9,
                    created_at: new Date().toISOString(),
                    instructor: { full_name: "Dr. Sarah Chen", avatar_url: null },
                  }}
                />
              </ComponentCard>

              <ComponentCard title="CertificateCard" description="Earned certification display">
                <CertificateCard
                  certificate={{
                    id: "1",
                    course_id: "course-1",
                    user_id: "user-1",
                    certificate_number: "ML-2024-00142",
                    verification_hash: "abc123def456",
                    issued_at: new Date().toISOString(),
                    certificate_url: null,
                    is_revoked: false,
                  }}
                />
              </ComponentCard>

              <ComponentCard title="MentorMatchCard" description="AI-powered mentor recommendations">
                <MentorMatchCard
                  match={{
                    mentor_id: "mentor-1",
                    mentor_name: "Prof. Ahmed Khan",
                    expertise_alignment: 94,
                    communication_style_fit: 88,
                    availability_match: 85,
                    success_rate: 97,
                    mentees_currently: 3,
                    mentees_max: 5,
                    overall_fit_score: 92,
                    why_matched: ["AI expertise", "Industry experience", "Research focus"],
                  }}
                />
              </ComponentCard>

              <ComponentCard title="LearningGoalCard" description="Learning objectives tracker">
                <LearningGoalCard
                  goal={{
                    goal_id: "1",
                    title: "Master Deep Learning Fundamentals",
                    category: "skill",
                    target_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
                    progress_percentage: 65,
                    milestones: [
                      { milestone: "Neural Networks Basics", due_date: "2024-01-15", completed: true },
                      { milestone: "CNNs and RNNs", due_date: "2024-02-15", completed: true },
                      { milestone: "Transformers", due_date: "2024-03-15", completed: false },
                      { milestone: "Practical Projects", due_date: "2024-04-01", completed: false },
                    ],
                    blockers: [],
                  }}
                />
              </ComponentCard>

              <div className="md:col-span-2">
                <ComponentCard title="LearningAnalyticsCard" description="Personal learning insights">
                  <LearningAnalyticsCard analytics={mockLearningAnalytics as any} />
                </ComponentCard>
              </div>

              <ComponentCard title="LearningCircleCard" description="Peer learning groups">
                <LearningCircleCard circle={mockLearningCircle as any} />
              </ComponentCard>

              <ComponentCard title="CourseCard (Enrolled)" description="In-progress course with progress">
                <CourseCard
                  course={{
                    id: "2",
                    title: "Research Methods & Statistics",
                    slug: "research-methods",
                    description: "Master research methodology",
                    category: "Research",
                    level: "intermediate",
                    language: "en",
                    thumbnail_url: null,
                    instructor_user_id: null,
                    instructor_org_id: null,
                    price: 49,
                    estimated_hours: 8,
                    is_published: true,
                    is_featured: false,
                    total_enrollments: 890,
                    avg_rating: 4.7,
                    created_at: new Date().toISOString(),
                    instructor: { full_name: "Dr. Emily Watson", avatar_url: null },
                  }}
                  enrollment={{
                    id: "e1",
                    course_id: "2",
                    user_id: "u1",
                    progress_percent: 72,
                    completed_at: null,
                    enrolled_at: new Date().toISOString(),
                    status: "active",
                  }}
                />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* =============== PROJECT MANAGEMENT COMPONENTS =============== */}
          <TabsContent value="project" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <ComponentCard title="KanbanBoard" description="Drag-and-drop task management">
                  <div className="h-[450px]">
                    <KanbanBoard />
                  </div>
                </ComponentCard>
              </div>

              <ComponentCard title="SprintOverview" description="Agile sprint progress dashboard">
                <SprintOverview />
              </ComponentCard>

              <ComponentCard title="GanttChartView" description="Project timeline visualization">
                <GanttChartView />
              </ComponentCard>

              <ComponentCard title="TimeTrackingWidget" description="Time logging and productivity">
                <TimeTrackingWidget />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* =============== HR & TALENT COMPONENTS =============== */}
          <TabsContent value="hr" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="JobPostingCard" description="Job listing display">
                <JobPostingCard
                  job={{
                    id: "1",
                    title: "Senior AI Research Scientist",
                    department: "AI Research Lab",
                    location: "Remote / Lahore",
                    type: "full_time",
                    salary: { min: 500000, max: 800000, currency: "PKR" },
                    status: "open",
                    applications: 67,
                    views: 450,
                    postedAt: new Date().toISOString(),
                    closesAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                  }}
                />
              </ComponentCard>

              <ComponentCard title="CandidatePipelineCard" description="Recruitment funnel metrics">
                <CandidatePipelineCard
                  metrics={{
                    totalApplications: 156,
                    inScreening: 52,
                    inInterview: 24,
                    offers: 8,
                    hired: 4,
                  }}
                />
              </ComponentCard>

              <ComponentCard title="EmployeeCard" description="Team member profile card">
                <EmployeeCard
                  employee={{
                    id: "1",
                    name: "Dr. Fatima Ali",
                    email: "fatima@company.com",
                    title: "Lead Data Scientist",
                    department: "AI Research",
                    manager: "Prof. Ahmed Khan",
                    startDate: "2022-03-15",
                    status: "active",
                    performanceRating: 4.8,
                    salary: 650000,
                  }}
                />
              </ComponentCard>

              <div className="md:col-span-2">
                <ComponentCard title="PerformanceReviewCard" description="Employee performance assessment">
                  <PerformanceReviewCard review={mockPerformanceReview} />
                </ComponentCard>
              </div>

              <ComponentCard title="JobPostingCard (Draft)" description="Unpublished job posting">
                <JobPostingCard
                  job={{
                    id: "2",
                    title: "Machine Learning Engineer",
                    department: "Engineering",
                    location: "Karachi",
                    type: "contract",
                    salary: { min: 300000, max: 450000, currency: "PKR" },
                    status: "draft",
                    applications: 0,
                    views: 0,
                    postedAt: new Date().toISOString(),
                    closesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  }}
                />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* =============== AUTOMATION COMPONENTS =============== */}
          <TabsContent value="automation" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="WorkflowCard" description="Automation workflow display">
                <WorkflowCard
                  workflow={{
                    id: "1",
                    name: "New Lead Processing",
                    description: "Automatically process and qualify incoming leads",
                    trigger: { type: "webhook", config: {} },
                    steps: [
                      { id: "1", type: "action", action: "validate_lead", config: {}, nextSteps: ["2"] },
                      { id: "2", type: "action", action: "send_notification", config: {}, nextSteps: [] }
                    ],
                    status: "active",
                    executions: 1247,
                    lastExecuted: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                  }}
                />
              </ComponentCard>

              <ComponentCard title="IntegrationCard" description="Connected service status">
                <div className="space-y-3">
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
                  <IntegrationCard
                    integration={{
                      id: "2",
                      name: "Google Drive",
                      type: "storage",
                      status: "connected",
                      config: {},
                      lastSync: new Date().toISOString(),
                    }}
                  />
                  <IntegrationCard
                    integration={{
                      id: "3",
                      name: "Jira",
                      type: "project_management",
                      status: "disconnected",
                      config: {},
                      lastSync: null,
                    }}
                  />
                </div>
              </ComponentCard>

              <ComponentCard title="AutomationRuleCard" description="Conditional automation triggers">
                <div className="space-y-3">
                  <AutomationRuleCard
                    rule={{
                      id: "1",
                      name: "Auto-assign urgent tasks",
                      condition: "Priority = Urgent AND Unassigned",
                      action: "Assign to on-call team member",
                      enabled: true,
                      priority: 1,
                      triggerCount: 234,
                      lastTriggered: new Date().toISOString(),
                    }}
                  />
                  <AutomationRuleCard
                    rule={{
                      id: "2",
                      name: "Deadline reminder",
                      condition: "Due date < 24 hours",
                      action: "Send Slack notification",
                      enabled: true,
                      priority: 2,
                      triggerCount: 89,
                      lastTriggered: new Date().toISOString(),
                    }}
                  />
                </div>
              </ComponentCard>

              <div className="md:col-span-2 lg:col-span-3">
                <ComponentCard title="WorkflowBuilder" description="Visual workflow design interface">
                  <WorkflowBuilder />
                </ComponentCard>
              </div>
            </div>
          </TabsContent>

          {/* =============== EVENTS COMPONENTS =============== */}
          <TabsContent value="events" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="EventCard (Virtual)" description="Online event display">
                <EventCard
                  event={{
                    id: "1",
                    title: "AI Research Summit 2024",
                    description: "Annual conference on artificial intelligence breakthroughs",
                    event_type: "Conference",
                    mode: "virtual",
                    start_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    end_datetime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
                    timezone: "PKT",
                    location_text: "Virtual Event",
                    meeting_link: "https://meet.google.com/abc-defg-hij",
                    organizer_user_id: null,
                    organizer_org_id: null,
                    group_id: null,
                    visibility: "public",
                    cover_image_url: null,
                    max_attendees: 500,
                    registration_url: null,
                    is_featured: true,
                    attendee_count: 423,
                    created_at: new Date().toISOString(),
                  }}
                />
              </ComponentCard>

              <ComponentCard title="EventCard (In-Person)" description="Physical event display">
                <EventCard
                  event={{
                    id: "2",
                    title: "Lahore Tech Meetup",
                    description: "Monthly networking event for tech professionals",
                    event_type: "Meetup",
                    mode: "in_person",
                    start_datetime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    end_datetime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
                    timezone: "PKT",
                    location_text: "Arfa Software Technology Park, Lahore",
                    meeting_link: null,
                    organizer_user_id: null,
                    organizer_org_id: null,
                    group_id: null,
                    visibility: "public",
                    cover_image_url: null,
                    max_attendees: 100,
                    registration_url: null,
                    is_featured: false,
                    attendee_count: 67,
                    created_at: new Date().toISOString(),
                  }}
                />
              </ComponentCard>

              <ComponentCard title="EventCard (Hybrid)" description="Combined virtual and in-person">
                <EventCard
                  event={{
                    id: "3",
                    title: "Research Methods Workshop",
                    description: "Hands-on workshop on academic research methodologies",
                    event_type: "Workshop",
                    mode: "hybrid",
                    start_datetime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                    end_datetime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
                    timezone: "PKT",
                    location_text: "LUMS Campus + Zoom",
                    meeting_link: "https://zoom.us/j/123456789",
                    organizer_user_id: null,
                    organizer_org_id: null,
                    group_id: null,
                    visibility: "public",
                    cover_image_url: null,
                    max_attendees: 50,
                    registration_url: null,
                    is_featured: true,
                    attendee_count: 38,
                    created_at: new Date().toISOString(),
                  }}
                />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* =============== ENTERPRISE COMPONENTS =============== */}
          <TabsContent value="enterprise" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComponentCard title="SSOConfigPanel" description="Single Sign-On configuration">
                <SSOConfigPanel />
              </ComponentCard>

              <ComponentCard title="RBACManager" description="Role-based access control">
                <RBACManager />
              </ComponentCard>

              <div className="lg:col-span-2">
                <ComponentCard title="AuditLogViewer" description="Security and activity audit trail">
                  <AuditLogViewer />
                </ComponentCard>
              </div>

              <div className="lg:col-span-2">
                <ComponentCard title="OrganizationSettings" description="Enterprise org configuration">
                  <OrganizationSettings />
                </ComponentCard>
              </div>
            </div>
          </TabsContent>

          {/* =============== MARKET INTELLIGENCE =============== */}
          <TabsContent value="market" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <ComponentCard title="MarketDemandRadar" description="Real-time skill demand tracking">
                  <MarketDemandRadar />
                </ComponentCard>
              </div>

              <ComponentCard title="WorkStatusIndicator" description="Availability and work status">
                <WorkStatusIndicator />
              </ComponentCard>

              <ComponentCard title="ProfileViewsCard" description="Profile visibility analytics">
                <ProfileViewsCard />
              </ComponentCard>
            </div>
          </TabsContent>

          {/* =============== IDENTITY & PORTABILITY =============== */}
          <TabsContent value="identity" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ComponentCard title="PortfolioShowcasePanel" description="Professional portfolio display">
                  <PortfolioShowcasePanel />
                </ComponentCard>
              </div>

              <ComponentCard title="PortableIdentityExport" description="Export identity for other platforms">
                <PortableIdentityExport />
              </ComponentCard>

              <ComponentCard title="ProfileViewsInline" description="Compact profile view counter">
                <ProfileViewsInline />
              </ComponentCard>

              <div className="md:col-span-2">
                <ComponentCard title="PortfolioManager" description="Portfolio CRUD management">
                  <PortfolioManager />
                </ComponentCard>
              </div>
            </div>
          </TabsContent>

          {/* =============== MESSAGING / COMMUNICATION =============== */}
          <TabsContent value="messaging" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentCard title="Work Status Indicator" description="Real-time availability status">
                <WorkStatusIndicator />
              </ComponentCard>

              <ComponentCard title="Notification Badges" description="Status indicator badges">
                <div className="flex flex-wrap gap-3">
                  <Badge className="gap-1">
                    <Bell className="h-3 w-3" />
                    12 New
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <MessageSquare className="h-3 w-3" />
                    5 Messages
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    3 Requests
                  </Badge>
                </div>
              </ComponentCard>

              <ComponentCard title="Quick Actions" description="Common messaging actions">
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Start New Chat
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Create Group
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Search className="h-4 w-4" />
                    Search Messages
                  </Button>
                </div>
              </ComponentCard>
            </div>
          </TabsContent>

          {/* =============== ANALYTICS & INSIGHTS =============== */}
          <TabsContent value="analytics" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ComponentCard title="Profile Views" description="Visibility metrics">
                <ProfileViewsCard />
              </ComponentCard>

              <ComponentCard title="Trust Analytics" description="Trust score breakdown">
                <div className="space-y-4">
                  <TrustScoreDisplay score={87} level="gold" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response Time</span>
                      <span className="font-medium">4h avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client Rating</span>
                      <span className="font-medium">4.9/5.0</span>
                    </div>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Learning Progress" description="Skill development metrics">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Trophy className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
                      <p className="text-lg font-bold">12</p>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Award className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="text-lg font-bold">8</p>
                      <p className="text-xs text-muted-foreground">Certificates</p>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg">
                    <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                    <p className="text-lg font-bold">24 Day</p>
                    <p className="text-xs text-muted-foreground">Learning Streak</p>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Compliance Status" description="Regulatory compliance check">
                <CompliancePanel />
              </ComponentCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Stats */}
        <div className="mt-12 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl border">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Platform Statistics</h2>
            <p className="text-muted-foreground">Complete backend coverage with enterprise-grade UI</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center p-3">
              <p className="text-3xl font-bold text-primary">165</p>
              <p className="text-xs text-muted-foreground">Hooks</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl font-bold text-primary">160+</p>
              <p className="text-xs text-muted-foreground">Components</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground">Domains</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl font-bold text-primary">50+</p>
              <p className="text-xs text-muted-foreground">Tables</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-xs text-muted-foreground">TypeScript</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl font-bold text-primary">RLS</p>
              <p className="text-xs text-muted-foreground">Secured</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl font-bold text-primary">A11y</p>
              <p className="text-xs text-muted-foreground">Compliant</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl font-bold text-primary">PWA</p>
              <p className="text-xs text-muted-foreground">Ready</p>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

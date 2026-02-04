import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useRecruitment,
  useEmployeeManagement,
  usePerformanceManagement,
  JobPosting,
  Candidate,
  Employee,
  PerformanceReview
} from "@/hooks/useHRTalent";
import {
  Briefcase,
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Calendar,
  Star,
  Eye,
  FileText,
  MapPin,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  ChevronRight,
  Building2
} from "lucide-react";
import { format } from "date-fns";

// =====================================================
// JOB POSTING CARD
// =====================================================
export function JobPostingCard({ 
  job,
  onView
}: { 
  job: JobPosting;
  onView?: (jobId: string) => void;
}) {
  const typeLabels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    internship: "Internship",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    open: "bg-primary/10 text-primary",
    paused: "bg-secondary text-secondary-foreground",
    closed: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold">{job.title}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Building2 className="h-4 w-4" />
              <span>{job.department}</span>
              <span>•</span>
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          </div>
          <Badge className={statusColors[job.status]}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">{typeLabels[job.type]}</Badge>
          <Badge variant="secondary">
            ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{job.applications} applications</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span>{job.views} views</span>
          </div>
        </div>

        {job.postedAt && (
          <p className="text-xs text-muted-foreground mb-3">
            Posted {format(new Date(job.postedAt), "MMM d, yyyy")}
            {job.closesAt && ` • Closes ${format(new Date(job.closesAt), "MMM d")}`}
          </p>
        )}

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onView?.(job.id)}
        >
          View Details
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// =====================================================
// CANDIDATE PIPELINE CARD
// =====================================================
export function CandidatePipelineCard({
  metrics,
  onStageClick
}: {
  metrics: {
    totalApplications: number;
    inScreening: number;
    inInterview: number;
    offers: number;
    hired: number;
  };
  onStageClick?: (stage: string) => void;
}) {
  const stages = [
    { id: "applications", label: "Applications", count: metrics.totalApplications, color: "bg-muted" },
    { id: "screening", label: "Screening", count: metrics.inScreening, color: "bg-primary/20" },
    { id: "interview", label: "Interview", count: metrics.inInterview, color: "bg-primary/40" },
    { id: "offers", label: "Offers", count: metrics.offers, color: "bg-primary/60" },
    { id: "hired", label: "Hired", count: metrics.hired, color: "bg-primary" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Candidate Pipeline
        </CardTitle>
        <CardDescription>Track candidates through the hiring process</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-32 mb-4">
          {stages.map((stage, index) => {
            const maxCount = Math.max(...stages.map(s => s.count));
            const height = maxCount > 0 ? (stage.count / maxCount) * 100 : 10;
            
            return (
              <div 
                key={stage.id}
                className="flex-1 flex flex-col items-center cursor-pointer group"
                onClick={() => onStageClick?.(stage.id)}
              >
                <div 
                  className={`w-full ${stage.color} rounded-t-lg transition-all group-hover:opacity-80`}
                  style={{ height: `${Math.max(height, 10)}%` }}
                />
                <div className="text-center mt-2">
                  <p className="text-lg font-bold">{stage.count}</p>
                  <p className="text-xs text-muted-foreground">{stage.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t text-sm">
          <span className="text-muted-foreground">Conversion Rate</span>
          <span className="font-semibold">
            {metrics.totalApplications > 0 
              ? ((metrics.hired / metrics.totalApplications) * 100).toFixed(1)
              : 0}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// EMPLOYEE CARD
// =====================================================
export function EmployeeCard({ employee }: { employee: Employee }) {
  const statusColors: Record<string, string> = {
    active: "bg-primary/10 text-primary",
    on_leave: "bg-secondary text-secondary-foreground",
    terminated: "bg-destructive/10 text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{employee.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{employee.name}</h4>
                <p className="text-sm text-muted-foreground">{employee.title}</p>
              </div>
              <Badge className={statusColors[employee.status]}>
                {employee.status.replace("_", " ")}
              </Badge>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{employee.department}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Reports to: {employee.manager}</span>
              </div>
            </div>

            {employee.performanceRating && (
              <div className="mt-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-sm font-medium">
                  {employee.performanceRating.toFixed(1)} rating
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// PERFORMANCE REVIEW CARD
// =====================================================
export function PerformanceReviewCard({ review }: { review: PerformanceReview }) {
  const statusIcons: Record<string, React.ReactNode> = {
    draft: <FileText className="h-4 w-4" />,
    submitted: <Clock className="h-4 w-4" />,
    approved: <CheckCircle2 className="h-4 w-4" />,
    acknowledged: <Award className="h-4 w-4" />,
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-primary";
    if (rating >= 3) return "text-secondary-foreground";
    return "text-destructive";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Review Period: {review.period}
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            {statusIcons[review.status]}
            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className={`text-4xl font-bold ${getRatingColor(review.overallRating)}`}>
            {review.overallRating.toFixed(1)}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Overall Rating</p>
            <Progress value={review.overallRating * 20} className="h-2 mt-1" />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium">Goals</p>
          {review.goals.slice(0, 3).map((goal, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {goal.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                {goal.title}
              </span>
              <Badge variant="secondary">{goal.rating}/5</Badge>
            </div>
          ))}
        </div>

        {review.feedback && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="line-clamp-2">{review.feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// RECRUITMENT DASHBOARD
// =====================================================
export function RecruitmentDashboard() {
  const { jobPostings, pipelineMetrics, fetchJobPostings } = useRecruitment();
  const { employees, fetchEmployees } = useEmployeeManagement();
  const { reviews, fetchReviews } = usePerformanceManagement();

  const [activeTab, setActiveTab] = useState("jobs");

  // Initialize data
  useState(() => {
    fetchJobPostings();
    fetchEmployees();
    fetchReviews();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">HR & Talent Management</h2>
          <p className="text-muted-foreground">
            Manage recruitment, employees, and performance
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Job Posting
        </Button>
      </div>

      {/* Pipeline Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <CandidatePipelineCard metrics={pipelineMetrics} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Open Positions</span>
              <span className="text-lg font-bold">{jobPostings.filter(j => j.status === "open").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Employees</span>
              <span className="text-lg font-bold">{employees.filter(e => e.status === "active").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Reviews</span>
              <span className="text-lg font-bold">{reviews.filter(r => r.status === "submitted").length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="reviews">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-6">
          {jobPostings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No job postings</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first job posting to start recruiting
                </p>
                <Button>Create Job Posting</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobPostings.map((job) => (
                <JobPostingCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          {employees.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No employees</h3>
                <p className="text-muted-foreground">
                  Employee data will appear here once added
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {employees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No performance reviews</h3>
                <p className="text-muted-foreground">
                  Reviews will appear here during review cycles
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <PerformanceReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RecruitmentDashboard;

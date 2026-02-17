import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  useCourses,
  useMyCourses,
  useMyCertificates,
  Course,
  CourseEnrollment,
  CourseCertificate
} from "@/hooks/useLearning";
import {
  useMentorshipLearning,
  MentorMatch,
  LearningGoal,
  LearningCircle,
  LearningAnalytics
} from "@/hooks/useMentorshipLearning";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Clock,
  Star,
  Play,
  CheckCircle2,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Search,
  Filter,
  ChevronRight,
  Flame,
  Zap,
  Brain,
  Compass
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

// =====================================================
// COURSE CARD
// =====================================================
export function CourseCard({ 
  course,
  enrollment
}: { 
  course: Course;
  enrollment?: CourseEnrollment;
}) {
  const levelColors: Record<string, string> = {
    beginner: "bg-green-500/10 text-green-500",
    intermediate: "bg-yellow-500/10 text-yellow-500",
    advanced: "bg-red-500/10 text-red-500",
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-muted">
        {course.thumbnail_url ? (
          <OptimizedImage 
            src={course.thumbnail_url} 
            alt={course.title}
            widths={[400, 600, 800]}
            fill
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {course.is_featured && (
          <Badge className="absolute top-2 left-2 gap-1">
            <Star className="h-3 w-3" />
            Featured
          </Badge>
        )}
        {enrollment && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <Progress value={enrollment.progress_percent} className="h-2" />
            <p className="text-white text-xs mt-1">{enrollment.progress_percent}% complete</p>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className={levelColors[course.level]}>
            {course.level}
          </Badge>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>{course.avg_rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-semibold line-clamp-2 mb-2">{course.title}</h3>
        
        {course.instructor && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Avatar className="h-5 w-5">
              <AvatarImage src={course.instructor.avatar_url || undefined} />
              <AvatarFallback>{course.instructor.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{course.instructor.full_name}</span>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.estimated_hours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.total_enrollments.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {enrollment ? (
          <Button className="w-full gap-2" asChild>
            <Link to={`/learning/course/${course.id}`}>
              <Play className="h-4 w-4" />
              Continue Learning
            </Link>
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-lg">
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
            <Button asChild>
              <Link to={`/learning/course/${course.id}`}>View Course</Link>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

// =====================================================
// CERTIFICATE CARD
// =====================================================
export function CertificateCard({ certificate }: { certificate: CourseCertificate }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Course Certificate</h3>
            <p className="text-sm text-muted-foreground">
              Certificate #{certificate.certificate_number}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Issued {format(new Date(certificate.issued_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            View
          </Button>
          <Button size="sm" className="flex-1">
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// MENTOR MATCH CARD
// =====================================================
export function MentorMatchCard({ 
  match,
  onConnect
}: { 
  match: MentorMatch;
  onConnect?: (mentorId: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{match.mentor_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{match.mentor_name}</h4>
              <Badge variant="secondary">
                {match.overall_fit_score.toFixed(0)}% match
              </Badge>
            </div>
            
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expertise</span>
                <Progress value={match.expertise_alignment} className="w-24 h-2" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Communication</span>
                <Progress value={match.communication_style_fit} className="w-24 h-2" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-medium">{match.success_rate}%</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {match.why_matched.slice(0, 2).map((reason, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              {match.mentees_currently}/{match.mentees_max} mentee slots filled
            </div>
          </div>
        </div>

        <Button 
          className="w-full mt-4" 
          onClick={() => onConnect?.(match.mentor_id)}
        >
          Request Mentorship
        </Button>
      </CardContent>
    </Card>
  );
}

// =====================================================
// LEARNING GOAL CARD
// =====================================================
export function LearningGoalCard({ 
  goal,
  onUpdateMilestone
}: { 
  goal: LearningGoal;
  onUpdateMilestone?: (goalId: string, milestoneIndex: number) => void;
}) {
  const categoryIcons: Record<string, React.ReactNode> = {
    skill: <Zap className="h-4 w-4" />,
    knowledge: <Brain className="h-4 w-4" />,
    certification: <Award className="h-4 w-4" />,
    project: <Target className="h-4 w-4" />,
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-lg">
              {categoryIcons[goal.category] || <Target className="h-4 w-4" />}
            </div>
            <div>
              <CardTitle className="text-base">{goal.title}</CardTitle>
              <CardDescription>
                Due: {format(new Date(goal.target_date), "MMM d, yyyy")}
              </CardDescription>
            </div>
          </div>
          <Badge>{goal.progress_percentage}%</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={goal.progress_percentage} className="h-2 mb-4" />
        
        <div className="space-y-2">
          {goal.milestones.map((milestone, index) => (
            <div 
              key={index}
              className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                milestone.completed ? "bg-green-500/10" : "bg-muted"
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${
                milestone.completed ? "text-green-500" : "text-muted-foreground"
              }`} />
              <span className={milestone.completed ? "line-through text-muted-foreground" : ""}>
                {milestone.milestone}
              </span>
            </div>
          ))}
        </div>

        {goal.blockers.length > 0 && (
          <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
            <p className="text-sm font-medium text-destructive">Blockers:</p>
            <ul className="text-sm text-destructive/80 mt-1 list-disc list-inside">
              {goal.blockers.map((blocker, i) => (
                <li key={i}>{blocker}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// LEARNING ANALYTICS CARD
// =====================================================
export function LearningAnalyticsCard({ analytics }: { analytics: LearningAnalytics | null }) {
  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Learning Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <Clock className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{analytics.total_learning_hours}</p>
            <p className="text-xs text-muted-foreground">Hours Learned</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <Zap className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{analytics.skills_developed}</p>
            <p className="text-xs text-muted-foreground">Skills Developed</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <Flame className="h-6 w-6 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{analytics.learning_streak_days}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <Trophy className="h-6 w-6 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{analytics.goals_completed}</p>
            <p className="text-xs text-muted-foreground">Goals Completed</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <p className="text-sm font-medium flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            Next Recommended Action
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {analytics.next_recommended_action}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Best Learning Method</p>
            <p className="font-medium capitalize">{analytics.strongest_learning_method}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Preferred Time</p>
            <p className="font-medium capitalize">{analytics.time_of_day_preference}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// LEARNING CIRCLE CARD
// =====================================================
export function LearningCircleCard({ circle }: { circle: LearningCircle }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{circle.topic}</h4>
              <p className="text-sm text-muted-foreground">
                {circle.members.length} members
              </p>
            </div>
          </div>
          <Badge variant={circle.active ? "default" : "secondary"}>
            {circle.active ? "Active" : "Paused"}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{circle.meeting_schedule}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{circle.resources_shared} resources</span>
          </div>
        </div>

        <Progress value={circle.collective_progress} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">
          {circle.collective_progress}% collective progress
        </p>

        <Button variant="outline" className="w-full mt-4">
          View Circle
        </Button>
      </CardContent>
    </Card>
  );
}

// =====================================================
// COURSE CATALOG
// =====================================================
export function CourseCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const { courses, loading } = useCourses({ search, category });

  const categories = ["Research Methods", "Data Science", "Academic Writing", "Programming", "Statistics"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={!category ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(undefined)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="aspect-video" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              {search ? "Try adjusting your search terms" : "Check back later for new courses"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// MY LEARNING DASHBOARD
// =====================================================
export function MyLearningDashboard() {
  const { enrollments, inProgress, completed, loading: coursesLoading } = useMyCourses();
  const { certificates, loading: certsLoading } = useMyCertificates();
  const { 
    learningGoals, 
    learningCircles, 
    analytics,
    generateLearningAnalytics 
  } = useMentorshipLearning();

  const [activeTab, setActiveTab] = useState("courses");

  // Generate sample analytics
  const learningAnalytics = generateLearningAnalytics(
    [
      { date: "2024-12-01", hours: 2, type: "video" },
      { date: "2024-12-02", hours: 1.5, type: "article" },
      { date: "2024-12-03", hours: 3, type: "course" },
    ],
    learningGoals
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Learning</h2>
        <p className="text-muted-foreground">
          Track your courses, goals, and learning progress
        </p>
      </div>

      <LearningAnalyticsCard analytics={learningAnalytics} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="circles">Learning Circles</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          {coursesLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : inProgress.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses in progress</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey today
                </p>
                <Button asChild>
                  <Link to="/learning">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((enrollment) => (
                <CourseCard 
                  key={enrollment.id} 
                  course={enrollment.course!} 
                  enrollment={enrollment}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          {learningGoals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No learning goals set</h3>
                <p className="text-muted-foreground mb-4">
                  Set goals to track your progress
                </p>
                <Button>Create Goal</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {learningGoals.map((goal) => (
                <LearningGoalCard key={goal.goal_id} goal={goal} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="circles" className="mt-6">
          {learningCircles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No learning circles</h3>
                <p className="text-muted-foreground mb-4">
                  Join a learning circle to learn with peers
                </p>
                <Button>Find Circles</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {learningCircles.map((circle) => (
                <LearningCircleCard key={circle.circle_id} circle={circle} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          {certsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
                <p className="text-muted-foreground">
                  Complete courses to earn certificates
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MyLearningDashboard;

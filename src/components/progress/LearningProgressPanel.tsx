import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  Circle,
  Users
} from "lucide-react";

interface LearningGoal {
  goal_id: string;
  title: string;
  category: 'skill' | 'knowledge' | 'certification' | 'project';
  target_date: string;
  milestones: {
    milestone: string;
    completed: boolean;
  }[];
  progress_percentage: number;
}

interface MentorMatch {
  mentor_id: string;
  mentor_name: string;
  expertise_alignment: number;
  overall_fit_score: number;
  why_matched: string[];
}

interface LearningProgressPanelProps {
  learningGoals?: LearningGoal[];
  mentorMatches?: MentorMatch[];
  totalLearningHours?: number;
  skillsDeveloped?: number;
  learningStreak?: number;
}

export function LearningProgressPanel({
  learningGoals = [],
  mentorMatches = [],
  totalLearningHours = 0,
  skillsDeveloped = 0,
  learningStreak = 0
}: LearningProgressPanelProps) {
  const getCategoryIcon = (category: LearningGoal['category']) => {
    switch (category) {
      case 'skill': return <Target className="h-4 w-4" />;
      case 'certification': return <Trophy className="h-4 w-4" />;
      case 'project': return <BookOpen className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: LearningGoal['category']) => {
    switch (category) {
      case 'skill': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'certification': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'project': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Default sample data
  const displayGoals = learningGoals.length > 0 ? learningGoals : [
    {
      goal_id: '1',
      title: 'Master Data Visualization',
      category: 'skill' as const,
      target_date: '2026-04-01',
      milestones: [
        { milestone: 'Complete D3.js course', completed: true },
        { milestone: 'Build 3 visualization projects', completed: false },
        { milestone: 'Publish portfolio piece', completed: false }
      ],
      progress_percentage: 35
    },
    {
      goal_id: '2',
      title: 'AWS Solutions Architect Certification',
      category: 'certification' as const,
      target_date: '2026-06-01',
      milestones: [
        { milestone: 'Complete study materials', completed: true },
        { milestone: 'Pass practice exams', completed: true },
        { milestone: 'Schedule certification exam', completed: false }
      ],
      progress_percentage: 65
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Learning & Development
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Learning Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">{totalLearningHours || 42}</div>
            <p className="text-xs text-muted-foreground">Hours Invested</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">{skillsDeveloped || 5}</div>
            <p className="text-xs text-muted-foreground">Skills Developed</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              {learningStreak || 7}
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* Active Goals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Active Learning Goals</h4>
            <Button variant="ghost" size="sm" className="text-xs">
              + Add Goal
            </Button>
          </div>

          {displayGoals.map((goal) => (
            <div key={goal.goal_id} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Badge className={`${getCategoryColor(goal.category)} border-0`}>
                    {getCategoryIcon(goal.category)}
                    <span className="ml-1 capitalize">{goal.category}</span>
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(goal.target_date).toLocaleDateString()}
                </Badge>
              </div>
              
              <h5 className="font-medium">{goal.title}</h5>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span>{goal.progress_percentage}%</span>
                </div>
                <Progress value={goal.progress_percentage} className="h-2" />
              </div>

              <div className="space-y-1">
                {goal.milestones.slice(0, 3).map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {milestone.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={milestone.completed ? 'text-muted-foreground line-through' : ''}>
                      {milestone.milestone}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mentor Suggestions */}
        {mentorMatches.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recommended Mentors
            </h4>
            {mentorMatches.slice(0, 2).map((mentor) => (
              <div key={mentor.mentor_id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{mentor.mentor_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(mentor.expertise_alignment)}% expertise match
                  </p>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

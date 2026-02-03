import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Target, 
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap
} from "lucide-react";

interface ProductivityMetrics {
  deep_work_hours: number;
  meetings_hours: number;
  admin_hours: number;
  learning_hours: number;
  productivity_score: number;
}

interface OpportunityFunnel {
  stages: {
    stage: string;
    count: number;
    conversion_rate: number;
  }[];
  bottleneck_stage: string;
  overall_conversion: number;
}

interface SkillUtilization {
  skill: string;
  proficiency_level: number;
  utilization_rate: number;
  recommendation: 'leverage' | 'develop' | 'maintain' | 'consider_pivoting';
}

interface AdvancedAnalyticsPanelProps {
  productivity?: ProductivityMetrics;
  opportunityFunnel?: OpportunityFunnel;
  skillUtilization?: SkillUtilization[];
}

export function AdvancedAnalyticsPanel({
  productivity,
  opportunityFunnel,
  skillUtilization = []
}: AdvancedAnalyticsPanelProps) {
  const getRecommendationColor = (rec: SkillUtilization['recommendation']) => {
    switch (rec) {
      case 'leverage': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'develop': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'maintain': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
      case 'consider_pivoting': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Default sample data
  const productivityData = productivity || {
    deep_work_hours: 28,
    meetings_hours: 8,
    admin_hours: 4,
    learning_hours: 6,
    productivity_score: 76
  };

  const funnel = opportunityFunnel || {
    stages: [
      { stage: 'Discovered', count: 45, conversion_rate: 60 },
      { stage: 'Applied', count: 27, conversion_rate: 44 },
      { stage: 'Interviewed', count: 12, conversion_rate: 58 },
      { stage: 'Offered', count: 7, conversion_rate: 71 },
      { stage: 'Accepted', count: 5, conversion_rate: 100 }
    ],
    bottleneck_stage: 'Applied',
    overall_conversion: 11
  };

  const skills = skillUtilization.length > 0 ? skillUtilization : [
    { skill: 'React', proficiency_level: 90, utilization_rate: 85, recommendation: 'leverage' as const },
    { skill: 'Python', proficiency_level: 85, utilization_rate: 60, recommendation: 'leverage' as const },
    { skill: 'Machine Learning', proficiency_level: 70, utilization_rate: 40, recommendation: 'develop' as const },
    { skill: 'SQL', proficiency_level: 80, utilization_rate: 90, recommendation: 'maintain' as const }
  ];

  const totalHours = productivityData.deep_work_hours + productivityData.meetings_hours + 
    productivityData.admin_hours + productivityData.learning_hours;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics & Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Productivity Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Weekly Productivity</h4>
            <Badge variant={productivityData.productivity_score >= 70 ? "default" : "secondary"}>
              {productivityData.productivity_score}% score
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-green-600" />
                Deep Work
              </span>
              <span>{productivityData.deep_work_hours}h ({Math.round(productivityData.deep_work_hours / totalHours * 100)}%)</span>
            </div>
            <Progress value={(productivityData.deep_work_hours / totalHours) * 100} className="h-1.5 bg-muted" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-muted/30 rounded">
              <p className="font-semibold">{productivityData.meetings_hours}h</p>
              <p className="text-muted-foreground">Meetings</p>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <p className="font-semibold">{productivityData.admin_hours}h</p>
              <p className="text-muted-foreground">Admin</p>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <p className="font-semibold">{productivityData.learning_hours}h</p>
              <p className="text-muted-foreground">Learning</p>
            </div>
          </div>
        </div>

        {/* Opportunity Funnel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Opportunity Funnel
            </h4>
            <span className="text-xs text-muted-foreground">
              {funnel.overall_conversion}% overall
            </span>
          </div>

          <div className="space-y-1">
            {funnel.stages.map((stage, idx) => (
              <div key={stage.stage} className="flex items-center gap-2">
                <div className="w-20 text-xs truncate">{stage.stage}</div>
                <div className="flex-1">
                  <Progress 
                    value={(stage.count / funnel.stages[0].count) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="w-8 text-xs text-right">{stage.count}</div>
              </div>
            ))}
          </div>

          {funnel.bottleneck_stage && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              <span className="text-amber-800 dark:text-amber-400">
                Bottleneck at {funnel.bottleneck_stage} stage
              </span>
            </div>
          )}
        </div>

        {/* Skill Utilization */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Skill Utilization</h4>

          {skills.slice(0, 4).map((skill) => (
            <div key={skill.skill} className="flex items-center justify-between p-2 border rounded">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill.skill}</span>
                  <Badge className={`${getRecommendationColor(skill.recommendation)} border-0 text-xs capitalize`}>
                    {skill.recommendation.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Proficiency: {skill.proficiency_level}%</span>
                  <span>Utilization: {skill.utilization_rate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

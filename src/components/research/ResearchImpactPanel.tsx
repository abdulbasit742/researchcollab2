import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Quote, 
  TrendingUp, 
  BookOpen,
  Award,
  ExternalLink,
  BarChart3
} from "lucide-react";

interface ResearchImpact {
  total_publications: number;
  total_citations: number;
  h_index: number;
  i10_index: number;
  citation_trend: 'growing' | 'stable' | 'declining';
  top_cited_work: { title: string; citations: number };
  field_rank_percentile: number;
}

interface PublicationPipelineItem {
  id: string;
  title: string;
  stage: 'ideation' | 'research' | 'writing' | 'review' | 'revision' | 'submitted' | 'published';
  target_journal: string;
  progress_percentage: number;
}

interface ResearchImpactPanelProps {
  researchImpact?: ResearchImpact;
  publicationPipeline?: PublicationPipelineItem[];
}

export function ResearchImpactPanel({
  researchImpact,
  publicationPipeline = []
}: ResearchImpactPanelProps) {
  const getStageColor = (stage: PublicationPipelineItem['stage']) => {
    const colors: Record<string, string> = {
      ideation: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
      research: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      writing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      submitted: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[stage] || 'bg-muted text-muted-foreground';
  };

  const getTrendIcon = (trend: 'growing' | 'stable' | 'declining') => {
    if (trend === 'growing') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'declining') return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
    return null;
  };

  // Default sample data
  const impact = researchImpact || {
    total_publications: 12,
    total_citations: 156,
    h_index: 6,
    i10_index: 4,
    citation_trend: 'growing' as const,
    top_cited_work: { title: 'Machine Learning Applications in Healthcare', citations: 45 },
    field_rank_percentile: 72
  };

  const pipeline = publicationPipeline.length > 0 ? publicationPipeline : [
    {
      id: '1',
      title: 'Novel Approach to Distributed Systems',
      stage: 'writing' as const,
      target_journal: 'IEEE Transactions',
      progress_percentage: 65
    },
    {
      id: '2',
      title: 'Survey of Modern ML Architectures',
      stage: 'submitted' as const,
      target_journal: 'Nature Machine Intelligence',
      progress_percentage: 90
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Research Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Impact Metrics */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold">{impact.total_publications}</div>
            <p className="text-xs text-muted-foreground">Publications</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold flex items-center justify-center gap-1">
              {impact.total_citations}
              {getTrendIcon(impact.citation_trend)}
            </div>
            <p className="text-xs text-muted-foreground">Citations</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold">{impact.h_index}</div>
            <p className="text-xs text-muted-foreground">h-index</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold">{impact.i10_index}</div>
            <p className="text-xs text-muted-foreground">i10-index</p>
          </div>
        </div>

        {/* Field Ranking */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Field Ranking
            </span>
            <Badge variant="outline">Top {100 - impact.field_rank_percentile}%</Badge>
          </div>
          <Progress value={impact.field_rank_percentile} className="h-2" />
        </div>

        {/* Top Cited Work */}
        <div className="border rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Most Cited Work</p>
              <p className="text-sm font-medium line-clamp-2">{impact.top_cited_work.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  <Quote className="h-3 w-3 mr-1" />
                  {impact.top_cited_work.citations} citations
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Publication Pipeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Publication Pipeline
            </h4>
            <Button variant="ghost" size="sm" className="text-xs">
              View All
            </Button>
          </div>

          {pipeline.map((pub) => (
            <div key={pub.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium line-clamp-1">{pub.title}</p>
                <Badge className={`${getStageColor(pub.stage)} border-0 capitalize shrink-0`}>
                  {pub.stage}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{pub.target_journal}</span>
                <span>{pub.progress_percentage}%</span>
              </div>
              
              <Progress value={pub.progress_percentage} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

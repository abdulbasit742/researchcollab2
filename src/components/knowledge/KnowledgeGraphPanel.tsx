import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Lightbulb, 
  Network,
  BookOpen,
  Link2,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface KnowledgeNode {
  id: string;
  type: 'concept' | 'skill' | 'project' | 'person' | 'resource';
  label: string;
  strength: number;
}

interface KnowledgeGap {
  domain: string;
  current_coverage: number;
  gap_severity: 'minor' | 'moderate' | 'critical';
  recommended_actions: string[];
}

interface DecayPrevention {
  skill: string;
  current_retention: number;
  refresh_needed_by: string;
}

interface KnowledgeGraphPanelProps {
  knowledgeNodes?: KnowledgeNode[];
  knowledgeGaps?: KnowledgeGap[];
  decayAlerts?: DecayPrevention[];
  totalInsights?: number;
}

export function KnowledgeGraphPanel({
  knowledgeNodes = [],
  knowledgeGaps = [],
  decayAlerts = [],
  totalInsights = 0
}: KnowledgeGraphPanelProps) {
  const getNodeTypeColor = (type: KnowledgeNode['type']) => {
    switch (type) {
      case 'skill': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'project': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'concept': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'person': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getGapSeverityColor = (severity: KnowledgeGap['gap_severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'moderate': return 'text-amber-600';
      default: return 'text-blue-600';
    }
  };

  // Default sample data
  const nodes = knowledgeNodes.length > 0 ? knowledgeNodes : [
    { id: '1', type: 'skill' as const, label: 'React', strength: 90 },
    { id: '2', type: 'skill' as const, label: 'Python', strength: 85 },
    { id: '3', type: 'concept' as const, label: 'Machine Learning', strength: 72 },
    { id: '4', type: 'project' as const, label: 'E-Commerce Platform', strength: 95 },
    { id: '5', type: 'concept' as const, label: 'Distributed Systems', strength: 68 }
  ];

  const gaps = knowledgeGaps.length > 0 ? knowledgeGaps : [
    {
      domain: 'Cloud Architecture',
      current_coverage: 45,
      gap_severity: 'moderate' as const,
      recommended_actions: ['Complete AWS certification', 'Work on cloud-native project']
    },
    {
      domain: 'DevOps',
      current_coverage: 30,
      gap_severity: 'critical' as const,
      recommended_actions: ['Learn Kubernetes', 'Set up CI/CD pipeline']
    }
  ];

  const decay = decayAlerts.length > 0 ? decayAlerts : [
    { skill: 'Java', current_retention: 65, refresh_needed_by: '2026-03-15' },
    { skill: 'Docker', current_retention: 72, refresh_needed_by: '2026-04-01' }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Knowledge Graph
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Knowledge Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-2xl font-bold">{nodes.length}</div>
            <p className="text-xs text-muted-foreground">Knowledge Nodes</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-2xl font-bold">{totalInsights || 23}</div>
            <p className="text-xs text-muted-foreground">Insights</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-2xl font-bold">{gaps.length}</div>
            <p className="text-xs text-muted-foreground">Gaps Identified</p>
          </div>
        </div>

        {/* Top Knowledge Nodes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Network className="h-4 w-4" />
            Strongest Knowledge Areas
          </h4>

          <div className="flex flex-wrap gap-2">
            {nodes.sort((a, b) => b.strength - a.strength).slice(0, 6).map((node) => (
              <Badge 
                key={node.id} 
                className={`${getNodeTypeColor(node.type)} border-0`}
              >
                {node.label}
                <span className="ml-1 opacity-70">{node.strength}%</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Knowledge Gaps */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Knowledge Gaps
          </h4>

          {gaps.slice(0, 2).map((gap, idx) => (
            <div key={idx} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{gap.domain}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs capitalize ${getGapSeverityColor(gap.gap_severity)}`}
                >
                  {gap.gap_severity}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current Coverage</span>
                  <span>{gap.current_coverage}%</span>
                </div>
                <Progress value={gap.current_coverage} className="h-1.5" />
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Next step: </span>
                {gap.recommended_actions[0]}
              </div>
            </div>
          ))}
        </div>

        {/* Decay Alerts */}
        {decay.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Skill Decay Alerts
            </h4>

            {decay.slice(0, 2).map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{alert.skill}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.current_retention}% retention
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-amber-800 dark:text-amber-400">
                    Refresh by
                  </p>
                  <p className="text-xs font-medium">
                    {new Date(alert.refresh_needed_by).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full text-sm">
          <Lightbulb className="h-4 w-4 mr-2" />
          Capture New Insight
        </Button>
      </CardContent>
    </Card>
  );
}

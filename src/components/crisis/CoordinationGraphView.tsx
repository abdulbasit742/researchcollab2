import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Network, AlertTriangle, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { CoordinationGraph, CoordinationNode, Bottleneck } from "@/types/crisis-coordination";

interface CoordinationGraphViewProps {
  graph: CoordinationGraph;
  onNodeClick?: (nodeId: string) => void;
}

const statusColors = {
  pending: "bg-muted text-muted-foreground",
  active: "bg-blue-500 text-white",
  completed: "bg-green-500 text-white",
  blocked: "bg-red-500 text-white",
  at_risk: "bg-amber-500 text-white",
};

const priorityIcons = {
  low: null,
  medium: <Clock className="h-3 w-3" />,
  high: <AlertTriangle className="h-3 w-3" />,
  critical: <AlertTriangle className="h-3 w-3 text-red-500" />,
};

export function CoordinationGraphView({ graph, onNodeClick }: CoordinationGraphViewProps) {
  const taskNodes = graph.nodes.filter(n => n.type === "task" || n.type === "milestone");
  const criticalNodes = graph.nodes.filter(n => graph.criticalPath.includes(n.id));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{graph.missionName}</CardTitle>
          </div>
          <Badge variant="outline">
            {graph.overallProgress}% Complete
          </Badge>
        </div>
        <CardDescription>
          {taskNodes.length} tasks · {graph.bottlenecks.length} bottlenecks · Last updated {new Date(graph.lastUpdated).toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mission Progress</span>
            <span className="font-medium">{graph.overallProgress}%</span>
          </div>
          <Progress value={graph.overallProgress} className="h-2" />
        </div>

        {/* Critical Path */}
        {criticalNodes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              Critical Path
            </h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {criticalNodes.map((node, i) => (
                <div key={node.id} className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`${statusColors[node.status]} cursor-pointer whitespace-nowrap`}
                    onClick={() => onNodeClick?.(node.id)}
                  >
                    {node.label}
                    {node.progress !== undefined && ` (${node.progress}%)`}
                  </Badge>
                  {i < criticalNodes.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottlenecks */}
        {graph.bottlenecks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Bottlenecks ({graph.bottlenecks.length})
            </h4>
            <div className="space-y-2">
              {graph.bottlenecks.slice(0, 3).map((bottleneck) => (
                <BottleneckItem 
                  key={bottleneck.nodeId} 
                  bottleneck={bottleneck}
                  node={graph.nodes.find(n => n.id === bottleneck.nodeId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Task Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <StatusCount 
            label="Pending" 
            count={taskNodes.filter(n => n.status === "pending").length}
            color="text-muted-foreground"
          />
          <StatusCount 
            label="Active" 
            count={taskNodes.filter(n => n.status === "active").length}
            color="text-blue-600"
          />
          <StatusCount 
            label="Completed" 
            count={taskNodes.filter(n => n.status === "completed").length}
            color="text-green-600"
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatusCount 
            label="Blocked" 
            count={taskNodes.filter(n => n.status === "blocked").length}
            color="text-red-600"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BottleneckItem({ bottleneck, node }: { bottleneck: Bottleneck; node?: CoordinationNode }) {
  const severityColors = {
    low: "border-l-yellow-400",
    medium: "border-l-amber-500",
    high: "border-l-orange-500",
    critical: "border-l-red-500",
  };

  return (
    <div className={`p-3 rounded-lg border border-l-4 ${severityColors[bottleneck.severity]} bg-card`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{node?.label || bottleneck.nodeId}</span>
        <Badge variant="outline" className="text-xs capitalize">
          {bottleneck.severity}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{bottleneck.reason}</p>
      {bottleneck.suggestedActions.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Suggested: </span>
          {bottleneck.suggestedActions[0]}
        </div>
      )}
    </div>
  );
}

function StatusCount({ 
  label, 
  count, 
  color, 
  icon 
}: { 
  label: string; 
  count: number; 
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/50">
      <div className={`text-2xl font-bold ${color} flex items-center justify-center gap-1`}>
        {icon}
        {count}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

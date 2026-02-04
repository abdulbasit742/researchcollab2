import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  useWorkflowBuilder,
  useAutomationRules,
  useIntegrations,
  Workflow,
  AutomationRule,
  Integration
} from "@/hooks/useAutomationWorkflows";
import {
  Zap,
  GitBranch,
  Play,
  Pause,
  Settings,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Link2,
  Unlink,
  RefreshCw,
  ChevronRight,
  Workflow as WorkflowIcon,
  Layers,
  Calendar,
  Webhook,
  Bot,
  Copy,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";

// =====================================================
// WORKFLOW CARD
// =====================================================
export function WorkflowCard({ 
  workflow,
  onExecute,
  onPause,
  onClone
}: { 
  workflow: Workflow;
  onExecute?: (id: string) => void;
  onPause?: (id: string) => void;
  onClone?: (id: string) => void;
}) {
  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-primary/10 text-primary",
    paused: "bg-secondary text-secondary-foreground",
    error: "bg-destructive/10 text-destructive",
  };

  const triggerIcons: Record<string, React.ReactNode> = {
    schedule: <Calendar className="h-4 w-4" />,
    webhook: <Webhook className="h-4 w-4" />,
    event: <Zap className="h-4 w-4" />,
    manual: <Play className="h-4 w-4" />,
    condition: <GitBranch className="h-4 w-4" />,
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <WorkflowIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{workflow.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {workflow.description}
              </p>
            </div>
          </div>
          <Badge className={statusColors[workflow.status]}>
            {workflow.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="gap-1">
            {triggerIcons[workflow.trigger.type]}
            {workflow.trigger.type}
          </Badge>
          <Badge variant="secondary">{workflow.steps.length} steps</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
          <div>
            <p>Executions</p>
            <p className="text-lg font-semibold text-foreground">{workflow.executions}</p>
          </div>
          {workflow.lastExecuted && (
            <div>
              <p>Last Run</p>
              <p className="text-sm text-foreground">
                {format(new Date(workflow.lastExecuted), "MMM d, h:mm a")}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {workflow.status === "active" ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1"
              onClick={() => onPause?.(workflow.id)}
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="flex-1 gap-1"
              onClick={() => onExecute?.(workflow.id)}
            >
              <Play className="h-4 w-4" />
              Run
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onClone?.(workflow.id)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// WORKFLOW BUILDER (SIMPLIFIED)
// =====================================================
export function WorkflowBuilder() {
  const [steps, setSteps] = useState<Array<{ id: string; type: string; label: string }>>([
    { id: "1", type: "trigger", label: "When project is created" },
    { id: "2", type: "action", label: "Send welcome email" },
    { id: "3", type: "action", label: "Create task checklist" },
  ]);

  const stepTypes = [
    { type: "action", label: "Action", icon: <Zap className="h-4 w-4" /> },
    { type: "condition", label: "Condition", icon: <GitBranch className="h-4 w-4" /> },
    { type: "delay", label: "Delay", icon: <Clock className="h-4 w-4" /> },
    { type: "webhook", label: "Webhook", icon: <Webhook className="h-4 w-4" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Workflow Builder
            </CardTitle>
            <CardDescription>Design your automation flow</CardDescription>
          </div>
          <Button className="gap-2">
            Save Workflow
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {index > 0 && (
                <div className="absolute left-6 -top-4 w-0.5 h-4 bg-border" />
              )}
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                step.type === "trigger" ? "bg-primary/5 border-primary/20" : "bg-muted"
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step.type === "trigger" ? "bg-primary text-primary-foreground" : "bg-background border"
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase">
                    {step.type}
                  </p>
                  <p className="font-medium">{step.label}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Step
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-3">Available Steps</p>
          <div className="flex flex-wrap gap-2">
            {stepTypes.map((type) => (
              <Button key={type.type} variant="outline" size="sm" className="gap-2">
                {type.icon}
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// INTEGRATION CARD
// =====================================================
export function IntegrationCard({ 
  integration,
  onConnect,
  onDisconnect,
  onSync
}: { 
  integration: Integration;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSync?: () => void;
}) {
  const statusColors: Record<string, string> = {
    connected: "bg-primary/10 text-primary",
    disconnected: "bg-muted text-muted-foreground",
    error: "bg-destructive/10 text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{integration.name}</h4>
            <p className="text-sm text-muted-foreground capitalize">{integration.type}</p>
          </div>
          <Badge className={statusColors[integration.status]}>
            {integration.status === "connected" && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {integration.status === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
            {integration.status}
          </Badge>
        </div>

        {integration.status === "connected" && integration.lastSync && (
          <p className="text-xs text-muted-foreground mt-3">
            Last synced: {format(new Date(integration.lastSync), "MMM d, h:mm a")}
          </p>
        )}

        <div className="flex gap-2 mt-4">
          {integration.status === "connected" ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1"
                onClick={onSync}
              >
                <RefreshCw className="h-4 w-4" />
                Sync
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onDisconnect}
              >
                <Unlink className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              className="w-full gap-1"
              onClick={onConnect}
            >
              <Link2 className="h-4 w-4" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// AUTOMATION RULE CARD
// =====================================================
export function AutomationRuleCard({ 
  rule,
  onToggle,
  onTest
}: { 
  rule: AutomationRule;
  onToggle?: (id: string, enabled: boolean) => void;
  onTest?: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{rule.name}</h4>
              <p className="text-sm text-muted-foreground">
                Priority: {rule.priority}
              </p>
            </div>
          </div>
          <Switch 
            checked={rule.enabled} 
            onCheckedChange={(checked) => onToggle?.(rule.id, checked)}
          />
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">When</p>
            <code className="text-xs">{rule.condition}</code>
          </div>
          <div className="p-2 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Then</p>
            <code className="text-xs">{rule.action}</code>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Triggered {rule.triggerCount} times</span>
          {rule.lastTriggered && (
            <span>Last: {format(new Date(rule.lastTriggered), "MMM d")}</span>
          )}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4 gap-2"
          onClick={() => onTest?.(rule.id)}
        >
          <Play className="h-4 w-4" />
          Test Rule
        </Button>
      </CardContent>
    </Card>
  );
}

// =====================================================
// AUTOMATION DASHBOARD
// =====================================================
export function AutomationDashboard() {
  const { workflows, fetchWorkflows, executeWorkflow, pauseWorkflow, cloneWorkflow } = useWorkflowBuilder();
  const { rules, fetchRules, toggleRule, testRule } = useAutomationRules();
  const { integrations, fetchIntegrations, connectIntegration, disconnectIntegration, syncIntegration } = useIntegrations();

  const [activeTab, setActiveTab] = useState("workflows");

  // Initialize data
  useState(() => {
    fetchWorkflows();
    fetchRules();
    fetchIntegrations();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automation & Workflows</h2>
          <p className="text-muted-foreground">
            Build automated workflows and connect integrations
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <WorkflowIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workflows.filter(w => w.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <Zap className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workflows.reduce((sum, w) => sum + w.executions, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Bot className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rules.filter(r => r.enabled).length}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{integrations.filter(i => i.status === "connected").length}</p>
                <p className="text-sm text-muted-foreground">Connected Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="mt-6">
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <WorkflowIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No workflows</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first workflow to automate tasks
                </p>
                <Button>Create Workflow</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workflows.map((workflow) => (
                <WorkflowCard 
                  key={workflow.id} 
                  workflow={workflow}
                  onExecute={executeWorkflow}
                  onPause={pauseWorkflow}
                  onClone={cloneWorkflow}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="builder" className="mt-6">
          <WorkflowBuilder />
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          {rules.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No automation rules</h3>
                <p className="text-muted-foreground mb-4">
                  Create rules to automate repetitive actions
                </p>
                <Button>Create Rule</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rules.map((rule) => (
                <AutomationRuleCard 
                  key={rule.id} 
                  rule={rule}
                  onToggle={toggleRule}
                  onTest={(id) => testRule(id, {})}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <IntegrationCard 
                key={integration.id} 
                integration={integration}
                onConnect={() => connectIntegration(integration.type, {})}
                onDisconnect={() => disconnectIntegration(integration.id)}
                onSync={() => syncIntegration(integration.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AutomationDashboard;

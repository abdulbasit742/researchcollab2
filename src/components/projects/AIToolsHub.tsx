import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AI_TOOLS_HUB,
  getAIToolCategoryLabel,
  getAIToolCounts,
  getAIToolRiskClass,
  getAIToolStatusClass,
  getAIToolStatusLabel,
  type AIToolDefinition,
} from "@/config/aiToolsHub";
import { Bot, BrainCircuit, CheckCircle2, Lock, PlayCircle, ShieldAlert, Sparkles } from "lucide-react";

type AIToolsHubProps = {
  tools?: AIToolDefinition[];
};

export function AIToolsHub({ tools = AI_TOOLS_HUB }: AIToolsHubProps) {
  const counts = getAIToolCounts(tools);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="AI Tools" value={counts.total.toString()} helper="Workspace assistants" />
        <MetricCard label="Available" value={counts.available.toString()} helper="Ready placeholders" />
        <MetricCard label="Guarded" value={counts.guarded.toString()} helper="Safety gated" danger={counts.guarded > 0} />
        <MetricCard label="Coming Soon" value={counts.comingSoon.toString()} helper="Planned tools" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Tools Hub
              </CardTitle>
              <CardDescription>
                Central place for research, writing, review, planning, and safety AI assistants across the project workspace.
              </CardDescription>
            </div>
            <Button variant="outline" disabled>
              <Sparkles className="mr-2 h-4 w-4" /> Launch AI Workspace
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This hub is read-only. Real AI actions should use saved project context, source-grounded inputs, human review, and audit logs before writing into reports or proposals.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {tools.map((tool) => (
              <AIToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AIToolCard({ tool }: { tool: AIToolDefinition }) {
  const disabled = tool.status !== "available";

  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getAIToolCategoryLabel(tool.category)}</Badge>
            <Badge className={getAIToolStatusClass(tool.status)}>{getAIToolStatusLabel(tool.status)}</Badge>
            <Badge className={getAIToolRiskClass(tool.risk)}>{tool.risk} risk</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{tool.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
          </div>
        </div>
        <Button variant="outline" disabled={disabled}>
          {disabled ? <Lock className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
          {disabled ? "Locked" : "Open"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <BrainCircuit className="h-4 w-4 text-primary" /> Inputs Needed
          </p>
          <div className="mt-2 space-y-2">
            {tool.inputNeeded.map((input) => (
              <p key={input} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {input}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ShieldAlert className="h-4 w-4 text-amber-500" /> Safety Note
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{tool.safetyNote}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-primary/5 p-3 text-sm">
        <p className="font-medium">Output Preview</p>
        <p className="mt-1 text-muted-foreground">{tool.outputPreview}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-amber-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

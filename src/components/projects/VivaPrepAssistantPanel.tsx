import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  VIVA_PREP_ITEMS,
  getVivaPrepCounts,
  getVivaPrepDifficultyClass,
  getVivaPrepReadiness,
  getVivaPrepStatusClass,
  getVivaPrepStatusLabel,
  type VivaPrepItem,
} from "@/config/vivaPrepAssistant";
import { AlertTriangle, CheckCircle2, GraduationCap, Lock, MessageSquareText, PlayCircle, Sparkles, type LucideIcon } from "lucide-react";

type VivaPrepAssistantPanelProps = {
  items?: VivaPrepItem[];
};

export function VivaPrepAssistantPanel({ items = VIVA_PREP_ITEMS }: VivaPrepAssistantPanelProps) {
  const readiness = getVivaPrepReadiness(items);
  const counts = getVivaPrepCounts(items);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Viva Readiness" value={`${readiness}%`} helper="Answer confidence" danger={readiness < 70} />
        <MetricCard label="Questions" value={counts.total.toString()} helper="Practice bank" />
        <MetricCard label="Weak Areas" value={counts.weak.toString()} helper="Needs practice" danger={counts.weak > 0} />
        <MetricCard label="Hard Questions" value={counts.hard.toString()} helper="High challenge" danger={counts.hard > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Viva Prep Assistant
              </CardTitle>
              <CardDescription>
                Practice common defense questions using answer points, supporting material, weak-area flags, and readiness labels.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <PlayCircle className="mr-2 h-4 w-4" /> Start Practice
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Generate More
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Viva readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is read-only preparation support. Real practice mode should connect to the actual report, project scope, supervisor feedback, and saved answers.
          </div>

          <div className="grid gap-4">
            {items.map((item) => (
              <VivaQuestionCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VivaQuestionCard({ item }: { item: VivaPrepItem }) {
  return (
    <div className="space-y-4 rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{item.topic}</Badge>
            <Badge className={getVivaPrepStatusClass(item.status)}>{getVivaPrepStatusLabel(item.status)}</Badge>
            <Badge className={getVivaPrepDifficultyClass(item.difficulty)}>{item.difficulty}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{item.question}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{item.focusNote}</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          <MessageSquareText className="mr-2 h-4 w-4" /> Practice Answer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Answer Points" icon={CheckCircle2} items={item.answerPoints} />
        <Checklist title="Supporting Material" icon={Sparkles} items={item.supportingMaterial} />
      </div>

      {item.status === "weak" ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" /> Weak-area flag
          </p>
          <p className="mt-1">{item.focusNote}</p>
        </div>
      ) : null}
    </div>
  );
}

function Checklist({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {item}
          </p>
        ))}
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

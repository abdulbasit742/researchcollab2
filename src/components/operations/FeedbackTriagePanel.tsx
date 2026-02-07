import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Signal, Volume2, VolumeX, Filter, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedbackItem } from "@/hooks/useOperationsCenter";

interface Props {
  feedback: FeedbackItem[];
  signalFeedback: FeedbackItem[];
  untriaged: FeedbackItem[];
  onTriage: (id: string, classification: string, priority: string, category?: string) => Promise<void>;
}

const classificationConfig = {
  signal: { label: "SIGNAL", icon: Signal, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  noise: { label: "NOISE", icon: VolumeX, color: "bg-muted text-muted-foreground border-border" },
  unclassified: { label: "UNTRIAGED", icon: Volume2, color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
};

export function FeedbackTriagePanel({ feedback, signalFeedback, untriaged, onTriage }: Props) {
  const [view, setView] = useState<"untriaged" | "signal" | "noise" | "all">("untriaged");

  const displayed = view === "untriaged" ? untriaged
    : view === "signal" ? signalFeedback
    : view === "noise" ? feedback.filter(f => f.classification === "noise")
    : feedback;

  return (
    <div className="space-y-4">
      {/* Triage Rules */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-2">📐 Triage Rubric</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">→ SIGNAL (Act on it)</p>
              <ul className="list-disc list-inside space-y-0.5 mt-1">
                <li>Repeated by 3+ users</li>
                <li>Blocks a core outcome</li>
                <li>Affects money or trust</li>
                <li>Reproducible consistently</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">→ NOISE (Log & ignore)</p>
              <ul className="list-disc list-inside space-y-0.5 mt-1">
                <li>One user's opinion</li>
                <li>Aesthetic preference</li>
                <li>Feature not in daily loop</li>
                <li>Emotion without data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(view === "untriaged" && "bg-amber-500/10 border-amber-500/50")}>
            {untriaged.length} untriaged
          </Badge>
          <Badge variant="outline" className={cn(view === "signal" && "bg-emerald-500/10 border-emerald-500/50")}>
            {signalFeedback.length} signal
          </Badge>
        </div>
        <Select value={view} onValueChange={(v) => setView(v as any)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="untriaged">Untriaged</SelectItem>
            <SelectItem value="signal">Signal Only</SelectItem>
            <SelectItem value="noise">Noise</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback Items */}
      <div className="space-y-2">
        {displayed.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p>All feedback triaged. Inbox zero.</p>
            </CardContent>
          </Card>
        ) : (
          displayed.map(fb => {
            const cls = classificationConfig[fb.classification as keyof typeof classificationConfig] || classificationConfig.unclassified;
            const Icon = cls.icon;
            return (
              <Card key={fb.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className={cls.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {cls.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{fb.source}</Badge>
                        {fb.is_blocking && <Badge variant="destructive" className="text-xs">Blocking</Badge>}
                        {fb.frequency > 1 && <Badge variant="secondary" className="text-xs">{fb.frequency}x reported</Badge>}
                      </div>
                      <p className="text-sm">{fb.raw_feedback}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>{fb.user_count} user(s)</span>
                        <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {fb.classification === "unclassified" && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button size="sm" variant="default" onClick={() => onTriage(fb.id, "signal", "high", "bug")}>
                          <Signal className="h-3 w-3 mr-1" /> Signal
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onTriage(fb.id, "noise", "ignore")}>
                          <VolumeX className="h-3 w-3 mr-1" /> Noise
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

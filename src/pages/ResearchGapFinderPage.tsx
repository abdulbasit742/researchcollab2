import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sparkles, Loader2, Lightbulb, Target, FlaskConical, Database,
  Wrench, FileText, Compass, History, BookOpen, AlertTriangle,
} from "lucide-react";

interface GapResult {
  summary?: string;
  existing_work?: string[];
  gaps?: string[];
  novelty_angles?: string[];
  suggested_methodology?: string;
  datasets?: string[];
  tools?: string[];
  paper_titles?: string[];
  future_scope?: string[];
  feasibility_note?: string;
}

interface HistoryRow {
  id: string;
  topic: string;
  context: string | null;
  result: GapResult;
  created_at: string;
}

function Section({ icon: Icon, title, items, color = "text-primary" }: { icon: React.ElementType; title: string; items?: string[]; color?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {items.map((x, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted-foreground mt-1">·</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function ResearchGapFinderPage() {
  const [topic, setTopic] = useState("");
  const [ctx, setCtx] = useState("");
  const [result, setResult] = useState<GapResult | null>(null);
  const qc = useQueryClient();

  const { data: history = [], isLoading: histLoading } = useQuery({
    queryKey: ["research-gap-history"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await supabase
        .from("research_gap_searches")
        .select("*")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return (data ?? []) as HistoryRow[];
    },
  });

  const runMut = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("research-gap-finder", {
        body: { topic, context: ctx || undefined },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data as GapResult;
    },
    onSuccess: (data) => {
      setResult(data);
      qc.invalidateQueries({ queryKey: ["research-gap-history"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function loadHistory(row: HistoryRow) {
    setTopic(row.topic);
    setCtx(row.context ?? "");
    setResult(row.result);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const running = runMut.isPending;

  return (
    <MainLayout>
      <div className="gradient-hero py-8 sm:py-14">
        <div className="container px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Badge variant="secondary" className="mb-3">
              <Sparkles className="h-3 w-3 mr-1" /> AI Research Gap Finder
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold">
              Find the <span className="text-gradient">white space</span> in your topic
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Enter a topic and get a structured map of existing work, open gaps, novelty angles, methodologies, datasets, and publishable paper titles — advisory only.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8 max-w-6xl grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Topic</CardTitle>
              <CardDescription>Be specific. E.g. "Vision transformers for prostate histopathology grading".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Research topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={running}
              />
              <Textarea
                placeholder="Optional context: your level (FYP / MS / PhD), prior work, constraints, available data..."
                value={ctx}
                onChange={(e) => setCtx(e.target.value)}
                disabled={running}
                rows={3}
              />
              <Button
                onClick={() => runMut.mutate()}
                disabled={running || topic.trim().length < 4}
                className="w-full sm:w-auto"
              >
                {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing topic…</>
                  : <><Sparkles className="h-4 w-4 mr-2" /> Find research gaps</>}
              </Button>
            </CardContent>
          </Card>

          {running && (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
            </div>
          )}

          {result && !running && (
            <div className="space-y-4">
              {result.summary && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" /> Field summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-sm">{result.summary}</p></CardContent>
                </Card>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Section icon={BookOpen} title="Existing work" items={result.existing_work} />
                <Section icon={Target} title="Open research gaps" items={result.gaps} color="text-orange-500" />
                <Section icon={Lightbulb} title="Novelty angles" items={result.novelty_angles} color="text-yellow-500" />
                <Section icon={FileText} title="Paper title ideas" items={result.paper_titles} />
                <Section icon={Database} title="Relevant datasets" items={result.datasets} color="text-blue-500" />
                <Section icon={Wrench} title="Suggested tools" items={result.tools} color="text-green-500" />
                <Section icon={Compass} title="Future scope" items={result.future_scope} color="text-purple-500" />
              </div>

              {result.suggested_methodology && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-primary" /> Suggested methodology
                    </CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-sm leading-relaxed">{result.suggested_methodology}</p></CardContent>
                </Card>
              )}

              {result.feasibility_note && (
                <Card className="border-orange-500/30 bg-orange-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" /> Feasibility note
                    </CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-sm">{result.feasibility_note}</p></CardContent>
                </Card>
              )}
            </div>
          )}

          {!result && !running && (
            <Card className="p-10 text-center text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Enter a topic above to generate a research gap map.</p>
            </Card>
          )}
        </div>

        <aside>
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" /> Recent searches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-3 space-y-2">
                  {histLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)
                  ) : history.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3">No searches yet.</p>
                  ) : (
                    history.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => loadHistory(h)}
                        className="w-full text-left p-3 rounded-md border hover:bg-muted/50 transition-colors"
                      >
                        <div className="text-sm font-medium line-clamp-2">{h.topic}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(h.created_at).toLocaleString()}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>
      </div>
    </MainLayout>
  );
}

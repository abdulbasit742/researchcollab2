/**
 * PeerReviewPanel — Structured Debate & Peer Review UI.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Users, MessageSquare, Loader2, CheckCircle, AlertTriangle,
  Gavel, Brain, ChevronRight, Scale, FileCheck, Swords,
} from "lucide-react";
import {
  useReviewCycles, useReviewComments, useReviewOutcome,
  useDebateThreads, useDebateEntries,
  useCreateReviewCycle, useAddReviewComment,
  useAIMethodologyReview, useGenerateReviewOutcome,
  useCreateDebateThread, useAddDebateEntry,
  type ReviewCycle, type ReviewComment,
} from "@/hooks/useStructuredReview";

interface PeerReviewPanelProps {
  workspaceId: string;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600",
  in_review: "bg-amber-500/10 text-amber-600",
  revision_requested: "bg-orange-500/10 text-orange-600",
  approved: "bg-green-500/10 text-green-600",
  rejected: "bg-red-500/10 text-red-600",
};

const severityColors: Record<string, string> = {
  low: "default",
  medium: "secondary",
  high: "outline",
  critical: "destructive",
};

export function PeerReviewPanel({ workspaceId }: PeerReviewPanelProps) {
  const { data: cycles = [], isLoading } = useReviewCycles(workspaceId);
  const createCycle = useCreateReviewCycle();
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [reviewType, setReviewType] = useState("open");

  return (
    <div className="space-y-4">
      {/* Create Cycle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Peer Review & Structured Debate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Review cycle title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1"
            />
            <Select value={reviewType} onValueChange={setReviewType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open Review</SelectItem>
                <SelectItem value="blind">Blind Review</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                if (newTitle.trim()) {
                  createCycle.mutate({ workspaceId, title: newTitle.trim(), reviewType });
                  setNewTitle("");
                }
              }}
              disabled={createCycle.isPending || !newTitle.trim()}
            >
              {createCycle.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cycles List */}
      {isLoading ? (
        <div className="text-center py-6"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
      ) : cycles.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No review cycles yet. Create one to start structured peer review.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cycles.map((cycle) => (
            <Card
              key={cycle.id}
              className={`cursor-pointer hover:border-primary/50 transition-colors ${selectedCycleId === cycle.id ? "border-primary" : ""}`}
              onClick={() => setSelectedCycleId(cycle.id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{cycle.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{cycle.review_type}</Badge>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[cycle.status] || ""}`}>
                        {cycle.status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(cycle.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cycle Detail */}
      {selectedCycleId && (
        <ReviewCycleDetail
          cycleId={selectedCycleId}
          workspaceId={workspaceId}
          cycle={cycles.find(c => c.id === selectedCycleId)}
        />
      )}
    </div>
  );
}

function ReviewCycleDetail({ cycleId, workspaceId, cycle }: { cycleId: string; workspaceId: string; cycle?: ReviewCycle }) {
  const { data: comments = [], isLoading: commentsLoading } = useReviewComments(cycleId);
  const { data: outcome } = useReviewOutcome(cycleId);
  const { data: threads = [] } = useDebateThreads(cycleId);
  const addComment = useAddReviewComment();
  const aiReview = useAIMethodologyReview();
  const generateOutcome = useGenerateReviewOutcome();
  const createThread = useCreateDebateThread();

  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("evidence");
  const [severity, setSeverity] = useState("medium");
  const [threadTitle, setThreadTitle] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{cycle?.title || "Review Cycle"}</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => aiReview.mutate({ workspaceId, reviewCycleId: cycleId })}
              disabled={aiReview.isPending}
            >
              {aiReview.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Brain className="h-3 w-3 mr-1" />}
              AI Review
            </Button>
            <Button
              size="sm"
              onClick={() => generateOutcome.mutate({ reviewCycleId: cycleId, workspaceId })}
              disabled={generateOutcome.isPending || comments.length === 0}
            >
              {generateOutcome.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Gavel className="h-3 w-3 mr-1" />}
              Generate Verdict
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="comments">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
            <TabsTrigger value="debate">Debate ({threads.length})</TabsTrigger>
            {outcome && <TabsTrigger value="outcome">Outcome</TabsTrigger>}
          </TabsList>

          <TabsContent value="comments" className="space-y-3 mt-3">
            {/* Add Comment Form */}
            <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
              <Textarea
                placeholder="Add structured review comment (reference specific claims or methodology)..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[60px] resize-none"
              />
              <div className="flex gap-2 items-center">
                <Select value={commentType} onValueChange={setCommentType}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="methodology">Methodology</SelectItem>
                    <SelectItem value="evidence">Evidence</SelectItem>
                    <SelectItem value="logic">Logic</SelectItem>
                    <SelectItem value="clarity">Clarity</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="bias">Bias</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => {
                    if (commentText.trim()) {
                      addComment.mutate({ cycleId, text: commentText.trim(), type: commentType, severity });
                      setCommentText("");
                    }
                  }}
                  disabled={addComment.isPending || !commentText.trim()}
                >
                  {addComment.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="text-center py-4"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-2">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg border space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={(severityColors[c.severity_level] || "secondary") as any} className="text-[10px]">
                          {c.severity_level}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{c.comment_type}</Badge>
                        {c.is_resolved && (
                          <Badge className="text-[10px] bg-primary/10 text-primary">
                            <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Resolved
                          </Badge>
                        )}
                        {c.ai_analysis && (
                          <Badge variant="outline" className="text-[10px]">
                            <Brain className="h-2.5 w-2.5 mr-0.5" /> AI-assisted
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{c.comment_text}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="debate" className="space-y-3 mt-3">
            {/* Create Thread */}
            <div className="flex gap-2">
              <Input
                placeholder="New debate thread title..."
                value={threadTitle}
                onChange={(e) => setThreadTitle(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (threadTitle.trim()) {
                    createThread.mutate({ cycleId, title: threadTitle.trim() });
                    setThreadTitle("");
                  }
                }}
                disabled={createThread.isPending || !threadTitle.trim()}
              >
                <Swords className="h-3 w-3 mr-1" /> Challenge
              </Button>
            </div>

            {/* Thread List */}
            <div className="space-y-2">
              {threads.map((t) => (
                <div key={t.id}>
                  <div
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/30 ${selectedThreadId === t.id ? "border-primary" : ""}`}
                    onClick={() => setSelectedThreadId(selectedThreadId === t.id ? null : t.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Scale className="h-3.5 w-3.5 text-primary" />
                        {t.title}
                      </h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[t.status] || ""}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                  {selectedThreadId === t.id && (
                    <DebateThreadDetail threadId={t.id} />
                  )}
                </div>
              ))}
              {threads.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No debate threads yet.</p>
              )}
            </div>
          </TabsContent>

          {outcome && (
            <TabsContent value="outcome" className="mt-3">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border text-center">
                  <p className="text-xs text-muted-foreground mb-1">Review Decision</p>
                  <p className={`text-2xl font-bold capitalize ${
                    outcome.decision === "approve" ? "text-green-600" :
                    outcome.decision === "reject" ? "text-red-600" : "text-amber-600"
                  }`}>
                    {outcome.decision.replace("_", " ")}
                  </p>
                  {outcome.weighted_score != null && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Quality Score: {(outcome.weighted_score * 100).toFixed(0)}%
                    </p>
                  )}
                  {outcome.institutional_seal && (
                    <Badge className="mt-2">
                      <Shield className="h-3 w-3 mr-1" /> Institutional Seal
                    </Badge>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{outcome.summary}</p>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DebateThreadDetail({ threadId }: { threadId: string }) {
  const { data: entries = [] } = useDebateEntries(threadId);
  const addEntry = useAddDebateEntry();
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState("argument");

  const typeIcons: Record<string, string> = {
    challenge: "🔴",
    counterclaim: "🟡",
    evidence: "🟢",
    defense: "🔵",
    concession: "⚪",
    moderator_note: "⚖️",
  };

  return (
    <div className="ml-4 mt-2 space-y-2 border-l-2 border-primary/20 pl-3">
      {entries.map((e) => (
        <div key={e.id} className="p-2 rounded border text-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <span>{typeIcons[e.entry_type] || "💬"}</span>
            <span className="capitalize font-medium">{e.entry_type.replace("_", " ")}</span>
            <span>·</span>
            <span>{new Date(e.created_at).toLocaleString()}</span>
          </div>
          <p>{e.content}</p>
        </div>
      ))}
      <div className="flex gap-2">
        <Select value={entryType} onValueChange={setEntryType}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="challenge">Challenge</SelectItem>
            <SelectItem value="counterclaim">Counterclaim</SelectItem>
            <SelectItem value="evidence">Evidence</SelectItem>
            <SelectItem value="defense">Defense</SelectItem>
            <SelectItem value="concession">Concession</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Add to debate..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && content.trim()) {
              addEntry.mutate({ threadId, entryType, content: content.trim() });
              setContent("");
            }
          }}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => {
            if (content.trim()) {
              addEntry.mutate({ threadId, entryType, content: content.trim() });
              setContent("");
            }
          }}
          disabled={addEntry.isPending || !content.trim()}
        >
          {addEntry.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "→"}
        </Button>
      </div>
    </div>
  );
}

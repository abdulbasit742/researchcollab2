/**
 * ResearchWorkspacePage — Source-grounded Research Intelligence workspace.
 * Upload documents, ask questions, get cited AI responses.
 */

import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ClaimGraphPanel } from "@/components/research/ClaimGraphPanel";
import { ResearchTimelinePanel } from "@/components/research/ResearchTimelinePanel";
import { FundingPlanPanel } from "@/components/research/FundingPlanPanel";
import { PeerReviewPanel } from "@/components/research/PeerReviewPanel";
import { KnowledgeGraphPanel } from "@/components/research/KnowledgeGraphPanel";
import { CARCResponsePanel } from "@/components/research/CARCResponsePanel";
import { PolicySimulationPanel } from "@/components/research/PolicySimulationPanel";
import { KnowledgeMonitorPanel } from "@/components/research/KnowledgeMonitorPanel";
import { ResearchPortfolioPanel } from "@/components/research/ResearchPortfolioPanel";
import {
  BookOpen, Upload, Search, FileText, MessageSquare,
  Loader2, CheckCircle, AlertCircle, ChevronRight,
  BarChart3, Shield, Sparkles, Quote,
} from "lucide-react";
import {
  useResearchWorkspace,
  useWorkspaceDocuments,
  useWorkspaceQueries,
  useUploadResearchDocument,
  useResearchQuery,
  useResearchAnalytics,
  type CitationEntry,
} from "@/hooks/useResearchWorkspace";

export default function ResearchWorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { data: workspace, isLoading: wsLoading } = useResearchWorkspace(workspaceId);
  const { data: documents = [], isLoading: docsLoading } = useWorkspaceDocuments(workspaceId);
  const { data: queries = [] } = useWorkspaceQueries(workspaceId);
  const { data: analytics } = useResearchAnalytics(workspaceId);
  const uploadDoc = useUploadResearchDocument();
  const askQuery = useResearchQuery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [queryText, setQueryText] = useState("");
  const [activeResponse, setActiveResponse] = useState<{
    text: string;
    citations: CitationEntry[];
    confidence: number;
  } | null>(null);
  const [hoveredCitation, setHoveredCitation] = useState<CitationEntry | null>(null);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!workspaceId) return;
    for (const file of Array.from(files)) {
      // Client-side text extraction for txt/md files
      let extractedText = "";
      if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
        extractedText = await file.text();
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        // For PDFs, we pass a placeholder — the edge function handles full parsing
        extractedText = await file.text().catch(() => "");
        if (!extractedText || extractedText.length < 50) {
          extractedText = `[PDF Document: ${file.name} — ${(file.size / 1024).toFixed(1)}KB. Text extraction requires server-side processing.]`;
        }
      } else {
        extractedText = await file.text().catch(() => `[Document: ${file.name}]`);
      }

      await uploadDoc.mutateAsync({
        workspaceId,
        file,
        extractedText,
      });
    }
  }, [workspaceId, uploadDoc]);

  const handleQuery = useCallback(async () => {
    if (!workspaceId || !queryText.trim()) return;
    const result = await askQuery.mutateAsync({
      workspaceId,
      queryText: queryText.trim(),
    });
    setActiveResponse({
      text: result.ai_response,
      citations: result.citation_map,
      confidence: result.confidence_score,
    });
    setQueryText("");
  }, [workspaceId, queryText, askQuery]);

  if (wsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Workspace not found</p>
      </div>
    );
  }

  // Parse citations in response text [Source N]
  const renderResponseWithCitations = (text: string, citations: CitationEntry[]) => {
    const parts = text.split(/(\[Source \d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[Source (\d+)\]/);
      if (match) {
        const idx = parseInt(match[1]) - 1;
        const citation = citations[idx];
        return (
          <span
            key={i}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium cursor-pointer hover:bg-primary/20 transition-colors"
            onMouseEnter={() => citation && setHoveredCitation(citation)}
            onMouseLeave={() => setHoveredCitation(null)}
          >
            <Quote className="h-3 w-3" />
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {workspace.title}
          </h1>
          {workspace.description && (
            <p className="text-muted-foreground mt-1">{workspace.description}</p>
          )}
        </div>
        <Badge variant={workspace.visibility === "private" ? "secondary" : "default"}>
          {workspace.visibility}
        </Badge>
      </div>

      {/* Analytics Bar */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Documents", value: analytics.document_count, icon: FileText },
            { label: "Chunks", value: analytics.total_chunks, icon: BarChart3 },
            { label: "Processed", value: analytics.processed_docs, icon: CheckCircle },
            { label: "Queries", value: analytics.total_queries, icon: Search },
            { label: "Answered", value: analytics.completed_queries, icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-xl font-bold mt-1">{value}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Documents + Upload */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Source Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Upload Zone */}
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">
                  Upload research documents (PDF, TXT, MD)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.txt,.md,.docx"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </div>

              {uploadDoc.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing document...
                </div>
              )}

              <Separator />

              {/* Document List */}
              {docsLoading ? (
                <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No documents yet. Upload to begin.
                </p>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent/30 transition-colors">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.file_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{doc.chunk_count} chunks</span>
                            <Badge
                              variant={doc.processing_status === "completed" ? "default" : "secondary"}
                              className="text-[10px] px-1 py-0"
                            >
                              {doc.processing_status === "completed" ? (
                                <CheckCircle className="h-3 w-3 mr-0.5" />
                              ) : doc.processing_status === "failed" ? (
                                <AlertCircle className="h-3 w-3 mr-0.5" />
                              ) : (
                                <Loader2 className="h-3 w-3 mr-0.5 animate-spin" />
                              )}
                              {doc.processing_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center: Query + Response */}
        <div className="lg:col-span-2 space-y-4">
          {/* Query Input */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask a question about your research documents..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleQuery();
                    }
                  }}
                  className="min-h-[60px] resize-none"
                  disabled={askQuery.isPending}
                />
                <Button
                  onClick={handleQuery}
                  disabled={askQuery.isPending || !queryText.trim()}
                  className="self-end"
                >
                  {askQuery.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Response */}
          {activeResponse && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Research Response
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={activeResponse.confidence >= 0.7 ? "default" : "secondary"}>
                      <Shield className="h-3 w-3 mr-1" />
                      {(activeResponse.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                    <Badge variant="outline">
                      {activeResponse.citations.length} sources
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Response Text with Inline Citations */}
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                  {renderResponseWithCitations(activeResponse.text, activeResponse.citations)}
                </div>

                {/* Citation Hover Panel */}
                {hoveredCitation && (
                  <div className="p-3 rounded-lg border bg-muted/50 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Quote className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        Source {hoveredCitation.source_index} — {hoveredCitation.document_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      "{hoveredCitation.text_preview}..."
                    </p>
                  </div>
                )}

                <Separator />

                {/* Citation List */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Sources Referenced</h4>
                  <div className="space-y-1">
                    {activeResponse.citations.map((c) => (
                      <div
                        key={c.chunk_id}
                        className="flex items-center gap-2 p-2 rounded text-xs hover:bg-accent/30 cursor-pointer transition-colors"
                        onMouseEnter={() => setHoveredCitation(c)}
                        onMouseLeave={() => setHoveredCitation(null)}
                      >
                        <Badge variant="outline" className="text-[10px] px-1">
                          S{c.source_index}
                        </Badge>
                        <span className="font-medium truncate">{c.document_name}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Query History */}
          {queries.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Query History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {queries.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg border hover:bg-accent/30 cursor-pointer transition-colors"
                        onClick={() => {
                          const resp = q.research_responses?.[0];
                          if (resp) {
                            setActiveResponse({
                              text: resp.ai_response,
                              citations: resp.citation_map as CitationEntry[],
                              confidence: Number(resp.confidence_score),
                            });
                          }
                        }}
                      >
                        <p className="text-sm font-medium">{q.query_text}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Badge
                            variant={q.status === "completed" ? "default" : "secondary"}
                            className="text-[10px] px-1 py-0"
                          >
                            {q.status}
                          </Badge>
                          <span>{new Date(q.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Constraint-Aware Research Copilot */}
      {workspaceId && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Constraint-Aware Research Copilot
          </h2>
          <CARCResponsePanel workspaceId={workspaceId} />
        </div>
      )}

      {/* Cross-Document Synthesis Panel */}
      {workspaceId && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Cross-Document Synthesis Engine
          </h2>
          <ClaimGraphPanel workspaceId={workspaceId} />
        </div>
      )}

      {/* Peer Review & Structured Debate */}
      {workspaceId && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Peer Review & Structured Debate
          </h2>
          <PeerReviewPanel workspaceId={workspaceId} />
        </div>
      )}

      {/* Research-to-Capital Structuring */}
      {workspaceId && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Research → Capital Structuring
          </h2>
          <FundingPlanPanel workspaceId={workspaceId} />
        </div>
      )}

      {/* Global Knowledge Graph */}
      {workspaceId && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Global Knowledge Graph & Citation Intelligence
          </h2>
        <KnowledgeGraphPanel workspaceId={workspaceId} />
        </div>
      )}

      {/* Policy Simulation & Impact Modeling */}
      {workspaceId && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Policy Simulation & Impact Modeling
          </h2>
          <PolicySimulationPanel workspaceId={workspaceId} />
        </div>
      )}

      {/* Longitudinal Research Memory */}
      {workspaceId && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Research Memory & Evolution
          </h2>
          <ResearchTimelinePanel workspaceId={workspaceId} />
        </div>
      )}

      {/* Autonomous Knowledge Monitor */}
      {workspaceId && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Autonomous Knowledge Monitor
          </h2>
          <KnowledgeMonitorPanel workspaceId={workspaceId} />
        </div>
      )}

      {/* Research Portfolio Optimization */}
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Research Portfolio Optimization
        </h2>
        <ResearchPortfolioPanel />
      </div>
    </div>
  );
}

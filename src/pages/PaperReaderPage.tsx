import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Loader2,
  Quote,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { PAPER_REGISTRY } from "@/data/papers/mobile-devices-english-study";
import { useUniversalAI, type AIDomain } from "@/hooks/useUniversalAI";
import ReactMarkdown from "react-markdown";

export default function PaperReaderPage() {
  const { slug } = useParams<{ slug: string }>();
  const paper = slug ? PAPER_REGISTRY[slug] : undefined;
  const { ask, loading: aiLoading } = useUniversalAI();

  const [summary, setSummary] = useState<{
    summary: string;
    keyFindings: string[];
    methodology: string;
    limitations: string;
    relevanceScore: number;
  } | null>(null);
  const [plainSummary, setPlainSummary] = useState<string | null>(null);
  const [showPlain, setShowPlain] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [showAISidebar, setShowAISidebar] = useState(false);

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Paper not found</h1>
          <Button asChild variant="outline">
            <Link to="/research-papers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Research Hub
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSummarize = async () => {
    setShowAISidebar(true);
    const result = await ask<{
      summary: string;
      keyFindings: string[];
      methodology: string;
      limitations: string;
      relevanceScore: number;
    }>("research" as AIDomain, "summarize-paper", {
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors,
      journal: paper.journal,
      type: "Journal Article",
      field: paper.field,
    });
    if (result) setSummary(result);
  };

  const handlePlainEnglish = async () => {
    if (plainSummary) {
      setShowPlain(!showPlain);
      return;
    }
    if (!summary) return;
    const result = await ask<{ simplified: string }>("research" as AIDomain, "simplify-summary", {
      title: paper.title,
      summary: summary.summary,
      findings: summary.keyFindings,
    });
    if (result) {
      setPlainSummary(result.simplified);
      setShowPlain(true);
    }
  };

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const AISummarizerContent = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground">AI Summarizer</h3>
        <Badge variant="secondary" className="text-[10px]">AI</Badge>
      </div>

      {!summary ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Get an AI-generated summary with key findings, methodology breakdown, and relevance score.
          </p>
          <Button
            onClick={handleSummarize}
            disabled={aiLoading}
            className="w-full gap-2"
            size="sm"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {aiLoading ? "Analyzing..." : "Summarize Paper"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Relevance Score</span>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {summary.relevanceScore}/10
            </Badge>
          </div>
          <Separator />
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-1">Summary</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{summary.summary}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-1">Key Findings</h4>
            <ul className="space-y-1">
              {summary.keyFindings.map((f, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-1">Methodology</h4>
            <p className="text-xs text-muted-foreground">{summary.methodology}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-1">Limitations</h4>
            <p className="text-xs text-muted-foreground">{summary.limitations}</p>
          </div>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handlePlainEnglish}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Lightbulb className="h-3.5 w-3.5" />
            )}
            {showPlain ? "Hide" : "Show"} Plain English
          </Button>
          {showPlain && plainSummary && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-foreground leading-relaxed">{plainSummary}</p>
            </div>
          )}
        </div>
      )}

      <Separator />
      <div className="space-y-2">
        <a href={paper.pdfPath} download className="block">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
        </a>
        <a
          href={`https://doi.org/${paper.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="truncate">DOI: {paper.doi}</span>
          </Button>
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-6">
      {/* Top Metadata Bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b"
      >
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Button variant="ghost" size="sm" asChild className="shrink-0 h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2">
                  <Link to="/research-papers">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                  Journal Article
                </Badge>
                <Badge variant="outline" className="text-[10px] sm:text-xs bg-green-500/10 text-green-700 border-green-200 shrink-0 hidden xs:inline-flex">
                  Open Access
                </Badge>
              </div>
              <h1 className="text-xs sm:text-sm md:text-base font-semibold text-foreground line-clamp-2 ml-0 sm:ml-9">
                {paper.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-xs text-muted-foreground mt-1 sm:ml-9">
                <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                  <Users className="h-3 w-3 shrink-0" />
                  {paper.authors.join(", ")}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {paper.year}
                </span>
                <span className="flex items-center gap-1 truncate max-w-[120px] sm:max-w-none hidden sm:flex">
                  <BookOpen className="h-3 w-3 shrink-0" />
                  {paper.journal}
                </span>
                <span className="flex items-center gap-1">
                  <Quote className="h-3 w-3" />
                  {paper.citations}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <a
                href={`https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 gap-1 text-[10px] sm:text-xs">
                  <ExternalLink className="h-3 w-3" />
                  DOI
                </Badge>
              </a>
              <a href={paper.pdfPath} download className="hidden sm:block">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </a>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* AI Summarizer - shown first on mobile when toggled */}
          {showAISidebar && (
            <div className="lg:hidden">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-4 sm:p-5">
                    <AISummarizerContent />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3 text-xs text-muted-foreground"
                      onClick={() => setShowAISidebar(false)}
                    >
                      Hide AI Panel
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Paper Content - Main */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Abstract */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">Abstract</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{paper.abstract}</p>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-3 sm:mt-4">
                    {paper.keywords.map((kw) => (
                      <Badge key={kw} variant="secondary" className="text-[10px] sm:text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sections */}
            {paper.sections.map((section, idx) => {
              const isExpanded = expandedSections[idx] !== false;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <button
                        onClick={() => toggleSection(idx)}
                        className="flex items-center justify-between w-full text-left min-h-[44px]"
                      >
                        <h2 className="text-base sm:text-lg font-bold text-foreground pr-2">{section.heading}</h2>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="mt-3 prose prose-sm max-w-none dark:prose-invert text-muted-foreground text-xs sm:text-sm">
                          <ReactMarkdown>{section.content}</ReactMarkdown>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Sidebar - AI Summarizer (desktop only) */}
          <div className="hidden lg:block space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-28"
            >
              <Card>
                <CardContent className="p-5">
                  <AISummarizerContent />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar - positioned above MobileBottomNav */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-2.5 z-30 safe-area-bottom">
        <div className="flex gap-2">
          <a href={paper.pdfPath} download className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5 h-10 text-xs touch-manipulation active:scale-95">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </a>
          <Button
            size="sm"
            className="flex-1 gap-1.5 h-10 text-xs touch-manipulation active:scale-95"
            onClick={handleSummarize}
            disabled={aiLoading || !!summary}
          >
            {aiLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {summary ? "Summarized ✓" : "AI Summarize"}
          </Button>
        </div>
      </div>
    </div>
  );
}

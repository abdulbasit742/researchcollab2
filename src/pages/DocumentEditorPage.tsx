import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDocuments } from "@/hooks/useDocuments";
import { useUniversalAI } from "@/hooks/useUniversalAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft, Save, Sparkles, BookOpen, Quote, FileText,
  Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2,
  AlignLeft, AlignCenter, AlignRight, Loader2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const DocumentEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDoc, fetchDocument, updateDocument, loading } = useDocuments();
  const { ask, loading: aiLoading } = useUniversalAI();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formatStyle, setFormatStyle] = useState("apa");
  const [saving, setSaving] = useState(false);
  const [aiPanel, setAiPanel] = useState(false);
  const [aiResult, setAiResult] = useState("");

  useEffect(() => {
    if (id) fetchDocument(id);
  }, [id]);

  useEffect(() => {
    if (currentDoc) {
      setTitle(currentDoc.title);
      setFormatStyle(currentDoc.format_style);
      // Extract text content from JSON or use as-is
      if (typeof currentDoc.content === "object" && currentDoc.content?.content) {
        const text = currentDoc.content.content
          .map((block: any) => (typeof block.content === "string" ? block.content : ""))
          .join("\n\n");
        setContent(text);
      } else if (typeof currentDoc.content === "string") {
        setContent(currentDoc.content);
      }
    }
  }, [currentDoc]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    await updateDocument(id, {
      title,
      content: { type: "doc", content: content.split("\n\n").map(p => ({ type: "paragraph", content: p })) },
      word_count: wordCount,
      format_style: formatStyle,
    });
    setSaving(false);
  }, [id, title, content, wordCount, formatStyle, updateDocument]);

  const handleAI = async (action: string) => {
    const result = await ask("research", action, { content: content.slice(0, 3000), format: formatStyle });
    if (result?.text) setAiResult(result.text);
    else if (result?.result) setAiResult(result.result);
    else if (typeof result === "string") setAiResult(result);
    setAiPanel(true);
  };

  if (loading && !currentDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2 px-4 py-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/productivity")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border-0 text-lg font-semibold bg-transparent focus-visible:ring-0 max-w-md"
            placeholder="Document title"
          />
          <div className="flex-1" />
          <Select value={formatStyle} onValueChange={setFormatStyle}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apa">APA</SelectItem>
              <SelectItem value="mla">MLA</SelectItem>
              <SelectItem value="chicago">Chicago</SelectItem>
              <SelectItem value="ieee">IEEE</SelectItem>
              <SelectItem value="harvard">Harvard</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-xs">{wordCount} words</Badge>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
        </div>

        {/* Formatting bar */}
        <div className="flex items-center gap-0.5 px-4 pb-2">
          <Button variant="ghost" size="icon" className="h-7 w-7"><Bold className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Italic className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Underline className="h-3.5 w-3.5" /></Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7"><Heading1 className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Heading2 className="h-3.5 w-3.5" /></Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7"><List className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><ListOrdered className="h-3.5 w-3.5" /></Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7"><AlignLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><AlignCenter className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><AlignRight className="h-3.5 w-3.5" /></Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7"><Quote className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><BookOpen className="h-3.5 w-3.5" /></Button>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                AI Assistant
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAI("rewrite_academically")}>Rewrite Academically</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("summarize")}>Summarize</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("suggest_citations")}>Suggest Citations</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("generate_literature_review")}>Generate Literature Review</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("generate_abstract")}>Generate Abstract</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("check_grammar")}>Check Grammar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex">
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Start writing your research document..."
            className="min-h-[600px] border-0 resize-none text-base leading-relaxed bg-transparent focus-visible:ring-0 font-serif"
          />
        </div>

        {/* AI Panel */}
        {aiPanel && aiResult && (
          <div className="w-80 border-l bg-card p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Suggestion
              </h4>
              <Button variant="ghost" size="sm" onClick={() => setAiPanel(false)} className="text-xs">Close</Button>
            </div>
            <Card>
              <CardContent className="p-3 text-sm whitespace-pre-wrap">{aiResult}</CardContent>
            </Card>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="flex-1 text-xs" onClick={() => { setContent(prev => prev + "\n\n" + aiResult); setAiPanel(false); }}>
                Insert
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setContent(aiResult); setAiPanel(false); }}>
                Replace
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentEditorPage;

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDocuments } from "@/hooks/useDocuments";
import { useUniversalAI } from "@/hooks/useUniversalAI";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorContent } from "@tiptap/react";
import { EditorToolbar } from "@/components/documents/EditorToolbar";
import { DocumentOutline } from "@/components/documents/DocumentOutline";
import { DocumentCommentsPanel } from "@/components/documents/DocumentCommentsPanel";
import { VersionHistoryPanel } from "@/components/documents/VersionHistoryPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft, Save, Sparkles, Loader2, PanelLeft, MessageSquare, History,
  Download, Users, FileText
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";

const DocumentEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentDoc, fetchDocument, updateDocument, loading } = useDocuments();
  const { ask, loading: aiLoading } = useUniversalAI();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [formatStyle, setFormatStyle] = useState("apa");
  const [saving, setSaving] = useState(false);
  const [leftPanel, setLeftPanel] = useState<"outline" | null>("outline");
  const [rightPanel, setRightPanel] = useState<"comments" | "history" | "ai" | null>(null);
  const [aiResult, setAiResult] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing your document..." }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
    ],
    content: null,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[calc(100vh-140px)] px-12 py-8 font-serif leading-relaxed",
      },
    },
    onUpdate: () => {
      // Trigger autosave after 3 seconds of inactivity
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => handleAutoSave(), 3000);
    },
  });

  useEffect(() => {
    if (id) fetchDocument(id);
  }, [id]);

  useEffect(() => {
    if (currentDoc && editor) {
      setTitle(currentDoc.title);
      setFormatStyle(currentDoc.format_style);
      if (currentDoc.content && typeof currentDoc.content === "object") {
        editor.commands.setContent(currentDoc.content);
      }
    }
  }, [currentDoc, editor]);

  const wordCount = editor?.storage.characterCount?.words() || 0;
  const charCount = editor?.storage.characterCount?.characters() || 0;

  const handleSave = useCallback(async () => {
    if (!id || !editor) return;
    setSaving(true);
    const content = editor.getJSON();
    await updateDocument(id, {
      title,
      content,
      word_count: wordCount,
      format_style: formatStyle,
    });

    // Save version
    const { data: lastVersion } = await supabase
      .from("document_versions")
      .select("version_number")
      .eq("document_id", id)
      .order("version_number", { ascending: false })
      .limit(1);
    const nextVersion = (lastVersion?.[0]?.version_number || 0) + 1;

    await supabase.from("document_versions").insert({
      document_id: id,
      version_number: nextVersion,
      content: content,
      created_by: user?.id || "",
      word_count: wordCount,
      change_summary: `Manual save v${nextVersion}`,
    } as any);

    // Audit log
    await supabase.from("document_audit_logs").insert({
      document_id: id,
      user_id: user?.id || "",
      action: "save",
      details: { version: nextVersion, word_count: wordCount },
    } as any);

    setLastSaved(new Date());
    setSaving(false);
    toast({ title: "Saved", description: `Version ${nextVersion} saved` });
  }, [id, title, editor, wordCount, formatStyle, updateDocument, user, toast]);

  const handleAutoSave = useCallback(async () => {
    if (!id || !editor) return;
    const content = editor.getJSON();
    await updateDocument(id, {
      content,
      word_count: editor.storage.characterCount?.words() || 0,
    });
    setLastSaved(new Date());
  }, [id, editor, updateDocument]);

  const handleAI = async (action: string) => {
    if (!editor) return;
    const text = editor.getText().slice(0, 3000);
    const result = await ask("research", action, { content: text, format: formatStyle });
    if (result?.text) setAiResult(result.text);
    else if (result?.result) setAiResult(result.result);
    else if (typeof result === "string") setAiResult(result);
    setRightPanel("ai");
  };

  const handleRestore = (content: any) => {
    if (editor && content) {
      editor.commands.setContent(content);
      toast({ title: "Restored", description: "Document restored from version history" });
    }
  };

  const handleExport = (format: string) => {
    if (!editor) return;
    if (format === "markdown") {
      // Simple markdown-like text export
      const text = editor.getText();
      const blob = new Blob([text], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "document"}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "text") {
      const text = editor.getText();
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "document"}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "html") {
      const html = editor.getHTML();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "document"}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading && !currentDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <div className="border-b bg-card shrink-0 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/productivity")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <FileText className="h-4 w-4 text-primary" />
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border-0 text-sm font-semibold bg-transparent focus-visible:ring-0 max-w-sm h-8"
            placeholder="Document title"
          />
          <div className="flex-1" />
          <Select value={formatStyle} onValueChange={setFormatStyle}>
            <SelectTrigger className="w-24 h-7 text-xs">
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
          <Badge variant="secondary" className="text-[10px] h-5">{wordCount} words</Badge>
          <Badge variant="outline" className="text-[10px] h-5">{charCount} chars</Badge>
          {lastSaved && (
            <span className="text-[10px] text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}

          {/* Panel toggles */}
          <Button
            variant={leftPanel === "outline" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setLeftPanel(leftPanel === "outline" ? null : "outline")}
            title="Toggle Outline"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={rightPanel === "comments" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setRightPanel(rightPanel === "comments" ? null : "comments")}
            title="Comments"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={rightPanel === "history" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setRightPanel(rightPanel === "history" ? null : "history")}
            title="Version History"
          >
            <History className="h-3.5 w-3.5" />
          </Button>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Export">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("html")}>Export HTML</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("markdown")}>Export Markdown</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("text")}>Export Plain Text</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* AI Assistant */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                AI
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAI("rewrite_academically")}>Rewrite Academically</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("summarize")}>Summarize</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("suggest_citations")}>Suggest Citations</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("generate_literature_review")}>Literature Review</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("generate_abstract")}>Generate Abstract</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("check_grammar")}>Check Grammar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1 h-7 text-xs">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </Button>
        </div>

        {/* Formatting Toolbar */}
        <EditorToolbar editor={editor} />
      </div>

      {/* Main editor area with panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Outline */}
        {leftPanel === "outline" && (
          <div className="w-56 border-r bg-card shrink-0 overflow-hidden">
            <DocumentOutline editor={editor} />
          </div>
        )}

        {/* Editor canvas */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-4xl mx-auto">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Right panel */}
        {rightPanel && id && (
          <div className="w-72 border-l bg-card shrink-0 overflow-hidden">
            {rightPanel === "comments" && (
              <DocumentCommentsPanel documentId={id} />
            )}
            {rightPanel === "history" && (
              <VersionHistoryPanel documentId={id} onRestore={handleRestore} />
            )}
            {rightPanel === "ai" && aiResult && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    AI Suggestion
                  </h4>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3">{aiResult}</div>
                </div>
                <div className="p-3 border-t flex gap-2">
                  <Button size="sm" className="flex-1 text-xs h-7" onClick={() => {
                    if (editor) {
                      editor.chain().focus().insertContent(aiResult).run();
                      setRightPanel(null);
                    }
                  }}>
                    Insert
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => setRightPanel(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="border-t bg-card px-4 py-1 flex items-center gap-4 text-[10px] text-muted-foreground shrink-0">
        <span>{formatStyle.toUpperCase()} format</span>
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
        {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
        <div className="flex-1" />
        <span>RCollab Docs</span>
      </div>
    </div>
  );
};

export default DocumentEditorPage;

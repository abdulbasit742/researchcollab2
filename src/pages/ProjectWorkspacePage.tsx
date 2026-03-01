import { useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWorkspaceDocs, useCreateWorkspaceDoc, useSaveWorkspaceDoc, useDocumentHistory } from "@/hooks/usePlatformExcellence";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus, Clock, Save, Loader2, FolderOpen, History } from "lucide-react";

export default function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const [newDocTitle, setNewDocTitle] = useState("");
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Get or create workspace for this project
  const { data: workspace, isLoading: wsLoading } = useQuery({
    queryKey: ["project-workspace", projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("research_workspaces")
        .select("*")
        .eq("project_id", projectId!)
        .maybeSingle();

      if (data) return data;

      // Auto-create workspace for project
      const { data: created, error } = await supabase
        .from("research_workspaces")
        .insert({
          project_id: projectId!,
          owner_id: user!.id,
          title: "Project Workspace",
          visibility: "team",
        })
        .select()
        .single();

      if (error) throw error;
      return created;
    },
    enabled: !!projectId && !!user,
  });

  const { data: docs = [], isLoading: docsLoading } = useWorkspaceDocs(workspace?.id);
  const createDoc = useCreateWorkspaceDoc();
  const saveDoc = useSaveWorkspaceDoc();
  const { data: history = [] } = useDocumentHistory(showHistory ? activeDocId || undefined : undefined);

  const activeDoc = docs.find((d: any) => d.id === activeDocId);

  const handleCreateDoc = async () => {
    if (!workspace?.id || !newDocTitle.trim()) return;
    const doc = await createDoc.mutateAsync({
      workspaceId: workspace.id,
      title: newDocTitle.trim(),
    });
    setNewDocTitle("");
    setShowNewDoc(false);
    setActiveDocId(doc.id);
    setEditContent("");
  };

  const handleSave = async () => {
    if (!activeDocId) return;
    await saveDoc.mutateAsync({
      docId: activeDocId,
      content: { text: editContent },
    });
  };

  const handleSelectDoc = (doc: any) => {
    setActiveDocId(doc.id);
    setEditContent(doc.content?.text || JSON.stringify(doc.content, null, 2));
  };

  return (
    <MainLayout>
      <div className="container py-6 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-primary" />
              Project Workspace
            </h1>
            <p className="text-sm text-muted-foreground">
              Collaborative documents with version tracking
            </p>
          </div>
          <Dialog open={showNewDoc} onOpenChange={setShowNewDoc}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Document title..."
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                />
                <Button onClick={handleCreateDoc} disabled={createDoc.isPending || !newDocTitle.trim()}>
                  {createDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground px-1">Documents</h3>
            {docsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              </div>
            ) : docs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No documents yet</p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="max-h-[70vh]">
                {docs.map((doc: any) => (
                  <Card
                    key={doc.id}
                    className={`mb-2 cursor-pointer transition-colors hover:bg-accent/30 ${
                      activeDocId === doc.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleSelectDoc(doc)}
                  >
                    <CardContent className="py-3 px-4">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">v{doc.version_number}</Badge>
                        <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            )}
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            {activeDoc ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{activeDoc.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">v{activeDoc.version_number}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                      >
                        <History className="h-4 w-4 mr-1" />
                        History
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saveDoc.isPending}
                      >
                        {saveDoc.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Start writing..."
                  />

                  {/* Version History */}
                  {showHistory && history.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Version History
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {history.map((h: any) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between p-2 rounded border text-xs cursor-pointer hover:bg-accent/30"
                            onClick={() => setEditContent(h.content?.text || JSON.stringify(h.content))}
                          >
                            <span>Version {h.version_number}</span>
                            <span className="text-muted-foreground">
                              {new Date(h.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Select or create a document to begin</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

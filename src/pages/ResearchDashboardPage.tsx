/**
 * ResearchDashboardPage — List and create research workspaces.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Loader2, FileText, Search, Lock, Globe, Building2 } from "lucide-react";
import { useResearchWorkspaces, useCreateWorkspace } from "@/hooks/useResearchWorkspace";

const VISIBILITY_ICONS = {
  private: Lock,
  shared: Globe,
  institutional: Building2,
};

export default function ResearchDashboardPage() {
  const navigate = useNavigate();
  const { data: workspaces = [], isLoading } = useResearchWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");

  const handleCreate = async () => {
    if (!title.trim()) return;
    const ws = await createWorkspace.mutateAsync({ title: title.trim(), description, visibility });
    setOpen(false);
    setTitle("");
    setDescription("");
    navigate(`/research/${ws.id}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Research Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Source-grounded AI research with full citation traceability
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Research Workspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input
                placeholder="Workspace title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="institutional">Institutional</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreate} disabled={createWorkspace.isPending || !title.trim()} className="w-full">
                {createWorkspace.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Workspace
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : workspaces.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No research workspaces</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first workspace to upload documents and query with AI.
          </p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => {
            const Icon = VISIBILITY_ICONS[ws.visibility as keyof typeof VISIBILITY_ICONS] || Lock;
            return (
              <Card
                key={ws.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/research/${ws.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {ws.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ws.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{ws.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      <Icon className="h-3 w-3 mr-1" />
                      {ws.visibility}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(ws.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

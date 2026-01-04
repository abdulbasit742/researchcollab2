import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FolderOpen, Plus, Pencil, Trash2, ExternalLink, GripVertical, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  thumbnail_url: string | null;
  display_order: number | null;
}

interface ProjectFormData {
  title: string;
  description: string;
  link: string;
}

export function PortfolioManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    link: "",
  });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true });

    if (error) {
      toast({
        title: "Error loading projects",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProjects(data || []);
    }
    setIsLoading(false);
  };

  const openAddDialog = () => {
    setEditingProject(null);
    setFormData({ title: "", description: "", link: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: PortfolioProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || "",
      link: project.link || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !formData.title.trim()) {
      toast({
        title: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    if (editingProject) {
      // Update existing project
      const { error } = await supabase
        .from("portfolio_projects")
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          link: formData.link.trim() || null,
        })
        .eq("id", editingProject.id);

      if (error) {
        toast({
          title: "Error updating project",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Project updated!" });
        fetchProjects();
        setIsDialogOpen(false);
      }
    } else {
      // Create new project
      const newOrder = projects.length;
      const { error } = await supabase
        .from("portfolio_projects")
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          link: formData.link.trim() || null,
          display_order: newOrder,
        });

      if (error) {
        toast({
          title: "Error adding project",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Project added!" });
        fetchProjects();
        setIsDialogOpen(false);
      }
    }

    setIsSaving(false);
  };

  const handleDelete = async (projectId: string) => {
    const { error } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Project deleted" });
      fetchProjects();
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Portfolio
          </CardTitle>
          <CardDescription>Please log in to manage your portfolio</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                Portfolio
              </CardTitle>
              <CardDescription>Showcase your work and projects</CardDescription>
            </div>
            <Button onClick={openAddDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No projects yet</p>
              <p className="text-sm">Add your first project to showcase your work</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{project.title}</h4>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {project.description}
                      </p>
                    )}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Project
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "Add Project"}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? "Update your project details"
                : "Add a new project to your portfolio"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">Title *</Label>
              <Input
                id="project-title"
                placeholder="My Awesome Project"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Brief description of your project..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-link">Project Link</Label>
              <Input
                id="project-link"
                placeholder="https://..."
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProject ? "Save Changes" : "Add Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

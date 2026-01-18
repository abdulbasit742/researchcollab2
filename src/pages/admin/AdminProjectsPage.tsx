import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { useAdminProjects, AdminProject } from "@/hooks/useAdminProjects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Trash2, Edit, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminProjectsPage() {
  const { projects, loading, updateProject, deleteProject } = useAdminProjects();
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    deadline_days: "",
    status: "open",
    location: "",
  });

  const handleStatusChange = async (project: AdminProject, status: string) => {
    const result = await updateProject(project.id, { status });
    if (result.success) {
      toast.success(`Project status changed to ${status}`);
    } else {
      toast.error(`Failed to update status: ${result.error}`);
    }
  };

  const handleUpdate = async () => {
    if (!editingProject) return;
    const result = await updateProject(editingProject.id, {
      title: formData.title,
      description: formData.description,
      budget_min: formData.budget_min ? Number(formData.budget_min) : null,
      budget_max: formData.budget_max ? Number(formData.budget_max) : null,
      deadline_days: formData.deadline_days ? Number(formData.deadline_days) : null,
      status: formData.status,
      location: formData.location || null,
    });
    if (result.success) {
      toast.success("Project updated successfully");
      setEditingProject(null);
    } else {
      toast.error(`Failed to update project: ${result.error}`);
    }
  };

  const handleDelete = async (project: AdminProject) => {
    if (!confirm(`Are you sure you want to delete "${project.title}"? This will also delete all bids.`)) return;
    const result = await deleteProject(project.id);
    if (result.success) {
      toast.success("Project deleted successfully");
    } else {
      toast.error(`Failed to delete project: ${result.error}`);
    }
  };

  const openEdit = (project: AdminProject) => {
    setFormData({
      title: project.title,
      description: project.description || "",
      budget_min: project.budget_min?.toString() || "",
      budget_max: project.budget_max?.toString() || "",
      deadline_days: project.deadline_days?.toString() || "",
      status: project.status || "open",
      location: project.location || "",
    });
    setEditingProject(project);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-purple-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const columns = [
    {
      key: "title",
      header: "Project",
      sortable: true,
      render: (project: AdminProject) => (
        <div>
          <p className="font-medium">{project.title}</p>
          <p className="text-xs text-muted-foreground">by {project.owner_name}</p>
        </div>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      render: (project: AdminProject) => (
        <span>
          {project.budget_min && project.budget_max
            ? `$${project.budget_min} - $${project.budget_max}`
            : project.budget_min
            ? `$${project.budget_min}+`
            : project.budget_max
            ? `Up to $${project.budget_max}`
            : "Not set"}
        </span>
      ),
    },
    {
      key: "bids_count",
      header: "Bids",
      sortable: true,
      render: (project: AdminProject) => (
        <Badge variant="outline">{project.bids_count || 0} bids</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (project: AdminProject) => getStatusBadge(project.status),
    },
    {
      key: "created_at",
      header: "Posted",
      sortable: true,
      render: (project: AdminProject) => format(new Date(project.created_at), "MMM d, yyyy"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (project: AdminProject) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openEdit(project)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleStatusChange(project, "open")}>
              <Clock className="h-4 w-4 mr-2" />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(project, "in_progress")}>
              <Clock className="h-4 w-4 mr-2" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(project, "completed")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(project, "cancelled")}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancelled
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(project)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projects Management</h1>
            <p className="text-muted-foreground">
              View and manage all earning projects
            </p>
          </div>
        </div>

        <DataTable
          data={projects}
          columns={columns}
          loading={loading}
          searchKey="title"
          searchPlaceholder="Search projects..."
          pageSize={15}
        />

        {/* Edit Dialog */}
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update project information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-budget_min">Min Budget ($)</Label>
                  <Input
                    id="edit-budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-budget_max">Max Budget ($)</Label>
                  <Input
                    id="edit-budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-deadline">Deadline (days)</Label>
                <Input
                  id="edit-deadline"
                  type="number"
                  value={formData.deadline_days}
                  onChange={(e) => setFormData({ ...formData, deadline_days: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProject(null)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

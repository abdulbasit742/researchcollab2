import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { useAdminTools, Tool } from "@/hooks/useTools";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Plus, Star, StarOff, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AdminToolsPage() {
  const { tools, loading, createTool, updateTool, deleteTool, refetch } = useAdminTools();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    short_description: "",
    description: "",
    is_featured: false,
    is_active: true,
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.category) {
      toast.error("Name and category are required");
      return;
    }
    const result = await createTool({
      name: formData.name,
      category: formData.category,
      short_description: formData.short_description,
      description: formData.description,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
    });
    if (result.success) {
      toast.success("Tool created successfully");
      setCreateOpen(false);
      setFormData({ name: "", category: "", short_description: "", description: "", is_featured: false, is_active: true });
    } else {
      toast.error(`Failed to create tool: ${result.error}`);
    }
  };

  const handleUpdate = async () => {
    if (!editingTool) return;
    const result = await updateTool(editingTool.id, {
      name: formData.name,
      category: formData.category,
      short_description: formData.short_description,
      description: formData.description,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
    });
    if (result.success) {
      toast.success("Tool updated successfully");
      setEditingTool(null);
    } else {
      toast.error(`Failed to update tool: ${result.error}`);
    }
  };

  const handleToggleFeatured = async (tool: Tool) => {
    const result = await updateTool(tool.id, { is_featured: !tool.is_featured });
    if (result.success) {
      toast.success(tool.is_featured ? "Tool unfeatured" : "Tool featured");
    }
  };

  const handleToggleActive = async (tool: Tool) => {
    const result = await updateTool(tool.id, { is_active: !tool.is_active });
    if (result.success) {
      toast.success(tool.is_active ? "Tool deactivated" : "Tool activated");
    }
  };

  const handleDelete = async (tool: Tool) => {
    if (!confirm(`Are you sure you want to delete "${tool.name}"?`)) return;
    const result = await deleteTool(tool.id);
    if (result.success) {
      toast.success("Tool deleted successfully");
    } else {
      toast.error(`Failed to delete tool: ${result.error}`);
    }
  };

  const openEdit = (tool: Tool) => {
    setFormData({
      name: tool.name,
      category: tool.category,
      short_description: tool.short_description || "",
      description: tool.description || "",
      is_featured: tool.is_featured,
      is_active: tool.is_active,
    });
    setEditingTool(tool);
  };

  const columns = [
    {
      key: "name",
      header: "Tool",
      sortable: true,
      render: (tool: Tool) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-lg">
            {tool.icon || "🔧"}
          </div>
          <div>
            <p className="font-medium">{tool.name}</p>
            <p className="text-xs text-muted-foreground">{tool.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "short_description",
      header: "Description",
      render: (tool: Tool) => (
        <p className="text-sm text-muted-foreground max-w-xs truncate">
          {tool.short_description || "-"}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (tool: Tool) => (
        <div className="flex gap-1">
          {tool.is_featured && <Badge className="bg-yellow-500">Featured</Badge>}
          <Badge variant={tool.is_active ? "default" : "secondary"}>
            {tool.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (tool: Tool) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openEdit(tool)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleToggleFeatured(tool)}>
              {tool.is_featured ? (
                <>
                  <StarOff className="h-4 w-4 mr-2" />
                  Unfeature
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Feature
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleActive(tool)}>
              {tool.is_active ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(tool)} className="text-destructive">
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
            <h1 className="text-2xl font-bold">Tools Management</h1>
            <p className="text-muted-foreground">
              Add, edit, and manage marketplace tools
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Tool</DialogTitle>
                <DialogDescription>Create a new tool for the marketplace</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tool name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Data Analysis, Writing, Research"
                  />
                </div>
                <div>
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured</Label>
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create Tool</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable
          data={tools}
          columns={columns}
          loading={loading}
          searchKey="name"
          searchPlaceholder="Search tools..."
          pageSize={15}
        />

        {/* Edit Dialog */}
        <Dialog open={!!editingTool} onOpenChange={() => setEditingTool(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tool</DialogTitle>
              <DialogDescription>Update tool information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-short_description">Short Description</Label>
                <Input
                  id="edit-short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Full Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured</Label>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTool(null)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

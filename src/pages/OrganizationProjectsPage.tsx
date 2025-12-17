import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Plus, Users, Calendar, DollarSign, Target,
  Clock, CheckCircle2, FolderKanban
} from "lucide-react";
import { getOrganizationById, getOrgProjects, OrgProject } from "@/data/organizations";

const OrganizationProjectsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    numberOfStudents: 10,
    budgetPerStudent: 200,
    duration: '3 months',
    requiredSkills: ''
  });
  
  const org = getOrganizationById(id || '');
  const projects = org ? getOrgProjects(org.id) : [];

  if (!org) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Organization Not Found</h1>
          <Button onClick={() => navigate('/org')}>Browse Organizations</Button>
        </div>
      </MainLayout>
    );
  }

  const handleCreateProject = () => {
    if (!newProject.title || !newProject.description) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    toast({
      title: "Project Created",
      description: `${newProject.title} has been created with budget $${newProject.numberOfStudents * newProject.budgetPerStudent}`
    });
    setCreateOpen(false);
    setNewProject({
      title: '',
      description: '',
      numberOfStudents: 10,
      budgetPerStudent: 200,
      duration: '3 months',
      requiredSkills: ''
    });
  };

  const getStatusColor = (status: OrgProject['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'draft': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/org/${id}/dashboard`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Project Programs</h1>
            <p className="text-muted-foreground">{org.name}</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Project Program</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Program Title</Label>
                  <Input
                    placeholder="e.g., FYP Research Program 2024"
                    value={newProject.title}
                    onChange={(e) => setNewProject(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the program objectives..."
                    value={newProject.description}
                    onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Number of Students</Label>
                    <Input
                      type="number"
                      value={newProject.numberOfStudents}
                      onChange={(e) => setNewProject(p => ({ ...p, numberOfStudents: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>Budget per Student ($)</Label>
                    <Input
                      type="number"
                      value={newProject.budgetPerStudent}
                      onChange={(e) => setNewProject(p => ({ ...p, budgetPerStudent: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g., 6 months"
                    value={newProject.duration}
                    onChange={(e) => setNewProject(p => ({ ...p, duration: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Required Skills (comma-separated)</Label>
                  <Input
                    placeholder="Python, Machine Learning, Data Analysis"
                    value={newProject.requiredSkills}
                    onChange={(e) => setNewProject(p => ({ ...p, requiredSkills: e.target.value }))}
                  />
                </div>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between font-medium">
                      <span>Total Program Budget</span>
                      <span>${newProject.numberOfStudents * newProject.budgetPerStudent}</span>
                    </div>
                  </CardContent>
                </Card>
                <Button onClick={handleCreateProject} className="w-full">
                  Create Program
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active Programs</p>
              <p className="text-2xl font-bold">{activeProjects.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{projects.reduce((sum, p) => sum + p.numberOfStudents, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">${projects.reduce((sum, p) => sum + p.totalBudget, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedProjects.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        <h2 className="text-xl font-semibold mb-4">Active Programs</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {activeProjects.map(project => {
            const completionRate = (project.completedCount / project.numberOfStudents) * 100;
            
            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Completion Progress</span>
                        <span className="font-medium">{project.completedCount}/{project.numberOfStudents} students</span>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Budget: ${project.totalBudget}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Duration: {project.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Assigned: {project.assignedStudents.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Deadline: {project.deadline?.toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {project.requiredSkills.map(skill => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Students
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Target className="h-4 w-4 mr-2" />
                        View Milestones
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Completed Programs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {completedProjects.map(project => (
                <Card key={project.id} className="opacity-80">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Students</p>
                        <p className="font-medium">{project.numberOfStudents}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">${project.totalBudget}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-medium">{project.completedCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Project Programs Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create bulk project programs for your students with defined budgets and milestones.
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Program
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default OrganizationProjectsPage;

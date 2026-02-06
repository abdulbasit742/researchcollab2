import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Search,
  DollarSign,
  Star,
  Clock,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Users,
  FileText,
  RefreshCw,
  PlusCircle,
  FolderOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEarningProjects, useMyBids, useMyProjects, EarningProject } from "@/hooks/useEarning";
import { useAuth } from "@/contexts/AuthContext";
import { formatPKRRange, formatPKR } from "@/lib/currency";
import { ProjectListSkeleton } from "@/components/skeletons/ProjectListSkeleton";
import { formatDistanceToNow } from "date-fns";
import { PostProjectModal } from "@/components/earn/PostProjectModal";
import { EditProjectModal } from "@/components/earn/EditProjectModal";
import { MyProjectCard } from "@/components/earn/MyProjectCard";
import { MyProjectsFilterSort, StatusFilter, SortOption } from "@/components/earn/MyProjectsFilterSort";
import { EarnStatsBar } from "@/components/earn/EarnStatsBar";


export default function EarnPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<EarningProject | null>(null);
  
  // My Projects filter/sort state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Real database hooks
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useEarningProjects();
  const { bids: myBids, loading: bidsLoading, refetch: refetchBids } = useMyBids();
  const { projects: myProjects, loading: myProjectsLoading, refetch: refetchMyProjects } = useMyProjects();

  const handleEditProject = (project: EarningProject) => {
    setProjectToEdit(project);
    setEditModalOpen(true);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const formatDeadline = (days: number | null) => {
    if (!days) return "Flexible";
    return `${days} days`;
  };

  return (
    <MainLayout>
      <div className="gradient-hero py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <DollarSign className="h-3 w-3 mr-1" />
              Student Earning Hub
            </Badge>
            <h1 className="text-3xl font-bold md:text-5xl lg:text-6xl">
              Turn Your Skills Into{" "}
              <span className="text-gradient">Real Income</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Earn money by helping with research projects, academic work, and 
              professional services. Set your rates and work on your schedule.
            </p>
          </motion.div>

          {/* Earning Stats - Real Data */}
          <EarnStatsBar />
        </div>
      </div>

      <div className="container py-8 md:py-16 px-4 md:px-6">
        <Tabs defaultValue="projects" className="space-y-6 md:space-y-8">
          <div className="flex flex-col gap-4">
            {/* Scrollable Tabs for Mobile */}
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-auto min-w-full md:w-auto">
                <TabsTrigger value="projects" className="whitespace-nowrap">
                  Available Projects
                </TabsTrigger>
                <TabsTrigger value="how-it-works" className="whitespace-nowrap">
                  How It Works
                </TabsTrigger>
                <TabsTrigger value="my-bids" className="whitespace-nowrap">
                  My Bids
                </TabsTrigger>
                <TabsTrigger value="my-projects" className="whitespace-nowrap">
                  My Projects
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => {
                  if (user) {
                    setPostModalOpen(true);
                  } else {
                    navigate("/auth?tab=signup");
                  }
                }}
                className="w-full sm:w-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Post Project
              </Button>
            </div>
          </div>

          <TabsContent value="projects" className="space-y-4 md:space-y-6">
            {projectsLoading ? (
              <ProjectListSkeleton count={4} />
            ) : projectsError ? (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="text-destructive mb-4">Error loading projects</div>
                  <Button onClick={() => refetchProjects()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? "No Projects Found" : "No Projects Available Yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery 
                      ? "Try adjusting your search criteria."
                      : "Be the first to post a project and find talented freelancers."
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => navigate("/auth?tab=signup")}>
                      Post a Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card variant="interactive">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle 
                            className="text-lg md:text-xl cursor-pointer hover:text-primary transition-colors truncate"
                            onClick={() => navigate(`/earn/projects/${project.id}`)}
                          >
                            {project.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Posted {formatTimeAgo(project.created_at)}
                            {project.owner_name && ` by ${project.owner_name}`}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={project.status === "open" ? "success" : "secondary"}
                          className="cursor-pointer hover:opacity-80 transition-opacity self-start shrink-0 capitalize"
                          onClick={() => navigate(`/earn/projects/${project.id}`)}
                        >
                          {project.status || "Open"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      <p className="text-muted-foreground text-sm md:text-base line-clamp-2">
                        {project.description || "No description provided."}
                      </p>

                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {(project.tags || []).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-4 md:gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold">
                            {project.budget_min && project.budget_max 
                              ? formatPKRRange(project.budget_min, project.budget_max)
                              : project.budget_min 
                                ? formatPKR(project.budget_min)
                                : "Budget TBD"
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>Deadline: {formatDeadline(project.deadline_days)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>{project.bid_count || 0} bids</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-0">
                      <Button 
                        onClick={() => navigate(`/earn/projects/${project.id}#bid`)}
                        className="w-full sm:w-auto"
                      >
                        Place Bid
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/earn/projects/${project.id}`)}
                        className="w-full sm:w-auto"
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="how-it-works">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  step: "1",
                  title: "Browse Projects",
                  description: "Explore available research and academic projects that match your skills. Filter by discipline, budget, and deadline.",
                  icon: Search,
                },
                {
                  step: "2",
                  title: "Place Your Bid",
                  description: "Submit a proposal with your rate and timeline. Include your relevant experience and approach to the work.",
                  icon: FileText,
                },
                {
                  step: "3",
                  title: "Complete & Get Paid",
                  description: "Deliver quality work on time. Payment is secured through escrow — you get paid when the client approves.",
                  icon: CheckCircle2,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <item.icon className="h-7 w-7 text-primary" />
                      </div>
                      <Badge variant="secondary" className="mb-3">Step {item.step}</Badge>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-bids">
            {!user ? (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Sign In to View Your Bids</h3>
                  <p className="text-muted-foreground mb-6">
                    Create an account to start bidding on projects and track your submissions.
                  </p>
                  <Link to="/auth?tab=signup">
                    <Button>Create Account to Start</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : bidsLoading ? (
              <ProjectListSkeleton count={3} />
            ) : myBids.length === 0 ? (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Bids Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start bidding on projects to track your submissions here.
                  </p>
                  <Button onClick={() => navigate("/earn")}>
                    Browse Projects
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myBids.map((bid, index) => (
                  <motion.div
                    key={bid.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card variant="interactive">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="font-semibold text-lg cursor-pointer hover:text-primary truncate"
                              onClick={() => navigate(`/earn/projects/${bid.project_id}`)}
                            >
                              {bid.project_title || "Project"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted {formatTimeAgo(bid.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-primary">{formatPKR(bid.amount)}</p>
                              <p className="text-xs text-muted-foreground">
                                in {bid.delivery_days} days
                              </p>
                            </div>
                            <Badge variant="secondary">
                              Pending
                            </Badge>
                          </div>
                        </div>
                        {bid.message && (
                          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                            {bid.message}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Projects Tab */}
          <TabsContent value="my-projects">
            {!user ? (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Sign In to View Your Projects</h3>
                  <p className="text-muted-foreground mb-6">
                    Create an account to post projects and manage them here.
                  </p>
                  <Link to="/auth?tab=signup">
                    <Button>Create Account to Start</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : myProjectsLoading ? (
              <ProjectListSkeleton count={3} />
            ) : myProjects.length === 0 ? (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Projects Posted Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Post your first project to find talented freelancers.
                  </p>
                  <Button onClick={() => setPostModalOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Post a Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <MyProjectsFilterSort
                  statusFilter={statusFilter}
                  sortOption={sortOption}
                  onStatusFilterChange={setStatusFilter}
                  onSortChange={setSortOption}
                  onReset={() => {
                    setStatusFilter("all");
                    setSortOption("date-desc");
                  }}
                  hasActiveFilters={statusFilter !== "all" || sortOption !== "date-desc"}
                />
                
                {(() => {
                  // Filter projects
                  let filtered = myProjects.filter((project) => {
                    if (statusFilter === "all") return true;
                    return (project.status || "open") === statusFilter;
                  });

                  // Sort projects
                  filtered = [...filtered].sort((a, b) => {
                    switch (sortOption) {
                      case "date-desc":
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      case "date-asc":
                        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                      case "bids-desc":
                        return (b.bid_count || 0) - (a.bid_count || 0);
                      case "bids-asc":
                        return (a.bid_count || 0) - (b.bid_count || 0);
                      case "budget-desc":
                        return (b.budget_max || b.budget_min || 0) - (a.budget_max || a.budget_min || 0);
                      case "budget-asc":
                        return (a.budget_max || a.budget_min || 0) - (b.budget_max || b.budget_min || 0);
                      default:
                        return 0;
                    }
                  });

                  if (filtered.length === 0) {
                    return (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-muted-foreground">
                            No projects match the current filters.
                          </p>
                        </CardContent>
                      </Card>
                    );
                  }

                  return filtered.map((project, index) => (
                    <MyProjectCard
                      key={project.id}
                      project={project}
                      index={index}
                      onEdit={handleEditProject}
                      onStatusChange={refetchMyProjects}
                    />
                  ));
                })()}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Post Project Modal */}
      <PostProjectModal 
        open={postModalOpen} 
        onOpenChange={setPostModalOpen}
        onSuccess={() => {
          refetchProjects();
          refetchMyProjects();
        }}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        project={projectToEdit}
        onSuccess={refetchMyProjects}
      />
    </MainLayout>
  );
}

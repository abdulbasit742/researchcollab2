import { useState, useEffect, useMemo, useCallback } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Bookmark,
  BookmarkCheck,
  Zap,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEarningProjects, useMyBids, useMyProjects, useSavedProjects, useWithdrawBid, useUpdateMyBid, useAcceptedBidForProjects, markEarnSeen, EarningProject } from "@/hooks/useEarning";
import { useAuth } from "@/contexts/AuthContext";
import { formatPKRRange, formatPKR } from "@/lib/currency";
import { ProjectListSkeleton } from "@/components/skeletons/ProjectListSkeleton";
import { formatDistanceToNow, addDays, differenceInDays } from "date-fns";
import { PostProjectModal } from "@/components/earn/PostProjectModal";
import { EditProjectModal } from "@/components/earn/EditProjectModal";
import { MyProjectCard } from "@/components/earn/MyProjectCard";
import { MyProjectsFilterSort, StatusFilter, SortOption } from "@/components/earn/MyProjectsFilterSort";
import { EarnStatsBar } from "@/components/earn/EarnStatsBar";
import { CategoryFilter } from "@/components/earn/CategoryFilter";
import { EarningsDashboardCard } from "@/components/earn/EarningsDashboardCard";
import { SavedProjectsTab } from "@/components/earn/SavedProjectsTab";
import { RecommendedProjects } from "@/components/earn/RecommendedProjects";
import { BidStatusTimeline } from "@/components/earn/BidStatusTimeline";
import { ShareProjectButton } from "@/components/earn/ShareProjectButton";
import { AdvancedFilters, AdvancedFilterState, DEFAULT_FILTERS } from "@/components/earn/AdvancedFilters";
import { EarnPricingSection } from "@/components/earn/EarnPricingSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";

const PAGE_SIZE = 10;

function CompletedProjectsList({ projects, onEdit, onStatusChange }: { projects: EarningProject[]; onEdit: (p: EarningProject) => void; onStatusChange: () => void }) {
  const acceptedAmounts = useAcceptedBidForProjects(projects.map(p => p.id));
  
  return (
    <>
      {projects.map((project, index) => (
        <MyProjectCard
          key={project.id}
          project={project}
          index={index}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          acceptedBidAmount={acceptedAmounts[project.id] ?? null}
        />
      ))}
    </>
  );
}

type ProjectSortOption = "urgency" | "newest" | "budget-high" | "budget-low" | "most-bids" | "deadline-soonest";
type BidFilterStatus = "all" | "pending" | "viewed" | "shortlisted" | "accepted" | "rejected";

function isUrgent(project: EarningProject): boolean {
  if (!project.deadline_days || !project.created_at) return false;
  const deadline = addDays(new Date(project.created_at), project.deadline_days);
  return differenceInDays(deadline, new Date()) <= 3 && differenceInDays(deadline, new Date()) >= 0;
}

const BID_FILTER_OPTIONS: { value: BidFilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "viewed", label: "Viewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export default function EarnPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<EarningProject | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [projectSort, setProjectSort] = useState<ProjectSortOption>("urgency");
  const [bidFilter, setBidFilter] = useState<BidFilterStatus>("all");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>(DEFAULT_FILTERS);
  const [withdrawConfirmId, setWithdrawConfirmId] = useState<string | null>(null);
  const [editingBidId, setEditingBidId] = useState<string | null>(null);
  const [editBidAmount, setEditBidAmount] = useState("");
  const [editBidDays, setEditBidDays] = useState("");
  const [editBidMessage, setEditBidMessage] = useState("");
  
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
  const { savedIds, toggleSave, isSaved } = useSavedProjects();
  const { withdrawBid, withdrawing } = useWithdrawBid();
  const { updateMyBid, updating: updatingMyBid } = useUpdateMyBid();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-refresh on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refetchProjects();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, selectedCategory]);

  const handleEditProject = (project: EarningProject) => {
    setProjectToEdit(project);
    setEditModalOpen(true);
  };

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.tags || []).some((s) => s.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchesCategory =
        selectedCategory === "All" ||
        (p.tags || []).some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()));
      
      // Advanced filters
      const minBudget = advancedFilters.budgetMin ? parseFloat(advancedFilters.budgetMin) : null;
      const maxBudget = advancedFilters.budgetMax ? parseFloat(advancedFilters.budgetMax) : null;
      const maxDeadline = advancedFilters.maxDeadlineDays ? parseInt(advancedFilters.maxDeadlineDays) : null;

      const matchesBudgetMin = minBudget === null || (p.budget_min !== null && p.budget_min >= minBudget);
      const matchesBudgetMax = maxBudget === null || (p.budget_max !== null && p.budget_max <= maxBudget);
      const matchesDeadline = maxDeadline === null || (p.deadline_days !== null && p.deadline_days <= maxDeadline);
      const matchesZeroBids = !advancedFilters.zeroBidsOnly || (p.bid_count || 0) === 0;

      return matchesSearch && matchesCategory && matchesBudgetMin && matchesBudgetMax && matchesDeadline && matchesZeroBids;
    });

    return filtered.sort((a, b) => {
      // Always float urgent to top first
      const aUrgent = isUrgent(a) ? 1 : 0;
      const bUrgent = isUrgent(b) ? 1 : 0;
      if (aUrgent !== bUrgent) return bUrgent - aUrgent;

      switch (projectSort) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "budget-high":
          return (b.budget_max || b.budget_min || 0) - (a.budget_max || a.budget_min || 0);
        case "budget-low":
          return (a.budget_max || a.budget_min || 0) - (b.budget_max || b.budget_min || 0);
        case "most-bids":
          return (b.bid_count || 0) - (a.bid_count || 0);
        case "deadline-soonest":
          return (a.deadline_days || 999) - (b.deadline_days || 999);
        default:
          return 0;
      }
    });
  }, [projects, debouncedSearch, selectedCategory, projectSort, advancedFilters]);

  const filteredBids = useMemo(() => {
    if (bidFilter === "all") return myBids;
    return myBids.filter(b => b.status === bidFilter);
  }, [myBids, bidFilter]);

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

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
      <div className="gradient-hero py-8 sm:py-12 md:py-24">
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
        <Tabs defaultValue="projects" className="space-y-6 md:space-y-8" onValueChange={(v) => { if (v === "my-bids") markEarnSeen(); }}>
          <div className="flex flex-col gap-4">
            {/* Scrollable Tabs for Mobile */}
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-auto min-w-full md:w-auto">
                <TabsTrigger value="projects" className="whitespace-nowrap">
                  Available Projects
                </TabsTrigger>
                <TabsTrigger value="saved" className="whitespace-nowrap">
                  <Bookmark className="h-3.5 w-3.5 mr-1" />
                  Saved ({savedIds.length})
                </TabsTrigger>
                <TabsTrigger value="how-it-works" className="whitespace-nowrap">
                  How It Works
                </TabsTrigger>
                <TabsTrigger value="my-bids" className="whitespace-nowrap relative">
                  My Bids
                  {myBids.length > 0 && (
                    <Badge variant="destructive" className="ml-1.5 h-5 min-w-[20px] px-1 text-[10px]">
                      {myBids.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="my-projects" className="whitespace-nowrap relative">
                  My Projects
                  {myProjects.length > 0 && (
                    <Badge variant="info" className="ml-1.5 h-5 min-w-[20px] px-1 text-[10px]">
                      {myProjects.length}
                    </Badge>
                  )}
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

            {/* Category Filter Chips */}
            <div className="flex items-center gap-3">
              <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>

            {/* Result Count */}
            {!projectsLoading && (debouncedSearch || selectedCategory !== "All") && (
              <p className="text-sm text-muted-foreground">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          <TabsContent value="projects" className="space-y-4 md:space-y-6">
            {/* Sort & Refresh */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={projectSort} onValueChange={(v) => setProjectSort(v as ProjectSortOption)}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgency">Urgency First</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="budget-high">Budget (High→Low)</SelectItem>
                    <SelectItem value="budget-low">Budget (Low→High)</SelectItem>
                    <SelectItem value="most-bids">Most Bids</SelectItem>
                    <SelectItem value="deadline-soonest">Deadline (Soonest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetchProjects()}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh
              </Button>
            </div>

            {/* Advanced Filters */}
            <AdvancedFilters filters={advancedFilters} onChange={setAdvancedFilters} />

            {/* Recommended Projects for logged-in users */}
            {user && !projectsLoading && projects.length > 0 && (
              <RecommendedProjects projects={projects} userSkills={[]} />
            )}

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
              <Card className="border-dashed">
                <CardContent className="py-12 px-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto rounded-full bg-muted flex items-center justify-center mb-4 w-14 h-14"
                  >
                    <Search className="h-7 w-7 text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-base font-semibold mb-2">
                    {debouncedSearch || selectedCategory !== "All" ? "No Projects Found" : "No Projects Available Yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                    {debouncedSearch || selectedCategory !== "All"
                      ? "Try adjusting your search or category filter."
                      : "Be the first to post a project and find talented freelancers."
                    }
                  </p>
                  {!debouncedSearch && selectedCategory === "All" && (
                    <Button onClick={() => user ? setPostModalOpen(true) : navigate("/auth?tab=signup")}>
                      Post a Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {visibleProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card variant="interactive">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle 
                                className="text-lg md:text-xl cursor-pointer hover:text-primary transition-colors truncate"
                                onClick={() => navigate(`/earn/projects/${project.id}`)}
                              >
                                {project.title}
                              </CardTitle>
                              {isUrgent(project) && (
                                <Badge variant="destructive" className="animate-pulse text-xs">
                                  <Zap className="h-3 w-3 mr-0.5" />
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mt-1">
                              Posted {formatTimeAgo(project.created_at)}
                              {project.owner_name && ` by ${project.owner_name}`}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 self-start shrink-0">
                            <ShareProjectButton projectId={project.id} projectTitle={project.title} variant="ghost" size="icon" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(project.id);
                              }}
                            >
                              {isSaved(project.id) ? (
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <Bookmark className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Badge 
                              variant={project.status === "open" ? "success" : "secondary"}
                              className="cursor-pointer hover:opacity-80 transition-opacity capitalize"
                              onClick={() => navigate(`/earn/projects/${project.id}`)}
                            >
                              {project.status || "Open"}
                            </Badge>
                          </div>
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
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    >
                      <Loader2 className="h-4 w-4 mr-2" />
                      Load More ({filteredProjects.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Saved Projects Tab */}
          <TabsContent value="saved">
            <SavedProjectsTab
              projects={projects}
              savedIds={savedIds}
              onToggleSave={toggleSave}
            />
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
              <Card className="border-dashed">
                <CardContent className="py-12 px-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto rounded-full bg-muted flex items-center justify-center mb-4 w-14 h-14"
                  >
                    <FileText className="h-7 w-7 text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-base font-semibold mb-2">Sign In to View Your Bids</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                    Create an account to start bidding on projects and track your submissions.
                  </p>
                  <Link to="/auth?tab=signup">
                    <Button>Create Account to Start</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : bidsLoading ? (
              <ProjectListSkeleton count={3} />
            ) : (
              <>
                {/* Earnings Dashboard */}
                <EarningsDashboardCard bids={myBids} />

                {/* Bid Status Filter Chips */}
                {myBids.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {BID_FILTER_OPTIONS.map((opt) => {
                      const count = opt.value === "all" ? myBids.length : myBids.filter(b => b.status === opt.value).length;
                      return (
                        <Button
                          key={opt.value}
                          variant={bidFilter === opt.value ? "default" : "outline"}
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => setBidFilter(opt.value)}
                        >
                          {opt.label}
                          {count > 0 && (
                            <Badge variant={bidFilter === opt.value ? "secondary" : "outline"} className="ml-1.5 h-5 min-w-[20px] px-1 text-[10px]">
                              {count}
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {myBids.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 px-6 text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="mx-auto rounded-full bg-muted flex items-center justify-center mb-4 w-14 h-14"
                      >
                        <FileText className="h-7 w-7 text-muted-foreground" />
                      </motion.div>
                      <h3 className="text-base font-semibold mb-2">No Bids Yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                        Start bidding on projects to track your submissions here.
                      </p>
                      <Button onClick={() => navigate("/earn")}>
                        Browse Projects
                      </Button>
                    </CardContent>
                  </Card>
                ) : filteredBids.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No bids match the "{bidFilter}" filter.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredBids.map((bid, index) => (
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
                                {/* Edit & Withdraw buttons */}
                                {(bid.status === "pending" || bid.status === "viewed") && (
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        if (editingBidId === bid.id) {
                                          setEditingBidId(null);
                                        } else {
                                          setEditingBidId(bid.id);
                                          setEditBidAmount(String(bid.amount));
                                          setEditBidDays(String(bid.delivery_days));
                                          setEditBidMessage(bid.message || "");
                                        }
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => setWithdrawConfirmId(bid.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="mt-3">
                              <BidStatusTimeline status={bid.status || "pending"} />
                            </div>
                            {bid.message && editingBidId !== bid.id && (
                              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                                {bid.message}
                              </p>
                            )}
                            {/* Inline Edit Form */}
                            {editingBidId === bid.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-3 rounded-lg border bg-muted/30 space-y-3"
                              >
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Amount (PKR)</label>
                                    <Input
                                      type="number"
                                      value={editBidAmount}
                                      onChange={(e) => setEditBidAmount(e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Delivery (days)</label>
                                    <Input
                                      type="number"
                                      value={editBidDays}
                                      onChange={(e) => setEditBidDays(e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-muted-foreground">Message</label>
                                  <Textarea
                                    value={editBidMessage}
                                    onChange={(e) => setEditBidMessage(e.target.value)}
                                    rows={2}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    disabled={updatingMyBid}
                                    onClick={async () => {
                                      const result = await updateMyBid(bid.id, {
                                        amount: parseFloat(editBidAmount),
                                        delivery_days: parseInt(editBidDays),
                                        message: editBidMessage,
                                      });
                                      if (result.success) {
                                        setEditingBidId(null);
                                        refetchBids();
                                      }
                                    }}
                                  >
                                    {updatingMyBid ? "Saving..." : "Save Changes"}
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setEditingBidId(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* My Projects Tab */}
          <TabsContent value="my-projects">
            {!user ? (
              <Card className="border-dashed">
                <CardContent className="py-12 px-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto rounded-full bg-muted flex items-center justify-center mb-4 w-14 h-14"
                  >
                    <FolderOpen className="h-7 w-7 text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-base font-semibold mb-2">Sign In to View Your Projects</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
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
              <Card className="border-dashed">
                <CardContent className="py-12 px-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto rounded-full bg-muted flex items-center justify-center mb-4 w-14 h-14"
                  >
                    <FolderOpen className="h-7 w-7 text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-base font-semibold mb-2">No Projects Posted Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
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

                  const closedProjects = filtered.filter(p => (p.status || "open") === "closed");
                  const activeProjects = filtered.filter(p => (p.status || "open") !== "closed");

                  return (
                    <>
                      {activeProjects.length > 0 && activeProjects.map((project, index) => (
                        <MyProjectCard
                          key={project.id}
                          project={project}
                          index={index}
                          onEdit={handleEditProject}
                          onStatusChange={refetchMyProjects}
                        />
                      ))}

                      {closedProjects.length > 0 && (
                        <>
                          <div className="pt-4 border-t mt-4">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                              Completed Projects
                            </h3>
                          </div>
                          <CompletedProjectsList projects={closedProjects} onEdit={handleEditProject} onStatusChange={refetchMyProjects} />
                        </>
                      )}

                      {activeProjects.length === 0 && closedProjects.length === 0 && (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">
                              No projects match the current filters.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EarnPricingSection />

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

      {/* Withdraw Bid Confirmation */}
      <AlertDialog open={!!withdrawConfirmId} onOpenChange={(open) => !open && setWithdrawConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Bid?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your bid from this project. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={withdrawing}
              onClick={async () => {
                if (withdrawConfirmId) {
                  const result = await withdrawBid(withdrawConfirmId);
                  if (result.success) {
                    setWithdrawConfirmId(null);
                    refetchBids();
                  }
                }
              }}
            >
              {withdrawing ? "Withdrawing..." : "Withdraw Bid"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Send,
  User,
  MessageSquare,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Star,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useStartConversation } from "@/hooks/useMessaging";
import { useEarningProject, useEarningProjects, useSubmitBid, useUpdateBidStatus, useQuickBidDefaults, useProjectAttachments, useUpdateProjectStatus } from "@/hooks/useEarning";
import { formatPKR } from "@/lib/currency";
import { formatDistanceToNow } from "date-fns";
import { ShareProjectButton } from "@/components/earn/ShareProjectButton";
import { RelatedProjects } from "@/components/earn/RelatedProjects";
import { BidComparisonTable } from "@/components/earn/BidComparisonTable";
import { ProjectActivityTimeline } from "@/components/earn/ProjectActivityTimeline";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { Paperclip, Download, XCircle as XCircleIcon, RotateCcw, Loader2 as Loader2Icon } from "lucide-react";
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

export default function EarnProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  const { project, bids, loading, refetch } = useEarningProject(id);
  const { projects: allProjects } = useEarningProjects();
  const { submitBid, submitting } = useSubmitBid();
  const { startConversation } = useStartConversation();
  const { attachments, loading: attachmentsLoading } = useProjectAttachments(id);
  const { updateBidStatus, updating: updatingBid } = useUpdateBidStatus();
  const { getDefaults, saveDefaults } = useQuickBidDefaults();
  const { updateStatus, updating: updatingStatus } = useUpdateProjectStatus();
  
  const [bidAmount, setBidAmount] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [message, setMessage] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const isOwner = user && project?.owner_id === user.id;
  const projectStatus = project?.status || "open";
  const isClosing = projectStatus === "open";

  // Pre-fill from quick bid defaults
  useEffect(() => {
    const defaults = getDefaults();
    if (defaults && !bidAmount && !deliveryDays) {
      setBidAmount(defaults.amount);
      setDeliveryDays(defaults.deliveryDays);
    }
  }, []);

  // Scroll to bid section if hash is present
  useEffect(() => {
    if (window.location.hash === "#bid" && !loading) {
      const bidSection = document.getElementById("bid-section");
      bidSection?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to place a bid.",
        variant: "destructive",
      });
      navigate(`/auth?redirect=/earn/projects/${id}#bid`);
      return;
    }

    if (!bidAmount || !deliveryDays || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    const result = await submitBid(
      id,
      parseFloat(bidAmount),
      parseInt(deliveryDays),
      message
    );

    if (result.success) {
      saveDefaults(bidAmount, deliveryDays);
      setBidAmount("");
      setDeliveryDays("");
      setMessage("");
      refetch();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full mb-6" />
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This project may have been removed or doesn't exist.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/earn">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6 md:py-8 max-w-4xl px-4 md:px-6">
        {/* Back Button + Share */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between mb-4 md:mb-6"
        >
          <Link to="/earn">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Button
                variant={projectStatus === "open" ? "secondary" : "default"}
                size="sm"
                onClick={() => setShowStatusDialog(true)}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <Loader2Icon className="h-4 w-4 mr-1 animate-spin" />
                ) : projectStatus === "open" ? (
                  <XCircleIcon className="h-4 w-4 mr-1" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-1" />
                )}
                {projectStatus === "open" ? "Close Project" : "Reopen Project"}
              </Button>
            )}
            <ShareProjectButton projectId={project.id} projectTitle={project.title} />
          </div>
        </motion.div>

        {/* Status Change Dialog */}
        <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isClosing ? "Close this project?" : "Reopen this project?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isClosing
                  ? "Closing this project will hide it from public listings. No new bids can be submitted. You can reopen it anytime."
                  : "Reopening this project will make it visible again and allow new bids."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={updatingStatus}
                onClick={async () => {
                  const newStatus = isClosing ? "closed" : "open";
                  const result = await updateStatus(project.id, newStatus);
                  if (result.success) {
                    setShowStatusDialog(false);
                    refetch();
                  }
                }}
              >
                {updatingStatus && <Loader2Icon className="h-4 w-4 mr-1 animate-spin" />}
                {isClosing ? "Close Project" : "Reopen Project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant={project.status === "open" ? "success" : "secondary"} className="capitalize">
                  {project.status || "Open"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Posted {formatTimeAgo(project.created_at)}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {(project.tags || []).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </motion.div>

        {/* Project Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
        >
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-semibold text-sm md:text-base truncate">
                  {project.budget_min && project.budget_max 
                    ? `PKR ${project.budget_min.toLocaleString()} - ${project.budget_max.toLocaleString()}`
                    : project.budget_min
                      ? formatPKR(project.budget_min)
                      : "TBD"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="font-semibold text-sm md:text-base">
                  {project.deadline_days ? `${project.deadline_days} days` : "Flexible"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-semibold text-sm md:text-base truncate">
                  {project.location || "Remote"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Bids</p>
                <p className="font-semibold text-sm md:text-base">{bids.length} placed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {project.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Owner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Posted By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarImage src={project.owner_avatar} />
                  <AvatarFallback>
                    {(project.owner_name || "U").split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {project.owner_name || "Anonymous"}
                  </h3>
                  <p className="text-muted-foreground truncate">Project Owner</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => startConversation(project.owner_id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Link to={`/u/${project.owner_id}`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Bids */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Recent Bids</CardTitle>
              <CardDescription>
                {bids.length} freelancer{bids.length !== 1 ? "s have" : " has"} bid on this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">
                  No bids yet. Be the first to bid!
                </p>
              ) : (
                <div className="space-y-3">
                  {bids.slice(0, 10).map((bid) => (
                    <div
                      key={bid.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={bid.bidder_avatar} />
                          <AvatarFallback>
                            {(bid.bidder_name || "U")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link to={`/u/${bid.bidder_id}`} className="font-medium hover:text-primary hover:underline transition-colors">
                            {bid.bidder_name || "Anonymous"}
                          </Link>
                          {bid.bidder_trust_score != null && (
                            <TrustBadge score={bid.bidder_trust_score} size="sm" />
                          )}
                          <Badge variant="outline" className="capitalize text-xs">
                            {(bid as any).status || "pending"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm pl-11 sm:pl-0">
                        <span className="font-semibold text-primary">
                          {formatPKR(bid.amount)}
                        </span>
                        <span className="text-muted-foreground">
                          in {bid.delivery_days} days
                        </span>
                        <span className="text-muted-foreground text-xs hidden sm:inline">
                          {formatTimeAgo(bid.created_at)}
                        </span>
                        {isOwner && id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={updatingBid}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateBidStatus(bid.id, id, "viewed").then((res) => { if (res.success) toast({ title: "Marked Viewed", description: `${bid.bidder_name}'s bid marked as viewed.` }); refetch(); })}>
                                <Eye className="h-4 w-4 mr-2" /> Mark Viewed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateBidStatus(bid.id, id, "shortlisted").then((res) => { if (res.success) toast({ title: "Shortlisted ⭐", description: `${bid.bidder_name} has been shortlisted.` }); refetch(); })}>
                                <Star className="h-4 w-4 mr-2" /> Shortlist
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateBidStatus(bid.id, id, "accepted").then((res) => { if (res.success) toast({ title: "Bid Accepted ✅", description: `You accepted ${bid.bidder_name}'s bid for ${formatPKR(bid.amount)}.` }); refetch(); })}>
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Accept
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateBidStatus(bid.id, id, "rejected").then((res) => { if (res.success) toast({ title: "Bid Rejected", description: `${bid.bidder_name}'s bid has been rejected.` }); refetch(); })} className="text-destructive">
                                <XCircle className="h-4 w-4 mr-2" /> Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Attachments Section */}
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Attachments ({attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {att.file_name}
                        </p>
                        {att.file_size && (
                          <p className="text-xs text-muted-foreground">
                            {(att.file_size / 1024).toFixed(1)} KB
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bid Comparison Table (Owner only) */}
        {isOwner && bids.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68 }}
            className="mb-6"
          >
            <BidComparisonTable bids={bids} />
          </motion.div>
        )}

        {/* Activity Timeline (Owner only) */}
        {isOwner && project && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <ProjectActivityTimeline project={project} bids={bids} />
          </motion.div>
        )}

        {/* Bid Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          id="bid-section"
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-5 w-5" />
                Place Your Bid
              </CardTitle>
              <CardDescription>
                Submit your proposal for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bid-amount">Bid Amount (PKR) *</Label>
                    <Input
                      id="bid-amount"
                      type="number"
                      placeholder="Enter your bid"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={0}
                      required
                    />
                    {project.budget_min && project.budget_max && (
                      <p className="text-xs text-muted-foreground">
                        Suggested: PKR {project.budget_min.toLocaleString()} - {project.budget_max.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery-days">Delivery Time (days) *</Label>
                    <Input
                      id="delivery-days"
                      type="number"
                      placeholder="Days to complete"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      min={1}
                      required
                    />
                    {project.deadline_days && (
                      <p className="text-xs text-muted-foreground">
                        Client deadline: {project.deadline_days} days
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Cover Letter *</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe why you're the best fit for this project..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Bid
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Projects */}
        {project.tags && project.tags.length > 0 && allProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <RelatedProjects
              currentProjectId={project.id}
              currentTags={project.tags}
              projects={allProjects}
            />
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}

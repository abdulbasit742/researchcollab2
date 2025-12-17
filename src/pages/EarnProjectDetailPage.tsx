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
  DollarSign,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Calendar,
  Send,
  User,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Mock data for demo (will be replaced with DB data)
const mockProjects: Record<string, {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  deadline_days: number;
  location: string;
  tags: string[];
  status: string;
  created_at: string;
  owner_id: string;
  owner_name: string;
  owner_avatar: string;
  owner_university: string;
  bids_count: number;
}> = {
  "1": {
    id: "1",
    title: "Data Analysis for Healthcare Research",
    description: "Need an expert in statistical analysis to process and analyze healthcare survey data using SPSS or R. The project involves cleaning a dataset of 5000+ patient responses, performing descriptive statistics, regression analysis, and creating visualizations for a research paper submission.",
    budget_min: 500,
    budget_max: 800,
    deadline_days: 5,
    location: "Remote",
    tags: ["R", "SPSS", "Statistics", "Healthcare"],
    status: "open",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    owner_id: "owner-1",
    owner_name: "Dr. Sarah Johnson",
    owner_avatar: "https://i.pravatar.cc/150?u=sarah",
    owner_university: "Stanford University",
    bids_count: 8,
  },
  "2": {
    id: "2",
    title: "Machine Learning Model Development",
    description: "Looking for ML expert to build a classification model for customer segmentation project. Must have experience with Python, Scikit-learn, and TensorFlow. The model should achieve at least 85% accuracy on the test set.",
    budget_min: 1000,
    budget_max: 1500,
    deadline_days: 10,
    location: "Remote",
    tags: ["Python", "Scikit-learn", "TensorFlow", "ML"],
    status: "open",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    owner_id: "owner-2",
    owner_name: "Prof. Michael Chen",
    owner_avatar: "https://i.pravatar.cc/150?u=michael",
    owner_university: "MIT",
    bids_count: 15,
  },
  "3": {
    id: "3",
    title: "Literature Review - Environmental Science",
    description: "Comprehensive literature review on renewable energy policies in developing countries. Should cover at least 50 peer-reviewed sources from the last 10 years. APA format required.",
    budget_min: 300,
    budget_max: 500,
    deadline_days: 7,
    location: "Remote",
    tags: ["Academic Writing", "Research", "Environmental"],
    status: "open",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    owner_id: "owner-3",
    owner_name: "Dr. Emily Williams",
    owner_avatar: "https://i.pravatar.cc/150?u=emily",
    owner_university: "UC Berkeley",
    bids_count: 12,
  },
  "4": {
    id: "4",
    title: "Survey Design and Analysis",
    description: "Design a survey questionnaire and analyze results for marketing research project. Need expertise in survey methodology and SPSS for analysis.",
    budget_min: 400,
    budget_max: 600,
    deadline_days: 4,
    location: "Remote",
    tags: ["Survey Design", "SPSS", "Marketing Research"],
    status: "open",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    owner_id: "owner-4",
    owner_name: "Prof. David Lee",
    owner_avatar: "https://i.pravatar.cc/150?u=david",
    owner_university: "Harvard Business School",
    bids_count: 6,
  },
};

const mockBids = [
  { id: "b1", bidder_name: "Alex T.", amount: 650, delivery_days: 4, created_at: "2 hours ago" },
  { id: "b2", bidder_name: "Maria G.", amount: 700, delivery_days: 5, created_at: "4 hours ago" },
  { id: "b3", bidder_name: "John D.", amount: 550, delivery_days: 6, created_at: "1 day ago" },
];

export default function EarnProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  const [project, setProject] = useState<typeof mockProjects["1"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Simulate loading and use mock data
    const timer = setTimeout(() => {
      if (id && mockProjects[id]) {
        setProject(mockProjects[id]);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

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

    setSubmitting(true);

    try {
      // For now, use mock success since we don't have real project IDs
      // In production, this would insert into earning_bids table
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Bid Submitted!",
        description: "Your bid has been submitted successfully. The project owner will review it shortly.",
      });

      setBidAmount("");
      setDeliveryDays("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return "Just now";
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
          <Link to="/earn">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6 md:py-8 max-w-4xl px-4 md:px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/earn">
            <Button variant="ghost" size="sm" className="mb-4 md:mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="success">Open</Badge>
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
          {project.tags.map((tag) => (
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
                  ${project.budget_min} - ${project.budget_max}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="font-semibold text-sm md:text-base">{project.deadline_days} days</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-semibold text-sm md:text-base truncate">{project.location}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Bids</p>
                <p className="font-semibold text-sm md:text-base">{project.bids_count} placed</p>
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
                {project.description}
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
                    {project.owner_name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{project.owner_name}</h3>
                  <p className="text-muted-foreground truncate">{project.owner_university}</p>
                </div>
                <Link to={`/u/${project.owner_id}`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
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
                {project.bids_count} freelancers have bid on this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{bid.bidder_name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{bid.bidder_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm pl-11 sm:pl-0">
                      <span className="font-semibold text-primary">${bid.amount}</span>
                      <span className="text-muted-foreground">
                        in {bid.delivery_days} days
                      </span>
                      <span className="text-muted-foreground text-xs hidden sm:inline">
                        {bid.created_at}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bid Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          id="bid-section"
        >
          <Card>
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
                    <Label htmlFor="bid-amount">Bid Amount ($) *</Label>
                    <Input
                      id="bid-amount"
                      type="number"
                      placeholder="Enter your bid"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={0}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Budget: ${project.budget_min} - ${project.budget_max}
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Deadline: {project.deadline_days} days
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposal">Your Proposal *</Label>
                  <Textarea
                    id="proposal"
                    placeholder="Describe your approach, relevant experience, and why you're the best fit..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments Link (optional)</Label>
                  <Input
                    id="attachments"
                    type="url"
                    placeholder="Link to portfolio or relevant work (Google Drive, etc.)"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full sm:w-auto"
                  disabled={submitting}
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Bid
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-sm text-muted-foreground">
                    <Link to={`/auth?redirect=/earn/projects/${id}#bid`} className="text-primary hover:underline">
                      Log in
                    </Link>
                    {" "}to submit your bid
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:hidden z-50">
        <Button 
          className="w-full"
          onClick={() => {
            const bidSection = document.getElementById("bid-section");
            bidSection?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <Send className="h-4 w-4 mr-2" />
          Place Bid
        </Button>
      </div>

      {/* Spacer for mobile sticky CTA */}
      <div className="h-20 md:hidden" />
    </MainLayout>
  );
}
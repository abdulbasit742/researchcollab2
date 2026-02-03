import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Filter,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStartConversation } from "@/hooks/useMessaging";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Collaboration {
  id: string;
  researcherId: string;
  title: string;
  description: string;
  owner: {
    name: string;
    university: string;
  };
  skills: string[];
  location: string;
  deadline: string;
  budget: string;
  applicants: number;
  featured: boolean;
}

const disciplines = [
  "All Disciplines",
  "Computer Science",
  "Data Science",
  "Engineering",
  "Medicine",
  "Environmental Science",
  "Law",
  "Social Sciences",
];

export default function CollaborationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [discipline, setDiscipline] = useState("All Disciplines");
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startConversation } = useStartConversation();

  // Fetch collaborations from DB
  useEffect(() => {
    const fetchCollaborations = async () => {
      setIsLoading(true);
      try {
        // Fetch open projects from earning_projects
        const { data: projects, error } = await supabase
          .from("earning_projects")
          .select("id, title, description, owner_id, tags, budget_min, budget_max, deadline_days, location, status")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        if (!projects || projects.length === 0) {
          setCollaborations([]);
          setIsLoading(false);
          return;
        }

        // Fetch owner profiles
        const ownerIds = [...new Set(projects.map(p => p.owner_id).filter(Boolean))] as string[];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, university")
          .in("id", ownerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Fetch bid counts
        const { data: bidsData } = await supabase
          .from("earning_bids")
          .select("project_id")
          .in("project_id", projects.map(p => p.id));

        const bidCounts: Record<string, number> = {};
        bidsData?.forEach(b => {
          bidCounts[b.project_id] = (bidCounts[b.project_id] || 0) + 1;
        });

        // Transform to collaboration format
        const collabs: Collaboration[] = projects.map(project => {
          const profile = profileMap.get(project.owner_id);
          return {
            id: project.id,
            researcherId: project.owner_id,
            title: project.title,
            description: project.description || "",
            owner: {
              name: profile?.full_name || "Anonymous Researcher",
              university: profile?.university || "Institution",
            },
            skills: project.tags || [],
            location: project.location || "Remote",
            deadline: project.deadline_days 
              ? `${project.deadline_days} days`
              : "Flexible",
            budget: project.budget_min && project.budget_max 
              ? `$${project.budget_min.toLocaleString()} - $${project.budget_max.toLocaleString()}`
              : "Negotiable",
            applicants: bidCounts[project.id] || 0,
            featured: false,
          };
        });

        setCollaborations(collabs);
      } catch (err) {
        console.error("Failed to fetch collaborations:", err);
        toast({
          title: "Error loading collaborations",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollaborations();
  }, [toast]);

  const handleApply = (title: string) => {
    toast({
      title: "Application Submitted!",
      description: `Your application for "${title}" has been sent.`,
    });
  };

  const handleResearcherClick = (researcherId: string) => {
    navigate(`/u/${researcherId}`);
  };

  const handleMessageOwner = (researcherId: string) => {
    if (!researcherId) {
      toast({
        title: "Unable to message",
        description: "Owner information is not available.",
        variant: "destructive",
      });
      return;
    }
    startConversation(researcherId);
  };

  // Filter collaborations
  const filteredCollaborations = collaborations.filter(collab => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!collab.title.toLowerCase().includes(query) &&
          !collab.description.toLowerCase().includes(query) &&
          !collab.skills.some(s => s.toLowerCase().includes(query))) {
        return false;
      }
    }
    return true;
  });

  return (
    <MainLayout>
      <div className="gradient-hero py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <Users className="h-3 w-3 mr-1" />
              Research Collaborations
            </Badge>
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
              Find Your Next{" "}
              <span className="text-gradient">Research Partner</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with researchers worldwide. Join collaborative projects 
              and advance your academic career.
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col md:flex-row gap-4 max-w-3xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collaborations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger className="md:w-56">
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>
              <SelectContent>
                {disciplines.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Collaborations List */}
      <div className="container py-16">
        <div className="grid gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full mt-4" />
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : filteredCollaborations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Collaborations Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "Check back later for new collaboration opportunities"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCollaborations.map((collab, index) => (
              <motion.div
                key={collab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="interactive" className="relative">
                  {collab.featured && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="premium">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar 
                        className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => handleResearcherClick(collab.researcherId)}
                      >
                        <AvatarFallback>
                          {collab.owner.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl pr-20">{collab.title}</CardTitle>
                        <CardDescription className="mt-1">
                          <span 
                            className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleResearcherClick(collab.researcherId)}
                          >
                            {collab.owner.name}
                          </span>
                          <span className="mx-2">•</span>
                          <span 
                            className="cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleResearcherClick(collab.researcherId)}
                          >
                            {collab.owner.university}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{collab.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {collab.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {collab.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Deadline: {collab.deadline}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {collab.budget}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {collab.applicants} applicants
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-3">
                    <Button onClick={() => handleApply(collab.title)}>
                      Apply Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleMessageOwner(collab.researcherId)}
                    >
                      Message Owner
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredCollaborations.length > 0 && (
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg">
              Load More Collaborations
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

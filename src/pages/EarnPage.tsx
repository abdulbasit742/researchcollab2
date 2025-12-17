import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Search,
  DollarSign,
  Star,
  Clock,
  ArrowRight,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Users,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const projects = [
  {
    id: "1",
    title: "Data Analysis for Healthcare Research",
    description: "Need an expert in statistical analysis to process and analyze healthcare survey data using SPSS or R.",
    budget: "$500 - $800",
    deadline: "5 days",
    bids: 8,
    skills: ["R", "SPSS", "Statistics", "Healthcare"],
    posted: "2 hours ago",
    status: "open",
  },
  {
    id: "2",
    title: "Machine Learning Model Development",
    description: "Looking for ML expert to build a classification model for customer segmentation project.",
    budget: "$1,000 - $1,500",
    deadline: "10 days",
    bids: 15,
    skills: ["Python", "Scikit-learn", "TensorFlow", "ML"],
    posted: "5 hours ago",
    status: "open",
  },
  {
    id: "3",
    title: "Literature Review - Environmental Science",
    description: "Comprehensive literature review on renewable energy policies in developing countries.",
    budget: "$300 - $500",
    deadline: "7 days",
    bids: 12,
    skills: ["Academic Writing", "Research", "Environmental"],
    posted: "1 day ago",
    status: "open",
  },
  {
    id: "4",
    title: "Survey Design and Analysis",
    description: "Design a survey questionnaire and analyze results for marketing research project.",
    budget: "$400 - $600",
    deadline: "4 days",
    bids: 6,
    skills: ["Survey Design", "SPSS", "Marketing Research"],
    posted: "3 hours ago",
    status: "open",
  },
];

const topEarners = [
  {
    id: "1",
    name: "Alex Thompson",
    avatar: "https://i.pravatar.cc/150?u=alex",
    specialty: "Data Science",
    earnings: "$12,450",
    rating: 4.9,
    projects: 45,
  },
  {
    id: "2",
    name: "Maria Garcia",
    avatar: "https://i.pravatar.cc/150?u=maria",
    specialty: "Academic Writing",
    earnings: "$9,800",
    rating: 4.8,
    projects: 62,
  },
  {
    id: "3",
    name: "David Kim",
    avatar: "https://i.pravatar.cc/150?u=kim",
    specialty: "Statistical Analysis",
    earnings: "$8,200",
    rating: 4.9,
    projects: 38,
  },
  {
    id: "4",
    name: "Lisa Wang",
    avatar: "https://i.pravatar.cc/150?u=lisa",
    specialty: "Machine Learning",
    earnings: "$15,600",
    rating: 5.0,
    projects: 29,
  },
];

const earningStats = [
  { label: "Active Projects", value: "250+", icon: Briefcase },
  { label: "Total Paid Out", value: "$125K+", icon: DollarSign },
  { label: "Active Earners", value: "500+", icon: Users },
  { label: "Avg. Response", value: "< 2hrs", icon: Clock },
];

export default function EarnPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

          {/* Earning Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
          >
            {earningStats.map((stat) => (
              <Card key={stat.label} variant="glass">
                <CardContent className="p-4 md:p-6 text-center">
                  <stat.icon className="h-6 w-6 md:h-8 md:w-8 mx-auto text-primary mb-2" />
                  <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
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
                <TabsTrigger value="earners" className="whitespace-nowrap">
                  Top Earners
                </TabsTrigger>
                <TabsTrigger value="my-bids" className="whitespace-nowrap">
                  My Bids
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
              <Link to="/auth?tab=signup" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  Create Profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <TabsContent value="projects" className="space-y-4 md:space-y-6">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria.
                  </p>
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
                            Posted {project.posted}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="success" 
                          className="cursor-pointer hover:opacity-80 transition-opacity self-start shrink-0"
                          onClick={() => navigate(`/earn/projects/${project.id}`)}
                        >
                          Open
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      <p className="text-muted-foreground text-sm md:text-base line-clamp-2">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-4 md:gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold">{project.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>Deadline: {project.deadline}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>{project.bids} bids</span>
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

          <TabsContent value="earners">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {topEarners.map((earner, index) => (
                <motion.div
                  key={earner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card variant="interactive">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <Avatar className="h-12 w-12 md:h-16 md:w-16 shrink-0">
                          <AvatarImage src={earner.avatar} />
                          <AvatarFallback>
                            {earner.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base md:text-lg truncate">{earner.name}</h3>
                          <p className="text-muted-foreground text-sm truncate">{earner.specialty}</p>
                          <div className="flex items-center gap-3 md:gap-4 mt-1 md:mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 md:h-4 md:w-4 fill-amber-400 text-amber-400" />
                              <span className="font-medium text-sm">{earner.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                              {earner.projects} projects
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg md:text-2xl font-bold text-gradient">
                            {earner.earnings}
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground">Total earned</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-bids">
            <Card>
              <CardContent className="p-8 md:p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Bids Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start bidding on projects to track your submissions here.
                </p>
                <Link to="/auth?tab=signup">
                  <Button>Create Account to Start</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

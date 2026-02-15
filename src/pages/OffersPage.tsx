import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  FileText,
  Users,
  MapPin,
  Target,
} from "lucide-react";
import { useEarningProjects, EarningProject } from "@/hooks/useEarning";
import { formatPKRRange, formatPKR } from "@/lib/currency";

export default function OffersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { projects, loading, error } = useEarningProjects();

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const renderProjectCard = (project: EarningProject, index: number) => (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card variant="interactive">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-lg">{project.title}</CardTitle>
              <CardDescription className="mt-1">
                By {project.owner_name || "Anonymous"}
              </CardDescription>
            </div>
            <Badge variant="success" className="capitalize">
              {project.status || "Open"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {(project.tags || []).slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {(project.tags || []).length > 3 && (
              <Badge variant="outline">+{(project.tags || []).length - 3}</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold">
                {project.budget_min && project.budget_max
                  ? formatPKRRange(project.budget_min, project.budget_max)
                  : project.budget_min
                    ? formatPKR(project.budget_min)
                    : "Budget TBD"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{project.deadline_days ? `${project.deadline_days} days` : "Flexible"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{project.bid_count || 0} bids</span>
            </div>
            {project.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{project.location}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(`/earn/projects/${project.id}`)}
          >
            View Details
          </Button>
          <Button onClick={() => navigate(`/earn/projects/${project.id}#bid`)}>
            Bid Now
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <MainLayout>
      <div className="gradient-hero py-8 sm:py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <Target className="h-3 w-3 mr-1" />
              Live Opportunities
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold md:text-5xl lg:text-6xl">
              Find Your Next{" "}
              <span className="text-gradient">Opportunity</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse open projects posted by researchers and professionals.
              Bid on work that matches your skills and earn real income.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-16">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-semibold">
              {loading ? "Loading..." : `${filteredProjects.length} Open Projects`}
            </h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? "No Matching Projects" : "No Open Projects Yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "Be the first to post a project on the platform!"}
                </p>
                <Link to="/earn">
                  <Button>Go to Earn Hub</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project, index) => renderProjectCard(project, index))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

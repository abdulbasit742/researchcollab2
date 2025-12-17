import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  Sparkles,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  CheckCircle2,
  ArrowRight,
  Users,
  Brain,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { 
  allUsers, 
  dummyStudents, 
  calculateMatchScore, 
  UserProfile 
} from "@/data/users";

// Simulated current user
const currentUser = dummyStudents[0];

export default function SmartMatchingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const { toast } = useToast();

  // Calculate matches with scores
  const matchedUsers = useMemo(() => {
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
    return otherUsers.map(user => ({
      user,
      score: calculateMatchScore(currentUser, user),
    })).sort((a, b) => b.score - a.score);
  }, []);

  // Get top matches
  const topMatches = matchedUsers.slice(0, 6);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matchedUsers.filter(({ user }) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!user.name.toLowerCase().includes(query) &&
            !user.researchInterests.some(i => i.toLowerCase().includes(query))) {
          return false;
        }
      }
      if (roleFilter !== "All") {
        if (roleFilter === "Student" && user.type !== "student") return false;
        if (roleFilter === "Researcher" && user.type !== "researcher") return false;
      }
      return true;
    });
  }, [matchedUsers, searchQuery, roleFilter]);

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
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Matching
            </Badge>
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
              Smart Matching{" "}
              <span className="text-gradient">Algorithm</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our intelligent algorithm analyzes your profile, interests, and goals 
              to find the best research collaborators for you.
            </p>
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 grid md:grid-cols-4 gap-4"
          >
            {[
              { label: "Interests Match", value: "35%", icon: Brain },
              { label: "Skills Overlap", value: "25%", icon: Sparkles },
              { label: "Level Compatibility", value: "20%", icon: GraduationCap },
              { label: "Location & Availability", value: "20%", icon: MapPin },
            ].map((item, index) => (
              <Card key={item.label} variant="glass">
                <CardContent className="p-4 text-center">
                  <item.icon className="h-6 w-6 mx-auto text-primary mb-2" />
                  <div className="text-xl font-bold text-gradient">{item.value}</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container py-16">
        {/* Top Matches Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Your Top Matches</h2>
              <p className="text-muted-foreground">Based on your profile analysis</p>
            </div>
            <Link to="/matches">
              <Button variant="outline">
                View All Matches
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topMatches.map(({ user, score }, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card variant="interactive" className="relative overflow-hidden">
                  {index < 3 && (
                    <div className="absolute top-0 right-0">
                      <Badge 
                        className={`rounded-none rounded-bl-lg ${
                          index === 0 ? "bg-amber-500" : 
                          index === 1 ? "bg-slate-400" : "bg-amber-700"
                        }`}
                      >
                        #{index + 1} Match
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {user.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                            <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{user.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          {user.type === "student" ? (
                            <GraduationCap className="h-3 w-3" />
                          ) : (
                            <Briefcase className="h-3 w-3" />
                          )}
                          {user.type === "student" ? user.department : (user as any).discipline}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="font-bold text-primary">{score}%</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {user.researchInterests.slice(0, 3).map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {user.location}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link to={`/u/${user.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      <Link to="/matches" className="flex-1">
                        <Button className="w-full" size="sm">
                          Connect
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* All Matches with Search */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">All Potential Matches</h2>
              <p className="text-muted-foreground">
                {filteredMatches.length} matches found
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search matches..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  <SelectItem value="Student">Students</SelectItem>
                  <SelectItem value="Researcher">Researchers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredMatches.slice(0, 10).map(({ user, score }, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card variant="elevated" className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          {user.verified && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                          <Badge variant="outline" className="ml-2">
                            {user.type === "student" ? "Student" : "Researcher"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.type === "student" 
                            ? `${user.department} • ${user.university}`
                            : `${(user as any).discipline} • ${(user as any).university}`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <div className="text-sm text-muted-foreground">Match Score</div>
                          <div className="text-xl font-bold text-gradient">{score}%</div>
                        </div>
                        <Link to="/matches">
                          <Button size="sm">Connect</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredMatches.length > 10 && (
            <div className="mt-8 text-center">
              <Link to="/matches">
                <Button variant="outline" size="lg">
                  View All {filteredMatches.length} Matches
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

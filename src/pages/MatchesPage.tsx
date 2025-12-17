import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MatchCard } from "@/components/matches/MatchCard";
import { ConnectModal } from "@/components/matches/ConnectModal";
import {
  Search,
  Heart,
  Users,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  allUsers, 
  dummyStudents, 
  dummyResearchers, 
  calculateMatchScore, 
  UserProfile,
  MatchRequest 
} from "@/data/users";

// Simulated current user (student)
const currentUser = dummyStudents[0];

const roles = ["All", "Student", "Researcher"];
const disciplines = [
  "All",
  "Computer Science",
  "Environmental Science",
  "Physics",
  "Psychology",
  "Engineering",
  "Economics",
  "Linguistics",
];
const researchLevels = ["All", "Beginner", "Intermediate", "Advanced", "Publication-ready"];
const availabilities = ["All", "5 hrs/week", "10 hrs/week", "20 hrs/week", "40+ hrs/week"];

export default function MatchesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [disciplineFilter, setDisciplineFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([
    {
      id: "1",
      fromUserId: currentUser.id,
      toUserId: "r1",
      message: "Would love to collaborate on ML research",
      status: "accepted",
      createdAt: new Date(),
    },
    {
      id: "2",
      fromUserId: currentUser.id,
      toUserId: "s2",
      message: "Interested in climate research collaboration",
      status: "pending",
      createdAt: new Date(),
    },
  ]);
  const { toast } = useToast();

  // Calculate matches with scores
  const matchedUsers = useMemo(() => {
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
    return otherUsers.map(user => ({
      user,
      score: calculateMatchScore(currentUser, user),
    })).sort((a, b) => b.score - a.score);
  }, []);

  // Apply filters
  const filteredMatches = useMemo(() => {
    return matchedUsers.filter(({ user }) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!user.name.toLowerCase().includes(query) &&
            !user.researchInterests.some(i => i.toLowerCase().includes(query))) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== "All") {
        if (roleFilter === "Student" && user.type !== "student") return false;
        if (roleFilter === "Researcher" && user.type !== "researcher") return false;
      }

      // Discipline filter
      if (disciplineFilter !== "All") {
        const dept = user.type === "student" ? user.department : (user as any).discipline;
        if (!dept.toLowerCase().includes(disciplineFilter.toLowerCase())) return false;
      }

      // Research level filter (students only)
      if (levelFilter !== "All" && user.type === "student") {
        if (user.researchLevel !== levelFilter.toLowerCase()) return false;
      }

      // Availability filter
      if (availabilityFilter !== "All") {
        if (user.availability !== availabilityFilter) return false;
      }

      return true;
    });
  }, [matchedUsers, searchQuery, roleFilter, disciplineFilter, levelFilter, availabilityFilter]);

  // Get my matches (accepted and pending)
  const myMatches = useMemo(() => {
    return matchRequests.map(req => {
      const user = allUsers.find(u => u.id === req.toUserId);
      if (!user) return null;
      return {
        request: req,
        user,
        score: calculateMatchScore(currentUser, user),
      };
    }).filter(Boolean) as { request: MatchRequest; user: UserProfile; score: number }[];
  }, [matchRequests]);

  const pendingMatches = myMatches.filter(m => m.request.status === "pending");
  const acceptedMatches = myMatches.filter(m => m.request.status === "accepted");
  const declinedMatches = myMatches.filter(m => m.request.status === "declined");

  const handleConnect = (user: UserProfile) => {
    setSelectedUser(user);
    setConnectModalOpen(true);
  };

  const handleSendRequest = (message: string) => {
    if (!selectedUser) return;

    const newRequest: MatchRequest = {
      id: Date.now().toString(),
      fromUserId: currentUser.id,
      toUserId: selectedUser.id,
      message,
      status: "pending",
      createdAt: new Date(),
    };

    setMatchRequests(prev => [...prev, newRequest]);
    setConnectModalOpen(false);
    
    toast({
      title: "Connection Request Sent!",
      description: `Your request has been sent to ${selectedUser.name}.`,
    });
  };

  const handleMessage = (user: UserProfile) => {
    toast({
      title: "Opening Chat",
      description: `Starting conversation with ${user.name}...`,
    });
  };

  const getRequestStatus = (userId: string) => {
    const req = matchRequests.find(r => r.toUserId === userId);
    return req?.status || null;
  };

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
              <Heart className="h-3 w-3 mr-1" />
              Research Matches
            </Badge>
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
              Find Your Perfect{" "}
              <span className="text-gradient">Research Match</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with researchers and students who share your interests. 
              Our smart algorithm finds the best matches for collaboration.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            <Card variant="glass">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-6 w-6 mx-auto text-primary mb-1" />
                <div className="text-2xl font-bold">{filteredMatches.length}</div>
                <div className="text-xs text-muted-foreground">Suggested</div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto text-amber-500 mb-1" />
                <div className="text-2xl font-bold">{pendingMatches.length}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-500 mb-1" />
                <div className="text-2xl font-bold">{acceptedMatches.length}</div>
                <div className="text-xs text-muted-foreground">Connected</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="container py-16">
        <Tabs defaultValue="suggested" className="space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <TabsList className="grid w-full lg:w-auto grid-cols-2">
              <TabsTrigger value="suggested" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Suggested Matches
              </TabsTrigger>
              <TabsTrigger value="my-matches" className="gap-2">
                <Users className="h-4 w-4" />
                My Matches
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Suggested Matches Tab */}
          <TabsContent value="suggested" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or interest..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="lg:w-40">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
                    <SelectTrigger className="lg:w-48">
                      <SelectValue placeholder="Discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplines.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="lg:w-44">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {researchLevels.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger className="lg:w-40">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilities.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Match Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map(({ user, score }, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MatchCard
                    user={user}
                    matchScore={score}
                    onConnect={() => handleConnect(user)}
                    onMessage={() => handleMessage(user)}
                    status={getRequestStatus(user.id)}
                  />
                </motion.div>
              ))}
            </div>

            {filteredMatches.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Matches Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to see more matches.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Matches Tab */}
          <TabsContent value="my-matches" className="space-y-8">
            {/* Accepted */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Connected ({acceptedMatches.length})
              </h3>
              {acceptedMatches.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {acceptedMatches.map(({ user, score }) => (
                    <MatchCard
                      key={user.id}
                      user={user}
                      matchScore={score}
                      onConnect={() => {}}
                      onMessage={() => handleMessage(user)}
                      showConnectButton={false}
                      status="accepted"
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No accepted connections yet. Start connecting with researchers!
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pending */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Pending Requests ({pendingMatches.length})
              </h3>
              {pendingMatches.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingMatches.map(({ user, score }) => (
                    <MatchCard
                      key={user.id}
                      user={user}
                      matchScore={score}
                      onConnect={() => {}}
                      onMessage={() => {}}
                      showConnectButton={false}
                      status="pending"
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No pending requests.
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Declined */}
            {declinedMatches.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  Declined ({declinedMatches.length})
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {declinedMatches.map(({ user, score }) => (
                    <MatchCard
                      key={user.id}
                      user={user}
                      matchScore={score}
                      onConnect={() => handleConnect(user)}
                      onMessage={() => {}}
                      status="declined"
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onSend={handleSendRequest}
        targetUser={selectedUser}
      />
    </MainLayout>
  );
}

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
  SlidersHorizontal,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const clearFilters = () => {
    setRoleFilter("All");
    setDisciplineFilter("All");
    setLevelFilter("All");
    setAvailabilityFilter("All");
  };

  const activeFiltersCount = [roleFilter, disciplineFilter, levelFilter, availabilityFilter]
    .filter(f => f !== "All").length;

  // Mobile Filter Sheet Content
  const FilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Role</label>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full h-11 touch-manipulation">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r} value={r} className="py-3">{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Discipline</label>
        <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
          <SelectTrigger className="w-full h-11 touch-manipulation">
            <SelectValue placeholder="Discipline" />
          </SelectTrigger>
          <SelectContent>
            {disciplines.map((d) => (
              <SelectItem key={d} value={d} className="py-3">{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Level</label>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full h-11 touch-manipulation">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {researchLevels.map((l) => (
              <SelectItem key={l} value={l} className="py-3">{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Availability</label>
        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-full h-11 touch-manipulation">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            {availabilities.map((a) => (
              <SelectItem key={a} value={a} className="py-3">{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={clearFilters} 
          className="flex-1 h-11 touch-manipulation"
        >
          Clear All
        </Button>
        <Button 
          onClick={() => setFiltersOpen(false)} 
          className="flex-1 h-11 touch-manipulation"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <MainLayout>
      {/* Hero Section - Mobile Optimized */}
      <div className="gradient-hero py-10 sm:py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-3 sm:mb-4">
              <Heart className="h-3 w-3 mr-1" />
              Research Matches
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold md:text-5xl lg:text-6xl">
              Find Your Perfect{" "}
              <span className="text-gradient">Research Match</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Connect with researchers and students who share your interests.
            </p>
          </motion.div>

          {/* Stats - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 sm:mt-10 grid grid-cols-3 gap-2 sm:gap-4 max-w-md sm:max-w-2xl mx-auto"
          >
            <Card variant="glass">
              <CardContent className="p-3 sm:p-4 text-center">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-1" />
                <div className="text-lg sm:text-2xl font-bold">{filteredMatches.length}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Suggested</div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-3 sm:p-4 text-center">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-amber-500 mb-1" />
                <div className="text-lg sm:text-2xl font-bold">{pendingMatches.length}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-3 sm:p-4 text-center">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-emerald-500 mb-1" />
                <div className="text-lg sm:text-2xl font-bold">{acceptedMatches.length}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Connected</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8 sm:py-16">
        <Tabs defaultValue="suggested" className="space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-4">
            <TabsList className="w-full grid grid-cols-2 h-12">
              <TabsTrigger value="suggested" className="gap-1 sm:gap-2 text-sm touch-manipulation">
                <Sparkles className="h-4 w-4" />
                <span className="hidden xs:inline">Suggested</span>
                <span className="xs:hidden">Matches</span>
              </TabsTrigger>
              <TabsTrigger value="my-matches" className="gap-1 sm:gap-2 text-sm touch-manipulation">
                <Users className="h-4 w-4" />
                My Matches
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Suggested Matches Tab */}
          <TabsContent value="suggested" className="space-y-4 sm:space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-2 sm:gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-10 h-11 touch-manipulation"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Mobile Filter Button */}
                  <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-11 w-11 sm:hidden touch-manipulation relative"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        {activeFiltersCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto max-h-[80vh]">
                      <SheetHeader className="mb-4">
                        <SheetTitle>Filter Matches</SheetTitle>
                      </SheetHeader>
                      <FilterContent />
                    </SheetContent>
                  </Sheet>

                  {/* Desktop Filters */}
                  <div className="hidden sm:flex gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-32 h-11">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
                      <SelectTrigger className="w-40 h-11">
                        <SelectValue placeholder="Discipline" />
                      </SelectTrigger>
                      <SelectContent>
                        {disciplines.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Match Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <CardContent className="p-8 sm:p-12 text-center">
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No Matches Found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters to see more matches.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="mt-4 touch-manipulation"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Matches Tab */}
          <TabsContent value="my-matches" className="space-y-6 sm:space-y-8">
            {/* Accepted */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                Connected ({acceptedMatches.length})
              </h3>
              {acceptedMatches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  <CardContent className="p-6 sm:p-8 text-center text-muted-foreground text-sm">
                    No accepted connections yet. Start connecting with researchers!
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pending */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                Pending Requests ({pendingMatches.length})
              </h3>
              {pendingMatches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  <CardContent className="p-6 sm:p-8 text-center text-muted-foreground text-sm">
                    No pending requests.
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Declined */}
            {declinedMatches.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  Declined ({declinedMatches.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

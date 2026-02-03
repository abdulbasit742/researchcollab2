import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Globe, Calendar, Heart, GraduationCap, Share2, MessageCircle,
  Building, MapPin, TrendingUp, Star, UserPlus, Link, CheckCircle,
  Clock, Award, Zap, Target, Send, Bell, ExternalLink, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdvancedNetwork, useCommunityManagement, useEventSystem, useMentorship, useAlumniNetwork, useReferralSystem } from "@/hooks/useNetworkSystems";
import { format, formatDistanceToNow } from "date-fns";

// Advanced Network Graph Panel
export function NetworkGraphPanel() {
  const { nodes, edges, metrics, strengthenConnection } = useAdvancedNetwork();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Network Graph
        </CardTitle>
        <CardDescription>
          Visualize your professional network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-muted/50 rounded-lg text-center">
            <p className="text-lg font-bold">{metrics.totalConnections}</p>
            <p className="text-[10px] text-muted-foreground">Connections</p>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-center">
            <p className="text-lg font-bold text-emerald-600">{(metrics as any).strongConnections || 0}</p>
            <p className="text-[10px] text-muted-foreground">Strong</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg text-center">
            <p className="text-lg font-bold text-primary">{metrics.influenceScore}</p>
            <p className="text-[10px] text-muted-foreground">Influence</p>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg text-center">
            <p className="text-lg font-bold text-amber-600">{metrics.atRiskConnections}</p>
            <p className="text-[10px] text-muted-foreground">At Risk</p>
          </div>
        </div>

        {/* Simplified graph visualization */}
        <div className="h-40 relative bg-muted/30 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              You
            </div>
          </div>
          {nodes.slice(0, 6).map((node, i) => {
            const angle = (i * 60 - 30) * (Math.PI / 180);
            const radius = 70;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <div
                key={node.id}
                className={cn(
                  "absolute h-10 w-10 rounded-full flex items-center justify-center text-xs font-medium",
                  node.tier === "platinum" ? "bg-purple-500 text-white" :
                  node.tier === "gold" ? "bg-amber-500 text-white" : "bg-muted text-foreground"
                )}
                style={{
                  left: `calc(50% + ${x}px - 20px)`,
                  top: `calc(50% + ${y}px - 20px)`,
                }}
              >
                {node.name.split(' ').map(n => n[0]).join('')}
              </div>
            );
          })}
        </div>

        <ScrollArea className="h-40">
          <div className="space-y-2">
            {nodes.map((node) => (
              <div key={node.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs",
                    node.tier === "platinum" ? "bg-purple-500/20 text-purple-600" :
                    node.tier === "gold" ? "bg-amber-500/20 text-amber-600" : "bg-muted"
                  )}>
                    {node.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{node.name}</p>
                    <p className="text-xs text-muted-foreground">{node.collaborations} collabs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={node.connectionStrength} className="w-16 h-1.5" />
                  <span className="text-xs">{node.connectionStrength}%</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Community Hub
export function CommunityHub() {
  const { communities, posts, joinCommunity, createPost } = useCommunityManagement();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Communities
        </CardTitle>
        <CardDescription>
          Join professional communities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Search communities..." />

        <ScrollArea className="h-64">
          <div className="space-y-3">
            {communities.map((community) => (
              <div key={community.id} className="p-3 rounded-lg border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{community.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{community.description}</p>
                  </div>
                  {community.isJoined ? (
                    <Badge variant="default" className="text-xs">{community.role}</Badge>
                  ) : (
                    <Badge variant="outline" className="capitalize text-xs">{community.visibility}</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {community.memberCount.toLocaleString()} members
                    <span className="text-emerald-500">• {community.activeMembers} active</span>
                  </div>
                  {!community.isJoined && (
                    <Button size="sm" className="h-7 text-xs" onClick={() => joinCommunity(community.id)}>
                      Join
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {community.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Events Calendar
export function EventsCalendar() {
  const { events, upcomingEvents, registeredEvents, registerForEvent } = useEventSystem();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Events
        </CardTitle>
        <CardDescription>
          Conferences, webinars, and meetups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="upcoming">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="registered">Registered ({registeredEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <ScrollArea className="h-56">
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="capitalize text-xs mb-1">{event.type}</Badge>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                      </div>
                      {event.price > 0 ? (
                        <span className="font-medium">${event.price}</span>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      {format(event.startDate, "MMM d, yyyy")}
                      <Badge variant="outline" className="text-[10px]">{event.format}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {event.attendeeCount} attending
                      </span>
                      {!event.isRegistered && (
                        <Button size="sm" className="h-7 text-xs" onClick={() => registerForEvent(event.id)}>
                          Register
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="registered" className="mt-4">
            <ScrollArea className="h-56">
              <div className="space-y-3">
                {registeredEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(event.startDate, "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default" className="text-xs">{event.registrationStatus}</Badge>
                      {event.virtualLink && (
                        <Button size="sm" variant="outline" className="h-6 text-xs gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Mentorship Program Panel
export function MentorshipPanel() {
  const { programs, mentorships, logSession } = useMentorship();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Mentorship
        </CardTitle>
        <CardDescription>
          Learn from experienced professionals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mentorships.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium text-sm mb-2">Active Mentorship</h4>
            {mentorships.filter(m => m.status === "active").map((mentorship) => (
              <div key={mentorship.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{mentorship.mentorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {mentorship.sessions.length} sessions completed
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  {mentorship.goals.slice(0, 2).map((goal) => (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{goal.title}</span>
                        <span className="text-muted-foreground">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2">Available Programs</h4>
          <div className="space-y-2">
            {programs.map((program) => (
              <div key={program.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-sm">{program.name}</h5>
                  <Badge variant="outline" className="capitalize text-xs">{program.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{program.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {program.duration} • {program.commitment}
                  </span>
                  <Button size="sm" variant="outline" className="h-7 text-xs">Apply</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Alumni Network
export function AlumniNetworkPanel() {
  const { networks, connections, connectWithAlumni } = useAlumniNetwork();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Alumni Network
        </CardTitle>
        <CardDescription>
          Connect with fellow alumni
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {networks.map((network) => (
          <div key={network.id} className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{network.institutionName}</h4>
              {network.isVerified && (
                <Badge variant="default" className="text-xs gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{network.networkName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {network.memberCount.toLocaleString()} alumni
            </div>
          </div>
        ))}

        <div>
          <h4 className="text-sm font-medium mb-2">Suggested Connections</h4>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{connection.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {connection.currentRole} at {connection.currentCompany}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Class of {connection.graduationYear} • {connection.degree}
                    </p>
                  </div>
                  {!connection.isConnected ? (
                    <Button size="sm" variant="outline" className="h-7" onClick={() => connectWithAlumni(connection.id)}>
                      <UserPlus className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Connected</Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

// Referral System
export function ReferralPanel() {
  const { referrals, stats, createReferral } = useReferralSystem();
  const [email, setEmail] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Referrals
        </CardTitle>
        <CardDescription>
          Invite professionals, earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-muted/50 rounded-lg text-center">
            <p className="text-lg font-bold">{stats.totalReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-center">
            <p className="text-lg font-bold text-emerald-600">{stats.successfulReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Successful</p>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg text-center">
            <p className="text-lg font-bold text-amber-600">{stats.pendingReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg text-center">
            <p className="text-lg font-bold text-primary">{stats.totalRewards}</p>
            <p className="text-[10px] text-muted-foreground">Points</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Enter email to invite..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => { createReferral(email, "platform"); setEmail(""); }}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-40">
          <div className="space-y-2">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-2 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{referral.refereeName || referral.refereeEmail}</p>
                  <p className="text-xs text-muted-foreground capitalize">{referral.type} referral</p>
                </div>
                <Badge variant={
                  referral.status === "completed" ? "default" :
                  referral.status === "pending" ? "secondary" : "outline"
                } className="text-xs">
                  {referral.status}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Combined Network Dashboard
export function NetworkDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <NetworkGraphPanel />
        <CommunityHub />
        <EventsCalendar />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <MentorshipPanel />
        <AlumniNetworkPanel />
        <ReferralPanel />
      </div>
    </div>
  );
}

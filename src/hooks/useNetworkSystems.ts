import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Advanced Network Graph
interface NetworkNode {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  trustScore: number;
  tier: "platinum" | "gold" | "silver" | "bronze" | "unranked";
  role: string;
  institution?: string;
  skills: string[];
  connectionStrength: number;
  lastInteraction: Date;
  mutualConnections: number;
  collaborations: number;
}

interface NetworkEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: "collaborator" | "mentor" | "mentee" | "colleague" | "referral";
  strength: number;
  createdAt: Date;
  lastActivity: Date;
}

interface NetworkMetrics {
  totalConnections: number;
  averageStrength: number;
  networkReach: number;
  influenceScore: number;
  diversityIndex: number;
  growthRate: number;
  atRiskConnections: number;
}

export function useAdvancedNetwork() {
  const [nodes, setNodes] = useState<NetworkNode[]>([
    {
      id: "1", userId: "u1", name: "Dr. Sarah Chen", trustScore: 94, tier: "platinum",
      role: "Research Scientist", institution: "Stanford", skills: ["ML", "Data Science"],
      connectionStrength: 92, lastInteraction: new Date(), mutualConnections: 15, collaborations: 5,
    },
    {
      id: "2", userId: "u2", name: "Prof. Michael Torres", trustScore: 89, tier: "gold",
      role: "Professor", institution: "MIT", skills: ["AI", "Robotics"],
      connectionStrength: 78, lastInteraction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), mutualConnections: 8, collaborations: 3,
    },
    {
      id: "3", userId: "u3", name: "Dr. Emily Watson", trustScore: 86, tier: "gold",
      role: "Data Scientist", institution: "Google", skills: ["NLP", "Python"],
      connectionStrength: 65, lastInteraction: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), mutualConnections: 12, collaborations: 2,
    },
  ]);

  const [edges, setEdges] = useState<NetworkEdge[]>([
    { id: "e1", sourceId: "me", targetId: "1", type: "collaborator", strength: 92, createdAt: new Date("2023-01-01"), lastActivity: new Date() },
    { id: "e2", sourceId: "me", targetId: "2", type: "mentor", strength: 78, createdAt: new Date("2022-06-01"), lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { id: "e3", sourceId: "me", targetId: "3", type: "colleague", strength: 65, createdAt: new Date("2023-06-01"), lastActivity: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  ]);

  const metrics = useMemo<NetworkMetrics>(() => ({
    totalConnections: nodes.length,
    averageStrength: nodes.reduce((sum, n) => sum + n.connectionStrength, 0) / nodes.length,
    networkReach: nodes.reduce((sum, n) => sum + n.mutualConnections, 0),
    influenceScore: Math.round(nodes.reduce((sum, n) => sum + n.trustScore * n.connectionStrength / 100, 0)),
    diversityIndex: 72,
    growthRate: 15,
    atRiskConnections: nodes.filter(n => n.connectionStrength < 50).length,
  }), [nodes]);

  const strengthenConnection = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, connectionStrength: Math.min(100, n.connectionStrength + 5) } : n
    ));
  }, []);

  return { nodes, edges, metrics, strengthenConnection };
}

// Community Management
interface Community {
  id: string;
  name: string;
  description: string;
  type: "research" | "industry" | "skill" | "interest" | "institution";
  visibility: "public" | "private" | "invite-only";
  memberCount: number;
  activeMembers: number;
  createdAt: Date;
  lastActivity: Date;
  tags: string[];
  moderators: string[];
  isJoined: boolean;
  role?: "member" | "moderator" | "admin";
}

interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  attachments: string[];
  reactions: { type: string; count: number }[];
  comments: number;
  createdAt: Date;
  isPinned: boolean;
}

export function useCommunityManagement() {
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: "1", name: "AI Research Network", description: "Global community for AI researchers",
      type: "research", visibility: "public", memberCount: 2450, activeMembers: 890,
      createdAt: new Date("2022-01-01"), lastActivity: new Date(),
      tags: ["AI", "ML", "Research"], moderators: ["mod1"], isJoined: true, role: "member",
    },
    {
      id: "2", name: "Data Science Professionals", description: "Industry practitioners sharing insights",
      type: "industry", visibility: "public", memberCount: 5200, activeMembers: 1200,
      createdAt: new Date("2021-06-01"), lastActivity: new Date(),
      tags: ["Data Science", "Analytics"], moderators: ["mod2"], isJoined: true, role: "moderator",
    },
    {
      id: "3", name: "Stanford AI Lab Alumni", description: "Alumni network from Stanford AI Lab",
      type: "institution", visibility: "invite-only", memberCount: 320, activeMembers: 95,
      createdAt: new Date("2020-01-01"), lastActivity: new Date(),
      tags: ["Stanford", "AI", "Alumni"], moderators: ["mod3"], isJoined: false,
    },
  ]);

  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: "p1", communityId: "1", authorId: "u1", authorName: "Dr. Sarah Chen",
      content: "Excited to share our latest paper on transformer efficiency...",
      attachments: [], reactions: [{ type: "🎯", count: 45 }, { type: "🔥", count: 23 }],
      comments: 12, createdAt: new Date(), isPinned: false,
    },
  ]);

  const joinCommunity = useCallback((communityId: string) => {
    setCommunities(prev => prev.map(c =>
      c.id === communityId ? { ...c, isJoined: true, role: "member", memberCount: c.memberCount + 1 } : c
    ));
  }, []);

  const createPost = useCallback((communityId: string, content: string) => {
    const post: CommunityPost = {
      id: crypto.randomUUID(),
      communityId,
      authorId: "me",
      authorName: "You",
      content,
      attachments: [],
      reactions: [],
      comments: 0,
      createdAt: new Date(),
      isPinned: false,
    };
    setPosts(prev => [post, ...prev]);
    return post;
  }, []);

  return { communities, posts, joinCommunity, createPost };
}

// Event System
interface Event {
  id: string;
  title: string;
  description: string;
  type: "conference" | "webinar" | "meetup" | "workshop" | "networking";
  format: "in-person" | "virtual" | "hybrid";
  startDate: Date;
  endDate: Date;
  timezone: string;
  location?: string;
  virtualLink?: string;
  organizer: string;
  organizerId: string;
  speakers: Speaker[];
  attendeeCount: number;
  maxAttendees?: number;
  price: number;
  currency: string;
  tags: string[];
  isRegistered: boolean;
  registrationStatus?: "confirmed" | "waitlist" | "cancelled";
}

interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  bio?: string;
}

export function useEventSystem() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1", title: "AI Research Summit 2024", description: "Annual gathering of top AI researchers",
      type: "conference", format: "hybrid",
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
      timezone: "America/Los_Angeles", location: "San Francisco, CA",
      virtualLink: "https://zoom.us/...",
      organizer: "AI Research Foundation", organizerId: "o1",
      speakers: [
        { id: "s1", name: "Dr. Fei-Fei Li", title: "Professor", company: "Stanford University" },
        { id: "s2", name: "Dr. Yann LeCun", title: "Chief AI Scientist", company: "Meta" },
      ],
      attendeeCount: 1250, maxAttendees: 2000, price: 299, currency: "USD",
      tags: ["AI", "ML", "Research"], isRegistered: false,
    },
    {
      id: "2", title: "Data Science Office Hours", description: "Weekly Q&A with industry experts",
      type: "webinar", format: "virtual",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      timezone: "America/New_York", virtualLink: "https://meet.google.com/...",
      organizer: "DataScience.com", organizerId: "o2",
      speakers: [{ id: "s3", name: "Jane Smith", title: "Senior Data Scientist", company: "Google" }],
      attendeeCount: 85, price: 0, currency: "USD",
      tags: ["Data Science", "Q&A"], isRegistered: true, registrationStatus: "confirmed",
    },
  ]);

  const registerForEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? {
        ...e,
        isRegistered: true,
        registrationStatus: e.maxAttendees && e.attendeeCount >= e.maxAttendees ? "waitlist" : "confirmed",
        attendeeCount: e.attendeeCount + 1,
      } : e
    ));
  }, []);

  const upcomingEvents = useMemo(() =>
    events.filter(e => e.startDate > new Date()).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
    [events]
  );

  const registeredEvents = useMemo(() =>
    events.filter(e => e.isRegistered),
    [events]
  );

  return { events, upcomingEvents, registeredEvents, registerForEvent };
}

// Mentorship Program
interface MentorshipProgram {
  id: string;
  name: string;
  description: string;
  type: "1-on-1" | "group" | "peer";
  duration: string;
  commitment: string;
  areas: string[];
  isActive: boolean;
  participantCount: number;
}

interface Mentorship {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  programId?: string;
  status: "active" | "completed" | "paused" | "cancelled";
  startDate: Date;
  endDate?: Date;
  goals: MentorshipGoal[];
  sessions: MentorshipSession[];
  feedback?: MentorshipFeedback;
}

interface MentorshipGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed";
  dueDate?: Date;
}

interface MentorshipSession {
  id: string;
  date: Date;
  duration: number;
  notes: string;
  actionItems: string[];
}

interface MentorshipFeedback {
  rating: number;
  highlights: string[];
  improvements: string[];
  wouldRecommend: boolean;
}

export function useMentorship() {
  const [programs, setPrograms] = useState<MentorshipProgram[]>([
    {
      id: "1", name: "AI Research Mentorship", description: "Connect with senior AI researchers",
      type: "1-on-1", duration: "6 months", commitment: "2 hours/month",
      areas: ["AI", "Research", "Career"], isActive: true, participantCount: 120,
    },
    {
      id: "2", name: "Leadership Development", description: "Group mentorship for emerging leaders",
      type: "group", duration: "3 months", commitment: "4 hours/month",
      areas: ["Leadership", "Management"], isActive: true, participantCount: 45,
    },
  ]);

  const [mentorships, setMentorships] = useState<Mentorship[]>([
    {
      id: "1", mentorId: "m1", mentorName: "Dr. Sarah Chen", menteeId: "me", menteeName: "You",
      status: "active", startDate: new Date("2024-01-01"),
      goals: [
        { id: "g1", title: "Publish first paper", description: "Submit to NeurIPS", progress: 60, status: "in_progress", dueDate: new Date("2024-06-01") },
        { id: "g2", title: "Build research network", description: "Connect with 10 researchers", progress: 80, status: "in_progress" },
      ],
      sessions: [
        { id: "s1", date: new Date("2024-01-15"), duration: 60, notes: "Discussed research direction", actionItems: ["Review literature", "Draft outline"] },
        { id: "s2", date: new Date("2024-02-15"), duration: 45, notes: "Paper outline review", actionItems: ["Complete methodology section"] },
      ],
    },
  ]);

  const applyForMentorship = useCallback((programId: string, mentorId: string) => {
    // Application logic
    return { applicationId: crypto.randomUUID(), status: "pending" };
  }, []);

  const logSession = useCallback((mentorshipId: string, session: Omit<MentorshipSession, "id">) => {
    setMentorships(prev => prev.map(m =>
      m.id === mentorshipId ? {
        ...m,
        sessions: [...m.sessions, { ...session, id: crypto.randomUUID() }],
      } : m
    ));
  }, []);

  return { programs, mentorships, applyForMentorship, logSession };
}

// Alumni Network
interface AlumniNetwork {
  id: string;
  institutionName: string;
  institutionId: string;
  networkName: string;
  memberCount: number;
  chapters: AlumniChapter[];
  isVerified: boolean;
  joinedAt?: Date;
}

interface AlumniChapter {
  id: string;
  name: string;
  location: string;
  memberCount: number;
  lastEvent?: Date;
}

interface AlumniConnection {
  id: string;
  userId: string;
  name: string;
  graduationYear: number;
  degree: string;
  currentRole: string;
  currentCompany: string;
  location: string;
  sharedPrograms: string[];
  isConnected: boolean;
}

export function useAlumniNetwork() {
  const [networks, setNetworks] = useState<AlumniNetwork[]>([
    {
      id: "1", institutionName: "Stanford University", institutionId: "i1",
      networkName: "Stanford Alumni Association", memberCount: 225000,
      chapters: [
        { id: "c1", name: "Bay Area", location: "San Francisco, CA", memberCount: 45000, lastEvent: new Date() },
        { id: "c2", name: "New York", location: "New York, NY", memberCount: 28000, lastEvent: new Date() },
      ],
      isVerified: true, joinedAt: new Date("2020-06-01"),
    },
  ]);

  const [connections, setConnections] = useState<AlumniConnection[]>([
    {
      id: "1", userId: "u1", name: "Dr. Emily Watson", graduationYear: 2018,
      degree: "PhD Computer Science", currentRole: "Senior ML Engineer",
      currentCompany: "Google", location: "Mountain View, CA",
      sharedPrograms: ["CS PhD Program"], isConnected: true,
    },
    {
      id: "2", userId: "u2", name: "James Chen", graduationYear: 2019,
      degree: "MS Data Science", currentRole: "Data Science Manager",
      currentCompany: "Netflix", location: "Los Gatos, CA",
      sharedPrograms: ["Data Science Track"], isConnected: false,
    },
  ]);

  const connectWithAlumni = useCallback((connectionId: string) => {
    setConnections(prev => prev.map(c =>
      c.id === connectionId ? { ...c, isConnected: true } : c
    ));
  }, []);

  return { networks, connections, connectWithAlumni };
}

// Referral System
interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  refereeId?: string;
  refereeName?: string;
  refereeEmail: string;
  type: "opportunity" | "platform" | "community";
  targetId?: string;
  targetName?: string;
  status: "pending" | "accepted" | "completed" | "expired";
  reward?: ReferralReward;
  createdAt: Date;
  expiresAt: Date;
}

interface ReferralReward {
  type: "trust_boost" | "credit" | "premium_days" | "feature_unlock";
  value: number;
  claimedAt?: Date;
}

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  conversionRate: number;
}

export function useReferralSystem() {
  const [referrals, setReferrals] = useState<Referral[]>([
    {
      id: "1", referrerId: "me", referrerName: "You",
      refereeName: "John Doe", refereeEmail: "john@example.com",
      type: "platform", status: "completed",
      reward: { type: "trust_boost", value: 5, claimedAt: new Date() },
      createdAt: new Date("2024-01-01"), expiresAt: new Date("2024-02-01"),
    },
    {
      id: "2", referrerId: "me", referrerName: "You",
      refereeEmail: "jane@example.com", type: "opportunity",
      targetId: "o1", targetName: "AI Research Project",
      status: "pending",
      createdAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ]);

  const stats = useMemo<ReferralStats>(() => ({
    totalReferrals: referrals.length,
    successfulReferrals: referrals.filter(r => r.status === "completed").length,
    pendingReferrals: referrals.filter(r => r.status === "pending").length,
    totalRewards: referrals.filter(r => r.reward?.claimedAt).reduce((sum, r) => sum + (r.reward?.value || 0), 0),
    conversionRate: referrals.length > 0 ? referrals.filter(r => r.status === "completed").length / referrals.length : 0,
  }), [referrals]);

  const createReferral = useCallback((email: string, type: Referral["type"], targetId?: string) => {
    const referral: Referral = {
      id: crypto.randomUUID(),
      referrerId: "me",
      referrerName: "You",
      refereeEmail: email,
      type,
      targetId,
      status: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    setReferrals(prev => [referral, ...prev]);
    return referral;
  }, []);

  return { referrals, stats, createReferral };
}

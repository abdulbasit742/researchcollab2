import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface IntroductionRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterTrustScore: number;
  requesterAvatar?: string;
  targetId: string;
  targetName: string;
  targetTrustScore: number;
  targetAvatar?: string;
  connectorId: string;
  connectorName: string;
  purpose: string;
  message: string;
  status: "pending" | "accepted" | "declined" | "expired" | "completed";
  requestedAt: Date;
  respondedAt?: Date;
  expiresAt: Date;
  introductionMade: boolean;
  wasSuccessful?: boolean;
}

export interface MutualConnection {
  id: string;
  name: string;
  avatar?: string;
  trustScore: number;
  relationshipStrength: "strong" | "moderate" | "weak";
  lastInteraction: Date;
  sharedProjects: number;
  canIntroduce: boolean;
  introductionEffectiveness: number; // percentage
}

export interface IntroductionStats {
  totalRequestsSent: number;
  totalRequestsReceived: number;
  acceptanceRate: number;
  successRate: number;
  averageResponseTime: number; // hours
  remainingRequestsThisWeek: number;
  weeklyLimit: number;
}

export function useWarmIntroductions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Mock incoming/outgoing requests
  const [incomingRequests] = useState<IntroductionRequest[]>([
    {
      id: "intro-1",
      requesterId: "user-5",
      requesterName: "Dr. Emily Watson",
      requesterTrustScore: 84,
      targetId: "user-8",
      targetName: "Prof. Michael Brown",
      targetTrustScore: 92,
      connectorId: user?.id || "",
      connectorName: "You",
      purpose: "Research collaboration on climate modeling",
      message: "I've been following Prof. Brown's work on atmospheric modeling and believe there's strong potential for collaboration with my computational methods research.",
      status: "pending",
      requestedAt: new Date(Date.now() - 86400000 * 2),
      expiresAt: new Date(Date.now() + 86400000 * 5),
      introductionMade: false,
    },
  ]);

  const [outgoingRequests] = useState<IntroductionRequest[]>([
    {
      id: "intro-2",
      requesterId: user?.id || "",
      requesterName: "You",
      requesterTrustScore: 78,
      targetId: "user-10",
      targetName: "Dr. Lisa Chen",
      targetTrustScore: 89,
      connectorId: "user-3",
      connectorName: "Prof. James Miller",
      purpose: "Seeking mentorship in AI ethics",
      message: "I'd greatly appreciate an introduction to Dr. Chen to discuss her research on responsible AI development.",
      status: "accepted",
      requestedAt: new Date(Date.now() - 86400000 * 5),
      respondedAt: new Date(Date.now() - 86400000 * 3),
      expiresAt: new Date(Date.now() + 86400000 * 10),
      introductionMade: true,
      wasSuccessful: true,
    },
  ]);

  // Mock mutual connections for a target user
  const getMutualConnections = useCallback((targetUserId: string): MutualConnection[] => {
    return [
      {
        id: "conn-1",
        name: "Dr. Sarah Chen",
        trustScore: 91,
        relationshipStrength: "strong",
        lastInteraction: new Date(Date.now() - 86400000 * 3),
        sharedProjects: 2,
        canIntroduce: true,
        introductionEffectiveness: 85,
      },
      {
        id: "conn-2",
        name: "Prof. James Miller",
        trustScore: 88,
        relationshipStrength: "moderate",
        lastInteraction: new Date(Date.now() - 86400000 * 14),
        sharedProjects: 1,
        canIntroduce: true,
        introductionEffectiveness: 72,
      },
      {
        id: "conn-3",
        name: "Alex Thompson",
        trustScore: 65,
        relationshipStrength: "weak",
        lastInteraction: new Date(Date.now() - 86400000 * 60),
        sharedProjects: 0,
        canIntroduce: false,
        introductionEffectiveness: 35,
      },
    ];
  }, []);

  const stats = useMemo<IntroductionStats>(() => ({
    totalRequestsSent: 12,
    totalRequestsReceived: 8,
    acceptanceRate: 75,
    successRate: 83,
    averageResponseTime: 18,
    remainingRequestsThisWeek: 3,
    weeklyLimit: 5,
  }), []);

  const requestIntroduction = useCallback(async (
    targetUserId: string,
    connectorId: string,
    purpose: string,
    message: string
  ) => {
    if (stats.remainingRequestsThisWeek <= 0) {
      return { success: false, error: "Weekly request limit reached" };
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log("Requesting introduction to:", targetUserId, "via:", connectorId);
    setLoading(false);
    return { success: true, requestId: `intro-${Date.now()}` };
  }, [stats.remainingRequestsThisWeek]);

  const respondToRequest = useCallback(async (
    requestId: string,
    accept: boolean,
    declineReason?: string
  ) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Responding to request:", requestId, accept ? "accepted" : "declined");
    setLoading(false);
    return { success: true };
  }, []);

  const makeIntroduction = useCallback(async (
    requestId: string,
    introductionMessage: string
  ) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    console.log("Making introduction for request:", requestId);
    setLoading(false);
    return { success: true };
  }, []);

  const markIntroductionOutcome = useCallback(async (
    requestId: string,
    wasSuccessful: boolean
  ) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoading(false);
    return { success: true };
  }, []);

  return {
    incomingRequests,
    outgoingRequests,
    stats,
    loading,
    getMutualConnections,
    requestIntroduction,
    respondToRequest,
    makeIntroduction,
    markIntroductionOutcome,
  };
}

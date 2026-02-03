import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Trust Decay Prevention System
interface DecayPrevention {
  lastActivityDate: Date;
  daysUntilDecay: number;
  decayRate: number;
  preventionActions: PreventionAction[];
  projectedScore: number;
}

interface PreventionAction {
  id: string;
  action: string;
  impact: number;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  completed: boolean;
}

export function useTrustDecayPrevention() {
  const { user } = useAuth();
  const [prevention, setPrevention] = useState<DecayPrevention>({
    lastActivityDate: new Date(),
    daysUntilDecay: 23,
    decayRate: 2,
    preventionActions: [
      { id: "1", action: "Complete a profile review", impact: 5, difficulty: "easy", estimatedTime: "5 min", completed: false },
      { id: "2", action: "Respond to pending messages", impact: 3, difficulty: "easy", estimatedTime: "10 min", completed: false },
      { id: "3", action: "Update skills & expertise", impact: 4, difficulty: "medium", estimatedTime: "15 min", completed: false },
      { id: "4", action: "Complete a milestone", impact: 10, difficulty: "hard", estimatedTime: "varies", completed: false },
      { id: "5", action: "Leave a professional review", impact: 6, difficulty: "medium", estimatedTime: "10 min", completed: false },
    ],
    projectedScore: 72,
  });

  const completeAction = useCallback((actionId: string) => {
    setPrevention(prev => ({
      ...prev,
      preventionActions: prev.preventionActions.map(a =>
        a.id === actionId ? { ...a, completed: true } : a
      ),
      daysUntilDecay: 30,
    }));
  }, []);

  return { prevention, completeAction };
}

// Peer Validation Network
interface PeerValidator {
  id: string;
  name: string;
  avatar?: string;
  trustScore: number;
  relationship: "collaborator" | "mentor" | "colleague" | "supervisor";
  validationsGiven: number;
  validationsReceived: number;
  lastInteraction: Date;
}

interface ValidationRequest {
  id: string;
  skill: string;
  context: string;
  status: "pending" | "approved" | "declined";
  weight: number;
  requestedAt: Date;
}

export function usePeerValidation() {
  const [validators, setValidators] = useState<PeerValidator[]>([
    { id: "1", name: "Dr. Sarah Chen", trustScore: 94, relationship: "supervisor", validationsGiven: 12, validationsReceived: 8, lastInteraction: new Date() },
    { id: "2", name: "Prof. Michael Torres", trustScore: 89, relationship: "collaborator", validationsGiven: 7, validationsReceived: 5, lastInteraction: new Date() },
    { id: "3", name: "Dr. Emily Watson", trustScore: 86, relationship: "colleague", validationsGiven: 4, validationsReceived: 6, lastInteraction: new Date() },
  ]);

  const [pendingRequests, setPendingRequests] = useState<ValidationRequest[]>([]);

  const requestValidation = useCallback((skill: string, validatorId: string, context: string) => {
    const newRequest: ValidationRequest = {
      id: crypto.randomUUID(),
      skill,
      context,
      status: "pending",
      weight: 1.0,
      requestedAt: new Date(),
    };
    setPendingRequests(prev => [...prev, newRequest]);
    return newRequest;
  }, []);

  const validationStrength = useMemo(() => {
    const totalWeight = validators.reduce((sum, v) => sum + (v.trustScore / 100) * v.validationsGiven, 0);
    return Math.min(100, Math.round(totalWeight * 10));
  }, [validators]);

  return { validators, pendingRequests, requestValidation, validationStrength };
}

// Trust Recovery System
interface RecoveryMilestone {
  id: string;
  title: string;
  description: string;
  pointsToRecover: number;
  progress: number;
  required: number;
  status: "locked" | "active" | "completed";
}

interface RecoveryPlan {
  currentScore: number;
  targetScore: number;
  estimatedRecoveryDays: number;
  milestones: RecoveryMilestone[];
  activeStreak: number;
  recoveryRate: number;
}

export function useTrustRecovery() {
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan>({
    currentScore: 45,
    targetScore: 75,
    estimatedRecoveryDays: 60,
    milestones: [
      { id: "1", title: "Complete 3 projects on-time", description: "Deliver quality work within deadlines", pointsToRecover: 10, progress: 1, required: 3, status: "active" },
      { id: "2", title: "Maintain 7-day response streak", description: "Reply to all messages within 24 hours", pointsToRecover: 5, progress: 4, required: 7, status: "active" },
      { id: "3", title: "Receive 2 positive reviews", description: "Get 4+ star ratings from collaborators", pointsToRecover: 8, progress: 0, required: 2, status: "locked" },
      { id: "4", title: "Resolve pending disputes", description: "Close all open disputes amicably", pointsToRecover: 12, progress: 0, required: 1, status: "locked" },
    ],
    activeStreak: 12,
    recoveryRate: 1.2,
  });

  const updateProgress = useCallback((milestoneId: string, increment: number) => {
    setRecoveryPlan(prev => ({
      ...prev,
      milestones: prev.milestones.map(m =>
        m.id === milestoneId
          ? { ...m, progress: Math.min(m.required, m.progress + increment) }
          : m
      ),
    }));
  }, []);

  return { recoveryPlan, updateProgress };
}

// Portable Credentials System
interface PortableCredential {
  id: string;
  type: "achievement" | "certification" | "endorsement" | "project";
  title: string;
  issuer: string;
  issuedAt: Date;
  expiresAt?: Date;
  verificationHash: string;
  exportFormats: ("json" | "pdf" | "vc" | "qr")[];
  shareableLink: string;
}

export function usePortableCredentials() {
  const [credentials, setCredentials] = useState<PortableCredential[]>([
    {
      id: "1",
      type: "achievement",
      title: "Top 5% Trust Score",
      issuer: "RCollab Platform",
      issuedAt: new Date("2024-01-15"),
      verificationHash: "0x1a2b3c4d5e6f...",
      exportFormats: ["json", "pdf", "vc", "qr"],
      shareableLink: "https://rcollab.app/verify/abc123",
    },
    {
      id: "2",
      type: "project",
      title: "AI Research Project Lead",
      issuer: "Stanford University",
      issuedAt: new Date("2024-02-01"),
      verificationHash: "0x7g8h9i0j1k2l...",
      exportFormats: ["json", "pdf", "vc"],
      shareableLink: "https://rcollab.app/verify/def456",
    },
  ]);

  const exportCredential = useCallback((credentialId: string, format: string) => {
    const credential = credentials.find(c => c.id === credentialId);
    if (!credential) return null;
    
    // Generate export based on format
    return {
      credential,
      format,
      exportedAt: new Date(),
      downloadUrl: `https://rcollab.app/export/${credentialId}/${format}`,
    };
  }, [credentials]);

  const generateVerificationQR = useCallback((credentialId: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://rcollab.app/verify/${credentialId}`)}`;
  }, []);

  return { credentials, exportCredential, generateVerificationQR };
}

// Trust Network Analysis
interface TrustConnection {
  id: string;
  userId: string;
  name: string;
  trustScore: number;
  mutualTrust: number;
  collaborations: number;
  lastCollaboration: Date;
  trustTrajectory: "rising" | "stable" | "declining";
}

interface TrustNetworkMetrics {
  averageTrust: number;
  networkDiversity: number;
  strongConnections: number;
  atRiskConnections: number;
  trustCapacity: number;
}

export function useTrustNetwork() {
  const [connections, setConnections] = useState<TrustConnection[]>([
    { id: "1", userId: "u1", name: "Dr. Alex Kim", trustScore: 92, mutualTrust: 88, collaborations: 5, lastCollaboration: new Date(), trustTrajectory: "rising" },
    { id: "2", userId: "u2", name: "Prof. Lisa Wang", trustScore: 87, mutualTrust: 82, collaborations: 3, lastCollaboration: new Date(), trustTrajectory: "stable" },
    { id: "3", userId: "u3", name: "Dr. James Chen", trustScore: 78, mutualTrust: 75, collaborations: 2, lastCollaboration: new Date(), trustTrajectory: "declining" },
  ]);

  const metrics = useMemo<TrustNetworkMetrics>(() => {
    const avgTrust = connections.reduce((sum, c) => sum + c.trustScore, 0) / connections.length;
    return {
      averageTrust: Math.round(avgTrust),
      networkDiversity: 72,
      strongConnections: connections.filter(c => c.mutualTrust >= 80).length,
      atRiskConnections: connections.filter(c => c.trustTrajectory === "declining").length,
      trustCapacity: Math.round(avgTrust * connections.length / 10),
    };
  }, [connections]);

  return { connections, metrics };
}

// Reputation Insurance System
interface ReputationInsurance {
  plan: "basic" | "professional" | "enterprise";
  coverageAmount: number;
  monthlyPremium: number;
  claimsAvailable: number;
  claimsUsed: number;
  protectedScore: number;
  coverageDetails: string[];
}

export function useReputationInsurance() {
  const [insurance, setInsurance] = useState<ReputationInsurance>({
    plan: "professional",
    coverageAmount: 25,
    monthlyPremium: 29.99,
    claimsAvailable: 2,
    claimsUsed: 0,
    protectedScore: 65,
    coverageDetails: [
      "Trust score floor protection",
      "Dispute resolution priority",
      "Profile visibility guarantee",
      "Escrow protection boost",
      "Recovery assistance",
    ],
  });

  const fileClaim = useCallback((reason: string) => {
    if (insurance.claimsAvailable <= 0) return false;
    setInsurance(prev => ({
      ...prev,
      claimsAvailable: prev.claimsAvailable - 1,
      claimsUsed: prev.claimsUsed + 1,
    }));
    return true;
  }, [insurance.claimsAvailable]);

  return { insurance, fileClaim };
}

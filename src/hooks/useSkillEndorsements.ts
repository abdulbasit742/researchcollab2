import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface SkillEndorsement {
  id: string;
  skillId: string;
  skillName: string;
  endorserId: string;
  endorserName: string;
  endorserTrustScore: number;
  endorserAvatar?: string;
  endorsementType: "verified_work" | "self_claimed" | "peer_endorsed";
  projectId?: string;
  projectName?: string;
  endorsedAt: Date;
  expiresAt: Date;
  weight: number;
  isExpired: boolean;
  validationStatus: "pending" | "validated" | "expired" | "revoked";
}

export interface EndorsementRequest {
  id: string;
  skillId: string;
  skillName: string;
  requesterId: string;
  requesterName: string;
  requestedAt: Date;
  message?: string;
  status: "pending" | "accepted" | "declined";
  projectReference?: string;
}

export interface SkillWithEndorsements {
  id: string;
  name: string;
  category: string;
  totalEndorsements: number;
  verifiedEndorsements: number;
  averageEndorserTrust: number;
  overallWeight: number;
  isVerifiedThroughWork: boolean;
  endorsements: SkillEndorsement[];
}

export function useSkillEndorsements(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<EndorsementRequest[]>([]);

  // Mock skill endorsements data
  const skillsWithEndorsements = useMemo<SkillWithEndorsements[]>(() => [
    {
      id: "skill-1",
      name: "Machine Learning",
      category: "Technical",
      totalEndorsements: 8,
      verifiedEndorsements: 5,
      averageEndorserTrust: 82,
      overallWeight: 4.1,
      isVerifiedThroughWork: true,
      endorsements: [
        {
          id: "end-1",
          skillId: "skill-1",
          skillName: "Machine Learning",
          endorserId: "user-2",
          endorserName: "Dr. Sarah Chen",
          endorserTrustScore: 91,
          endorsementType: "verified_work",
          projectId: "proj-1",
          projectName: "Neural Network Research",
          endorsedAt: new Date(Date.now() - 86400000 * 30),
          expiresAt: new Date(Date.now() + 86400000 * 700),
          weight: 0.91,
          isExpired: false,
          validationStatus: "validated",
        },
        {
          id: "end-2",
          skillId: "skill-1",
          skillName: "Machine Learning",
          endorserId: "user-3",
          endorserName: "Prof. James Miller",
          endorserTrustScore: 88,
          endorsementType: "verified_work",
          projectId: "proj-2",
          projectName: "AI Ethics Framework",
          endorsedAt: new Date(Date.now() - 86400000 * 60),
          expiresAt: new Date(Date.now() + 86400000 * 670),
          weight: 0.88,
          isExpired: false,
          validationStatus: "validated",
        },
      ],
    },
    {
      id: "skill-2",
      name: "Data Analysis",
      category: "Technical",
      totalEndorsements: 12,
      verifiedEndorsements: 8,
      averageEndorserTrust: 78,
      overallWeight: 3.8,
      isVerifiedThroughWork: true,
      endorsements: [],
    },
    {
      id: "skill-3",
      name: "Project Management",
      category: "Leadership",
      totalEndorsements: 6,
      verifiedEndorsements: 2,
      averageEndorserTrust: 71,
      overallWeight: 2.4,
      isVerifiedThroughWork: false,
      endorsements: [],
    },
  ], []);

  const requestEndorsement = useCallback(async (
    skillId: string,
    endorserIds: string[],
    message?: string
  ) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Requesting endorsement for skill:", skillId, "from:", endorserIds);
    setLoading(false);
    return { success: true, requestsSent: endorserIds.length };
  }, []);

  const respondToRequest = useCallback(async (
    requestId: string,
    accept: boolean,
    projectReference?: string
  ) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setPendingRequests(prev => 
      prev.map(r => r.id === requestId 
        ? { ...r, status: accept ? "accepted" : "declined" } 
        : r
      )
    );
    setLoading(false);
    return { success: true };
  }, []);

  const getEndorsementStrength = useCallback((skill: SkillWithEndorsements): "strong" | "moderate" | "weak" => {
    if (skill.verifiedEndorsements >= 5 && skill.averageEndorserTrust >= 80) return "strong";
    if (skill.verifiedEndorsements >= 2 && skill.averageEndorserTrust >= 60) return "moderate";
    return "weak";
  }, []);

  const totalVerifiedSkills = useMemo(() => 
    skillsWithEndorsements.filter(s => s.isVerifiedThroughWork).length,
    [skillsWithEndorsements]
  );

  return {
    skillsWithEndorsements,
    pendingRequests,
    loading,
    requestEndorsement,
    respondToRequest,
    getEndorsementStrength,
    totalVerifiedSkills,
    targetUserId,
  };
}

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CoordinationPartner,
  DataSharingPolicy,
  CrossBorderMission,
  DataAgreement,
} from "@/types/crisis-coordination";

// System 62: Global Coordination Interoperability
// Cross-country, NGO, academic-government collaboration with sovereignty respect

export function useGlobalCoordination() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<CoordinationPartner[]>([]);
  const [missions, setMissions] = useState<CrossBorderMission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Register a coordination partner
  const registerPartner = useCallback(async (
    name: string,
    type: CoordinationPartner["type"],
    region: string,
    capabilities: string[],
    dataPolicy: DataSharingPolicy
  ): Promise<CoordinationPartner | null> => {
    if (!user) return null;
    setIsLoading(true);

    const partner: CoordinationPartner = {
      id: `partner-${Date.now()}`,
      name,
      type,
      region,
      capabilities,
      dataPolicy,
      joinedAt: new Date().toISOString(),
      status: "pending",
      trustLevel: 50, // Initial trust level
    };

    await new Promise(r => setTimeout(r, 300));
    setPartners(prev => [...prev, partner]);
    setIsLoading(false);
    return partner;
  }, [user]);

  // Activate a partner
  const activatePartner = useCallback((partnerId: string) => {
    setPartners(prev => prev.map(p =>
      p.id === partnerId ? { ...p, status: "active" as const } : p
    ));
  }, []);

  // Suspend a partner
  const suspendPartner = useCallback((partnerId: string) => {
    setPartners(prev => prev.map(p =>
      p.id === partnerId ? { ...p, status: "suspended" as const } : p
    ));
  }, []);

  // Update partner trust level
  const updatePartnerTrust = useCallback((partnerId: string, trustDelta: number) => {
    setPartners(prev => prev.map(p =>
      p.id === partnerId
        ? { ...p, trustLevel: Math.max(0, Math.min(100, p.trustLevel + trustDelta)) }
        : p
    ));
  }, []);

  // Initiate a cross-border mission
  const initiateMission = useCallback(async (
    name: string,
    description: string,
    objectives: string[],
    partnerIds: string[]
  ): Promise<CrossBorderMission | null> => {
    if (!user) return null;
    setIsLoading(true);

    const selectedPartners = partners.filter(p => partnerIds.includes(p.id));

    const mission: CrossBorderMission = {
      id: `mission-${Date.now()}`,
      name,
      description,
      initiatedBy: user.id,
      partners: selectedPartners,
      objectives,
      status: "proposed",
      dataAgreements: [],
      createdAt: new Date().toISOString(),
    };

    await new Promise(r => setTimeout(r, 300));
    setMissions(prev => [...prev, mission]);
    setIsLoading(false);
    return mission;
  }, [user, partners]);

  // Update mission status
  const updateMissionStatus = useCallback((
    missionId: string,
    status: CrossBorderMission["status"]
  ) => {
    setMissions(prev => prev.map(m =>
      m.id === missionId
        ? {
            ...m,
            status,
            completedAt: status === "completed" || status === "terminated"
              ? new Date().toISOString()
              : undefined,
          }
        : m
    ));
  }, []);

  // Create a data agreement
  const createDataAgreement = useCallback(async (
    missionId: string,
    partnerId: string,
    dataTypes: string[],
    purpose: string,
    anonymizationLevel: DataAgreement["anonymizationLevel"],
    auditRights: boolean,
    terminationClause: string,
    endDate?: string
  ): Promise<DataAgreement | null> => {
    if (!user) return null;

    const agreement: DataAgreement = {
      id: `agreement-${Date.now()}`,
      partnerId,
      dataTypes,
      purpose,
      startDate: new Date().toISOString(),
      endDate,
      anonymizationLevel,
      auditRights,
      terminationClause,
      signedAt: new Date().toISOString(),
      signedBy: [user.id],
    };

    setMissions(prev => prev.map(m =>
      m.id === missionId
        ? { ...m, dataAgreements: [...m.dataAgreements, agreement] }
        : m
    ));

    return agreement;
  }, [user]);

  // Sign a data agreement (by partner)
  const signAgreement = useCallback((
    missionId: string,
    agreementId: string,
    signerId: string
  ) => {
    setMissions(prev => prev.map(m =>
      m.id === missionId
        ? {
            ...m,
            dataAgreements: m.dataAgreements.map(a =>
              a.id === agreementId
                ? { ...a, signedBy: [...a.signedBy, signerId] }
                : a
            ),
          }
        : m
    ));
  }, []);

  // Check data sharing compatibility
  const checkDataCompatibility = useCallback((
    partnerId: string,
    dataTypes: string[]
  ): { compatible: boolean; issues: string[] } => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return { compatible: false, issues: ["Partner not found"] };

    const issues: string[] = [];
    const { dataPolicy } = partner;

    dataTypes.forEach(dt => {
      if (dataPolicy.restrictedDataTypes.includes(dt)) {
        issues.push(`${dt} is restricted by partner policy`);
      }
      if (!dataPolicy.approvedDataTypes.includes(dt) && dataPolicy.approvedDataTypes.length > 0) {
        issues.push(`${dt} is not in approved data types`);
      }
    });

    if (!dataPolicy.allowsDataImport) {
      issues.push("Partner does not allow data import");
    }

    return {
      compatible: issues.length === 0,
      issues,
    };
  }, [partners]);

  // Get partners by capability
  const getPartnersByCapability = useCallback((capability: string): CoordinationPartner[] => {
    return partners.filter(p => 
      p.status === "active" &&
      p.capabilities.some(c => c.toLowerCase().includes(capability.toLowerCase()))
    );
  }, [partners]);

  // Get partners by region
  const getPartnersByRegion = useCallback((region: string): CoordinationPartner[] => {
    return partners.filter(p => 
      p.status === "active" &&
      p.region.toLowerCase().includes(region.toLowerCase())
    );
  }, [partners]);

  // Get coordination stats
  const getCoordinationStats = useCallback(() => {
    const activePartners = partners.filter(p => p.status === "active");
    const activeMissions = missions.filter(m => m.status === "active");

    return {
      totalPartners: partners.length,
      activePartners: activePartners.length,
      partnersByType: {
        country: activePartners.filter(p => p.type === "country").length,
        ngo: activePartners.filter(p => p.type === "ngo").length,
        academic: activePartners.filter(p => p.type === "academic").length,
        government: activePartners.filter(p => p.type === "government").length,
        industry: activePartners.filter(p => p.type === "industry").length,
      },
      totalMissions: missions.length,
      activeMissions: activeMissions.length,
      completedMissions: missions.filter(m => m.status === "completed").length,
      totalDataAgreements: missions.reduce((sum, m) => sum + m.dataAgreements.length, 0),
      averagePartnerTrust: activePartners.length > 0
        ? activePartners.reduce((sum, p) => sum + p.trustLevel, 0) / activePartners.length
        : 0,
    };
  }, [partners, missions]);

  return {
    partners,
    missions,
    isLoading,
    registerPartner,
    activatePartner,
    suspendPartner,
    updatePartnerTrust,
    initiateMission,
    updateMissionStatus,
    createDataAgreement,
    signAgreement,
    checkDataCompatibility,
    getPartnersByCapability,
    getPartnersByRegion,
    getCoordinationStats,
  };
}

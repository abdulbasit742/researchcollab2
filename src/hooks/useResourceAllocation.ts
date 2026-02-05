import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AllocatableResource,
  AllocationRequest,
  ResourceAllocation,
  AllocationConstraints,
} from "@/types/crisis-coordination";

// System 59: Resource & Capability Allocation
// Allocate expertise, resources, funding, knowledge based on urgency and readiness

const DEFAULT_CONSTRAINTS: AllocationConstraints = {
  maxConcurrentAllocations: 5,
  burnoutPrevention: true,
  fairnessEnforced: true,
  priorityOverride: false,
};

export function useResourceAllocation() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AllocationRequest[]>([]);
  const [constraints, setConstraints] = useState<AllocationConstraints>(DEFAULT_CONSTRAINTS);
  const [isLoading, setIsLoading] = useState(false);

  // Create an allocation request
  const createRequest = useCallback(async (
    resourceType: AllocatableResource,
    description: string,
    urgency: AllocationRequest["urgency"],
    justification: string,
    missionId?: string,
    quantity?: number,
    capabilitiesNeeded?: string[]
  ): Promise<AllocationRequest | null> => {
    if (!user) return null;
    setIsLoading(true);

    const request: AllocationRequest = {
      id: `request-${Date.now()}`,
      requestedBy: user.id,
      missionId,
      resourceType,
      description,
      urgency,
      quantity,
      capabilitiesNeeded,
      justification,
      requestedAt: new Date().toISOString(),
      status: "pending",
      allocations: [],
    };

    await new Promise(r => setTimeout(r, 300));
    setRequests(prev => [...prev, request]);
    setIsLoading(false);
    return request;
  }, [user]);

  // Approve a request
  const approveRequest = useCallback(async (
    requestId: string
  ) => {
    if (!user) return;
    
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: "approved" as const } : r
    ));
  }, [user]);

  // Deny a request
  const denyRequest = useCallback(async (
    requestId: string
  ) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: "denied" as const } : r
    ));
  }, []);

  // Allocate a resource to a request
  const allocateResource = useCallback(async (
    requestId: string,
    resourceId: string,
    resourceName: string,
    startDate: string,
    endDate?: string,
    amount?: number
  ): Promise<ResourceAllocation | null> => {
    if (!user) return null;
    setIsLoading(true);

    const allocation: ResourceAllocation = {
      id: `alloc-${Date.now()}`,
      requestId,
      resourceId,
      resourceName,
      allocatedBy: user.id,
      allocatedAt: new Date().toISOString(),
      amount,
      startDate,
      endDate,
      status: "allocated",
    };

    setRequests(prev => prev.map(r => 
      r.id === requestId
        ? { ...r, allocations: [...r.allocations, allocation], status: "fulfilled" as const }
        : r
    ));

    await new Promise(r => setTimeout(r, 200));
    setIsLoading(false);
    return allocation;
  }, [user]);

  // Update allocation status
  const updateAllocationStatus = useCallback((
    requestId: string,
    allocationId: string,
    status: ResourceAllocation["status"],
    utilizationRate?: number
  ) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId
        ? {
            ...r,
            allocations: r.allocations.map(a =>
              a.id === allocationId ? { ...a, status, utilizationRate } : a
            ),
          }
        : r
    ));
  }, []);

  // Release an allocation
  const releaseAllocation = useCallback((
    requestId: string,
    allocationId: string
  ) => {
    updateAllocationStatus(requestId, allocationId, "released");
  }, [updateAllocationStatus]);

  // Recall an allocation (for emergencies)
  const recallAllocation = useCallback((
    requestId: string,
    allocationId: string
  ) => {
    updateAllocationStatus(requestId, allocationId, "recalled");
  }, [updateAllocationStatus]);

  // Check if a resource is over-allocated
  const checkOverallocation = useCallback((resourceId: string): boolean => {
    const activeAllocations = requests.flatMap(r => r.allocations)
      .filter(a => 
        a.resourceId === resourceId &&
        (a.status === "allocated" || a.status === "in_use")
      );

    return activeAllocations.length >= constraints.maxConcurrentAllocations;
  }, [requests, constraints]);

  // Get utilization stats
  const getUtilizationStats = useCallback(() => {
    const allAllocations = requests.flatMap(r => r.allocations);
    const activeAllocations = allAllocations.filter(a => 
      a.status === "allocated" || a.status === "in_use"
    );

    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === "pending").length,
      fulfilledRequests: requests.filter(r => r.status === "fulfilled").length,
      activeAllocations: activeAllocations.length,
      averageUtilization: activeAllocations.length > 0
        ? activeAllocations.reduce((sum, a) => sum + (a.utilizationRate || 0), 0) / activeAllocations.length
        : 0,
      byResourceType: {
        expertise: requests.filter(r => r.resourceType === "expertise").length,
        funding: requests.filter(r => r.resourceType === "funding").length,
        knowledge: requests.filter(r => r.resourceType === "knowledge").length,
        equipment: requests.filter(r => r.resourceType === "equipment").length,
        infrastructure: requests.filter(r => r.resourceType === "infrastructure").length,
      },
    };
  }, [requests]);

  // Update constraints
  const updateConstraints = useCallback((updates: Partial<AllocationConstraints>) => {
    setConstraints(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    requests,
    constraints,
    isLoading,
    createRequest,
    approveRequest,
    denyRequest,
    allocateResource,
    updateAllocationStatus,
    releaseAllocation,
    recallAllocation,
    checkOverallocation,
    getUtilizationStats,
    updateConstraints,
  };
}

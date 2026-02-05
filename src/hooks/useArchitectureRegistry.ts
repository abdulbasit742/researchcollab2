import { useMemo } from "react";
import { 
  CANONICAL_LAYERS, 
  SYSTEM_REGISTRY, 
  ARCHITECTURE_STATS,
  getSystemsByPhase,
  getSystemsByLayer,
  isSystemVisible,
  getBuildPriority,
  type SystemClassification
} from "@/architecture";

export type UserTier = "new" | "established" | "power" | "institutional";
export type BuildPhase = "now" | "next" | "later" | "park";

/**
 * Hook to access the master architecture registry
 * Provides utilities for querying systems, layers, and visibility
 */
export function useArchitectureRegistry(userTier: UserTier = "new") {
  // Get all visible systems for the current user tier
  const visibleSystems = useMemo(() => {
    return Object.entries(SYSTEM_REGISTRY)
      .filter(([id]) => isSystemVisible(Number(id), userTier))
      .map(([id, system]) => ({ id: Number(id), ...system }));
  }, [userTier]);

  // Get systems by build phase
  const systemsByPhase = useMemo(() => ({
    now: getSystemsByPhase("now"),
    next: getSystemsByPhase("next"),
    later: getSystemsByPhase("later"),
    park: getSystemsByPhase("park"),
  }), []);

  // Get systems by layer
  const systemsByLayer = useMemo(() => {
    const result: Record<string, ReturnType<typeof getSystemsByLayer>> = {};
    for (const key of Object.keys(CANONICAL_LAYERS)) {
      result[key] = getSystemsByLayer(key as keyof typeof CANONICAL_LAYERS);
    }
    return result;
  }, []);

  // Get prioritized build order
  const buildOrder = useMemo(() => {
    return Object.keys(SYSTEM_REGISTRY)
      .map(id => ({
        id: Number(id),
        priority: getBuildPriority(Number(id)),
        ...SYSTEM_REGISTRY[Number(id)],
      }))
      .sort((a, b) => b.priority - a.priority);
  }, []);

  // Check if a specific system is visible
  const checkSystemVisibility = (systemId: number): boolean => {
    return isSystemVisible(systemId, userTier);
  };

  // Get system by ID
  const getSystem = (systemId: number) => {
    const system = SYSTEM_REGISTRY[systemId];
    if (!system) return null;
    return {
      id: systemId,
      ...system,
      isVisible: isSystemVisible(systemId, userTier),
      buildPriority: getBuildPriority(systemId),
    };
  };

  // Get layer by key
  const getLayer = (layerKey: keyof typeof CANONICAL_LAYERS) => {
    return {
      ...CANONICAL_LAYERS[layerKey],
      systems: getSystemsByLayer(layerKey),
    };
  };

  // Get all hooks for a phase
  const getHooksForPhase = (phase: BuildPhase): string[] => {
    return getSystemsByPhase(phase)
      .filter(s => s.hook)
      .map(s => s.hook as string);
  };

  // Calculate completion percentage
  const getPhaseCompletion = (phase: BuildPhase): number => {
    const systems = getSystemsByPhase(phase);
    // For now, assume "now" is 100% (hooks exist), others are 0%
    // In real implementation, this would check actual implementation status
    if (phase === "now") return 100;
    return 0;
  };

  return {
    // Data
    layers: CANONICAL_LAYERS,
    registry: SYSTEM_REGISTRY,
    stats: ARCHITECTURE_STATS,
    visibleSystems,
    systemsByPhase,
    systemsByLayer,
    buildOrder,
    
    // Utilities
    checkSystemVisibility,
    getSystem,
    getLayer,
    getHooksForPhase,
    getPhaseCompletion,
  };
}

/**
 * Hook to check if a specific feature should be enabled
 * Based on system classification and user tier
 */
export function useSystemAccess(systemId: number, userTier: UserTier = "new") {
  const isVisible = useMemo(() => 
    isSystemVisible(systemId, userTier), 
    [systemId, userTier]
  );

  const system = SYSTEM_REGISTRY[systemId];
  
  return {
    isVisible,
    isCore: system?.classification === "core",
    isExtended: system?.classification === "extended",
    isInstitutional: system?.classification === "institutional",
    buildPhase: system?.buildPhase || "park",
    canAccess: isVisible && system?.buildPhase !== "park",
  };
}

/**
 * Hook to get the next recommended systems to build
 */
export function useBuildRecommendations() {
  return useMemo(() => {
    const nowSystems = getSystemsByPhase("now");
    const nextSystems = getSystemsByPhase("next");
    
    // Find next systems whose dependencies are all in "now" phase
    const readyToBuild = nextSystems.filter(system => {
      const deps = system.dependencies;
      return deps.every(depId => 
        nowSystems.some(s => s.id === depId)
      );
    });

    return {
      currentPhase: nowSystems,
      readyForNext: readyToBuild,
      blocked: nextSystems.filter(s => !readyToBuild.includes(s)),
    };
  }, []);
}

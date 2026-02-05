import { ReactNode } from "react";
import { useSystemAccess, type UserTier } from "@/hooks/useArchitectureRegistry";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Clock } from "lucide-react";

interface SystemGateProps {
  systemId: number;
  userTier?: UserTier;
  children: ReactNode;
  fallback?: ReactNode;
  showLockedMessage?: boolean;
}

/**
 * Gate component that conditionally renders based on system access
 * Uses the master architecture registry to determine visibility
 */
export function SystemGate({ 
  systemId, 
  userTier = "new",
  children, 
  fallback,
  showLockedMessage = false
}: SystemGateProps) {
  const { isVisible, canAccess, buildPhase, isInstitutional } = useSystemAccess(systemId, userTier);

  // If user can access, render children
  if (canAccess) {
    return <>{children}</>;
  }

  // If there's a custom fallback, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show locked message if requested
  if (showLockedMessage) {
    if (buildPhase === "park") {
      return (
        <Card className="bg-muted/50">
          <CardContent className="py-8 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              This feature is planned for a future release.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (isInstitutional && userTier !== "institutional") {
      return (
        <Card className="bg-muted/50">
          <CardContent className="py-8 text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              This feature is available for institutional accounts.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (!isVisible) {
      return (
        <Card className="bg-muted/50">
          <CardContent className="py-8 text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Unlock this feature by building your professional history.
            </p>
          </CardContent>
        </Card>
      );
    }
  }

  // Default: render nothing
  return null;
}

/**
 * Hook-based gate for conditional logic
 */
export function useSystemGate(systemId: number, userTier: UserTier = "new") {
  const access = useSystemAccess(systemId, userTier);
  
  return {
    ...access,
    gate: (content: ReactNode) => access.canAccess ? content : null,
    gateWithFallback: (content: ReactNode, fallback: ReactNode) => 
      access.canAccess ? content : fallback,
  };
}

// System ID constants for easy reference
export const SYSTEM_IDS = {
  // Layer 1: Identity & Trust
  UPOM: 1,
  TRUST_ENGINE: 2,
  VALUE_LOOPS: 21,
  SILENT_QC: 23,
  PERSONAL_MEMORY: 25,
  POWER_DAMPENING: 27,
  FAIRNESS: 53,

  // Layer 2: Capability & Outcomes
  OUTCOME_GRAPH: 3,
  CAPABILITY_GRAPH: 46,
  READINESS: 47,
  SKILL_GAP: 49,
  PERFORMANCE: 50,
  CAREER_EVOLUTION: 52,

  // Layer 3: Opportunities & Execution
  MATCHING: 4,
  DEAL_EXECUTION: 5,
  MARKET_BALANCER: 24,
  TALENT_ALLOCATION: 48,
  RESOURCE_ALLOCATION: 59,

  // Layer 4: Economics
  VALUE_UNITS: 29,
  PRICING: 30,
  REVENUE_SHARING: 31,
  INCENTIVES: 32,
  COST_TRANSPARENCY: 33,
  INSTITUTIONAL_FUNDING: 34,
  ECONOMIC_SAFETY: 35,
  ECONOMIC_MEMORY: 36,

  // Layer 5: Knowledge & Memory
  LONG_TERM_MEMORY: 6,
  KNOWLEDGE_OBJECTS: 37,
  KNOWLEDGE_GRAPH: 38,
  FAILURE_PRESERVATION: 39,
  INSTITUTIONAL_VAULTS: 40,
  KNOWLEDGE_VALIDATION: 41,
  AI_HISTORIAN: 42,
  LEGACY_SUCCESSION: 43,
  KNOWLEDGE_PIPELINE: 44,
  ANTI_CAPTURE: 45,

  // Layer 6: Institutions & Governance
  NOTIFICATIONS: 22,
  INSTITUTIONAL_FEEDBACK: 26,
  CHANGE_EXPLAINER: 28,
  TALENT_STRATEGY: 51,
  NATIONAL_HUMAN_CAPITAL: 54,
  MOBILIZATION: 55,
  CRISIS_MODE: 56,
  COORDINATION_GRAPH: 57,
  DECISION_TRACE: 58,
  POST_CRISIS: 60,
  POWER_SAFEGUARDS: 61,
  GLOBAL_COORDINATION: 62,

  // Layer 7: Intelligence & Automation
  EXTENSIBILITY: 9,
} as const;

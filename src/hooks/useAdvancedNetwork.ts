import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// PROFESSIONAL NETWORK FEATURES (Features 26-45)
// =====================================================

// Feature 26: Weighted Connections (Not Equal Edges)
export interface WeightedConnection {
  connection_id: string;
  user_id: string;
  user_name: string;
  relationship_weight: number; // 0-100
  weight_factors: {
    factor: string;
    contribution: number;
  }[];
  interaction_frequency: 'daily' | 'weekly' | 'monthly' | 'rare';
  last_interaction: string;
}

// Feature 27: Contextual Networks
export interface ContextualNetwork {
  context: 'work' | 'research' | 'funding' | 'advisory' | 'institutional';
  connections: string[];
  strength: number;
  active_collaborations: number;
}

// Feature 28: Warm Introduction Requests
export interface IntroductionRequest {
  id: string;
  requester_id: string;
  target_id: string;
  mutual_connection_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  created_at: string;
  expires_at: string;
}

// Feature 29: Trust-Path Visualization
export interface TrustPath {
  from: string;
  to: string;
  hops: {
    user_id: string;
    user_name: string;
    trust_score: number;
  }[];
  aggregate_trust: number;
  path_strength: 'strong' | 'moderate' | 'weak';
}

// Feature 30: Network Strength Indicators
export interface NetworkStrength {
  total_connections: number;
  weighted_connection_value: number;
  network_diversity: number;
  key_connectors: string[];
  growth_trend: 'growing' | 'stable' | 'shrinking';
  health_score: number;
}

// Feature 31: Interaction-Quality Scoring
export interface InteractionQuality {
  connection_id: string;
  quality_score: number;
  meaningful_interactions: number;
  surface_interactions: number;
  quality_trend: 'improving' | 'stable' | 'declining';
}

// Feature 32: Connection Relevance Decay
export interface ConnectionDecay {
  connection_id: string;
  original_strength: number;
  current_strength: number;
  decay_rate: number;
  days_since_interaction: number;
  reactivation_actions: string[];
}

// Feature 33: Network Hygiene Suggestions
export interface HygieneSuggestion {
  type: 'reconnect' | 'remove' | 'strengthen' | 'diversify';
  connection_id?: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  expected_benefit: string;
}

// Feature 34: Private Notes on Connections
export interface ConnectionNote {
  connection_id: string;
  note: string;
  tags: string[];
  last_updated: string;
  reminder_date?: string;
}

// Feature 35: Network-Based Opportunity Gating
export interface OpportunityGate {
  opportunity_id: string;
  required_connection_type: 'direct' | 'second_degree' | 'institutional';
  met: boolean;
  path_to_access?: string[];
}

// Feature 36: Mutual Trust Exposure Limits
export interface TrustExposureLimit {
  connection_id: string;
  max_referral_amount: number;
  current_exposure: number;
  risk_level: 'low' | 'medium' | 'high';
}

// Feature 37: Anti-Network Farming Logic
export interface NetworkFarmingFlag {
  user_id: string;
  flag_type: 'mass_connection' | 'spam_requests' | 'fake_endorsements';
  confidence: number;
  detected_at: string;
  evidence: string[];
  action_taken?: string;
}

// Feature 38: Domain-Specific Circles
export interface DomainCircle {
  id: string;
  domain: string;
  members: string[];
  average_trust: number;
  collaboration_density: number;
  top_contributors: string[];
}

// Feature 39: Institutional Network Overlays
export interface InstitutionalOverlay {
  institution_id: string;
  institution_name: string;
  connected_members: number;
  total_members: number;
  penetration_rate: number;
  key_connections: string[];
}

// Feature 40: Time-Based Relationship Freshness
export interface RelationshipFreshness {
  connection_id: string;
  freshness_score: number; // 0-100
  last_meaningful_contact: string;
  recommended_action?: string;
}

export function useAdvancedNetwork() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weightedConnections, setWeightedConnections] = useState<WeightedConnection[]>([]);
  const [contextualNetworks, setContextualNetworks] = useState<ContextualNetwork[]>([]);
  const [introRequests, setIntroRequests] = useState<IntroductionRequest[]>([]);
  const [connectionNotes, setConnectionNotes] = useState<Map<string, ConnectionNote>>(new Map());
  const [hygieneSuggestions, setHygieneSuggestions] = useState<HygieneSuggestion[]>([]);

  // Feature 41: Calculate Connection Weight
  const calculateConnectionWeight = useCallback((
    sharedProjects: number,
    messagesExchanged: number,
    yearsConnected: number,
    mutualConnections: number
  ): number => {
    let weight = 0;
    weight += Math.min(30, sharedProjects * 10); // Max 30 from projects
    weight += Math.min(20, messagesExchanged * 0.5); // Max 20 from messages
    weight += Math.min(25, yearsConnected * 5); // Max 25 from time
    weight += Math.min(25, mutualConnections * 2.5); // Max 25 from mutuals
    return Math.round(weight);
  }, []);

  // Feature 42: Find Trust Path
  const findTrustPath = useCallback((fromId: string, toId: string, network: any[]): TrustPath | null => {
    // Simplified BFS for trust path
    const visited = new Set<string>();
    const queue: { userId: string; path: any[] }[] = [{ userId: fromId, path: [] }];

    while (queue.length > 0) {
      const { userId, path } = queue.shift()!;
      if (userId === toId) {
        const hops = path.map(p => ({
          user_id: p.id,
          user_name: p.name || 'Unknown',
          trust_score: p.trust || 50
        }));
        return {
          from: fromId,
          to: toId,
          hops,
          aggregate_trust: hops.reduce((sum, h) => sum + h.trust_score, 0) / Math.max(1, hops.length),
          path_strength: hops.length <= 2 ? 'strong' : hops.length <= 4 ? 'moderate' : 'weak'
        };
      }

      if (visited.has(userId)) continue;
      visited.add(userId);

      const connections = network.filter(n => n.from === userId || n.to === userId);
      for (const conn of connections) {
        const nextId = conn.from === userId ? conn.to : conn.from;
        queue.push({ userId: nextId, path: [...path, { id: nextId, name: conn.name, trust: conn.trust }] });
      }
    }

    return null;
  }, []);

  // Feature 43: Calculate Network Strength
  const calculateNetworkStrength = useCallback((connections: WeightedConnection[]): NetworkStrength => {
    const totalWeight = connections.reduce((sum, c) => sum + c.relationship_weight, 0);
    const uniqueDomains = new Set(connections.flatMap(c => c.weight_factors.map(f => f.factor)));
    
    return {
      total_connections: connections.length,
      weighted_connection_value: totalWeight,
      network_diversity: uniqueDomains.size / 10, // Normalized
      key_connectors: connections.filter(c => c.relationship_weight > 70).map(c => c.user_id),
      growth_trend: 'stable',
      health_score: Math.min(100, (totalWeight / Math.max(1, connections.length)))
    };
  }, []);

  // Feature 44: Generate Hygiene Suggestions
  const generateHygieneSuggestions = useCallback((connections: WeightedConnection[]): HygieneSuggestion[] => {
    const suggestions: HygieneSuggestion[] = [];

    // Find stale connections
    connections.filter(c => c.interaction_frequency === 'rare').forEach(c => {
      suggestions.push({
        type: 'reconnect',
        connection_id: c.connection_id,
        suggestion: `Reconnect with ${c.user_name} - no interaction in months`,
        priority: 'medium',
        expected_benefit: 'Maintain professional relationship'
      });
    });

    // Find weak connections worth strengthening
    connections.filter(c => c.relationship_weight >= 40 && c.relationship_weight < 60).forEach(c => {
      suggestions.push({
        type: 'strengthen',
        connection_id: c.connection_id,
        suggestion: `Consider collaborating with ${c.user_name} to strengthen relationship`,
        priority: 'low',
        expected_benefit: 'Increase connection value'
      });
    });

    return suggestions;
  }, []);

  // Feature 45: Request Introduction
  const requestIntroduction = useCallback(async (
    targetId: string,
    mutualConnectionId: string,
    reason: string
  ): Promise<boolean> => {
    if (!user) return false;

    const request: IntroductionRequest = {
      id: crypto.randomUUID(),
      requester_id: user.id,
      target_id: targetId,
      mutual_connection_id: mutualConnectionId,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    setIntroRequests(prev => [...prev, request]);
    toast({ title: "Introduction Requested", description: "Your mutual connection will be notified" });
    return true;
  }, [user, toast]);

  return {
    weightedConnections,
    contextualNetworks,
    introRequests,
    connectionNotes,
    hygieneSuggestions,
    calculateConnectionWeight,
    findTrustPath,
    calculateNetworkStrength,
    generateHygieneSuggestions,
    requestIntroduction,
    setConnectionNotes
  };
}

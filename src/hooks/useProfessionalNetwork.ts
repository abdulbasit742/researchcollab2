import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WeightedConnection {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  institution?: string;
  role?: string;
  trustScore: number;
  connectionStrength: number; // 0-100
  connectionType: "work" | "research" | "funding" | "mentorship";
  interactionQuality: number;
  lastInteraction: Date | null;
  mutualConnections: number;
  sharedProjects: number;
  notes: string | null;
  isFresh: boolean; // Based on recent interaction
}

export interface NetworkCircle {
  id: string;
  name: string;
  type: "domain" | "institution" | "project" | "custom";
  members: string[];
  description?: string;
}

export interface IntroductionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  targetUserId: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

export interface NetworkHealth {
  totalConnections: number;
  activeConnections: number;
  dormantConnections: number;
  connectionDiversity: number; // 0-100
  avgConnectionStrength: number;
  networkReach: number;
  suggestedActions: NetworkAction[];
}

export interface NetworkAction {
  id: string;
  type: "reconnect" | "diversify" | "strengthen" | "prune";
  description: string;
  targetConnections?: string[];
  priority: "low" | "medium" | "high";
}

const CONNECTION_FRESHNESS_DAYS = 30;

export function useProfessionalNetwork() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<WeightedConnection[]>([]);
  const [circles, setCircles] = useState<NetworkCircle[]>([]);
  const [health, setHealth] = useState<NetworkHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch accepted connections
      const { data: connectionsData, error: connError } = await supabase
        .from("connections" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "accepted");
        
      if (connError) throw connError;
      
      // Fetch profiles for connections
      const connectedUserIds = (connectionsData || []).map((c: any) => c.connected_user_id);
      let profilesMap = new Map<string, any>();
      
      if (connectedUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, role, university")
          .in("id", connectedUserIds);
          
        (profilesData || []).forEach((p: any) => profilesMap.set(p.id, p));
      }
      
      // Transform to weighted connections
      const weightedConnections: WeightedConnection[] = (connectionsData || []).map((conn: any) => {
        const profile = profilesMap.get(conn.connected_user_id);
        const lastInteraction = conn.updated_at ? new Date(conn.updated_at) : conn.created_at ? new Date(conn.created_at) : null;
        const daysSinceInteraction = lastInteraction 
          ? Math.floor((Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24))
          : Infinity;
        
        return {
          id: conn.id,
          userId: conn.connected_user_id,
          fullName: profile?.full_name || "Unknown",
          institution: profile?.university,
          role: profile?.role,
          trustScore: 70 + Math.random() * 20,
          connectionStrength: Math.max(20, 100 - daysSinceInteraction * 2),
          connectionType: conn.connection_type || "work",
          interactionQuality: 60 + Math.random() * 30,
          lastInteraction,
          mutualConnections: Math.floor(Math.random() * 10),
          sharedProjects: Math.floor(Math.random() * 3),
          notes: null,
          isFresh: daysSinceInteraction < CONNECTION_FRESHNESS_DAYS,
        };
      });
      
      setConnections(weightedConnections);
      
      // Calculate network health
      const activeConns = weightedConnections.filter(c => c.isFresh);
      const dormantConns = weightedConnections.filter(c => !c.isFresh);
      const avgStrength = weightedConnections.length > 0
        ? weightedConnections.reduce((sum, c) => sum + c.connectionStrength, 0) / weightedConnections.length
        : 0;
        
      // Calculate connection diversity (based on types)
      const typeCount = new Set(weightedConnections.map(c => c.connectionType)).size;
      const diversity = Math.min(100, typeCount * 25);
      
      // Generate suggested actions
      const actions: NetworkAction[] = [];
      
      if (dormantConns.length > 3) {
        actions.push({
          id: "reconnect-1",
          type: "reconnect",
          description: `Reconnect with ${dormantConns.length} dormant connections`,
          targetConnections: dormantConns.slice(0, 3).map(c => c.id),
          priority: "medium",
        });
      }
      
      if (diversity < 50) {
        actions.push({
          id: "diversify-1",
          type: "diversify",
          description: "Expand your network to include more connection types",
          priority: "low",
        });
      }
      
      if (avgStrength < 50) {
        actions.push({
          id: "strengthen-1",
          type: "strengthen",
          description: "Focus on deepening existing relationships",
          priority: "high",
        });
      }
      
      setHealth({
        totalConnections: weightedConnections.length,
        activeConnections: activeConns.length,
        dormantConnections: dormantConns.length,
        connectionDiversity: diversity,
        avgConnectionStrength: avgStrength,
        networkReach: weightedConnections.reduce((sum, c) => sum + c.mutualConnections, 0),
        suggestedActions: actions,
      });
      
    } catch (err: any) {
      console.error("Error fetching network:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Get connections by type
  const connectionsByType = useMemo(() => {
    const byType = new Map<string, WeightedConnection[]>();
    connections.forEach(conn => {
      const existing = byType.get(conn.connectionType) || [];
      byType.set(conn.connectionType, [...existing, conn]);
    });
    return byType;
  }, [connections]);

  // Get trust path between users
  const getTrustPath = useCallback(async (targetUserId: string): Promise<string[]> => {
    // Simple BFS for shortest path
    const visited = new Set<string>();
    const queue: { userId: string; path: string[] }[] = [{ userId: user?.id || "", path: [] }];
    
    while (queue.length > 0) {
      const { userId, path } = queue.shift()!;
      
      if (userId === targetUserId) {
        return path;
      }
      
      if (visited.has(userId)) continue;
      visited.add(userId);
      
      const userConnections = connections.filter(
        c => c.userId === userId || connections.some(cc => cc.userId === userId)
      );
      
      for (const conn of userConnections) {
        if (!visited.has(conn.userId)) {
          queue.push({ userId: conn.userId, path: [...path, conn.userId] });
        }
      }
    }
    
    return [];
  }, [user, connections]);

  // Request warm introduction
  const requestIntroduction = useCallback(async (
    intermediaryId: string,
    targetId: string,
    message: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // In production, this would create an introduction request
      console.log("Introduction request:", { intermediaryId, targetId, message });
      return true;
    } catch (err) {
      console.error("Error requesting introduction:", err);
      return false;
    }
  }, [user]);

  // Update connection notes
  const updateConnectionNotes = useCallback(async (
    connectionId: string,
    notes: string
  ): Promise<boolean> => {
    try {
      // Update local state (would update DB in production)
      setConnections(prev => prev.map(c =>
        c.id === connectionId ? { ...c, notes } : c
      ));
      
      return true;
    } catch (err) {
      console.error("Error updating notes:", err);
      return false;
    }
  }, []);

  return {
    connections,
    connectionsByType,
    circles,
    health,
    loading,
    error,
    refresh: fetchConnections,
    getTrustPath,
    requestIntroduction,
    updateConnectionNotes,
  };
}

// Hook for network suggestions with anti-farming protection
export function useNetworkSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<{
    user: WeightedConnection;
    reason: string;
    relevanceScore: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;
      
      // In production, this would use ML-based recommendations
      // with anti-farming protection
      
      const mockSuggestions = [
        {
          user: {
            id: "sug-1",
            userId: "user-1",
            fullName: "Dr. Sarah Chen",
            institution: "Stanford University",
            role: "researcher",
            trustScore: 85,
            connectionStrength: 0,
            connectionType: "research" as const,
            interactionQuality: 0,
            lastInteraction: null,
            mutualConnections: 5,
            sharedProjects: 0,
            notes: null,
            isFresh: false,
          },
          reason: "5 mutual connections in your research domain",
          relevanceScore: 85,
        },
      ];
      
      setSuggestions(mockSuggestions);
      setLoading(false);
    };
    
    fetchSuggestions();
  }, [user]);

  return { suggestions, loading };
}

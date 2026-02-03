import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface FederatedInstance {
  id: string;
  instance_name: string;
  instance_code: string;
  instance_type: string;
  public_endpoint: string;
  api_version: string;
  trust_level: string;
  governance_authority: string | null;
  data_residency: string | null;
  supported_features: string[] | null;
  federation_agreement_signed: boolean;
  last_heartbeat_at: string | null;
  health_status: string;
  created_at: string;
}

export interface FederatedIdentity {
  id: string;
  local_user_id: string;
  remote_instance_id: string;
  remote_user_hash: string;
  verification_level: string;
  trust_score_snapshot: number | null;
  permissions: string[] | null;
  linked_at: string;
  is_active: boolean;
}

export interface FederatedCollaborationRequest {
  id: string;
  requesting_instance_id: string;
  target_instance_id: string;
  collaboration_type: string;
  purpose: string;
  status: string;
  requested_at: string;
  reviewed_at: string | null;
  expires_at: string | null;
}

export interface FederatedDiscoveryItem {
  id: string;
  source_instance_id: string;
  resource_type: string;
  resource_hash: string;
  metadata: Record<string, unknown>;
  cached_at: string;
  expires_at: string | null;
}

export function useFederatedResearch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [instances, setInstances] = useState<FederatedInstance[]>([]);
  const [identities, setIdentities] = useState<FederatedIdentity[]>([]);
  const [collaborations, setCollaborations] = useState<FederatedCollaborationRequest[]>([]);
  const [discoveryCache, setDiscoveryCache] = useState<FederatedDiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [instancesRes, identitiesRes, collabsRes, cacheRes] = await Promise.all([
        supabase.from("federated_instances" as any).select("*").order("instance_name"),
        supabase.from("federated_identities" as any).select("*").eq("local_user_id", user.id),
        supabase.from("federated_collaboration_requests" as any).select("*").order("requested_at", { ascending: false }),
        supabase.from("federated_discovery_cache" as any).select("*").order("cached_at", { ascending: false }).limit(100),
      ]);

      setInstances((instancesRes.data as unknown as FederatedInstance[]) || []);
      setIdentities((identitiesRes.data as unknown as FederatedIdentity[]) || []);
      setCollaborations((collabsRes.data as unknown as FederatedCollaborationRequest[]) || []);
      setDiscoveryCache((cacheRes.data as unknown as FederatedDiscoveryItem[]) || []);
    } catch (err) {
      console.error("Error fetching federation data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const registerInstance = async (data: Partial<FederatedInstance>) => {
    const { error } = await supabase.from("federated_instances" as any).insert(data);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Instance Registered" });
    await fetchAll();
    return true;
  };

  const updateInstanceTrust = async (id: string, trustLevel: string) => {
    const { error } = await supabase
      .from("federated_instances" as any)
      .update({ trust_level: trustLevel, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Trust Level Updated" });
    await fetchAll();
    return true;
  };

  const requestCollaboration = async (
    targetInstanceId: string,
    collaborationType: string,
    purpose: string
  ) => {
    // Get local instance (first active one)
    const localInstance = instances.find(i => i.trust_level === "trusted");
    if (!localInstance) {
      toast({ title: "Error", description: "No local instance configured", variant: "destructive" });
      return false;
    }

    const { error } = await supabase.from("federated_collaboration_requests" as any).insert({
      requesting_instance_id: localInstance.id,
      target_instance_id: targetInstanceId,
      collaboration_type: collaborationType,
      purpose,
      status: "pending",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Collaboration Request Sent" });
    await fetchAll();
    return true;
  };

  const respondToCollaboration = async (id: string, approved: boolean, notes?: string) => {
    const { error } = await supabase
      .from("federated_collaboration_requests" as any)
      .update({
        status: approved ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
        response_notes: notes,
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: approved ? "Collaboration Approved" : "Collaboration Rejected" });
    await fetchAll();
    return true;
  };

  const stats = {
    totalInstances: instances.length,
    trustedInstances: instances.filter(i => i.trust_level === "trusted").length,
    healthyInstances: instances.filter(i => i.health_status === "healthy").length,
    pendingCollaborations: collaborations.filter(c => c.status === "pending").length,
    activeCollaborations: collaborations.filter(c => c.status === "approved").length,
    linkedIdentities: identities.filter(i => i.is_active).length,
    cachedResources: discoveryCache.length,
  };

  return {
    instances,
    identities,
    collaborations,
    discoveryCache,
    loading,
    stats,
    refetch: fetchAll,
    registerInstance,
    updateInstanceTrust,
    requestCollaboration,
    respondToCollaboration,
  };
}

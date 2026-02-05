import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  InstitutionalVault,
  VaultType,
  VaultAccessLevel,
  VaultEntry,
} from "@/types/knowledge-civilization";

// ============================================
// SYSTEM 40: INSTITUTIONAL MEMORY VAULTS
// Institutions should never "forget"
// ============================================

export function useInstitutionalVaults() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vaults, setVaults] = useState<InstitutionalVault[]>([]);

  // Create a new vault
  const createVault = useCallback(async (
    input: {
      institutionId: string;
      name: string;
      description: string;
      type: VaultType;
      accessLevel?: VaultAccessLevel;
      versioningEnabled?: boolean;
      retentionPolicy?: string;
    }
  ): Promise<InstitutionalVault | null> => {
    if (!user) {
      toast.error("You must be logged in to create vaults");
      return null;
    }

    setLoading(true);
    try {
      const now = new Date();
      const vault: InstitutionalVault = {
        id: crypto.randomUUID(),
        institutionId: input.institutionId,
        name: input.name,
        description: input.description,
        type: input.type,
        entries: [],
        entryCount: 0,
        accessLevel: input.accessLevel || "institutional",
        accessRoles: [],
        viewers: [],
        editors: [user.id],
        versioningEnabled: input.versioningEnabled ?? true,
        retentionPolicy: input.retentionPolicy || "permanent",
        auditTrail: [{
          action: "vault_created",
          performedBy: user.id,
          performedAt: now,
          details: {},
        }],
        successors: [],
        createdAt: now,
        updatedAt: now,
      };

      setVaults(prev => [...prev, vault]);
      toast.success("Vault created");
      return vault;
    } catch (err) {
      toast.error("Failed to create vault");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add entry to vault
  const addEntry = useCallback(async (
    vaultId: string,
    objectId: string,
    objectType: string,
    metadata: Record<string, unknown> = {}
  ): Promise<VaultEntry | null> => {
    if (!user) return null;

    const now = new Date();
    const entry: VaultEntry = {
      id: crypto.randomUUID(),
      vaultId,
      objectId,
      objectType,
      addedBy: user.id,
      addedAt: now,
      metadata,
    };

    setVaults(prev => prev.map(v => {
      if (v.id !== vaultId) return v;
      if (!v.editors.includes(user.id)) {
        toast.error("You don't have permission to add to this vault");
        return v;
      }
      
      return {
        ...v,
        entries: [...v.entries, entry],
        entryCount: v.entryCount + 1,
        auditTrail: [...v.auditTrail, {
          action: "entry_added",
          performedBy: user.id,
          performedAt: now,
          details: { objectId, objectType },
        }],
        updatedAt: now,
      };
    }));

    toast.success("Entry added to vault");
    return entry;
  }, [user]);

  // Remove entry from vault
  const removeEntry = useCallback(async (
    vaultId: string,
    entryId: string,
    reason: string
  ): Promise<boolean> => {
    if (!user) return false;

    const now = new Date();
    setVaults(prev => prev.map(v => {
      if (v.id !== vaultId) return v;
      if (!v.editors.includes(user.id)) {
        toast.error("You don't have permission to remove from this vault");
        return v;
      }
      
      const entry = v.entries.find(e => e.id === entryId);
      if (!entry) return v;
      
      return {
        ...v,
        entries: v.entries.filter(e => e.id !== entryId),
        entryCount: v.entryCount - 1,
        auditTrail: [...v.auditTrail, {
          action: "entry_removed",
          performedBy: user.id,
          performedAt: now,
          details: { entryId, reason, objectId: entry.objectId },
        }],
        updatedAt: now,
      };
    }));

    toast.success("Entry removed from vault");
    return true;
  }, [user]);

  // Update access control
  const updateAccessControl = useCallback(async (
    vaultId: string,
    updates: {
      accessLevel?: VaultAccessLevel;
      accessRoles?: string[];
      viewers?: string[];
      editors?: string[];
    }
  ): Promise<boolean> => {
    if (!user) return false;

    const now = new Date();
    setVaults(prev => prev.map(v => {
      if (v.id !== vaultId) return v;
      if (!v.editors.includes(user.id)) {
        toast.error("You don't have permission to modify access");
        return v;
      }
      
      return {
        ...v,
        ...updates,
        auditTrail: [...v.auditTrail, {
          action: "access_updated",
          performedBy: user.id,
          performedAt: now,
          details: updates,
        }],
        updatedAt: now,
      };
    }));

    toast.success("Access control updated");
    return true;
  }, [user]);

  // Set succession plan
  const setSuccessionPlan = useCallback(async (
    vaultId: string,
    successors: string[],
    plan?: string
  ): Promise<boolean> => {
    if (!user) return false;

    const now = new Date();
    setVaults(prev => prev.map(v => {
      if (v.id !== vaultId) return v;
      if (!v.editors.includes(user.id)) {
        toast.error("You don't have permission to set succession");
        return v;
      }
      
      return {
        ...v,
        successors,
        successionPlan: plan,
        auditTrail: [...v.auditTrail, {
          action: "succession_updated",
          performedBy: user.id,
          performedAt: now,
          details: { successors, plan },
        }],
        updatedAt: now,
      };
    }));

    toast.success("Succession plan updated");
    return true;
  }, [user]);

  // Get vault audit trail
  const getAuditTrail = useCallback((vaultId: string) => {
    const vault = vaults.find(v => v.id === vaultId);
    return vault?.auditTrail || [];
  }, [vaults]);

  // Search within vault
  const searchVault = useCallback(async (
    vaultId: string,
    query: string,
    filters?: {
      objectType?: string;
      addedBy?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<VaultEntry[]> => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return [];

    let results = vault.entries;

    if (filters?.objectType) {
      results = results.filter(e => e.objectType === filters.objectType);
    }
    if (filters?.addedBy) {
      results = results.filter(e => e.addedBy === filters.addedBy);
    }
    if (filters?.startDate) {
      results = results.filter(e => e.addedAt >= filters.startDate!);
    }
    if (filters?.endDate) {
      results = results.filter(e => e.addedAt <= filters.endDate!);
    }

    // Would do text search on object content
    return results;
  }, [vaults]);

  // Get vaults for institution
  const getInstitutionVaults = useCallback((institutionId: string) => {
    return vaults.filter(v => v.institutionId === institutionId);
  }, [vaults]);

  // Get vault statistics
  const getVaultStats = useCallback((vaultId: string) => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return null;

    const byType = vault.entries.reduce((acc, e) => {
      acc[e.objectType] = (acc[e.objectType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byContributor = vault.entries.reduce((acc, e) => {
      acc[e.addedBy] = (acc[e.addedBy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = vault.auditTrail
      .filter(a => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return a.performedAt >= weekAgo;
      })
      .length;

    return {
      totalEntries: vault.entryCount,
      byType,
      byContributor,
      recentActivity,
      auditTrailLength: vault.auditTrail.length,
      hasSuccessionPlan: vault.successors.length > 0,
    };
  }, [vaults]);

  return {
    loading,
    vaults,
    createVault,
    addEntry,
    removeEntry,
    updateAccessControl,
    setSuccessionPlan,
    getAuditTrail,
    searchVault,
    getInstitutionVaults,
    getVaultStats,
  };
}

export type { InstitutionalVault, VaultType, VaultAccessLevel, VaultEntry };

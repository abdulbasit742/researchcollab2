import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// ACCESS CONTROL & PERMISSIONS - 12+ Features
// ============================================================

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'admin';
  scope: 'own' | 'team' | 'org' | 'global';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  user_count: number;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  resource_type: string;
  conditions: {
    attribute: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
    value: unknown;
  }[];
  effect: 'allow' | 'deny';
  priority: number;
  is_enabled: boolean;
}

export interface ResourceAccess {
  resource_id: string;
  resource_type: string;
  user_id: string;
  access_level: 'none' | 'view' | 'edit' | 'manage' | 'owner';
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

export interface AccessRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  resource_id: string;
  resource_type: string;
  resource_name: string;
  requested_access: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export function useAccessControl() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [policies, setPolicies] = useState<AccessPolicy[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Initialize default permissions and roles
  useEffect(() => {
    const defaultPermissions: Permission[] = [
      { id: 'perm-profile-read', name: 'View Profiles', description: 'View user profiles', resource: 'profile', action: 'read', scope: 'global' },
      { id: 'perm-profile-update-own', name: 'Update Own Profile', description: 'Update your own profile', resource: 'profile', action: 'update', scope: 'own' },
      { id: 'perm-project-create', name: 'Create Projects', description: 'Create new projects', resource: 'project', action: 'create', scope: 'own' },
      { id: 'perm-project-manage', name: 'Manage Projects', description: 'Manage team projects', resource: 'project', action: 'manage', scope: 'team' },
      { id: 'perm-deal-create', name: 'Create Deals', description: 'Create new deals', resource: 'deal', action: 'create', scope: 'own' },
      { id: 'perm-deal-manage', name: 'Manage Deals', description: 'Manage all deals', resource: 'deal', action: 'manage', scope: 'org' },
      { id: 'perm-admin-users', name: 'Manage Users', description: 'Admin user management', resource: 'user', action: 'admin', scope: 'global' },
      { id: 'perm-admin-settings', name: 'Manage Settings', description: 'Admin settings access', resource: 'settings', action: 'admin', scope: 'global' }
    ];
    setPermissions(defaultPermissions);

    const defaultRoles: Role[] = [
      {
        id: 'role-user',
        name: 'User',
        description: 'Standard platform user',
        permissions: ['perm-profile-read', 'perm-profile-update-own', 'perm-project-create', 'perm-deal-create'],
        is_system: true,
        created_at: new Date().toISOString(),
        user_count: 0
      },
      {
        id: 'role-verified',
        name: 'Verified User',
        description: 'Verified platform user with extended permissions',
        permissions: ['perm-profile-read', 'perm-profile-update-own', 'perm-project-create', 'perm-project-manage', 'perm-deal-create'],
        is_system: true,
        created_at: new Date().toISOString(),
        user_count: 0
      },
      {
        id: 'role-admin',
        name: 'Administrator',
        description: 'Platform administrator',
        permissions: defaultPermissions.map(p => p.id),
        is_system: true,
        created_at: new Date().toISOString(),
        user_count: 0
      }
    ];
    setRoles(defaultRoles);

    // Set user permissions based on role
    const userRole = defaultRoles.find(r => r.id === 'role-user');
    if (userRole) {
      setUserPermissions(new Set(userRole.permissions));
    }

    setLoading(false);
  }, []);

  // Feature 1: Check Permission
  const hasPermission = useCallback((permissionId: string): boolean => {
    return userPermissions.has(permissionId);
  }, [userPermissions]);

  // Feature 2: Check Multiple Permissions (AND)
  const hasAllPermissions = useCallback((permissionIds: string[]): boolean => {
    return permissionIds.every(id => userPermissions.has(id));
  }, [userPermissions]);

  // Feature 3: Check Multiple Permissions (OR)
  const hasAnyPermission = useCallback((permissionIds: string[]): boolean => {
    return permissionIds.some(id => userPermissions.has(id));
  }, [userPermissions]);

  // Feature 4: Get User's Effective Permissions
  const getEffectivePermissions = useCallback((): Permission[] => {
    return permissions.filter(p => userPermissions.has(p.id));
  }, [permissions, userPermissions]);

  // Feature 5: Create Custom Role
  const createRole = async (
    name: string,
    description: string,
    permissionIds: string[]
  ): Promise<Role> => {
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name,
      description,
      permissions: permissionIds,
      is_system: false,
      created_at: new Date().toISOString(),
      user_count: 0
    };

    setRoles(prev => [...prev, newRole]);
    toast({ title: "Role Created", description: `${name} role created successfully` });
    return newRole;
  };

  // Feature 6: Update Role Permissions
  const updateRolePermissions = async (
    roleId: string,
    permissionIds: string[]
  ): Promise<boolean> => {
    const role = roles.find(r => r.id === roleId);
    if (role?.is_system) {
      toast({ title: "Cannot Modify System Role", variant: "destructive" });
      return false;
    }

    setRoles(prev => prev.map(r =>
      r.id === roleId ? { ...r, permissions: permissionIds } : r
    ));
    toast({ title: "Role Updated" });
    return true;
  };

  // Feature 7: Delete Role
  const deleteRole = async (roleId: string): Promise<boolean> => {
    const role = roles.find(r => r.id === roleId);
    if (role?.is_system) {
      toast({ title: "Cannot Delete System Role", variant: "destructive" });
      return false;
    }
    if (role && role.user_count > 0) {
      toast({ title: "Cannot Delete Role with Users", variant: "destructive" });
      return false;
    }

    setRoles(prev => prev.filter(r => r.id !== roleId));
    toast({ title: "Role Deleted" });
    return true;
  };

  // Feature 8: Create Access Policy
  const createPolicy = async (policy: Omit<AccessPolicy, 'id'>): Promise<AccessPolicy> => {
    const newPolicy: AccessPolicy = {
      ...policy,
      id: `policy-${Date.now()}`
    };

    setPolicies(prev => [...prev, newPolicy]);
    toast({ title: "Access Policy Created" });
    return newPolicy;
  };

  // Feature 9: Evaluate Access Policy
  const evaluatePolicy = useCallback((
    resourceType: string,
    context: Record<string, unknown>
  ): 'allow' | 'deny' => {
    const applicablePolicies = policies
      .filter(p => p.resource_type === resourceType && p.is_enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const policy of applicablePolicies) {
      const conditionsMet = policy.conditions.every(condition => {
        const contextValue = context[condition.attribute];
        
        switch (condition.operator) {
          case 'equals':
            return contextValue === condition.value;
          case 'not_equals':
            return contextValue !== condition.value;
          case 'contains':
            return String(contextValue).includes(String(condition.value));
          case 'in':
            return Array.isArray(condition.value) && condition.value.includes(contextValue);
          case 'not_in':
            return Array.isArray(condition.value) && !condition.value.includes(contextValue);
          default:
            return false;
        }
      });

      if (conditionsMet) {
        return policy.effect;
      }
    }

    return 'deny'; // Default deny
  }, [policies]);

  // Feature 10: Request Access
  const requestAccess = async (
    resourceId: string,
    resourceType: string,
    resourceName: string,
    requestedAccess: string,
    reason: string
  ): Promise<AccessRequest> => {
    if (!user) throw new Error("Not authenticated");

    const request: AccessRequest = {
      id: `request-${Date.now()}`,
      requester_id: user.id,
      requester_name: user.email || 'Unknown',
      resource_id: resourceId,
      resource_type: resourceType,
      resource_name: resourceName,
      requested_access: requestedAccess,
      reason,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setAccessRequests(prev => [request, ...prev]);
    toast({ title: "Access Request Submitted" });
    return request;
  };

  // Feature 11: Review Access Request
  const reviewAccessRequest = async (
    requestId: string,
    approved: boolean,
    notes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    setAccessRequests(prev => prev.map(r =>
      r.id === requestId
        ? {
            ...r,
            status: approved ? 'approved' as const : 'denied' as const,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
          }
        : r
    ));

    toast({ 
      title: approved ? "Access Granted" : "Access Denied",
      description: notes || undefined
    });
    return true;
  };

  // Feature 12: Get Pending Requests
  const getPendingRequests = useCallback((): AccessRequest[] => {
    return accessRequests.filter(r => r.status === 'pending');
  }, [accessRequests]);

  // Feature 13: Check Resource Access Level
  const checkResourceAccess = (
    resourceId: string,
    resourceType: string,
    requiredLevel: ResourceAccess['access_level']
  ): boolean => {
    // In a real implementation, this would check the database
    const levelOrder = ['none', 'view', 'edit', 'manage', 'owner'];
    const userLevel = 'view'; // Would be fetched from database
    
    return levelOrder.indexOf(userLevel) >= levelOrder.indexOf(requiredLevel);
  };

  return {
    // State
    permissions,
    roles,
    policies,
    accessRequests,
    loading,

    // Permission Checks
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getEffectivePermissions,

    // Role Management
    createRole,
    updateRolePermissions,
    deleteRole,

    // Policy Management
    createPolicy,
    evaluatePolicy,

    // Access Requests
    requestAccess,
    reviewAccessRequest,
    getPendingRequests,

    // Resource Access
    checkResourceAccess
  };
}

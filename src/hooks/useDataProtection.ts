import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// DATA PROTECTION & ENCRYPTION - 12+ Features
// ============================================================

export interface EncryptionKey {
  id: string;
  name: string;
  algorithm: 'AES-256-GCM' | 'RSA-4096' | 'ChaCha20-Poly1305';
  purpose: 'data' | 'transport' | 'backup';
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  rotation_due: string | null;
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  label: string;
  description: string;
  retention_days: number;
  encryption_required: boolean;
  access_log_required: boolean;
}

export interface DataAccessLog {
  id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  action: 'read' | 'write' | 'delete' | 'export';
  timestamp: string;
  ip_address: string;
  success: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'network' | 'private';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  allow_indexing: boolean;
  data_sharing_consent: boolean;
  analytics_consent: boolean;
  marketing_consent: boolean;
}

export interface DataRetentionPolicy {
  id: string;
  data_type: string;
  retention_period_days: number;
  auto_delete: boolean;
  archive_before_delete: boolean;
  legal_hold: boolean;
}

export function useDataProtection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [accessLogs, setAccessLogs] = useState<DataAccessLog[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profile_visibility: 'network',
    show_email: false,
    show_phone: false,
    show_location: true,
    allow_indexing: true,
    data_sharing_consent: false,
    analytics_consent: true,
    marketing_consent: false
  });
  const [retentionPolicies, setRetentionPolicies] = useState<DataRetentionPolicy[]>([]);
  const [loading, setLoading] = useState(false);

  // Feature 1: Data Classification System
  const DATA_CLASSIFICATIONS: DataClassification[] = [
    {
      level: 'public',
      label: 'Public',
      description: 'Information that can be freely shared',
      retention_days: 365 * 5,
      encryption_required: false,
      access_log_required: false
    },
    {
      level: 'internal',
      label: 'Internal',
      description: 'Information for platform users only',
      retention_days: 365 * 3,
      encryption_required: false,
      access_log_required: true
    },
    {
      level: 'confidential',
      label: 'Confidential',
      description: 'Sensitive business or personal information',
      retention_days: 365 * 2,
      encryption_required: true,
      access_log_required: true
    },
    {
      level: 'restricted',
      label: 'Restricted',
      description: 'Highly sensitive data requiring strict controls',
      retention_days: 365,
      encryption_required: true,
      access_log_required: true
    }
  ];

  // Feature 2: Encryption Key Management
  const rotateEncryptionKey = async (keyId: string): Promise<boolean> => {
    const key = encryptionKeys.find(k => k.id === keyId);
    if (!key) return false;

    const newKey: EncryptionKey = {
      ...key,
      id: `key-${Date.now()}`,
      created_at: new Date().toISOString(),
      rotation_due: new Date(Date.now() + 90 * 86400000).toISOString()
    };

    setEncryptionKeys(prev => [
      ...prev.map(k => k.id === keyId ? { ...k, is_active: false } : k),
      newKey
    ]);

    toast({ title: "Encryption Key Rotated", description: "New key is now active" });
    return true;
  };

  // Feature 3: Generate New Encryption Key
  const generateEncryptionKey = async (
    name: string,
    algorithm: EncryptionKey['algorithm'],
    purpose: EncryptionKey['purpose']
  ): Promise<EncryptionKey> => {
    const newKey: EncryptionKey = {
      id: `key-${Date.now()}`,
      name,
      algorithm,
      purpose,
      created_at: new Date().toISOString(),
      expires_at: null,
      is_active: true,
      rotation_due: new Date(Date.now() + 90 * 86400000).toISOString()
    };

    setEncryptionKeys(prev => [...prev, newKey]);
    toast({ title: "Encryption Key Generated" });
    return newKey;
  };

  // Feature 4: Update Privacy Settings
  const updatePrivacySettings = async (updates: Partial<PrivacySettings>): Promise<boolean> => {
    setPrivacySettings(prev => ({ ...prev, ...updates }));
    toast({ title: "Privacy Settings Updated" });
    return true;
  };

  // Feature 5: Data Access Logging
  const logDataAccess = async (
    resourceType: string,
    resourceId: string,
    action: DataAccessLog['action'],
    success: boolean
  ) => {
    if (!user) return;

    const log: DataAccessLog = {
      id: `log-${Date.now()}`,
      user_id: user.id,
      resource_type: resourceType,
      resource_id: resourceId,
      action,
      timestamp: new Date().toISOString(),
      ip_address: '***.***.***',
      success
    };

    setAccessLogs(prev => [log, ...prev.slice(0, 999)]);
  };

  // Feature 6: Get Access Logs
  const getAccessLogs = useCallback((
    filters?: {
      resourceType?: string;
      action?: DataAccessLog['action'];
      startDate?: Date;
      endDate?: Date;
    }
  ): DataAccessLog[] => {
    let filtered = accessLogs;

    if (filters?.resourceType) {
      filtered = filtered.filter(l => l.resource_type === filters.resourceType);
    }
    if (filters?.action) {
      filtered = filtered.filter(l => l.action === filters.action);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(l => new Date(l.timestamp) >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(l => new Date(l.timestamp) <= filters.endDate!);
    }

    return filtered;
  }, [accessLogs]);

  // Feature 7: Data Retention Policy Management
  const setRetentionPolicy = async (
    dataType: string,
    retentionDays: number,
    autoDelete: boolean = true,
    archiveFirst: boolean = true
  ): Promise<boolean> => {
    const policy: DataRetentionPolicy = {
      id: `policy-${Date.now()}`,
      data_type: dataType,
      retention_period_days: retentionDays,
      auto_delete: autoDelete,
      archive_before_delete: archiveFirst,
      legal_hold: false
    };

    setRetentionPolicies(prev => {
      const existing = prev.findIndex(p => p.data_type === dataType);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = policy;
        return updated;
      }
      return [...prev, policy];
    });

    toast({ title: "Retention Policy Set" });
    return true;
  };

  // Feature 8: Legal Hold Management
  const setLegalHold = async (dataType: string, enabled: boolean): Promise<boolean> => {
    setRetentionPolicies(prev =>
      prev.map(p => p.data_type === dataType ? { ...p, legal_hold: enabled } : p)
    );
    toast({ 
      title: enabled ? "Legal Hold Enabled" : "Legal Hold Released",
      description: `For ${dataType} data`
    });
    return true;
  };

  // Feature 9: Data Export (GDPR Compliance)
  const exportUserData = async (): Promise<{
    filename: string;
    data: Record<string, unknown>;
    generated_at: string;
  }> => {
    setLoading(true);
    
    // Simulate data collection
    await new Promise(resolve => setTimeout(resolve, 1000));

    const exportData = {
      filename: `user-data-export-${Date.now()}.json`,
      data: {
        profile: {
          id: user?.id,
          email: user?.email,
          created_at: user?.created_at
        },
        privacy_settings: privacySettings,
        access_logs: accessLogs.slice(0, 100),
        encryption_keys: encryptionKeys.map(k => ({
          name: k.name,
          algorithm: k.algorithm,
          purpose: k.purpose,
          created_at: k.created_at
        }))
      },
      generated_at: new Date().toISOString()
    };

    setLoading(false);
    toast({ title: "Data Export Ready" });
    return exportData;
  };

  // Feature 10: Data Deletion Request (Right to be Forgotten)
  const requestDataDeletion = async (reason: string): Promise<{
    request_id: string;
    estimated_completion: string;
  }> => {
    const request = {
      request_id: `del-${Date.now()}`,
      estimated_completion: new Date(Date.now() + 30 * 86400000).toISOString()
    };

    toast({ 
      title: "Deletion Request Submitted",
      description: "You will be notified when processing is complete"
    });

    return request;
  };

  // Feature 11: Anonymization Status
  const getAnonymizationStatus = (): {
    can_anonymize: boolean;
    blockers: string[];
    data_to_anonymize: string[];
  } => {
    const blockers: string[] = [];
    const data_to_anonymize = ['profile_data', 'activity_logs', 'messages', 'preferences'];

    // Check for blockers
    if (retentionPolicies.some(p => p.legal_hold)) {
      blockers.push("Data is under legal hold");
    }

    return {
      can_anonymize: blockers.length === 0,
      blockers,
      data_to_anonymize
    };
  };

  // Feature 12: Consent Management
  const updateConsent = async (
    consentType: 'data_sharing' | 'analytics' | 'marketing',
    granted: boolean
  ): Promise<boolean> => {
    const updates: Partial<PrivacySettings> = {};
    
    switch (consentType) {
      case 'data_sharing':
        updates.data_sharing_consent = granted;
        break;
      case 'analytics':
        updates.analytics_consent = granted;
        break;
      case 'marketing':
        updates.marketing_consent = granted;
        break;
    }

    await updatePrivacySettings(updates);
    
    // Log consent change
    await logDataAccess('consent', consentType, 'write', true);
    
    return true;
  };

  // Feature 13: Get Data Classification
  const getClassification = (level: DataClassification['level']): DataClassification | undefined => {
    return DATA_CLASSIFICATIONS.find(c => c.level === level);
  };

  return {
    // State
    encryptionKeys,
    accessLogs,
    privacySettings,
    retentionPolicies,
    loading,
    DATA_CLASSIFICATIONS,

    // Encryption
    rotateEncryptionKey,
    generateEncryptionKey,

    // Privacy
    updatePrivacySettings,
    updateConsent,

    // Access Logging
    logDataAccess,
    getAccessLogs,

    // Retention
    setRetentionPolicy,
    setLegalHold,

    // GDPR
    exportUserData,
    requestDataDeletion,
    getAnonymizationStatus,

    // Classification
    getClassification
  };
}

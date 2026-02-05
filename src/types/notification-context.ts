 // ============================================
 // NOTIFICATION CONTEXT TYPES
 // For context-aware, non-repeating notifications
 // ============================================
 
 export interface NotificationContext {
   entityId: string;
   entityType: "deal" | "opportunity" | "user" | "milestone" | "dispute" | "system";
   contextHash: string;
   lastNotifiedAt: Date;
   notificationCount: number;
   contextVersion: number;
   keyFields: Record<string, unknown>;
 }
 
 export type NotificationUrgency = "urgent" | "high" | "medium" | "low";
 
 export interface NotificationBatchConfig {
   urgent: "immediate";
   high: "within_hour";
   medium: "daily_digest";
   low: "weekly_summary";
 }
 
 export interface ContextAwareNotification {
   id: string;
   type: string;
   title: string;
   message: string;
   actionUrl?: string;
   actionLabel?: string;
   urgency: NotificationUrgency;
   context: NotificationContext;
   silentSuccess: boolean;
   createdAt: Date;
   batchedUntil?: Date;
 }
 
 export interface NotificationDeduplicationResult {
   shouldSend: boolean;
   reason?: "context_unchanged" | "too_recent" | "success_silent" | "batched";
   nextAllowedAt?: Date;
 }
 
 // Context change detection
 export interface ContextChangeDetector {
   entityType: string;
   significantFields: string[];
   hashFunction: (fields: Record<string, unknown>) => string;
 }
 
 export const DEFAULT_CONTEXT_DETECTORS: Record<string, ContextChangeDetector> = {
   deal: {
     entityType: "deal",
     significantFields: ["status", "currentMilestone", "escrowAmount", "deadline"],
     hashFunction: (fields) => JSON.stringify(fields),
   },
   opportunity: {
     entityType: "opportunity",
     significantFields: ["status", "applicantCount", "budget", "deadline"],
     hashFunction: (fields) => JSON.stringify(fields),
   },
   milestone: {
     entityType: "milestone",
     significantFields: ["status", "deadline", "deliverables"],
     hashFunction: (fields) => JSON.stringify(fields),
   },
 };
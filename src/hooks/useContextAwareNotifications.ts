 import { useState, useCallback, useRef, useMemo } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 import {
   NotificationContext,
   NotificationUrgency,
   ContextAwareNotification,
   NotificationDeduplicationResult,
   DEFAULT_CONTEXT_DETECTORS,
 } from "@/types/notification-context";
 
 // ============================================
 // CONTEXT-AWARE NOTIFICATION ENGINE
 // Intelligent, non-repeating notifications
 // ============================================
 
 interface NotificationRules {
   minIntervalMs: number;
   requireActionUrl: boolean;
   silentSuccessTypes: string[];
   batchingConfig: Record<NotificationUrgency, number>;
 }
 
 const DEFAULT_RULES: NotificationRules = {
   minIntervalMs: 24 * 60 * 60 * 1000, // 24 hours
   requireActionUrl: true,
   silentSuccessTypes: [
     "deal.completed_success",
     "milestone.approved",
     "payment.received",
     "profile.updated",
   ],
   batchingConfig: {
     urgent: 0, // Immediate
     high: 60 * 60 * 1000, // 1 hour
     medium: 24 * 60 * 60 * 1000, // Daily
     low: 7 * 24 * 60 * 60 * 1000, // Weekly
   },
 };
 
 export function useContextAwareNotifications() {
   const { user } = useAuth();
   const [notifications, setNotifications] = useState<ContextAwareNotification[]>([]);
   const [pendingBatch, setPendingBatch] = useState<ContextAwareNotification[]>([]);
   const contextCache = useRef<Map<string, NotificationContext>>(new Map());
 
   // Generate context hash for deduplication
   const generateContextHash = useCallback((
     entityType: string,
     entityId: string,
     keyFields: Record<string, unknown>
   ): string => {
     const detector = DEFAULT_CONTEXT_DETECTORS[entityType];
     if (detector) {
       const relevantFields: Record<string, unknown> = {};
       detector.significantFields.forEach(field => {
         if (keyFields[field] !== undefined) {
           relevantFields[field] = keyFields[field];
         }
       });
       return btoa(JSON.stringify({ entityType, entityId, ...relevantFields }));
     }
     return btoa(JSON.stringify({ entityType, entityId, ...keyFields }));
   }, []);
 
   // Check if notification should be sent
   const checkDeduplication = useCallback((
     type: string,
     entityType: string,
     entityId: string,
     keyFields: Record<string, unknown>,
     urgency: NotificationUrgency
   ): NotificationDeduplicationResult => {
     const contextHash = generateContextHash(entityType, entityId, keyFields);
     const cacheKey = `${type}:${entityId}`;
     const existingContext = contextCache.current.get(cacheKey);
 
     // Check if this is a silent success type
     if (DEFAULT_RULES.silentSuccessTypes.includes(type)) {
       return { shouldSend: false, reason: "success_silent" };
     }
 
     // Check if context has changed
     if (existingContext) {
       if (existingContext.contextHash === contextHash) {
         const timeSinceLastNotification = Date.now() - existingContext.lastNotifiedAt.getTime();
         if (timeSinceLastNotification < DEFAULT_RULES.minIntervalMs) {
           return {
             shouldSend: false,
             reason: "too_recent",
             nextAllowedAt: new Date(existingContext.lastNotifiedAt.getTime() + DEFAULT_RULES.minIntervalMs),
           };
         }
         return { shouldSend: false, reason: "context_unchanged" };
       }
     }
 
     // Check batching for non-urgent notifications
     if (urgency !== "urgent") {
       const batchDelay = DEFAULT_RULES.batchingConfig[urgency];
       if (batchDelay > 0) {
         return {
           shouldSend: true,
           reason: "batched",
         };
       }
     }
 
     return { shouldSend: true };
   }, [generateContextHash]);
 
   // Create a context-aware notification
   const createNotification = useCallback(async (params: {
     type: string;
     title: string;
     message: string;
     entityType: "deal" | "opportunity" | "user" | "milestone" | "dispute" | "system";
     entityId: string;
     keyFields: Record<string, unknown>;
     urgency: NotificationUrgency;
     actionUrl?: string;
     actionLabel?: string;
   }): Promise<{ sent: boolean; reason?: string }> => {
     if (!user) return { sent: false, reason: "not_authenticated" };
 
     // Require action URL for non-info notifications
     if (DEFAULT_RULES.requireActionUrl && !params.actionUrl && params.urgency !== "low") {
       console.warn("Notification blocked: no action URL provided");
       return { sent: false, reason: "no_action_url" };
     }
 
     // Check deduplication
     const dedupeResult = checkDeduplication(
       params.type,
       params.entityType,
       params.entityId,
       params.keyFields,
       params.urgency
     );
 
     if (!dedupeResult.shouldSend) {
       return { sent: false, reason: dedupeResult.reason };
     }
 
     const contextHash = generateContextHash(params.entityType, params.entityId, params.keyFields);
     const context: NotificationContext = {
       entityId: params.entityId,
       entityType: params.entityType,
       contextHash,
       lastNotifiedAt: new Date(),
       notificationCount: (contextCache.current.get(`${params.type}:${params.entityId}`)?.notificationCount || 0) + 1,
       contextVersion: Date.now(),
       keyFields: params.keyFields,
     };
 
     const notification: ContextAwareNotification = {
       id: crypto.randomUUID(),
       type: params.type,
       title: params.title,
       message: params.message,
       actionUrl: params.actionUrl,
       actionLabel: params.actionLabel,
       urgency: params.urgency,
       context,
       silentSuccess: false,
       createdAt: new Date(),
     };
 
     // Handle batching
     if (dedupeResult.reason === "batched") {
       const batchDelay = DEFAULT_RULES.batchingConfig[params.urgency];
       notification.batchedUntil = new Date(Date.now() + batchDelay);
       setPendingBatch(prev => [...prev, notification]);
     } else {
       // Send immediately for urgent notifications
       try {
         await supabase.from("notifications").insert({
           user_id: user.id,
           type: params.type,
           title: params.title,
           message: params.message,
           data: {
             entityType: params.entityType,
             entityId: params.entityId,
             actionUrl: params.actionUrl,
             actionLabel: params.actionLabel,
             urgency: params.urgency,
             contextVersion: context.contextVersion,
           },
         });
       } catch (error) {
         console.error("Failed to create notification:", error);
         return { sent: false, reason: "database_error" };
       }
     }
 
     // Update context cache
     contextCache.current.set(`${params.type}:${params.entityId}`, context);
     setNotifications(prev => [...prev.slice(-99), notification]);
 
     return { sent: true };
   }, [user, checkDeduplication, generateContextHash]);
 
   // Create a contextual nudge (non-blocking, low priority)
   const createNudge = useCallback(async (params: {
     type: string;
     title: string;
     message: string;
     entityType: "deal" | "opportunity" | "user" | "milestone" | "dispute" | "system";
     entityId: string;
     actionUrl?: string;
   }): Promise<{ sent: boolean }> => {
     return createNotification({
       ...params,
       keyFields: {},
       urgency: "low",
     });
   }, [createNotification]);
 
   // Create an urgent alert
   const createUrgentAlert = useCallback(async (params: {
     type: string;
     title: string;
     message: string;
     entityType: "deal" | "opportunity" | "user" | "milestone" | "dispute" | "system";
     entityId: string;
     keyFields: Record<string, unknown>;
     actionUrl: string;
     actionLabel: string;
   }): Promise<{ sent: boolean }> => {
     return createNotification({
       ...params,
       urgency: "urgent",
     });
   }, [createNotification]);
 
   // Flush pending batch (called by scheduler or manually)
   const flushBatch = useCallback(async (urgency?: NotificationUrgency) => {
     if (!user) return;
 
     const now = new Date();
     const toFlush = pendingBatch.filter(n => {
       if (urgency && n.urgency !== urgency) return false;
       return !n.batchedUntil || n.batchedUntil <= now;
     });
 
     if (toFlush.length === 0) return;
 
     // Group by urgency for digest
     const grouped = toFlush.reduce((acc, n) => {
       acc[n.urgency] = acc[n.urgency] || [];
       acc[n.urgency].push(n);
       return acc;
     }, {} as Record<NotificationUrgency, ContextAwareNotification[]>);
 
     // Create digest notifications
     for (const [urg, notifs] of Object.entries(grouped)) {
       if (notifs.length === 1) {
         // Single notification, send as-is
         await supabase.from("notifications").insert({
           user_id: user.id,
           type: notifs[0].type,
           title: notifs[0].title,
           message: notifs[0].message,
           data: {
             entityType: notifs[0].context.entityType,
             entityId: notifs[0].context.entityId,
             actionUrl: notifs[0].actionUrl,
             urgency: urg,
           },
         });
       } else {
         // Multiple notifications, create digest
         await supabase.from("notifications").insert({
           user_id: user.id,
           type: "digest",
           title: `${notifs.length} updates`,
           message: notifs.map(n => n.title).join(", "),
           data: {
             digestItems: notifs.map(n => ({
               type: n.type,
               title: n.title,
               actionUrl: n.actionUrl,
             })),
             urgency: urg,
           },
         });
       }
     }
 
     // Remove flushed from pending
     setPendingBatch(prev => prev.filter(n => !toFlush.includes(n)));
   }, [user, pendingBatch]);
 
   // Get notification stats
   const stats = useMemo(() => ({
     total: notifications.length,
     pending: pendingBatch.length,
     byUrgency: {
       urgent: notifications.filter(n => n.urgency === "urgent").length,
       high: notifications.filter(n => n.urgency === "high").length,
       medium: notifications.filter(n => n.urgency === "medium").length,
       low: notifications.filter(n => n.urgency === "low").length,
     },
     silentSuccessCount: notifications.filter(n => n.silentSuccess).length,
   }), [notifications, pendingBatch]);
 
   return {
     notifications,
     pendingBatch,
     stats,
     createNotification,
     createNudge,
     createUrgentAlert,
     flushBatch,
     checkDeduplication,
   };
 }
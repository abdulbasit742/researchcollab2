 import { useState, useCallback, useEffect } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 
 // ============================================
 // EXTENSIBILITY & COMPOSABILITY SYSTEM
 // API-first, event-driven, plugin-ready
 // ============================================
 
 // Event types for the platform event bus
 export type PlatformEventType =
   | "user.created"
   | "user.updated"
   | "user.trust_changed"
   | "deal.created"
   | "deal.state_changed"
   | "deal.completed"
   | "deal.disputed"
   | "milestone.submitted"
   | "milestone.approved"
   | "milestone.disputed"
   | "outcome.verified"
   | "outcome.created"
   | "opportunity.matched"
   | "opportunity.applied"
   | "escrow.locked"
   | "escrow.released"
   | "institution.verified"
   | "skill.endorsed"
   | "credential.verified"
   | "plugin.installed"
   | "plugin.uninstalled"
   | "workflow.triggered"
   | "workflow.completed";
 
 export interface PlatformEvent {
   id: string;
   type: PlatformEventType;
   timestamp: Date;
   source: string;
   actorId: string | null;
   payload: Record<string, unknown>;
   metadata: {
     version: string;
     correlationId?: string;
     causationId?: string;
   };
 }
 
 export interface EventSubscription {
   id: string;
   eventTypes: PlatformEventType[];
   handler: (event: PlatformEvent) => Promise<void>;
   filter?: (event: PlatformEvent) => boolean;
   priority: number;
   active: boolean;
 }
 
 export interface Plugin {
   id: string;
   name: string;
   version: string;
   author: string;
   description: string;
   category: "analytics" | "integration" | "workflow" | "ui" | "governance" | "ai";
   permissions: PluginPermission[];
   eventSubscriptions: PlatformEventType[];
   endpoints: PluginEndpoint[];
   status: "active" | "inactive" | "error" | "pending_approval";
   installedAt: Date;
   config: Record<string, unknown>;
 }
 
 export type PluginPermission =
   | "read:users"
   | "read:deals"
   | "read:outcomes"
   | "write:deals"
   | "write:outcomes"
   | "send:notifications"
   | "access:ai"
   | "manage:workflows";
 
 export interface PluginEndpoint {
   path: string;
   method: "GET" | "POST" | "PUT" | "DELETE";
   description: string;
   requiresAuth: boolean;
 }
 
 export interface Workflow {
   id: string;
   name: string;
   description: string;
   trigger: WorkflowTrigger;
   steps: WorkflowStep[];
   status: "active" | "paused" | "draft";
   executionCount: number;
   lastExecutedAt: Date | null;
   createdBy: string;
   createdAt: Date;
 }
 
 export interface WorkflowTrigger {
   type: "event" | "schedule" | "manual" | "condition";
   config: Record<string, unknown>;
 }
 
 export interface WorkflowStep {
   id: string;
   order: number;
   type: "action" | "condition" | "delay" | "parallel" | "plugin_call";
   config: Record<string, unknown>;
   onSuccess?: string; // next step id
   onFailure?: string; // failure step id
 }
 
 export interface APIEndpoint {
   path: string;
   method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
   description: string;
   requestSchema: Record<string, unknown>;
   responseSchema: Record<string, unknown>;
   rateLimit: { requests: number; windowMs: number };
   requiresAuth: boolean;
   scopes: string[];
 }
 
 export interface Webhook {
   id: string;
   name: string;
   url: string;
   events: PlatformEventType[];
   secret: string;
   active: boolean;
   createdAt: Date;
   lastTriggeredAt: Date | null;
   failureCount: number;
 }
 
 // ============================================
 // EVENT BUS IMPLEMENTATION
 // ============================================
 
 class EventBus {
   private subscriptions: Map<string, EventSubscription> = new Map();
   private eventHistory: PlatformEvent[] = [];
   private maxHistorySize = 1000;
 
   subscribe(subscription: Omit<EventSubscription, "id">): string {
     const id = crypto.randomUUID();
     this.subscriptions.set(id, { ...subscription, id });
     return id;
   }
 
   unsubscribe(subscriptionId: string): boolean {
     return this.subscriptions.delete(subscriptionId);
   }
 
   async emit(event: Omit<PlatformEvent, "id" | "timestamp">): Promise<void> {
     const fullEvent: PlatformEvent = {
       ...event,
       id: crypto.randomUUID(),
       timestamp: new Date(),
     };
 
     // Store in history
     this.eventHistory.push(fullEvent);
     if (this.eventHistory.length > this.maxHistorySize) {
       this.eventHistory.shift();
     }
 
     // Find matching subscriptions
     const matchingSubscriptions = Array.from(this.subscriptions.values())
       .filter(sub => sub.active && sub.eventTypes.includes(event.type))
       .filter(sub => !sub.filter || sub.filter(fullEvent))
       .sort((a, b) => b.priority - a.priority);
 
     // Execute handlers
     for (const subscription of matchingSubscriptions) {
       try {
         await subscription.handler(fullEvent);
       } catch (error) {
         console.error(`Event handler error for ${subscription.id}:`, error);
       }
     }
   }
 
   getHistory(filter?: { type?: PlatformEventType; since?: Date }): PlatformEvent[] {
     let history = [...this.eventHistory];
     
     if (filter?.type) {
       history = history.filter(e => e.type === filter.type);
     }
     if (filter?.since) {
       history = history.filter(e => e.timestamp >= filter.since);
     }
     
     return history;
   }
 }
 
 // Singleton event bus
 const eventBus = new EventBus();
 
 // ============================================
 // HOOK IMPLEMENTATION
 // ============================================
 
 export function useExtensibilitySystem() {
   const { user } = useAuth();
   const [plugins, setPlugins] = useState<Plugin[]>([]);
   const [workflows, setWorkflows] = useState<Workflow[]>([]);
   const [webhooks, setWebhooks] = useState<Webhook[]>([]);
   const [loading, setLoading] = useState(false);
 
   // Subscribe to events
   const subscribeToEvents = useCallback((
     eventTypes: PlatformEventType[],
     handler: (event: PlatformEvent) => Promise<void>,
     options?: { filter?: (event: PlatformEvent) => boolean; priority?: number }
   ): string => {
     return eventBus.subscribe({
       eventTypes,
       handler,
       filter: options?.filter,
       priority: options?.priority || 0,
       active: true,
     });
   }, []);
 
   // Unsubscribe from events
   const unsubscribeFromEvents = useCallback((subscriptionId: string): void => {
     eventBus.unsubscribe(subscriptionId);
   }, []);
 
   // Emit event
   const emitEvent = useCallback(async (
     type: PlatformEventType,
     payload: Record<string, unknown>,
     options?: { correlationId?: string; causationId?: string }
   ): Promise<void> => {
     await eventBus.emit({
       type,
       source: "platform",
       actorId: user?.id || null,
       payload,
       metadata: {
         version: "1.0",
         correlationId: options?.correlationId,
         causationId: options?.causationId,
       },
     });
   }, [user]);
 
   // Get event history
   const getEventHistory = useCallback((filter?: { type?: PlatformEventType; since?: Date }) => {
     return eventBus.getHistory(filter);
   }, []);
 
   // Install plugin
   const installPlugin = useCallback(async (
     pluginData: Omit<Plugin, "id" | "status" | "installedAt">
   ): Promise<{ success: boolean; pluginId?: string }> => {
     const plugin: Plugin = {
       ...pluginData,
       id: crypto.randomUUID(),
       status: "pending_approval",
       installedAt: new Date(),
     };
 
     setPlugins(prev => [...prev, plugin]);
 
     // Emit installation event
     await emitEvent("plugin.installed", { pluginId: plugin.id, pluginName: plugin.name });
 
     return { success: true, pluginId: plugin.id };
   }, [emitEvent]);
 
   // Activate/deactivate plugin
   const togglePlugin = useCallback(async (
     pluginId: string,
     active: boolean
   ): Promise<{ success: boolean }> => {
     setPlugins(prev => prev.map(p => 
       p.id === pluginId ? { ...p, status: active ? "active" : "inactive" } : p
     ));
     return { success: true };
   }, []);
 
   // Uninstall plugin
   const uninstallPlugin = useCallback(async (pluginId: string): Promise<{ success: boolean }> => {
     const plugin = plugins.find(p => p.id === pluginId);
     if (plugin) {
       await emitEvent("plugin.uninstalled", { pluginId, pluginName: plugin.name });
     }
     setPlugins(prev => prev.filter(p => p.id !== pluginId));
     return { success: true };
   }, [plugins, emitEvent]);
 
   // Create workflow
   const createWorkflow = useCallback(async (
     workflowData: Omit<Workflow, "id" | "executionCount" | "lastExecutedAt" | "createdAt" | "createdBy">
   ): Promise<{ success: boolean; workflowId?: string }> => {
     if (!user) return { success: false };
 
     const workflow: Workflow = {
       ...workflowData,
       id: crypto.randomUUID(),
       executionCount: 0,
       lastExecutedAt: null,
       createdBy: user.id,
       createdAt: new Date(),
     };
 
     setWorkflows(prev => [...prev, workflow]);
     return { success: true, workflowId: workflow.id };
   }, [user]);
 
   // Execute workflow manually
   const executeWorkflow = useCallback(async (
     workflowId: string,
     input?: Record<string, unknown>
   ): Promise<{ success: boolean; output?: Record<string, unknown> }> => {
     const workflow = workflows.find(w => w.id === workflowId);
     if (!workflow || workflow.status !== "active") {
       return { success: false };
     }
 
     await emitEvent("workflow.triggered", { workflowId, input });
 
     // Simulate workflow execution
     setWorkflows(prev => prev.map(w => 
       w.id === workflowId 
         ? { ...w, executionCount: w.executionCount + 1, lastExecutedAt: new Date() }
         : w
     ));
 
     await emitEvent("workflow.completed", { workflowId, success: true });
 
     return { success: true, output: {} };
   }, [workflows, emitEvent]);
 
   // Register webhook
   const registerWebhook = useCallback(async (
     name: string,
     url: string,
     events: PlatformEventType[]
   ): Promise<{ success: boolean; webhookId?: string; secret?: string }> => {
     const secret = crypto.randomUUID();
     const webhook: Webhook = {
       id: crypto.randomUUID(),
       name,
       url,
       events,
       secret,
       active: true,
       createdAt: new Date(),
       lastTriggeredAt: null,
       failureCount: 0,
     };
 
     setWebhooks(prev => [...prev, webhook]);
 
     // Subscribe webhook to events
     subscribeToEvents(events, async (event) => {
       try {
         // In production, this would make an HTTP call
         console.log(`Webhook ${webhook.id} triggered for ${event.type}`);
         setWebhooks(prev => prev.map(w => 
           w.id === webhook.id ? { ...w, lastTriggeredAt: new Date() } : w
         ));
       } catch (error) {
         setWebhooks(prev => prev.map(w => 
           w.id === webhook.id ? { ...w, failureCount: w.failureCount + 1 } : w
         ));
       }
     });
 
     return { success: true, webhookId: webhook.id, secret };
   }, [subscribeToEvents]);
 
   // Delete webhook
   const deleteWebhook = useCallback(async (webhookId: string): Promise<{ success: boolean }> => {
     setWebhooks(prev => prev.filter(w => w.id !== webhookId));
     return { success: true };
   }, []);
 
   // API Registry (static definition of available endpoints)
   const apiRegistry: APIEndpoint[] = [
     {
       path: "/api/v1/users/{id}",
       method: "GET",
       description: "Get user profile",
       requestSchema: {},
       responseSchema: { type: "object", properties: { id: { type: "string" } } },
       rateLimit: { requests: 100, windowMs: 60000 },
       requiresAuth: true,
       scopes: ["read:users"],
     },
     {
       path: "/api/v1/deals",
       method: "POST",
       description: "Create a new deal",
       requestSchema: { type: "object", required: ["title", "parties"] },
       responseSchema: { type: "object", properties: { dealId: { type: "string" } } },
       rateLimit: { requests: 20, windowMs: 60000 },
       requiresAuth: true,
       scopes: ["write:deals"],
     },
     {
       path: "/api/v1/outcomes",
       method: "GET",
       description: "List outcomes",
       requestSchema: {},
       responseSchema: { type: "array" },
       rateLimit: { requests: 100, windowMs: 60000 },
       requiresAuth: true,
       scopes: ["read:outcomes"],
     },
   ];
 
   return {
     plugins,
     workflows,
     webhooks,
     apiRegistry,
     loading,
     // Events
     subscribeToEvents,
     unsubscribeFromEvents,
     emitEvent,
     getEventHistory,
     // Plugins
     installPlugin,
     togglePlugin,
     uninstallPlugin,
     // Workflows
     createWorkflow,
     executeWorkflow,
     // Webhooks
     registerWebhook,
     deleteWebhook,
   };
 }
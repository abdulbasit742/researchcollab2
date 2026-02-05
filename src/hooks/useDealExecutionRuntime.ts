 import { useState, useCallback, useMemo } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { toast } from "sonner";
 
 // ============================================
 // DEAL EXECUTION RUNTIME
 // Treats deals as executable programs with
 // state machines, simulation, and templates
 // ============================================
 
 // State Machine States
 export type DealExecutionState =
   | "draft"
   | "negotiating"
   | "terms_agreed"
   | "escrow_pending"
   | "escrow_locked"
   | "execution_started"
   | "milestone_active"
   | "milestone_submitted"
   | "milestone_review"
   | "milestone_approved"
   | "milestone_disputed"
   | "dispute_mediation"
   | "dispute_arbitration"
   | "deal_completed"
   | "deal_cancelled"
   | "deal_terminated";
 
 // State Transitions
 export interface StateTransition {
   from: DealExecutionState;
   to: DealExecutionState;
   trigger: string;
   guard?: (context: DealContext) => boolean;
   effect?: (context: DealContext) => Promise<void>;
 }
 
 // Deal Context (runtime data)
 export interface DealContext {
   dealId: string;
   currentState: DealExecutionState;
   parties: DealParty[];
   scope: ScopeObject;
   milestones: MilestoneObject[];
   escrow: EscrowObject;
   timeline: TimelineEvent[];
   metadata: Record<string, unknown>;
 }
 
 export interface DealParty {
   userId: string;
   role: "initiator" | "executor" | "funder" | "mediator" | "arbitrator";
   trustAtStart: number;
   agreedAt: Date | null;
   signatureHash?: string;
 }
 
 export interface ScopeObject {
   description: string;
   deliverables: DeliverableSpec[];
   constraints: string[];
   successCriteria: SuccessCriterion[];
   exclusions: string[];
 }
 
 export interface DeliverableSpec {
   id: string;
   title: string;
   description: string;
   acceptanceCriteria: string[];
   linkedMilestoneId: string | null;
 }
 
 export interface SuccessCriterion {
   id: string;
   description: string;
   measurable: boolean;
   verificationMethod: "self_report" | "peer_review" | "automated" | "third_party";
 }
 
 export interface MilestoneObject {
   id: string;
   title: string;
   order: number;
   status: "pending" | "active" | "submitted" | "approved" | "disputed" | "completed";
   dueDate: Date;
   paymentAmount: number;
   paymentConditions: PaymentConditionSpec[];
   evidence: EvidenceRecord[];
   autoReleaseAfterDays: number | null;
 }
 
 export interface PaymentConditionSpec {
   type: "approval" | "timeout" | "automatic" | "escrow_release";
   condition: string;
   amount: number;
   fulfilled: boolean;
 }
 
 export interface EvidenceRecord {
   id: string;
   type: "file" | "link" | "text" | "screenshot";
   content: string;
   submittedAt: Date;
   submittedBy: string;
 }
 
 export interface EscrowObject {
   totalAmount: number;
   currency: string;
   lockedAmount: number;
   releasedAmount: number;
   pendingReleases: PendingRelease[];
   transactions: EscrowTransaction[];
 }
 
 export interface PendingRelease {
   milestoneId: string;
   amount: number;
   releaseDate: Date;
   status: "pending" | "approved" | "released" | "disputed";
 }
 
 export interface EscrowTransaction {
   id: string;
   type: "lock" | "release" | "refund" | "dispute_hold";
   amount: number;
   timestamp: Date;
   reason: string;
 }
 
 export interface TimelineEvent {
   id: string;
   state: DealExecutionState;
   timestamp: Date;
   actorId: string;
   action: string;
   metadata: Record<string, unknown>;
 }
 
 export interface DisputeBranch {
   trigger: string;
   escalationPath: ("auto_mediation" | "peer_mediation" | "admin_arbitration" | "external_arbitration")[];
   timeoutDays: number;
   fallbackAction: "refund" | "release" | "split" | "hold";
 }
 
 export interface SimulationResult {
   scenarioName: string;
   path: DealExecutionState[];
   duration: number;
   outcome: "success" | "dispute" | "cancelled" | "timeout";
   financialOutcome: { party: string; amount: number }[];
   riskScore: number;
   recommendations: string[];
 }
 
 export interface DealTemplate {
   id: string;
   name: string;
   description: string;
   category: string;
   scope: Partial<ScopeObject>;
   milestoneTemplates: Partial<MilestoneObject>[];
   defaultDuration: number;
   usageCount: number;
 }
 
 // ============================================
 // STATE MACHINE DEFINITION
 // ============================================
 
 const STATE_TRANSITIONS: StateTransition[] = [
   // Draft → Negotiating
   { from: "draft", to: "negotiating", trigger: "start_negotiation" },
   
   // Negotiating → Terms Agreed
   { from: "negotiating", to: "terms_agreed", trigger: "all_parties_agree" },
   { from: "negotiating", to: "draft", trigger: "return_to_draft" },
   { from: "negotiating", to: "deal_cancelled", trigger: "cancel" },
   
   // Terms Agreed → Escrow
   { from: "terms_agreed", to: "escrow_pending", trigger: "request_escrow" },
   { from: "terms_agreed", to: "negotiating", trigger: "renegotiate" },
   
   // Escrow Flow
   { from: "escrow_pending", to: "escrow_locked", trigger: "escrow_funded" },
   { from: "escrow_pending", to: "deal_cancelled", trigger: "funding_timeout" },
   
   // Execution Flow
   { from: "escrow_locked", to: "execution_started", trigger: "start_execution" },
   { from: "execution_started", to: "milestone_active", trigger: "activate_milestone" },
   
   // Milestone Flow
   { from: "milestone_active", to: "milestone_submitted", trigger: "submit_work" },
   { from: "milestone_submitted", to: "milestone_review", trigger: "start_review" },
   { from: "milestone_review", to: "milestone_approved", trigger: "approve" },
   { from: "milestone_review", to: "milestone_disputed", trigger: "dispute" },
   { from: "milestone_approved", to: "milestone_active", trigger: "next_milestone" },
   { from: "milestone_approved", to: "deal_completed", trigger: "final_milestone" },
   
   // Dispute Flow
   { from: "milestone_disputed", to: "dispute_mediation", trigger: "escalate_mediation" },
   { from: "dispute_mediation", to: "milestone_approved", trigger: "resolve_approve" },
   { from: "dispute_mediation", to: "dispute_arbitration", trigger: "escalate_arbitration" },
   { from: "dispute_arbitration", to: "deal_completed", trigger: "arbitration_complete" },
   { from: "dispute_arbitration", to: "deal_terminated", trigger: "arbitration_terminate" },
   
   // Cancellation
   { from: "milestone_active", to: "deal_cancelled", trigger: "mutual_cancel" },
   { from: "milestone_disputed", to: "deal_terminated", trigger: "unresolvable" },
 ];
 
 // ============================================
 // HOOK IMPLEMENTATION
 // ============================================
 
 export function useDealExecutionRuntime(dealId?: string) {
   const { user } = useAuth();
   const [context, setContext] = useState<DealContext | null>(null);
   const [loading, setLoading] = useState(false);
   const [templates, setTemplates] = useState<DealTemplate[]>([]);
 
   // Initialize new deal
   const initializeDeal = useCallback(async (
     parties: Omit<DealParty, "agreedAt">[],
     scope: ScopeObject,
     milestones: Omit<MilestoneObject, "status" | "evidence">[]
   ): Promise<string> => {
     const newDealId = crypto.randomUUID();
     
     const initialContext: DealContext = {
       dealId: newDealId,
       currentState: "draft",
       parties: parties.map(p => ({ ...p, agreedAt: null })),
       scope,
       milestones: milestones.map(m => ({
         ...m,
         status: "pending",
         evidence: [],
       })),
       escrow: {
         totalAmount: milestones.reduce((sum, m) => sum + m.paymentAmount, 0),
         currency: "USD",
         lockedAmount: 0,
         releasedAmount: 0,
         pendingReleases: [],
         transactions: [],
       },
       timeline: [{
         id: crypto.randomUUID(),
         state: "draft",
         timestamp: new Date(),
         actorId: user?.id || "system",
         action: "deal_created",
         metadata: {},
       }],
       metadata: {},
     };
 
     setContext(initialContext);
     return newDealId;
   }, [user]);
 
   // Transition to new state
   const transition = useCallback(async (
     trigger: string,
     metadata?: Record<string, unknown>
   ): Promise<{ success: boolean; newState?: DealExecutionState; error?: string }> => {
     if (!context || !user) {
       return { success: false, error: "No active deal or user" };
     }
 
     const validTransition = STATE_TRANSITIONS.find(
       t => t.from === context.currentState && t.trigger === trigger
     );
 
     if (!validTransition) {
       return { 
         success: false, 
         error: `Invalid transition: ${trigger} from ${context.currentState}` 
       };
     }
 
     // Check guard condition
     if (validTransition.guard && !validTransition.guard(context)) {
       return { success: false, error: "Guard condition not met" };
     }
 
     // Execute effect if present
     if (validTransition.effect) {
       await validTransition.effect(context);
     }
 
     // Update context
     const newContext: DealContext = {
       ...context,
       currentState: validTransition.to,
       timeline: [
         ...context.timeline,
         {
           id: crypto.randomUUID(),
           state: validTransition.to,
           timestamp: new Date(),
           actorId: user.id,
           action: trigger,
           metadata: metadata || {},
         },
       ],
     };
 
     setContext(newContext);
     toast.success(`Deal transitioned to ${validTransition.to}`);
 
     return { success: true, newState: validTransition.to };
   }, [context, user]);
 
   // Get available transitions from current state
   const availableTransitions = useMemo(() => {
     if (!context) return [];
     return STATE_TRANSITIONS
       .filter(t => t.from === context.currentState)
       .map(t => ({ trigger: t.trigger, targetState: t.to }));
   }, [context]);
 
   // Simulate deal execution (scenario planning)
   const simulateDeal = useCallback(async (
     scenario: "optimistic" | "pessimistic" | "realistic" | "dispute"
   ): Promise<SimulationResult> => {
     if (!context) {
       return {
         scenarioName: scenario,
         path: [],
         duration: 0,
         outcome: "cancelled",
         financialOutcome: [],
         riskScore: 100,
         recommendations: ["Initialize deal first"],
       };
     }
 
     const scenarios: Record<string, SimulationResult> = {
       optimistic: {
         scenarioName: "Optimistic",
         path: ["draft", "negotiating", "terms_agreed", "escrow_locked", "execution_started", "milestone_active", "milestone_submitted", "milestone_approved", "deal_completed"],
         duration: context.milestones.reduce((sum, m) => sum + 7, 0),
         outcome: "success",
         financialOutcome: context.parties.map(p => ({
           party: p.userId,
           amount: p.role === "executor" ? context.escrow.totalAmount : 0,
         })),
         riskScore: 15,
         recommendations: ["All milestones completed on time", "Consider adding performance bonus clause"],
       },
       pessimistic: {
         scenarioName: "Pessimistic",
         path: ["draft", "negotiating", "terms_agreed", "escrow_locked", "execution_started", "milestone_active", "milestone_submitted", "milestone_disputed", "dispute_arbitration", "deal_terminated"],
         duration: context.milestones.reduce((sum, m) => sum + 30, 0),
         outcome: "dispute",
         financialOutcome: context.parties.map(p => ({
           party: p.userId,
           amount: p.role === "funder" ? context.escrow.totalAmount * 0.5 : context.escrow.totalAmount * 0.5,
         })),
         riskScore: 75,
         recommendations: ["Add clearer success criteria", "Include mediation clause", "Reduce milestone sizes"],
       },
       realistic: {
         scenarioName: "Realistic",
         path: ["draft", "negotiating", "terms_agreed", "escrow_locked", "execution_started", "milestone_active", "milestone_submitted", "milestone_review", "milestone_approved", "deal_completed"],
         duration: context.milestones.reduce((sum, m) => sum + 14, 0),
         outcome: "success",
         financialOutcome: context.parties.map(p => ({
           party: p.userId,
           amount: p.role === "executor" ? context.escrow.totalAmount : 0,
         })),
         riskScore: 35,
         recommendations: ["Expect 1-2 revision cycles", "Build in buffer time for reviews"],
       },
       dispute: {
         scenarioName: "Dispute Path",
         path: ["milestone_active", "milestone_submitted", "milestone_disputed", "dispute_mediation", "milestone_approved", "deal_completed"],
         duration: context.milestones.reduce((sum, m) => sum + 21, 0),
         outcome: "success",
         financialOutcome: context.parties.map(p => ({
           party: p.userId,
           amount: p.role === "executor" ? context.escrow.totalAmount * 0.9 : 0,
         })),
         riskScore: 50,
         recommendations: ["Mediation typically resolves 80% of disputes", "Document everything"],
       },
     };
 
     return scenarios[scenario] || scenarios.realistic;
   }, [context]);
 
   // Submit milestone evidence
   const submitMilestoneEvidence = useCallback(async (
     milestoneId: string,
     evidence: Omit<EvidenceRecord, "id" | "submittedAt" | "submittedBy">
   ): Promise<{ success: boolean }> => {
     if (!context || !user) return { success: false };
 
     const newEvidence: EvidenceRecord = {
       ...evidence,
       id: crypto.randomUUID(),
       submittedAt: new Date(),
       submittedBy: user.id,
     };
 
     setContext({
       ...context,
       milestones: context.milestones.map(m =>
         m.id === milestoneId
           ? { ...m, evidence: [...m.evidence, newEvidence] }
           : m
       ),
     });
 
     return { success: true };
   }, [context, user]);
 
   // Approve milestone
   const approveMilestone = useCallback(async (
     milestoneId: string
   ): Promise<{ success: boolean }> => {
     if (!context || !user) return { success: false };
 
     setContext({
       ...context,
       milestones: context.milestones.map(m =>
         m.id === milestoneId ? { ...m, status: "approved" } : m
       ),
       escrow: {
         ...context.escrow,
         pendingReleases: [
           ...context.escrow.pendingReleases,
           {
             milestoneId,
             amount: context.milestones.find(m => m.id === milestoneId)?.paymentAmount || 0,
             releaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
             status: "pending",
           },
         ],
       },
     });
 
     toast.success("Milestone approved! Payment will be released in 7 days.");
     return { success: true };
   }, [context, user]);
 
   // Create deal template from current deal
   const saveAsTemplate = useCallback(async (
     name: string,
     description: string,
     category: string
   ): Promise<{ success: boolean; templateId?: string }> => {
     if (!context) return { success: false };
 
     const template: DealTemplate = {
       id: crypto.randomUUID(),
       name,
       description,
       category,
       scope: context.scope,
       milestoneTemplates: context.milestones.map(m => ({
         title: m.title,
         order: m.order,
         paymentAmount: m.paymentAmount,
         autoReleaseAfterDays: m.autoReleaseAfterDays,
       })),
       defaultDuration: 30,
       usageCount: 0,
     };
 
     setTemplates(prev => [...prev, template]);
     toast.success("Deal saved as template");
 
     return { success: true, templateId: template.id };
   }, [context]);
 
   // Load from template
   const loadFromTemplate = useCallback(async (templateId: string): Promise<{ success: boolean }> => {
     const template = templates.find(t => t.id === templateId);
     if (!template) return { success: false };
 
     // Initialize deal with template data
     await initializeDeal(
       [],
       template.scope as ScopeObject,
       template.milestoneTemplates.map((m, i) => ({
         id: crypto.randomUUID(),
         title: m.title || `Milestone ${i + 1}`,
         order: m.order || i,
         dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
         paymentAmount: m.paymentAmount || 0,
         paymentConditions: [],
         autoReleaseAfterDays: m.autoReleaseAfterDays || 7,
       }))
     );
 
     return { success: true };
   }, [templates, initializeDeal]);
 
   // Get audit trail
   const getAuditTrail = useCallback(() => {
     if (!context) return [];
     return context.timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
   }, [context]);
 
   return {
     context,
     loading,
     templates,
     availableTransitions,
     initializeDeal,
     transition,
     simulateDeal,
     submitMilestoneEvidence,
     approveMilestone,
     saveAsTemplate,
     loadFromTemplate,
     getAuditTrail,
   };
 }
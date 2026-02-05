 // ============================================
 // UNIVERSAL PROFESSIONAL OBJECT MODEL (UPOM)
 // The foundational data layer for professional infrastructure
 // ============================================
 
 // Base object interface that ALL professional objects implement
 export interface UPOMObject {
   id: string;
   objectType: UPOMObjectType;
   ownerId: string | null;
   version: number;
   createdAt: Date;
   updatedAt: Date;
   lifecycleState: LifecycleState;
   visibility: VisibilityLevel;
   trustSignals: TrustSignal[];
   auditHistory: AuditEntry[];
 }
 
 export type UPOMObjectType =
   | "person"
   | "skill"
   | "credential"
   | "outcome"
   | "deal"
   | "project"
   | "research_artifact"
   | "opportunity"
   | "institution"
   | "policy"
   | "event"
   | "learning_unit";
 
 export type LifecycleState =
   | "draft"
   | "active"
   | "pending_verification"
   | "verified"
   | "archived"
   | "suspended"
   | "deprecated";
 
 export type VisibilityLevel =
   | "private"
   | "connections_only"
   | "institution_only"
   | "public"
   | "system";
 
 export interface TrustSignal {
   type: "peer_verification" | "institutional" | "outcome_based" | "behavioral" | "temporal";
   value: number;
   source: string;
   timestamp: Date;
   weight: number;
 }
 
 export interface AuditEntry {
   id: string;
   action: string;
   actorId: string;
   timestamp: Date;
   details: Record<string, unknown>;
   reversible: boolean;
 }
 
 // ============================================
 // SPECIFIC OBJECT TYPES
 // ============================================
 
 export interface PersonObject extends UPOMObject {
   objectType: "person";
   displayName: string;
   email: string;
   skills: SkillReference[];
   credentials: CredentialReference[];
   institutionAffiliations: InstitutionAffiliation[];
   trustScore: number;
   trustTier: "platinum" | "gold" | "silver" | "bronze" | "unverified";
 }
 
 export interface SkillObject extends UPOMObject {
   objectType: "skill";
   name: string;
   category: string;
   proficiencyLevel: number;
   evidenceCount: number;
   lastDemonstrated: Date | null;
   endorsements: SkillEndorsement[];
   decayRate: number;
 }
 
 export interface CredentialObject extends UPOMObject {
   objectType: "credential";
   name: string;
   issuer: string;
   issuerId: string | null;
   issuedAt: Date;
   expiresAt: Date | null;
   verificationMethod: "institutional" | "peer" | "self_reported" | "blockchain";
   verificationStatus: "verified" | "pending" | "expired" | "revoked";
 }
 
 export interface OutcomeObject extends UPOMObject {
   objectType: "outcome";
   title: string;
   description: string;
   outcomeType: "project_completion" | "deal_success" | "research_publication" | "milestone_delivery" | "collaboration_result";
   participants: ParticipantRole[];
   inputs: ObjectReference[];
   results: ResultMetric[];
   impact: ImpactAssessment;
   verificationStatus: "verified" | "disputed" | "pending" | "unverified";
 }
 
 export interface DealObject extends UPOMObject {
   objectType: "deal";
   title: string;
   parties: PartyInfo[];
   scope: ScopeDefinition;
   milestones: MilestoneState[];
   currentState: DealState;
   paymentConditions: PaymentCondition[];
   disputeBranches: DisputeBranch[];
 }
 
 export interface ProjectObject extends UPOMObject {
   objectType: "project";
   title: string;
   description: string;
   domain: string;
   teamMembers: TeamMember[];
   deliverables: Deliverable[];
   timeline: ProjectTimeline;
   linkedDeals: string[];
   linkedOutcomes: string[];
 }
 
 export interface InstitutionObject extends UPOMObject {
   objectType: "institution";
   name: string;
   institutionType: "university" | "research_lab" | "company" | "government" | "ngo" | "industry_body";
   countryCode: string;
   trustAnchorLevel: number;
   members: MemberRecord[];
   policies: string[];
   dataResidencyRules: DataResidencyRule[];
 }
 
 export interface OpportunityObject extends UPOMObject {
   objectType: "opportunity";
   title: string;
   opportunityType: "project" | "grant" | "collaboration" | "job" | "research";
   requirements: RequirementSpec[];
   fitScore: number;
   successProbability: number;
   readinessIndicators: ReadinessIndicator[];
   expiresAt: Date | null;
 }
 
 export interface ResearchArtifactObject extends UPOMObject {
   objectType: "research_artifact";
   artifactType: "dataset" | "code" | "methodology" | "publication" | "preprint" | "notebook";
   title: string;
   authors: AuthorContribution[];
   provenance: ProvenanceLink[];
   reproducibilityScore: number;
   openScienceBadges: string[];
 }
 
 // ============================================
 // SUPPORTING TYPES
 // ============================================
 
 export interface SkillReference {
   skillId: string;
   proficiency: number;
   verified: boolean;
 }
 
 export interface CredentialReference {
   credentialId: string;
   isPrimary: boolean;
 }
 
 export interface InstitutionAffiliation {
   institutionId: string;
   role: string;
   startDate: Date;
   endDate: Date | null;
   verified: boolean;
 }
 
 export interface SkillEndorsement {
   endorserId: string;
   endorserTrustLevel: number;
   context: string;
   timestamp: Date;
 }
 
 export interface ParticipantRole {
   personId: string;
   role: string;
   contributionWeight: number;
 }
 
 export interface ObjectReference {
   objectId: string;
   objectType: UPOMObjectType;
   relationship: string;
 }
 
 export interface ResultMetric {
   name: string;
   value: number | string;
   unit: string;
   verified: boolean;
 }
 
 export interface ImpactAssessment {
   category: "academic" | "commercial" | "social" | "institutional";
   score: number;
   evidence: string[];
 }
 
 export interface PartyInfo {
   personId: string;
   role: "initiator" | "executor" | "funder" | "mediator";
   trustAtStart: number;
 }
 
 export interface ScopeDefinition {
   description: string;
   deliverables: string[];
   constraints: string[];
   successCriteria: string[];
 }
 
 export interface MilestoneState {
   id: string;
   title: string;
   status: "pending" | "in_progress" | "submitted" | "approved" | "disputed" | "completed";
   dueDate: Date;
   paymentAmount: number;
   evidence: string[];
 }
 
 export type DealState =
   | "draft"
   | "negotiating"
   | "agreed"
   | "escrow_locked"
   | "in_progress"
   | "under_review"
   | "disputed"
   | "completed"
   | "cancelled"
   | "terminated";
 
 export interface PaymentCondition {
   milestoneId: string;
   amount: number;
   currency: string;
   releaseCondition: string;
   autoReleaseAfterDays: number | null;
 }
 
 export interface DisputeBranch {
   trigger: string;
   escalationPath: string[];
   resolutionOptions: string[];
 }
 
 export interface TeamMember {
   personId: string;
   role: string;
   joinedAt: Date;
   active: boolean;
 }
 
 export interface Deliverable {
   id: string;
   title: string;
   status: "planned" | "in_progress" | "completed" | "blocked";
   artifacts: string[];
 }
 
 export interface ProjectTimeline {
   startDate: Date;
   endDate: Date | null;
   phases: { name: string; startDate: Date; endDate: Date }[];
 }
 
 export interface MemberRecord {
   personId: string;
   role: string;
   department: string | null;
   since: Date;
 }
 
 export interface DataResidencyRule {
   dataType: string;
   allowedRegions: string[];
   encryption: boolean;
 }
 
 export interface RequirementSpec {
   type: "skill" | "credential" | "trust_level" | "experience";
   value: string;
   weight: number;
   required: boolean;
 }
 
 export interface ReadinessIndicator {
   dimension: string;
   score: number;
   gaps: string[];
 }
 
 export interface AuthorContribution {
   personId: string;
   contributionType: string;
   percentage: number;
 }
 
 export interface ProvenanceLink {
   sourceId: string;
   sourceType: UPOMObjectType;
   relationship: "derived_from" | "extends" | "cites" | "replicates";
 }
 
 // ============================================
 // OBJECT GRAPH TYPES
 // ============================================
 
 export interface ObjectRelationship {
   id: string;
   sourceId: string;
   sourceType: UPOMObjectType;
   targetId: string;
   targetType: UPOMObjectType;
   relationshipType: RelationshipType;
   strength: number;
   createdAt: Date;
   metadata: Record<string, unknown>;
 }
 
 export type RelationshipType =
   | "created_by"
   | "owns"
   | "participated_in"
   | "resulted_in"
   | "requires"
   | "enables"
   | "verifies"
   | "endorses"
   | "employs"
   | "collaborates_with"
   | "mentors"
   | "supervises";
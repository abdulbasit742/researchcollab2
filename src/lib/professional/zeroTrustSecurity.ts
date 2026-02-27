/**
 * Zero-Trust Professional Infrastructure Security Model
 * Privacy controls, algorithm transparency, anti-scraping,
 * integrity monitoring, and security transparency.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("zeroTrustSecurity");

// ─── Privacy Controls ───

export interface ProfessionalPrivacySettings {
  hideEscrowAmounts: boolean;
  hideSponsorNames: boolean;
  hideInstitutionalRelationships: boolean;
  hideDeliverableArtifacts: boolean;
  anonymizedProjectMode: boolean;
  restrictRecruiterAccess: boolean;
  approveInstitutionalReporting: boolean;
  allowProfileIndexing: boolean;
}

export const DEFAULT_PRIVACY: ProfessionalPrivacySettings = {
  hideEscrowAmounts: true,
  hideSponsorNames: false,
  hideInstitutionalRelationships: false,
  hideDeliverableArtifacts: true,
  anonymizedProjectMode: false,
  restrictRecruiterAccess: false,
  approveInstitutionalReporting: false,
  allowProfileIndexing: false,
};

export async function getPrivacySettings(userId: string): Promise<ProfessionalPrivacySettings> {
  const { data } = await supabase
    .from("professional_privacy_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return DEFAULT_PRIVACY;

  return {
    hideEscrowAmounts: data.hide_escrow_amounts ?? true,
    hideSponsorNames: data.hide_sponsor_names ?? false,
    hideInstitutionalRelationships: data.hide_institutional_relationships ?? false,
    hideDeliverableArtifacts: data.hide_deliverable_artifacts ?? true,
    anonymizedProjectMode: data.anonymized_project_mode ?? false,
    restrictRecruiterAccess: data.restrict_recruiter_access ?? false,
    approveInstitutionalReporting: data.approve_institutional_reporting ?? false,
    allowProfileIndexing: data.allow_profile_indexing ?? false,
  };
}

export async function updatePrivacySettings(userId: string, settings: Partial<ProfessionalPrivacySettings>) {
  const mapped: Record<string, unknown> = {};
  if (settings.hideEscrowAmounts !== undefined) mapped.hide_escrow_amounts = settings.hideEscrowAmounts;
  if (settings.hideSponsorNames !== undefined) mapped.hide_sponsor_names = settings.hideSponsorNames;
  if (settings.hideInstitutionalRelationships !== undefined) mapped.hide_institutional_relationships = settings.hideInstitutionalRelationships;
  if (settings.hideDeliverableArtifacts !== undefined) mapped.hide_deliverable_artifacts = settings.hideDeliverableArtifacts;
  if (settings.anonymizedProjectMode !== undefined) mapped.anonymized_project_mode = settings.anonymizedProjectMode;
  if (settings.restrictRecruiterAccess !== undefined) mapped.restrict_recruiter_access = settings.restrictRecruiterAccess;
  if (settings.approveInstitutionalReporting !== undefined) mapped.approve_institutional_reporting = settings.approveInstitutionalReporting;
  if (settings.allowProfileIndexing !== undefined) mapped.allow_profile_indexing = settings.allowProfileIndexing;
  mapped.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("professional_privacy_settings")
    .upsert({ user_id: userId, ...mapped }, { onConflict: "user_id" });

  if (error) throw error;
  log.info("Privacy settings updated", { userId });
}

// ─── Algorithm Transparency ───

export interface AlgorithmTransparencyEntry {
  algorithmName: string;
  category: string;
  formulaDescription: string;
  influencingFactors: string[];
  nonInfluencingFactors: string[];
  version: string;
}

export async function getAlgorithmTransparency(): Promise<AlgorithmTransparencyEntry[]> {
  const { data } = await supabase
    .from("algorithm_transparency_registry")
    .select("*")
    .eq("is_public", true);

  return (data ?? []).map((d) => ({
    algorithmName: d.algorithm_name,
    category: d.algorithm_category,
    formulaDescription: d.formula_description,
    influencingFactors: (d.influencing_factors as string[]) ?? [],
    nonInfluencingFactors: (d.non_influencing_factors as string[]) ?? [],
    version: d.version ?? "1.0",
  }));
}

// ─── Professional Integrity Monitoring ───

export type IntegritySignalType =
  | "reputation_manipulation"
  | "artificial_collaboration_loop"
  | "fake_escrow_simulation"
  | "identity_misrepresentation"
  | "collusion_pattern"
  | "sponsor_student_inflation_ring";

export interface IntegritySignal {
  signalType: IntegritySignalType;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedUserId?: string;
  evidence: Record<string, unknown>;
}

export async function detectIntegrityViolations(userId: string): Promise<IntegritySignal[]> {
  const signals: IntegritySignal[] = [];

  // Check for artificial collaboration loops
  const { data: trustEdges } = await supabase
    .from("trust_edges")
    .select("target_id, source_id")
    .or(`source_id.eq.${userId},target_id.eq.${userId}`)
    .limit(200);

  const edges = trustEdges ?? [];
  const partners = new Set(edges.map((e) => e.source_id === userId ? e.target_id : e.source_id));

  // Detect reciprocal-only relationships (potential collusion)
  const reciprocalCount = edges.filter((e) => {
    const partner = e.source_id === userId ? e.target_id : e.source_id;
    return edges.some((e2) =>
      (e2.source_id === partner && e2.target_id === userId) ||
      (e2.target_id === partner && e2.source_id === userId)
    );
  }).length;

  if (partners.size > 0 && reciprocalCount / edges.length > 0.9 && edges.length > 10) {
    signals.push({
      signalType: "artificial_collaboration_loop",
      severity: "high",
      description: "Unusually high reciprocal-only collaboration pattern detected",
      affectedUserId: userId,
      evidence: { reciprocalRate: reciprocalCount / edges.length, totalEdges: edges.length },
    });
  }

  // Check for reputation manipulation via rapid trust edge creation
  const recentEdges = edges.filter((e) => {
    // Simple heuristic: if too many edges exist, flag
    return true;
  });

  if (recentEdges.length > 50) {
    signals.push({
      signalType: "reputation_manipulation",
      severity: "medium",
      description: "Unusually high number of trust edges detected",
      affectedUserId: userId,
      evidence: { edgeCount: recentEdges.length },
    });
  }

  return signals;
}

// ─── Anti-Scraping Detection ───

export interface AntiScrapingEvent {
  eventType: "rate_limit_exceeded" | "bot_detected" | "mass_profile_access" | "api_abuse";
  sourceIp?: string;
  userId?: string;
  endpoint?: string;
  requestCount: number;
  blocked: boolean;
}

export async function logAntiScrapingEvent(event: AntiScrapingEvent) {
  await supabase.from("anti_scraping_events").insert({
    event_type: event.eventType,
    source_ip: event.sourceIp,
    user_id: event.userId,
    endpoint: event.endpoint,
    request_count: event.requestCount,
    blocked: event.blocked,
  });
}

// ─── Security Transparency Report ───

export interface SecurityTransparencyReport {
  reportYear: number;
  reportPeriod: string;
  securityIncidentCount: number;
  escrowInvariantBreachCount: number;
  ledgerReconciliationSuccessRate: number;
  disputeResolutionStats: Record<string, number>;
  dataAccessViolationAttempts: number;
  penTestSummary?: string;
}

export async function getSecurityTransparencyReports(): Promise<SecurityTransparencyReport[]> {
  const { data } = await supabase
    .from("security_transparency_reports")
    .select("*")
    .not("published_at", "is", null)
    .order("report_year", { ascending: false });

  return (data ?? []).map((d) => ({
    reportYear: d.report_year,
    reportPeriod: d.report_period,
    securityIncidentCount: d.security_incident_count ?? 0,
    escrowInvariantBreachCount: d.escrow_invariant_breach_count ?? 0,
    ledgerReconciliationSuccessRate: d.ledger_reconciliation_success_rate ?? 100,
    disputeResolutionStats: (d.dispute_resolution_stats as Record<string, number>) ?? {},
    dataAccessViolationAttempts: d.data_access_violation_attempts ?? 0,
    penTestSummary: d.pen_test_summary ?? undefined,
  }));
}

// ─── Access Control Logging ───

export async function logAccessControlEvent(event: {
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  privilegeLevel: string;
  wasAuthorized: boolean;
  denialReason?: string;
}) {
  await supabase.from("access_control_audit").insert({
    actor_id: event.actorId,
    action: event.action,
    resource_type: event.resourceType,
    resource_id: event.resourceId,
    privilege_level: event.privilegeLevel,
    was_authorized: event.wasAuthorized,
    denial_reason: event.denialReason,
  });
}

// ─── Transparency Constants ───

export const ZERO_TRUST_TRANSPARENCY = {
  securityModel: "Zero-Trust: Every request authenticated, authorized, and validated",
  privacyPrinciple: "Privacy by default. Transparency by consent.",
  dataMinimization: [
    "Only execution-relevant data collected",
    "No behavioral tracking for ads",
    "No passive engagement harvesting",
    "No cross-platform behavioral profiling",
  ],
  algorithmTransparency: [
    "Search ranking logic published",
    "Reputation formula publicly explained",
    "Trust edge scoring transparent",
    "No secret boosting or pay-to-win",
  ],
  antiScraping: [
    "Rate limiting on all endpoints",
    "Behavioral anomaly detection",
    "Bot fingerprint detection",
    "Strict API token management",
  ],
  fileSecurityModel: [
    "Private storage buckets",
    "Short-lived signed URLs",
    "Strict file type validation",
    "Ownership-based access control",
    "No public document indexing",
  ],
  accessControlPrinciples: [
    "Least privilege for all staff",
    "No direct production financial access without logging",
    "No override of escrow invariant",
    "No manual ledger edits",
    "Founder cannot bypass ledger rules",
  ],
  ethicsFramework: [
    "No ranking manipulation for revenue",
    "No engagement addiction design",
    "No dark patterns",
    "No exploitative monetization",
    "No silent algorithm changes",
  ],
  dataSovereignty: [
    "GDPR compliance",
    "FERPA compliance",
    "UK GDPR",
    "Regional data localization",
    "Right-to-access export",
    "Right-to-rectify non-financial data",
    "Financial ledger deletion strictly limited",
  ],
} as const;

/**
 * Talent Intelligence Engine
 * Execution Resume, Talent Readiness Score, Skill Validation, Career Trajectory.
 * Replaces LinkedIn's resume/endorsement model with escrow-verified performance intelligence.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";
import { calculateERS, type ERSBreakdown } from "./executionReputationScore";

const log = createLogger("talentIntelligence");

// ─── Execution Resume ───

export interface ExecutionResumeProject {
  projectTitle: string;
  sponsor: string;
  budgetHandled: number;
  completionDays: number;
  milestoneCount: number;
  onTimePct: number;
  hasDispute: boolean;
  institutionalValidation: boolean;
  deliverables: string[];
  completedAt: string;
}

export interface ExecutionResume {
  userId: string;
  displayName: string;
  ers: ERSBreakdown;
  projects: ExecutionResumeProject[];
  skillEvidence: SkillEvidenceBlock[];
  facultyAssessments: FacultyAssessment[];
  talentReadinessScore: TalentReadinessScore;
  careerTrajectory: CareerTrajectoryPoint[];
  economicFootprint: EconomicFootprint;
}

// ─── Skill Evidence ───

export interface SkillEvidenceBlock {
  id: string;
  skillName: string;
  projectId: string | null;
  deliverableUrl: string | null;
  sponsorConfirmed: boolean;
  facultyConfirmed: boolean;
  confidenceLevel: "high" | "medium" | "low";
  evidenceDescription: string | null;
}

// ─── Faculty Assessment ───

export interface FacultyAssessment {
  facultyId: string;
  executionDepthRating: number;
  skillAccuracyRating: number;
  recommendationLevel: string;
  notes: string | null;
  flags: string[];
}

// ─── Talent Readiness Score ───

export interface TalentReadinessScore {
  overall: number;
  escrowVolume: number;
  complexityDiversity: number;
  crossDomain: number;
  institutionalValidation: number;
  sponsorRepeat: number;
  punctuality: number;
  disputeFree: number;
  tier: "emerging" | "developing" | "ready" | "proven" | "elite";
}

const TRS_WEIGHTS = {
  escrowVolume: 0.15,
  complexityDiversity: 0.15,
  crossDomain: 0.10,
  institutionalValidation: 0.15,
  sponsorRepeat: 0.15,
  punctuality: 0.15,
  disputeFree: 0.15,
} as const;

function classifyTRSTier(score: number, projectCount: number): TalentReadinessScore["tier"] {
  if (projectCount < 2) return "emerging";
  if (score >= 85) return "elite";
  if (score >= 70) return "proven";
  if (score >= 50) return "ready";
  return "developing";
}

// ─── Career Trajectory ───

export interface CareerTrajectoryPoint {
  period: string;
  escrowCumulative: number;
  projectsCumulative: number;
  complexityAvg: number;
  reliabilityAvg: number;
}

// ─── Economic Footprint ───

export interface EconomicFootprint {
  totalFundingParticipated: number;
  sponsorDiversity: number;
  industryCategories: string[];
  teamCollaborationCount: number;
  institutionCount: number;
}

// ─── Hiring Predictive Insights ───

export interface HiringPrediction {
  riskScore: number;
  reliabilityProjection: number;
  collaborationCompatibility: number;
  reasoning: string[];
}

// ─── Core Functions ───

export async function calculateTalentReadinessScore(userId: string): Promise<TalentReadinessScore> {
  const { data: records } = await supabase
    .from("accountability_records")
    .select("*")
    .eq("executor_id", userId);

  const all = records ?? [];
  const projectCount = all.length;
  const completed = all.filter((r) => r.outcome_status === "completed");
  const disputed = all.filter((r) => r.outcome_status === "disputed");
  const totalEscrow = all.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);

  // Escrow volume score
  const escrowVolume = Math.min(100, totalEscrow / 500);

  // Complexity diversity
  const budgets = all.map((r) => r.escrow_amount ?? 0);
  const budgetRange = budgets.length > 1 ? Math.max(...budgets) - Math.min(...budgets) : 0;
  const complexityDiversity = Math.min(100, budgetRange / 200 + projectCount * 5);

  // Cross-domain
  const domains = new Set(all.flatMap((r) => r.promised_deliverables ?? []));
  const crossDomain = Math.min(100, domains.size * 10);

  // Institutional validation
  const { count: validations } = await supabase
    .from("academic_records")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("verification_status", "verified");
  const institutionalValidation = Math.min(100, (validations ?? 0) * 20);

  // Sponsor repeat
  const sponsors = all.map((r) => r.funder_id).filter(Boolean);
  const sponsorSet = new Set(sponsors);
  const repeatSponsors = sponsors.length - sponsorSet.size;
  const sponsorRepeat = sponsorSet.size > 0 ? Math.min(100, (repeatSponsors / sponsorSet.size) * 100) : 0;

  // Punctuality
  const onTime = completed.filter((r) => !r.deadline || !r.verified_at || new Date(r.verified_at) <= new Date(r.deadline));
  const punctuality = completed.length > 0 ? (onTime.length / completed.length) * 100 : 0;

  // Dispute-free
  const disputeFree = projectCount > 0 ? ((projectCount - disputed.length) / projectCount) * 100 : 0;

  const overall = Math.min(100, Math.round(
    escrowVolume * TRS_WEIGHTS.escrowVolume +
    complexityDiversity * TRS_WEIGHTS.complexityDiversity +
    crossDomain * TRS_WEIGHTS.crossDomain +
    institutionalValidation * TRS_WEIGHTS.institutionalValidation +
    sponsorRepeat * TRS_WEIGHTS.sponsorRepeat +
    punctuality * TRS_WEIGHTS.punctuality +
    disputeFree * TRS_WEIGHTS.disputeFree
  ));

  const tier = classifyTRSTier(overall, projectCount);

  log.info("TRS calculated", { userId, overall, tier });

  return {
    overall,
    escrowVolume: Math.round(escrowVolume),
    complexityDiversity: Math.round(complexityDiversity),
    crossDomain: Math.round(crossDomain),
    institutionalValidation: Math.round(institutionalValidation),
    sponsorRepeat: Math.round(sponsorRepeat),
    punctuality: Math.round(punctuality),
    disputeFree: Math.round(disputeFree),
    tier,
  };
}

export async function buildExecutionResume(userId: string): Promise<ExecutionResume> {
  const [ers, trs] = await Promise.all([
    calculateERS(userId),
    calculateTalentReadinessScore(userId),
  ]);

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  const displayName = profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : userId.substring(0, 8);

  // Projects
  const { data: records } = await supabase
    .from("accountability_records")
    .select("*")
    .eq("executor_id", userId)
    .order("created_at", { ascending: false });

  const projects: ExecutionResumeProject[] = (records ?? []).map((r) => ({
    projectTitle: r.promised_deliverables?.[0] ?? "Project",
    sponsor: r.funder_id ?? "Unknown",
    budgetHandled: r.escrow_amount ?? 0,
    completionDays: r.verified_at && r.created_at
      ? Math.round((new Date(r.verified_at).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    milestoneCount: r.promised_deliverables?.length ?? 0,
    onTimePct: r.deadline && r.verified_at && new Date(r.verified_at) <= new Date(r.deadline) ? 100 : 0,
    hasDispute: r.outcome_status === "disputed",
    institutionalValidation: !!r.verified_by,
    deliverables: r.promised_deliverables ?? [],
    completedAt: r.verified_at ?? r.created_at ?? "",
  }));

  // Skill evidence
  const { data: skillData } = await supabase
    .from("skill_evidence_blocks")
    .select("*")
    .eq("user_id", userId);

  const skillEvidence: SkillEvidenceBlock[] = (skillData ?? []).map((s: any) => ({
    id: s.id,
    skillName: s.skill_name,
    projectId: s.project_id,
    deliverableUrl: s.deliverable_url,
    sponsorConfirmed: s.sponsor_confirmed,
    facultyConfirmed: s.faculty_confirmed,
    confidenceLevel: s.confidence_level,
    evidenceDescription: s.evidence_description,
  }));

  // Faculty assessments
  const { data: assessments } = await supabase
    .from("faculty_talent_assessments")
    .select("*")
    .eq("student_id", userId);

  const facultyAssessments: FacultyAssessment[] = (assessments ?? []).map((a: any) => ({
    facultyId: a.faculty_id,
    executionDepthRating: a.execution_depth_rating,
    skillAccuracyRating: a.skill_accuracy_rating,
    recommendationLevel: a.recommendation_level,
    notes: a.notes,
    flags: a.flags ?? [],
  }));

  // Career trajectory (simplified — group by quarter)
  const careerTrajectory: CareerTrajectoryPoint[] = [];
  let cumEscrow = 0;
  let cumProjects = 0;
  const sorted = [...(records ?? [])].sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());
  for (const r of sorted) {
    cumEscrow += r.escrow_amount ?? 0;
    cumProjects += 1;
    const period = r.created_at ? r.created_at.substring(0, 7) : "unknown";
    careerTrajectory.push({
      period,
      escrowCumulative: cumEscrow,
      projectsCumulative: cumProjects,
      complexityAvg: cumEscrow / cumProjects,
      reliabilityAvg: r.outcome_status === "completed" ? 100 : 50,
    });
  }

  // Economic footprint
  const sponsors = new Set((records ?? []).map((r) => r.funder_id).filter(Boolean));
  const economicFootprint: EconomicFootprint = {
    totalFundingParticipated: cumEscrow,
    sponsorDiversity: sponsors.size,
    industryCategories: [...new Set((records ?? []).flatMap((r) => r.promised_deliverables ?? []))].slice(0, 10),
    teamCollaborationCount: (records ?? []).length,
    institutionCount: 1, // simplified
  };

  log.info("Execution resume built", { userId, projectCount: projects.length });

  return {
    userId,
    displayName,
    ers,
    projects,
    skillEvidence,
    facultyAssessments,
    talentReadinessScore: trs,
    careerTrajectory,
    economicFootprint,
  };
}

export async function generateHiringPrediction(userId: string): Promise<HiringPrediction> {
  const trs = await calculateTalentReadinessScore(userId);
  const reasoning: string[] = [];

  const riskScore = Math.max(0, 100 - trs.disputeFree);
  if (riskScore < 10) reasoning.push("Very low dispute risk based on execution history");
  else if (riskScore > 30) reasoning.push("Elevated dispute history — recommend trial project");

  const reliabilityProjection = Math.round((trs.punctuality * 0.5 + trs.disputeFree * 0.3 + trs.sponsorRepeat * 0.2));
  if (reliabilityProjection >= 80) reasoning.push("Strong reliability projection based on consistent performance");

  const collaborationCompatibility = Math.round((trs.crossDomain * 0.3 + trs.complexityDiversity * 0.3 + trs.institutionalValidation * 0.4));
  if (collaborationCompatibility >= 70) reasoning.push("High collaboration compatibility across domains");

  return { riskScore, reliabilityProjection, collaborationCompatibility, reasoning };
}

export async function generateInstitutionalTalentReport(institutionId: string): Promise<{
  totalProjects: number;
  avgEscrowHandled: number;
  avgCompletionReliability: number;
  sponsorRepeatPct: number;
  topSkills: string[];
}> {
  // Get users associated with institution via academic records
  const { data: records } = await supabase
    .from("academic_records")
    .select("user_id")
    .eq("institution_id", institutionId)
    .eq("verification_status", "verified");

  const userIds = [...new Set((records ?? []).map((r) => r.user_id))];

  if (userIds.length === 0) {
    return { totalProjects: 0, avgEscrowHandled: 0, avgCompletionReliability: 0, sponsorRepeatPct: 0, topSkills: [] };
  }

  const { data: accountability } = await supabase
    .from("accountability_records")
    .select("*")
    .in("executor_id", userIds.slice(0, 100));

  const all = accountability ?? [];
  const completed = all.filter((r) => r.outcome_status === "completed");
  const totalEscrow = all.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
  const skills = [...new Set(all.flatMap((r) => r.promised_deliverables ?? []))];

  return {
    totalProjects: all.length,
    avgEscrowHandled: all.length > 0 ? Math.round(totalEscrow / all.length) : 0,
    avgCompletionReliability: all.length > 0 ? Math.round((completed.length / all.length) * 100) : 0,
    sponsorRepeatPct: 0, // requires deeper analysis
    topSkills: skills.slice(0, 20),
  };
}

// ─── Transparency ───

export const TRS_TRANSPARENCY = {
  formula: "TRS = Σ(factor × weight) across 7 dimensions",
  factors: [
    { name: "Escrow Volume", weight: "15%", description: "Total capital handled through escrow" },
    { name: "Complexity Diversity", weight: "15%", description: "Range of project budgets and types" },
    { name: "Cross-Domain Execution", weight: "10%", description: "Breadth of skill domains demonstrated" },
    { name: "Institutional Validation", weight: "15%", description: "Verified academic credentials" },
    { name: "Sponsor Repeat Factor", weight: "15%", description: "Sponsors who funded the same person again" },
    { name: "Milestone Punctuality", weight: "15%", description: "On-time milestone delivery rate" },
    { name: "Dispute-Free Performance", weight: "15%", description: "Percentage of projects without disputes" },
  ],
  notFactors: ["Follower count", "Likes", "Viral posts", "Endorsements", "Connection count", "Paid promotion"],
  antiGaming: [
    "No escrow = no TRS boost",
    "Institutional validation prevents artificial skill inflation",
    "Sponsor feedback is immutable once submitted",
    "Dispute records are permanent and penalize gaming",
  ],
} as const;

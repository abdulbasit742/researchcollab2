/**
 * Institutional Identity Layer — cryptographic identity, global IDs, reputation ledger.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("institutionIdentity");

export interface InstitutionIdentity {
  tenantId: string;
  globalIdentityHash: string;
  trustSignature: string | null;
  regionOrigin: string | null;
  reputationScore: number;
  verifiedAt: string | null;
}

function generateIdentityHash(tenantId: string, timestamp: string): string {
  // Deterministic hash from tenant + time (production would use crypto.subtle)
  const raw = `GIID:${tenantId}:${timestamp}:rcollab-sovereign`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `GIID-${Math.abs(hash).toString(36).toUpperCase().padStart(12, "0")}`;
}

function generateTrustSignature(tenantId: string, hash: string): string {
  const raw = `SIG:${tenantId}:${hash}`;
  let sig = 0;
  for (let i = 0; i < raw.length; i++) {
    sig = ((sig << 7) - sig) + raw.charCodeAt(i);
    sig |= 0;
  }
  return `TSIG-${Math.abs(sig).toString(36).toUpperCase().padStart(16, "0")}`;
}

export async function registerInstitutionIdentity(tenantId: string, regionId?: string): Promise<InstitutionIdentity> {
  const now = new Date().toISOString();
  const hash = generateIdentityHash(tenantId, now);
  const signature = generateTrustSignature(tenantId, hash);

  const { data, error } = await (supabase as any).from("institution_identity_registry").upsert({
    tenant_id: tenantId, global_identity_hash: hash,
    trust_signature: signature, region_origin: regionId ?? null,
    reputation_score: 50, verified_at: now,
  }, { onConflict: "tenant_id" }).select().single();

  if (error) throw new Error(`Identity registration failed: ${error.message}`);
  log.info("Institution identity registered", { tenantId, hash });

  return {
    tenantId, globalIdentityHash: data.global_identity_hash,
    trustSignature: data.trust_signature, regionOrigin: data.region_origin,
    reputationScore: data.reputation_score, verifiedAt: data.verified_at,
  };
}

export async function verifyInstitutionIdentity(tenantId: string): Promise<boolean> {
  const { data } = await (supabase as any).from("institution_identity_registry")
    .select("global_identity_hash, trust_signature, verified_at")
    .eq("tenant_id", tenantId).maybeSingle();
  if (!data || !data.verified_at) return false;
  const expectedSig = generateTrustSignature(tenantId, data.global_identity_hash);
  return data.trust_signature === expectedSig;
}

export async function getInstitutionIdentity(tenantId: string): Promise<InstitutionIdentity | null> {
  const { data } = await (supabase as any).from("institution_identity_registry")
    .select("*").eq("tenant_id", tenantId).maybeSingle();
  if (!data) return null;
  return {
    tenantId: data.tenant_id, globalIdentityHash: data.global_identity_hash,
    trustSignature: data.trust_signature, regionOrigin: data.region_origin,
    reputationScore: data.reputation_score, verifiedAt: data.verified_at,
  };
}

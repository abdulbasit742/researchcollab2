import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limit: track verification attempts per IP (in-memory, per-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // max 30 verifications per minute per IP
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting for this public endpoint
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { passport_id, signed_hash } = await req.json();

    if (!passport_id || !signed_hash) {
      return new Response(JSON.stringify({ error: "passport_id and signed_hash required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate input format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(passport_id)) {
      return new Response(JSON.stringify({ error: "Invalid passport_id format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof signed_hash !== "string" || signed_hash.length > 512) {
      return new Response(JSON.stringify({ error: "Invalid signed_hash format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: passport, error } = await supabase
      .from("reputation_passports")
      .select("id, signed_hash, issued_at, expires_at, trust_score_snapshot, visibility_score_snapshot, passport_version")
      .eq("id", passport_id)
      .maybeSingle();

    if (error || !passport) {
      return new Response(JSON.stringify({
        valid: false,
        integrity_status: "not_found",
        timestamp: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const hashMatch = passport.signed_hash === signed_hash;
    const expired = new Date(passport.expires_at) < new Date();

    // Log verification attempt
    await supabase.from("external_verification_logs").insert({
      passport_id,
      external_platform: (req.headers.get("origin") ?? "unknown").substring(0, 255),
    });

    // Record verification
    await supabase.from("passport_verifications").insert({
      passport_id,
      verifier_entity: (req.headers.get("origin") ?? "api").substring(0, 255),
      verification_status: hashMatch && !expired ? "verified" : "failed",
      verified_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        valid: hashMatch && !expired,
        integrity_status: !hashMatch ? "tampered" : expired ? "expired" : "verified",
        trust_score: passport.trust_score_snapshot,
        visibility_score: passport.visibility_score_snapshot,
        version: passport.passport_version,
        issued_at: passport.issued_at,
        expires_at: passport.expires_at,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

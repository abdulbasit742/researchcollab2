import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Input sanitization ──────────────────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

// ─── Rate limiting (in-memory, per-IP) ───────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW_MS = 300_000; // per 5 minutes

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

// ─── Constants ───────────────────────────────────────────────
const ADMIN_EMAIL = "researchcollabpro@gmail.com";

const INQUIRY_LABELS: Record<string, string> = {
  general: "General Inquiry",
  partnership: "Partnership Request",
  enterprise: "Enterprise Sales",
  support: "Technical Support",
};

const VALID_INQUIRY_TYPES = new Set(Object.keys(INQUIRY_LABELS));

interface ContactNotification {
  name: string;
  email: string;
  organization?: string;
  inquiryType: string;
  subject?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured, skipping email notification");
      return new Response(
        JSON.stringify({ success: true, message: "Email notifications not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: ContactNotification = await req.json();
    const { name, email, organization, inquiryType, subject, message } = body;

    // ─── Input validation ──────────────────────────────────
    if (!name || !email || !message || !inquiryType) {
      throw new Error("Missing required fields: name, email, message, inquiryType");
    }

    if (typeof name !== "string" || name.length > 100) {
      throw new Error("Name must be a string under 100 characters");
    }
    if (!validateEmail(email)) {
      throw new Error("Invalid email address");
    }
    if (typeof message !== "string" || message.length > 5000) {
      throw new Error("Message must be under 5000 characters");
    }
    if (!VALID_INQUIRY_TYPES.has(inquiryType)) {
      throw new Error("Invalid inquiry type");
    }
    if (subject && (typeof subject !== "string" || subject.length > 200)) {
      throw new Error("Subject must be under 200 characters");
    }
    if (organization && (typeof organization !== "string" || organization.length > 200)) {
      throw new Error("Organization must be under 200 characters");
    }

    // ─── Sanitize all user inputs ──────────────────────────
    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeOrg = organization ? escapeHtml(organization.trim()) : "";
    const safeSubject = subject ? escapeHtml(subject.trim()) : "";
    const safeMessage = escapeHtml(message.trim());
    const inquiryLabel = INQUIRY_LABELS[inquiryType] || "General Inquiry";

    const emailSubject = safeSubject
      ? `[${inquiryLabel}] ${safeSubject}`
      : `[${inquiryLabel}] New contact from ${safeName}`;

    // Send admin notification
    const adminEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Researcher Collab Pro <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: emailSubject,
        reply_to: email.trim(),
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">📬 New Contact Submission</h1>
            </div>
            <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef; border-top: none;">
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin-bottom: 16px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666; width: 120px;">Name</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Email</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${safeEmail}" style="color: #667eea;">${safeEmail}</a></td>
                  </tr>
                  ${safeOrg ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Organization</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${safeOrg}</td></tr>` : ""}
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Type</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><span style="background: #667eea; color: white; padding: 2px 10px; border-radius: 12px; font-size: 13px;">${inquiryLabel}</span></td>
                  </tr>
                  ${safeSubject ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Subject</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${safeSubject}</td></tr>` : ""}
                </table>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                <h3 style="margin-top: 0; color: #667eea;">Message</h3>
                <p style="white-space: pre-wrap; margin: 0;">${safeMessage}</p>
              </div>
              <p style="font-size: 12px; color: #999; margin-top: 16px; text-align: center;">
                Reply directly to this email to respond to ${safeName}.
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const adminResult = await adminEmail.json();

    // Send confirmation to submitter
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Researcher Collab Pro <onboarding@resend.dev>",
        to: [email.trim()],
        subject: "We received your message!",
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">✅ Message Received</h1>
            </div>
            <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef; border-top: none;">
              <p>Hi ${safeName},</p>
              <p>Thank you for reaching out! We've received your <strong>${inquiryLabel.toLowerCase()}</strong> and will get back to you within <strong>24-48 hours</strong>.</p>
              <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e9ecef; margin: 16px 0;">
                <p style="margin: 0; color: #666; font-size: 14px;"><strong>Your message:</strong></p>
                <p style="margin: 8px 0 0; white-space: pre-wrap; font-size: 14px;">${safeMessage.slice(0, 200)}${safeMessage.length > 200 ? "..." : ""}</p>
              </div>
              <p style="font-size: 14px; color: #666;">Best regards,<br/>The Researcher Collab Pro Team</p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!adminEmail.ok) {
      console.error("Resend API error:", adminResult);
      throw new Error(adminResult.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-contact function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

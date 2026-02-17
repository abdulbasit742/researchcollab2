import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactNotification {
  name: string;
  email: string;
  organization?: string;
  inquiryType: string;
  subject?: string;
  message: string;
}

const ADMIN_EMAIL = "researchcollabpro@gmail.com";

const INQUIRY_LABELS: Record<string, string> = {
  general: "General Inquiry",
  partnership: "Partnership Request",
  enterprise: "Enterprise Sales",
  support: "Technical Support",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured, skipping email notification");
      return new Response(
        JSON.stringify({ success: true, message: "Email notifications not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { name, email, organization, inquiryType, subject, message }: ContactNotification = await req.json();

    if (!name || !email || !message || !inquiryType) {
      throw new Error("Missing required fields: name, email, message, inquiryType");
    }

    const inquiryLabel = INQUIRY_LABELS[inquiryType] || inquiryType;
    const emailSubject = subject
      ? `[${inquiryLabel}] ${subject}`
      : `[${inquiryLabel}] New contact from ${name}`;

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
        reply_to: email,
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
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Email</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #667eea;">${email}</a></td>
                  </tr>
                  ${organization ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Organization</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${organization}</td></tr>` : ""}
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Type</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><span style="background: #667eea; color: white; padding: 2px 10px; border-radius: 12px; font-size: 13px;">${inquiryLabel}</span></td>
                  </tr>
                  ${subject ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Subject</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${subject}</td></tr>` : ""}
                </table>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                <h3 style="margin-top: 0; color: #667eea;">Message</h3>
                <p style="white-space: pre-wrap; margin: 0;">${message}</p>
              </div>
              <p style="font-size: 12px; color: #999; margin-top: 16px; text-align: center;">
                Reply directly to this email to respond to ${name}.
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
        to: [email],
        subject: "We received your message!",
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">✅ Message Received</h1>
            </div>
            <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef; border-top: none;">
              <p>Hi ${name},</p>
              <p>Thank you for reaching out! We've received your <strong>${inquiryLabel.toLowerCase()}</strong> and will get back to you within <strong>24-48 hours</strong>.</p>
              <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e9ecef; margin: 16px 0;">
                <p style="margin: 0; color: #666; font-size: 14px;"><strong>Your message:</strong></p>
                <p style="margin: 8px 0 0; white-space: pre-wrap; font-size: 14px;">${message.slice(0, 200)}${message.length > 200 ? "..." : ""}</p>
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

    console.log("Contact notification sent successfully:", adminResult);

    return new Response(
      JSON.stringify({ success: true, emailId: adminResult.id }),
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

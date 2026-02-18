import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyBidRequest {
  projectId: string;
  bidAmount: number;
  bidderName: string;
  deliveryDays: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JWT Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured, skipping email notification");
      return new Response(
        JSON.stringify({ success: true, message: "Email notifications not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { projectId, bidAmount, bidderName, deliveryDays }: NotifyBidRequest = await req.json();

    // Validate required fields
    if (!projectId || !bidAmount) {
      throw new Error("Missing required fields: projectId, bidAmount");
    }

    // Fetch project and owner details
    const { data: project, error: projectError } = await supabase
      .from("earning_projects")
      .select("title, owner_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      throw new Error("Project not found");
    }

    // Get owner's email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      project.owner_id
    );

    if (userError || !userData?.user?.email) {
      console.log("Could not find owner email, skipping notification");
      return new Response(
        JSON.stringify({ success: true, message: "No email to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const ownerEmail = userData.user.email;
    const projectTitle = project.title;

    // Format bid amount in PKR
    const formattedAmount = new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(bidAmount);

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Researcher Collab Pro <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `New Bid on "${projectTitle}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New Bid Received!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Great news! You've received a new bid on your project.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin-bottom: 20px;">
                <h2 style="color: #667eea; margin-top: 0; font-size: 18px;">${projectTitle}</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Bidder</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; text-align: right;">${bidderName || "Anonymous"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Bid Amount</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; text-align: right; color: #28a745;">${formattedAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666;">Delivery Time</td>
                    <td style="padding: 10px 0; font-weight: bold; text-align: right;">${deliveryDays} days</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                Log in to your account to review this bid and connect with the bidder.
              </p>
              
              <div style="text-align: center;">
                <a href="https://academic-forge-flow.lovable.app/earn" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Bid Details
                </a>
              </div>
            </div>
            
            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              This is an automated notification from Researcher Collab Pro.
            </p>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Email notification sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-new-bid function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.4.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  fullName: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: string;
  type: "confirmation" | "reminder" | "status_change";
}

const getEmailContent = (data: EmailRequest) => {
  const { fullName, appointmentDate, appointmentTime, serviceType, status, type } = data;

  const subjects = {
    confirmation: "Appointment Confirmed - Barbershop",
    reminder: "Appointment Reminder - Barbershop",
    status_change: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)} - Barbershop`,
  };

  const messages = {
    confirmation: `
      <h1>Hello ${fullName}!</h1>
      <p>Your appointment has been confirmed.</p>
      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h2 style="margin-top: 0;">Appointment Details</h2>
        <p><strong>Service:</strong> ${serviceType}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Status:</strong> ${status}</p>
      </div>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>The Barbershop Team</p>
    `,
    reminder: `
      <h1>Hello ${fullName}!</h1>
      <p>This is a reminder about your upcoming appointment.</p>
      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h2 style="margin-top: 0;">Appointment Details</h2>
        <p><strong>Service:</strong> ${serviceType}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
      </div>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>The Barbershop Team</p>
    `,
    status_change: `
      <h1>Hello ${fullName}!</h1>
      <p>Your appointment status has been updated to: <strong>${status}</strong></p>
      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h2 style="margin-top: 0;">Appointment Details</h2>
        <p><strong>Service:</strong> ${serviceType}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Status:</strong> ${status}</p>
      </div>
      <p>If you have any questions, please contact us.</p>
      <p>Best regards,<br>The Barbershop Team</p>
    `,
  };

  return {
    subject: subjects[type],
    html: messages[type],
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();
    console.log("Sending email:", emailData);

    const { subject, html } = getEmailContent(emailData);

    const emailResponse = await resend.emails.send({
      from: "Barbershop <onboarding@resend.dev>",
      to: [emailData.to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

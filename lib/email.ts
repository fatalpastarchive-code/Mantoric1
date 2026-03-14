import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationEmailOptions {
  to: string;
  code: string;
}

export async function sendVerificationEmail({ to, code }: SendVerificationEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set in environment variables. Email will not be sent.");
    return;
  }

  const html = `
    <div style="background-color: #09090b; color: #fafafa; font-family: 'Inter', Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; justify-content: center; margin-bottom: 24px;">
          <div style="background-color: #fafafa; color: #09090b; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">
            V
          </div>
        </div>
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #fafafa;">Welcome to Vanguard</h1>
        <p style="font-size: 16px; color: #a1a1aa; margin-bottom: 32px;">
          To complete your registration, please verify your email address by entering the 6-digit code below. This code will expire in 15 minutes.
        </p>
        <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #fafafa;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #71717a;">
          If you didn't request this email, you can safely ignore it.
        </p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Vanguard <onboarding@resend.dev>",
      to: [to],
      subject: "Verify your email address for Vanguard",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send verification email via Resend");
    }

    console.log(`Verification email sent to ${to}`, data);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
}

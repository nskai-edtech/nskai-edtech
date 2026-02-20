import { Resend } from "resend";
import { ReactElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "NSKAI <onboarding@resend.dev>";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail({
  to,
  subject,
  react,
}: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: "nsukka.ai@gmail.com",
      subject,
      react,
    });

    if (error) {
      console.error("[EMAIL] Send failed:", error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Sent "${subject}" to ${to} — ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[EMAIL] Unexpected error:", message);
    return { success: false, error: message };
  }
}

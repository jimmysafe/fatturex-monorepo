/* eslint-disable node/no-process-env */
/* eslint-disable no-console */
import { SigninInOtpEmail } from "@repo/ui/components/email/signin-otp";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpSigninEmail(email: string, otp: string) {
  try {
    console.log(process.env.APP_ENV, process.env.VERCEL_ENV);
    if (process.env.APP_ENV !== "production" && process.env.VERCEL_ENV !== "production") {
      console.log(`======== SIGNIN OTP: ${otp} ========`);
      return { success: true };
    }
    const { data, error } = await resend.emails.send({
      from: "Fatturex <no-reply@fatturex.com>",
      to: [email],
      subject: "Fatturex - Il tuo codice di accesso OTP",
      react: SigninInOtpEmail({ otp }),
    });
    if (error) {
      throw new Error("Errore nell'invio della mail");
    }
    return data;
  }
  catch (error) {
    throw new Error("Errore nell'invio della mail");
  }
}

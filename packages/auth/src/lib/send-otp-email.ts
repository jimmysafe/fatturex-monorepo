/* eslint-disable node/no-process-env */
import { SigninInOtpEmail } from "@repo/ui/components/email/signin-otp";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpSigninEmail(email: string, otp: string) {
  try {
    // eslint-disable-next-line no-console
    console.log("APP ENV: ", process.env.APP_ENV);
    if (process.env.APP_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(`======== SIGNIN OTP: ${otp} ========`);
      return { success: true };
    }
    const { data, error } = await resend.emails.send({
      from: "Fatturex <info@basilico.studio>",
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

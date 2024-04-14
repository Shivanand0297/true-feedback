import { ApiResponse } from '@/types/apiResponse';
import { Resend } from 'resend';
import VerificationEmail from '../../emails/VerificationEmail';

export const resend = new Resend(process.env.RESEND_API_KEY);


export default async function sendVerificationEmail(email: string, username: string, verificationCode: string): Promise<ApiResponse> {
  try {
    
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'TrueFeedback Verification Code',
      react: VerificationEmail({ username, verificationCode }),
    });

    return {
      success: true,
      message: "Email send successfully"
    }
  } catch (error) {
    console.log("Faild to send email", error)
    return {
      success: false,
      message: "Failed to send message"
    }
  }
}
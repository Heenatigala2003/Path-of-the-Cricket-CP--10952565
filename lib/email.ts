// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSponsorshipConfirmation({
  to,
  companyName,
  tier,
  amount,
}: {
  to: string;
  companyName: string;
  tier: string;
  amount: number;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@pathofthecricket.com',
      to,
      subject: `Sponsorship Application Received - Path of the Cricket`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you, ${companyName}!</h2>
          <p>Your sponsorship application for <strong>${tier}</strong> with an investment of <strong>$${amount.toLocaleString()}</strong> has been received.</p>
          <p>We will review your application and get back to you within 3-5 business days.</p>
          <p>If you have any questions, please reply to this email.</p>
          <br />
          <p>Best regards,<br />Path of the Cricket Team</p>
        </div>
      `,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
import nodemailer from "nodemailer";
import IMailService from "../../interfaces/utils/IMailService";

class MailService implements IMailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendMail(name: string, email: string, otp: string): Promise<void> {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: black">
        <h2 style="color: #007bff;">Dear ${name},</h2>
        <p>To ensure the security of your account, we've generated a One-Time Password (OTP) for you to complete your registration or login process.</p>
        <p style="font-size: 1.2em; font-weight: bold;">Your OTP is: 
          <span style="color: #007bff;">${otp}</span>
        </p>
        <p>Please use this OTP within the next 5 minutes to complete your action. If you did not initiate this request or need any assistance, please contact our support team immediately.</p>
        <p>Thank you for trusting <strong>MockQ</strong>. We look forward to serving you!</p>
        <p>Best regards,<br/><strong>MockQ</strong></p>
        <div style="margin-top: 20px; border-top: 1px solid #eaeaea; padding-top: 10px;">
          <p style="font-size: 0.9em; color: #777;">This email was sent to ${email}. If you did not request this email, please ignore it.</p>
        </div>
      </div>
    `;

    const info = await this.transporter.sendMail({
      from: process.env.MAIL,
      to: email,
      subject: "WeOne Materninty Care Verification Code ✔", // Subject line
      text: emailContent,
      html: emailContent, // html body
    });
  }

  async sendLeaveMail(name: string, email: string,  cancelReason: string): Promise<void> {
    const emailContent = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #4CAF50; text-align: center;">Booking Cancellation Notice</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>We regret to inform you that your booking has been canceled due to an emergency situation on your service provider. Below are the details:</p>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Reason for Cancellation:</strong> ${cancelReason}</li>
                </ul>
                <p>We sincerely apologize for the inconvenience this may have caused you. Please rest assured that your refund has been processed and should reflect in your account shortly.</p>
                <p>If you have any questions or need further assistance, please feel free to contact our support team.</p>
                <p style="font-weight: bold;">Thank you for your understanding and cooperation.</p>
                
                <p>Best regards,<br/> 
                <strong>WeOne Maternity Care Team</strong></p>
                <hr style="border: 0; height: 1px; background: #ccc; margin-top: 20px;">
                <p style="color: #777; font-size: 0.8em;">This is an automated email, please do not reply. If you need assistance, contact our support at <a href="mailto:support@weone.com" style="color: #4CAF50;">support@weone.com</a>.</p>
                <p style="color: #777; font-size: 0.8em;">© 2024 WeOne Maternity Care. All rights reserved.</p>
            </div>
        </div>
    `;

    await this.transporter.sendMail({
        from: process.env.MAIL,
        to: email,
        subject: "Booking Cancellation Notice - WeOne Maternity Care",
        html: emailContent, // html body
    });
}

}

export default MailService;

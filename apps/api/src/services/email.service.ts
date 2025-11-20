export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await this.send({
      to: email,
      subject: 'Password Reset Request',
      text: `Reset your password here: ${resetLink}`,
      html,
    });
  }

  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    const html = `
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await this.send({
      to: email,
      subject: 'Verify Your Email',
      text: `Verify your email here: ${verificationLink}`,
      html,
    });
  }

  async send(options: EmailOptions): Promise<void> {
    console.log(`[Email Service] Sending email to ${options.to}: ${options.subject}`);
    console.log(options.text);
  }
}

export const emailService = new EmailService();

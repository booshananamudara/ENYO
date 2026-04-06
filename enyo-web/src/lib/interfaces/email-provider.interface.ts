/**
 * Parameters for sending an email through any provider.
 */
export interface SendEmailParams {
  /** Recipient email address. */
  to: string;
  /** Email subject line. */
  subject: string;
  /** HTML body content. */
  html: string;
  /** Sender address override (provider default used if omitted). */
  from?: string;
}

/**
 * Abstraction over email delivery providers (e.g., Resend, SendGrid).
 * Implement this interface for each provider to keep the service layer decoupled.
 */
export interface IEmailProvider {
  /** Send an email and return the provider-assigned message ID. */
  sendEmail(params: SendEmailParams): Promise<{ id: string }>;
}

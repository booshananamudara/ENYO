import { Resend } from 'resend';
import type { IEmailProvider, SendEmailParams } from '@/lib/interfaces/email-provider.interface';

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM = 'ShopEnyo <noreply@shopEnyo.com>';

/** Resend implementation of the email provider interface. */
class ResendEmailProvider implements IEmailProvider {
  /** Send an email via Resend. */
  async sendEmail(params: SendEmailParams): Promise<{ id: string }> {
    const { data, error } = await resend.emails.send({
      from: params.from ?? DEFAULT_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error('Email send error:', error);
      return { id: 'error' };
    }

    return { id: data?.id ?? 'unknown' };
  }
}

/** Singleton email provider instance. */
export const emailProvider: IEmailProvider = new ResendEmailProvider();

/** Send order confirmation email. */
export async function sendOrderConfirmation(toEmail: string, orderNumber: string, total: string) {
  return emailProvider.sendEmail({
    to: toEmail,
    subject: `Order Confirmed — ${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1B3A5C;">Order Confirmed!</h1>
        <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
        <p>Total: <strong>${total}</strong></p>
        <p>We'll send you updates as your order progresses.</p>
        <hr />
        <p style="color: #888; font-size: 12px;">ShopEnyo — Shop Anywhere. Checkout Once.</p>
      </div>
    `,
  });
}

/** Send shipping update email. */
export async function sendShippingUpdate(
  toEmail: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string,
) {
  return emailProvider.sendEmail({
    to: toEmail,
    subject: `Shipping Update — ${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1B3A5C;">Shipping Update</h1>
        <p>Your order <strong>${orderNumber}</strong> status: <strong>${status}</strong></p>
        ${trackingNumber ? `<p>Tracking: <strong>${trackingNumber}</strong></p>` : ''}
        <hr />
        <p style="color: #888; font-size: 12px;">ShopEnyo — Shop Anywhere. Checkout Once.</p>
      </div>
    `,
  });
}

/** Send welcome email after registration. */
export async function sendWelcomeEmail(toEmail: string, name: string) {
  return emailProvider.sendEmail({
    to: toEmail,
    subject: 'Welcome to ShopEnyo!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1B3A5C;">Welcome, ${name}!</h1>
        <p>Thanks for joining ShopEnyo. Start shopping from any store and checkout once.</p>
        <ol>
          <li><a href="https://chromewebstore.google.com/detail/lhoapedkalbdndadogkiiegndiknpnjg" style="color: #2E75B6;">Install the EnyoCart Chrome extension</a></li>
          <li>Add products from any online store</li>
          <li>Checkout once on ShopEnyo.com</li>
        </ol>
        <hr />
        <p style="color: #888; font-size: 12px;">ShopEnyo — Shop Anywhere. Checkout Once.</p>
      </div>
    `,
  });
}

/** Send return approved email. */
export async function sendReturnApproved(
  toEmail: string,
  returnNumber: string,
  shippingLabelUrl?: string,
) {
  return emailProvider.sendEmail({
    to: toEmail,
    subject: `Return Approved — ${returnNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1B3A5C;">Return Approved</h1>
        <p>Your return <strong>${returnNumber}</strong> has been approved.</p>
        ${shippingLabelUrl ? `<p><a href="${shippingLabelUrl}">Download Shipping Label</a></p>` : ''}
        <p>Please ship your items within 14 days.</p>
        <hr />
        <p style="color: #888; font-size: 12px;">ShopEnyo — Shop Anywhere. Checkout Once.</p>
      </div>
    `,
  });
}

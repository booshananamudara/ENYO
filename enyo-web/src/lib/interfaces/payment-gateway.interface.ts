/**
 * Parameters for initiating a payment through a gateway.
 */
export interface InitiatePaymentParams {
  /** Internal order ID. */
  orderId: string;
  /** Amount to charge. */
  amount: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Payment method identifier (e.g., 'CREDIT_CARD', 'CRYPTO_BITCOIN'). */
  method: string;
  /** Optional metadata to attach to the transaction. */
  metadata?: Record<string, unknown>;
}

/**
 * Response returned after initiating a payment.
 */
export interface PaymentGatewayResponse {
  /** Gateway-assigned transaction ID. */
  transactionId: string;
  /** Current status of the payment at the gateway. */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** URL to redirect the user to for completing payment (if applicable). */
  redirectUrl?: string;
  /** Crypto wallet address for crypto payments (if applicable). */
  cryptoAddress?: string;
  /** QR code data/URL for scan-to-pay methods (if applicable). */
  qrCodeData?: string;
}

/**
 * Result of verifying a payment's current status at the gateway.
 */
export interface PaymentVerification {
  /** Gateway-assigned transaction ID. */
  transactionId: string;
  /** Verified payment status. */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Amount that was charged. */
  amount: number;
  /** Currency the amount was charged in. */
  currency: string;
  /** Timestamp when the payment was completed, if applicable. */
  paidAt?: string;
  /** Provider-specific metadata returned with the verification. */
  metadata?: Record<string, unknown>;
}

/**
 * Response returned after processing a refund.
 */
export interface RefundResponse {
  /** Gateway-assigned refund transaction ID. */
  refundId: string;
  /** Original transaction ID that was refunded. */
  transactionId: string;
  /** Refund status. */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Amount refunded. */
  amount: number;
  /** Currency of the refund. */
  currency: string;
}

/**
 * Abstraction over payment gateways (e.g., Bankful, Stripe, crypto processors).
 * Implement this interface for each gateway to keep the service layer decoupled.
 */
export interface IPaymentGateway {
  /** Initiate a payment and return the gateway response. */
  initiatePayment(params: InitiatePaymentParams): Promise<PaymentGatewayResponse>;

  /** Verify the current status of a payment by its transaction ID. */
  verifyPayment(transactionId: string): Promise<PaymentVerification>;

  /** Refund a payment (full or partial) by its transaction ID. */
  refundPayment(transactionId: string, amount: number): Promise<RefundResponse>;
}

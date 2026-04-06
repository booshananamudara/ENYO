import type { PaymentDetail, PaymentSummary } from '@/lib/types/payment';
import type { Payment, Order } from '@prisma/client';

type PaymentWithOrder = Payment & {
  order: Order & { user?: { name: string; email: string } };
};

/** Map a Prisma payment to a full detail DTO (customer view, strips metadata). */
export function toPaymentDetailDto(payment: Payment): PaymentDetail {
  return {
    id: payment.id,
    orderId: payment.orderId,
    method: payment.method,
    status: payment.status,
    amount: Number(payment.amount),
    currency: payment.currency,
    bankfulTxId: payment.bankfulTxId,
    cryptoAddress: payment.cryptoAddress,
    cryptoCurrency: payment.cryptoCurrency,
    cryptoAmount: payment.cryptoAmount ? Number(payment.cryptoAmount) : null,
    exchangeRate: payment.exchangeRate ? Number(payment.exchangeRate) : null,
    processingFee: payment.processingFee ? Number(payment.processingFee) : null,
    paidAt: payment.paidAt?.toISOString() ?? null,
    failedAt: payment.failedAt?.toISOString() ?? null,
    failureReason: payment.failureReason,
    refundedAmount: payment.refundedAmount ? Number(payment.refundedAmount) : null,
    refundedAt: payment.refundedAt?.toISOString() ?? null,
    metadata: null,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

/** Map a Prisma payment to a summary DTO for list views. */
export function toPaymentSummaryDto(payment: PaymentWithOrder): PaymentSummary {
  return {
    id: payment.id,
    orderId: payment.orderId,
    orderNumber: payment.order.orderNumber,
    method: payment.method,
    status: payment.status,
    amount: Number(payment.amount),
    currency: payment.currency,
    paidAt: payment.paidAt?.toISOString() ?? null,
    createdAt: payment.createdAt.toISOString(),
  };
}

/** Map a Prisma payment to a full admin detail DTO (includes all metadata). */
export function toAdminPaymentDetailDto(payment: Payment): PaymentDetail {
  return {
    ...toPaymentDetailDto(payment),
    metadata: payment.metadata as Record<string, unknown> | null,
  };
}

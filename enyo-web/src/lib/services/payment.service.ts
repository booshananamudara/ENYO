import * as paymentRepo from '@/lib/repositories/payment.repository';
import { toPaymentDetailDto, toPaymentSummaryDto } from '@/lib/dto/payment.dto';
import { NotFoundError } from '@/lib/errors';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { PaymentDetail, PaymentSummary, InitiatePaymentInput } from '@/lib/types/payment';
import type { PaginatedResponse } from '@/lib/types/api';

/** Initiate a payment session for an order. */
export async function initiatePayment(input: InitiatePaymentInput): Promise<PaymentDetail> {
  const existing = await paymentRepo.findPaymentByOrderId(input.orderId);
  if (existing) {
    return toPaymentDetailDto(existing);
  }
  const payment = await paymentRepo.createPayment({
    order: { connect: { id: input.orderId } },
    method: input.method as never,
    amount: 0,
    currency: input.currency as never,
    status: 'PENDING',
  });
  return toPaymentDetailDto(payment);
}

/** Process a payment webhook from Bankful. */
export async function processWebhook(data: {
  transactionId: string;
  status: string;
  amount: number;
  metadata?: Record<string, unknown>;
}): Promise<PaymentDetail> {
  const payment = await paymentRepo.findPaymentByBankfulTxId(data.transactionId);
  if (!payment) throw new NotFoundError('Payment not found');

  const isConfirmed = data.status === 'CONFIRMED' || data.status === 'confirmed';
  const isFailed = data.status === 'FAILED' || data.status === 'failed';

  const updated = await paymentRepo.updatePaymentStatus(payment.id, {
    status: isConfirmed ? 'CONFIRMED' : isFailed ? 'FAILED' : ('PROCESSING' as never),
    paidAt: isConfirmed ? new Date() : undefined,
    failedAt: isFailed ? new Date() : undefined,
    failureReason: isFailed ? 'Payment failed via webhook' : undefined,
    metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
  });

  return toPaymentDetailDto(updated);
}

/** Get a payment detail by order ID. */
export async function getPaymentByOrderId(orderId: string): Promise<PaymentDetail> {
  const payment = await paymentRepo.findPaymentByOrderId(orderId);
  if (!payment) throw new NotFoundError('Payment not found');
  return toPaymentDetailDto(payment);
}

/** Admin: get paginated payment list with filters. */
export async function getAllPayments(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  method?: string;
  search?: string;
}): Promise<PaginatedResponse<PaymentSummary>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const { data, total } = await paymentRepo.findAllPayments({ ...params, page, pageSize });

  return {
    data: data.map((p) => toPaymentSummaryDto(p as never)),
    total,
    page,
    pageSize,
  };
}

/** Admin: get payment aggregate stats. */
export async function getPaymentStats() {
  return paymentRepo.getPaymentStats();
}

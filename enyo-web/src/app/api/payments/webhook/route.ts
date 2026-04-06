import { NextRequest } from 'next/server';
import * as paymentService from '@/lib/services/payment.service';
import { paymentWebhookSchema } from '@/lib/validators/payment';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = paymentWebhookSchema.parse(body);
    const payment = await paymentService.processWebhook({
      transactionId: validated.transactionId,
      status: validated.status,
      amount: validated.amount,
      metadata: validated.metadata as Record<string, unknown> | undefined,
    });
    return successResponse(payment);
  } catch (error) {
    return errorResponse(error);
  }
}

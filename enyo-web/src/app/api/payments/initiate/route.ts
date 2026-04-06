import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import * as paymentService from '@/lib/services/payment.service';
import { initiatePaymentSchema } from '@/lib/validators/payment';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const validated = initiatePaymentSchema.parse(body);
    const payment = await paymentService.initiatePayment(validated);
    return successResponse(payment);
  } catch (error) {
    return errorResponse(error);
  }
}

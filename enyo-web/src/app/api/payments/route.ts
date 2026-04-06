import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';
import * as paymentService from '@/lib/services/payment.service';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');

    if (type === 'stats') {
      const stats = await paymentService.getPaymentStats();
      return successResponse(stats);
    }

    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '20');
    const status = searchParams.get('status') ?? undefined;
    const method = searchParams.get('method') ?? undefined;
    const search = searchParams.get('search') ?? undefined;
    const result = await paymentService.getAllPayments({ page, pageSize, status, method, search });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

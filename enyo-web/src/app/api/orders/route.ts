import { NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth-utils';
import * as orderService from '@/lib/services/order.service';
import { createOrderSchema } from '@/lib/validators/order';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '20');
    const status = searchParams.get('status') ?? undefined;
    const search = searchParams.get('search') ?? undefined;

    const user = await requireAuth();

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      const result = await orderService.getAllOrders({ page, pageSize, status, search });
      return successResponse(result);
    }

    const result = await orderService.getOrdersByUser(user.id, page, pageSize);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createOrderSchema.parse(body);
    const order = await orderService.createOrder(validated, user.id);
    return successResponse(order, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

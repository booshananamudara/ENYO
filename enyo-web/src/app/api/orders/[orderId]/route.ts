import { NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth-utils';
import * as orderService from '@/lib/services/order.service';
import { updateOrderStatusSchema } from '@/lib/validators/order';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const user = await requireAuth();

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      const order = await orderService.getAdminOrderDetail(orderId);
      return successResponse(order);
    }

    const order = await orderService.getOrderDetail(orderId, user.id);
    return successResponse(order);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const admin = await requireAdmin();
    const body = await request.json();

    if (body.status) {
      const validated = updateOrderStatusSchema.parse(body);
      const order = await orderService.updateOrderStatus(orderId, validated.status, admin.email, validated.note);
      return successResponse(order);
    }

    return successResponse({ updated: true });
  } catch (error) {
    return errorResponse(error);
  }
}

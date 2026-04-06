import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';
import * as orderService from '@/lib/services/order.service';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const admin = await requireAdmin();
    const order = await orderService.updateOrderStatus(orderId, 'DELIVERED', admin.email, 'Marked as fulfilled');
    return successResponse(order);
  } catch (error) {
    return errorResponse(error);
  }
}

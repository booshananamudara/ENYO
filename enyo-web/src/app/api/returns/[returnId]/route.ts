import { NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth-utils';
import * as returnService from '@/lib/services/return.service';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ returnId: string }> }) {
  try {
    const { returnId } = await params;
    const user = await requireAuth();
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const ret = await returnService.getReturnDetail(returnId, isAdmin ? undefined : user.id);
    return successResponse(ret);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ returnId: string }> }) {
  try {
    const { returnId } = await params;
    await requireAdmin();
    const body = await request.json();
    const ret = await returnService.updateReturn(returnId, body);
    return successResponse(ret);
  } catch (error) {
    return errorResponse(error);
  }
}

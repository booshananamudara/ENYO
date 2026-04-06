import { NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth-utils';
import * as returnService from '@/lib/services/return.service';
import { createReturnSchema } from '@/lib/validators/return';
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
      const result = await returnService.getAllReturns({ page, pageSize, status, search });
      return successResponse(result);
    }

    const result = await returnService.getReturnsByUser(user.id, page, pageSize);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createReturnSchema.parse(body);
    const ret = await returnService.createReturn(validated, user.id);
    return successResponse(ret, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

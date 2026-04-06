import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';
import * as userService from '@/lib/services/user.service';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '20');
    const search = searchParams.get('search') ?? undefined;
    const result = await userService.getAllUsers({ page, pageSize, search });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

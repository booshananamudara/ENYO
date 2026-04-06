import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';
import * as analyticsService from '@/lib/services/analytics.service';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');

    if (type === 'revenue') {
      const days = Number(searchParams.get('days') ?? '30');
      const data = await analyticsService.getRevenueChartData(days);
      return successResponse(data);
    }

    if (type === 'vendors') {
      const data = await analyticsService.getTopVendors();
      return successResponse(data);
    }

    if (type === 'methods') {
      const data = await analyticsService.getPaymentMethodDistribution();
      return successResponse(data);
    }

    const stats = await analyticsService.getDashboardStats();
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error);
  }
}

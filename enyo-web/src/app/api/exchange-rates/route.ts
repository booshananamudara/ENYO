import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';
import * as exchangeRateService from '@/lib/services/exchange-rate.service';
import { exchangeRateSchema } from '@/lib/validators/settings';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const rates = await exchangeRateService.getAllExchangeRates();
    const mapped = rates.map((r) => ({
      id: r.id,
      currency: r.currency,
      baseRate: Number(r.baseRate),
      surchargePercent: Number(r.surchargePercent),
      isActive: r.isActive,
    }));
    return successResponse(mapped);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { id, ...data } = body;
    const result = await exchangeRateService.updateExchangeRate(id, data, admin.email);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const encoded = btoa(JSON.stringify(body.items ?? []));
    return successResponse({ redirectUrl: `/checkout?cart=${encoded}` });
  } catch (error) {
    return errorResponse(error);
  }
}

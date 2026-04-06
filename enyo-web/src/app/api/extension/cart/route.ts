import { NextRequest } from 'next/server';
import { verifyExtensionToken, extractBearerToken } from '@/lib/extension-auth';
import { UnauthorizedError } from '@/lib/errors';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) throw new UnauthorizedError('Missing bearer token');

    const payload = await verifyExtensionToken(token);
    const body = await request.json();

    return successResponse({
      userId: payload.userId,
      cartItemCount: Array.isArray(body.items) ? body.items.length : 0,
      redirectUrl: `/checkout?cart=${btoa(JSON.stringify(body.items))}`,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextRequest } from 'next/server';
import { authenticateExtension } from '@/lib/extension-auth';
import { loginSchema } from '@/lib/validators/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);
    const result = await authenticateExtension(validated.email, validated.password);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

import { z } from 'zod';
import * as userService from '@/lib/services/user.service';
import { successResponse, errorResponse } from '@/lib/api-response';

const registerBodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = registerBodySchema.parse(body);
    const user = await userService.createUser(input);
    return successResponse({ id: user.id, email: user.email, name: user.name }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextResponse } from 'next/server';
import { AppError, ValidationError } from '@/lib/errors';
import { ZodError } from 'zod';

/** Return a success JSON response. */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/** Handle errors and return appropriate JSON response. */
export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    error.errors.forEach((e) => {
      const key = e.path.join('.');
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(e.message);
    });
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: fieldErrors },
      { status: 400 },
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, error: error.message, details: error.fieldErrors },
      { status: error.statusCode },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode },
    );
  }

  console.error('Unhandled error:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 },
  );
}

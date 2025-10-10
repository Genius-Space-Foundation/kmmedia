import { NextRequest, NextResponse } from "next/server";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function createError(
  message: string,
  statusCode: number = 500
): CustomError {
  return new CustomError(message, statusCode);
}

export function handleApiError(
  error: unknown,
  req?: NextRequest
): NextResponse {
  console.error("API Error:", {
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    url: req?.url,
    method: req?.method,
    timestamp: new Date().toISOString(),
  });

  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === "production";

  if (error instanceof CustomError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        ...(isProduction ? {} : { stack: error.stack }),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        message: isProduction ? "Internal server error" : error.message,
        ...(isProduction ? {} : { stack: error.stack }),
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: isProduction
        ? "Internal server error"
        : "Unknown error occurred",
    },
    { status: 500 }
  );
}

export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      const req = args[0] as NextRequest;
      return handleApiError(error, req);
    }
  };
}

// Logging utility
export function logError(error: Error, context?: Record<string, any>): void {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
  };

  console.error("Application Error:", JSON.stringify(errorLog, null, 2));

  // In production, you would send this to your error monitoring service
  // Example: Sentry.captureException(error, { extra: context });
}


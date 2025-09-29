/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { apiErrorResponseSchema } from "@/modules/auth/schema/auth-api.schema";

export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

export class AuthApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.name = "AuthApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const handleApiError = (error: unknown): NextResponse => {
  console.error("API Error:", error);

  // If it's our custom error, use it directly
  if (error instanceof AuthApiError) {
    return NextResponse.json(
      {
        error: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // If it's a validation error from Zod
  if (error && typeof error === "object" && "issues" in error) {
    const validationError = error as any;
    const errorMessages =
      validationError.issues?.map((issue: any) => issue.message) || [];

    return NextResponse.json(
      {
        error: "Validation failed",
        message: "Request payload validation failed",
        statusCode: 400,
        details: errorMessages,
      },
      { status: 400 }
    );
  }

  // If it's a fetch error (network/API call failed)
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return NextResponse.json(
      {
        error: "External API error",
        message: "Failed to communicate with external service",
        statusCode: 502,
      },
      { status: 502 }
    );
  }

  // If it's a JSON parsing error
  if (error instanceof SyntaxError && error.message.includes("JSON")) {
    return NextResponse.json(
      {
        error: "Invalid JSON",
        message: "Request body contains invalid JSON",
        statusCode: 400,
      },
      { status: 400 }
    );
  }

  // Default error response
  return NextResponse.json(
    {
      error: "Internal server error",
      cause: error,
      message: "An unexpected error occurred",
      statusCode: 500,
    },
    { status: 500 }
  );
};

export const createApiError = (
  message: string,
  statusCode: number = 400,
  details?: any
): AuthApiError => {
  return new AuthApiError(message, statusCode, details);
};

export const validateApiErrorResponse = (data: any) => {
  return apiErrorResponseSchema.safeParse(data);
};

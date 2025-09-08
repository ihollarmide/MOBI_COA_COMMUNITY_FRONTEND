/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { createSession } from "@/modules/auth/lib/session";
import {
  authenticateUserPayloadSchema,
  userAuthResponseSchema,
  ValidatedAuthenticateUserPayload,
  ValidatedUserAuthResponse,
} from "@/modules/auth/schema/auth-api.schema";
import {
  handleApiError,
  createApiError,
} from "@/modules/auth/lib/api-error-handler";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw createApiError("Invalid JSON in request body", 400);
    }

    // Validate the request payload
    const validationResult = authenticateUserPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      throw createApiError(
        "Request validation failed",
        400,
        validationResult.error.issues
      );
    }

    const validatedPayload: ValidatedAuthenticateUserPayload =
      validationResult.data;

    // Call your backend server to authenticate
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.COMPLETE_SIGNATURE_VERIFICATION}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...validatedPayload.xApiHeaders,
        },
        body: JSON.stringify(validatedPayload.body),
      }
    );

    if (!res.ok) {
      // Try to parse error response from backend
      let errorData: any;
      try {
        errorData = await res.json();
      } catch {
        // If we can't parse the error response, use the status text
        errorData = { error: res.statusText || "Authentication failed" };
      }

      // Return the error from the backend with the appropriate status code
      return NextResponse.json(
        {
          error: errorData.error || "Authentication failed",
          message: errorData.message || "Invalid credentials",
          statusCode: res.status,
          details: errorData.details,
        },
        { status: res.status }
      );
    }

    // Parse and validate the response from backend
    let responseData: any;
    try {
      responseData = await res.json();
    } catch (error) {
      console.error("Error parsing response:", error);
      throw createApiError("Invalid response from backend service", 502);
    }

    // Validate the response structure
    const responseValidationResult =
      userAuthResponseSchema.safeParse(responseData);
    if (!responseValidationResult.success) {
      console.error(
        "Backend response validation failed:",
        responseValidationResult.error
      );
      throw createApiError("Invalid response format from backend service", 502);
    }

    const validatedResponse: ValidatedUserAuthResponse =
      responseValidationResult.data;

    // Save session
    await createSession({
      walletAddress: validatedPayload.body.walletAddress,
      accessToken: validatedResponse.data.token,
      telegramId: validatedResponse.data.user.telegramId,
      telegramUsername: validatedResponse.data.user.telegramUsername,
      telegramJoined: validatedResponse.data.user.telegramJoined,
      twitterUsername: validatedResponse.data.user.twitterUsername,
      twitterFollowed: validatedResponse.data.user.twitterFollowed,
      instagramFollowed: validatedResponse.data.user.instagramFollowed,
      phoneNumberVerified: validatedResponse.data.user.phoneNumberVerified,
      phoneNumber: validatedResponse.data.user.phoneNumber,
      isFlagged: validatedResponse.data.user.isFlagged,
      updatedAt: validatedResponse.data.user.updatedAt,
      uplineId: validatedPayload.extras.uplineId
        ? validatedPayload.extras.uplineId
        : validatedResponse.data.user.uplineId,
      genesisClaimed: validatedPayload.extras.isGenesisClaimed
        ? validatedPayload.extras.isGenesisClaimed
        : validatedResponse.data.user.genesisClaimed,
      createdAt: validatedResponse.data.user.createdAt,
    });

    // Return success response with validated data
    return NextResponse.json({
      status: "success",
      data: {
        token: validatedResponse.data.token,
        user: {
          ...validatedResponse.data.user,
          uplineId: validatedPayload.extras.uplineId
            ? validatedPayload.extras.uplineId
            : validatedResponse.data.user.uplineId,
          genesisClaimed: validatedPayload.extras.isGenesisClaimed
            ? validatedPayload.extras.isGenesisClaimed
            : validatedResponse.data.user.genesisClaimed,
        },
      },
      message: "Authentication successful",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

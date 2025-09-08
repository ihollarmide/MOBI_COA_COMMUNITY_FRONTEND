import { NextResponse } from "next/server";
import { updateSession, getSession } from "@/modules/auth/lib/session";
import {
  updateSessionSchema,
  ValidatedUpdateSessionPayload,
} from "@/modules/auth/schema/auth-api.schema";
import {
  handleApiError,
  createApiError,
} from "@/modules/auth/lib/api-error-handler";

export async function PATCH(req: Request) {
  try {
    // Check if user has an active session
    const currentSession = await getSession();
    if (!currentSession) {
      return NextResponse.json(null, { status: 200 });
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw createApiError("Invalid JSON in request body", 400);
    }

    // Validate the request payload
    const validationResult = updateSessionSchema.safeParse(body);
    if (!validationResult.success) {
      throw createApiError(
        "Request validation failed",
        400,
        validationResult.error.issues
      );
    }

    const validatedPayload: ValidatedUpdateSessionPayload =
      validationResult.data;

    // Update the session with validated data
    const updatedSession = await updateSession(validatedPayload);

    if (!updatedSession) {
      throw createApiError("Failed to update session", 500);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { accessToken, ...rest } = updatedSession;

    // Return success response with updated session data
    return NextResponse.json({
      success: true,
      data: rest,
      message: "Session updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Also support PUT method for backward compatibility
export async function PUT(req: Request) {
  return PATCH(req);
}

// Get session
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(null, { status: 200 });
  }
  return NextResponse.json(session);
}

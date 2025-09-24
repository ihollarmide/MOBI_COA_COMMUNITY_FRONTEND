// app/api/social/twitter/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  createEncodedState,
  decodeState,
  validateState,
} from "@/lib/state-encoding.utils";
import { cookies } from "next/headers";

// Generate PKCE code verifier and challenge
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  return { codeVerifier, codeChallenge };
}

// Initiate OAuth 2.0 flow - Only handles redirection
export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (action !== "initiate") {
    return NextResponse.json(
      { error: "Invalid action. Use ?action=initiate to start OAuth flow" },
      { status: 400 }
    );
  }

  // Generate PKCE parameters
  const { codeVerifier, codeChallenge } = generatePKCE();

  // Generate CSRF token for additional security
  const csrfToken = crypto.randomBytes(32).toString("base64url");

  // Create and encode state as base64url string
  const state = createEncodedState(codeVerifier, codeChallenge, csrfToken, 10);

  // Validate required environment variables
  if (!process.env.TWITTER_CLIENT_ID) {
    return NextResponse.json(
      { error: "TWITTER_CLIENT_ID environment variable is not set" },
      { status: 500 }
    );
  }

  if (!process.env.TWITTER_REDIRECT_URI) {
    return NextResponse.json(
      { error: "TWITTER_REDIRECT_URI environment variable is not set" },
      { status: 500 }
    );
  }

  // Define scopes - space-separated as per documentation
  const scopes = [
    "tweet.read",
    "users.read",
    "offline.access", // For refresh token support
  ].join(" ");

  // Build authorization URL with proper encoding
  const authParams = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: process.env.TWITTER_REDIRECT_URI,
    scope: scopes,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `https://x.com/i/oauth2/authorize?${authParams.toString()}`;

  // Store sensitive parameters in httpOnly cookies for security
  const response = NextResponse.redirect(authUrl);

  // Store sensitive data in httpOnly cookies
  response.cookies.set("twitter_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  response.cookies.set("twitter_csrf_token", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  response.cookies.set("twitter_code_challenge", codeChallenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  response.cookies.set("twitter_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}

// In-memory store for processed codes (production: use Redis/DB with SETNX or similar)
const processedCodes = new Set<string>();

export async function POST(req: Request) {
  let code: string | undefined;

  try {
    const { code: rawCode, state } = await req.json();
    code = rawCode;

    // Validate required parameters
    if (
      !code ||
      typeof code !== "string" ||
      !state ||
      typeof state !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Authorization code and state are required" },
        { status: 400 }
      );
    }

    // ✅ Mark code as permanently used (first request wins)
    if (processedCodes.has(code)) {
      return NextResponse.json(
        { success: false, error: "Authorization code has already been used" },
        { status: 400 }
      );
    }
    processedCodes.add(code);

    // Validate environment
    if (
      !process.env.TWITTER_CLIENT_ID ||
      !process.env.TWITTER_CLIENT_SECRET ||
      !process.env.TWITTER_REDIRECT_URI
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Twitter OAuth environment variables are not configured",
        },
        { status: 500 }
      );
    }

    // Decode/validate state
    let parsedState;
    try {
      parsedState = decodeState(state);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid state parameter format" },
        { status: 400 }
      );
    }

    if (!validateState(parsedState)) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired state parameter" },
        { status: 400 }
      );
    }

    const twitterOauthState = (await cookies()).get(
      "twitter_oauth_state"
    )?.value;
    const twitterCodeVerifier = (await cookies()).get(
      "twitter_code_verifier"
    )?.value;
    const twitterCsrfToken = (await cookies()).get("twitter_csrf_token")?.value;

    // Validate cookies against state
    if (twitterOauthState !== state) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid state parameter - possible CSRF attack",
        },
        { status: 400 }
      );
    }
    if (twitterCodeVerifier !== parsedState.codeVerifier) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid code verifier - possible CSRF attack",
        },
        { status: 400 }
      );
    }
    if (twitterCsrfToken !== parsedState.csrfToken) {
      return NextResponse.json(
        { success: false, error: "Invalid CSRF token - possible CSRF attack" },
        { status: 400 }
      );
    }

    // Prepare token exchange
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.TWITTER_REDIRECT_URI!,
      code_verifier: parsedState.codeVerifier,
    });

    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
          ).toString("base64"),
      },
      body: tokenParams,
    });

    if (!tokenRes.ok) {
      const errorData = await tokenRes.json();
      return NextResponse.json(
        {
          success: false,
          error: "Failed to exchange code for token",
          details: errorData,
        },
        { status: tokenRes.status }
      );
    }

    const tokenData = await tokenRes.json();

    // Get user info
    const userRes = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      const userErrorData = await userRes.json();
      return NextResponse.json(
        {
          success: false,
          error: "Failed to get user information",
          details: userErrorData,
        },
        { status: userRes.status }
      );
    }

    const userData = await userRes.json();

    return NextResponse.json({
      success: true,
      ...tokenData,
      user: userData.data,
    });
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during token exchange" },
      { status: 500 }
    );
  }
}

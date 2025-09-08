// app/api/auth/twitter/refresh/route.ts

import { NextResponse } from "next/server";

// Refresh token endpoint
export async function POST(req: Request) {
  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    if (!process.env.TWITTER_CLIENT_ID) {
      return NextResponse.json(
        { error: "TWITTER_CLIENT_ID environment variable is not set" },
        { status: 500 }
      );
    }

    // Exchange refresh token for new access token
    const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: refresh_token,
        grant_type: "refresh_token",
        client_id: process.env.TWITTER_CLIENT_ID,
      }),
    });

    if (!tokenRes.ok) {
      const errorData = await tokenRes.json();
      console.error("Token refresh failed:", {
        status: tokenRes.status,
        statusText: tokenRes.statusText,
        error: errorData,
      });
      return NextResponse.json(
        {
          error: "Failed to refresh token",
          details: errorData,
          status: tokenRes.status,
        },
        { status: tokenRes.status }
      );
    }

    const tokenData = await tokenRes.json();

    return NextResponse.json({
      success: true,
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token, // New refresh token
      scope: tokenData.scope,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Internal server error during token refresh" },
      { status: 500 }
    );
  }
}

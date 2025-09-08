/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utility functions for encoding and decoding state objects for OAuth flows
 * Uses base64url encoding for URL-safe transmission
 */

export interface OAuthState {
  codeVerifier: string;
  codeChallenge: string;
  csrfToken: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Encode a state object to a base64url string
 * @param stateObject - The state object to encode
 * @returns Base64url encoded string
 */
export function encodeState(stateObject: OAuthState): string {
  return Buffer.from(JSON.stringify(stateObject)).toString("base64url");
}

/**
 * Decode a base64url string back to a state object
 * @param encodedState - The base64url encoded state string
 * @returns Decoded state object
 * @throws Error if the string is invalid
 */
export function decodeState(encodedState: string): OAuthState {
  try {
    const decoded = JSON.parse(
      Buffer.from(encodedState, "base64url").toString("utf-8")
    );
    return decoded as OAuthState;
  } catch (error) {
    console.error("Error decoding state:", error);
    throw new Error("Invalid state parameter format");
  }
}

/**
 * Validate a state object structure and expiration
 * @param stateObject - The state object to validate
 * @returns True if valid, false otherwise
 */
export function validateState(stateObject: any): stateObject is OAuthState {
  const requiredFields: (keyof OAuthState)[] = [
    "codeVerifier",
    "codeChallenge",
    "csrfToken",
    "timestamp",
    "expiresAt",
  ];

  return (
    requiredFields.every((field) => field in stateObject) &&
    typeof stateObject.timestamp === "number" &&
    typeof stateObject.expiresAt === "number" &&
    stateObject.expiresAt > Date.now()
  );
}

/**
 * Create a new state object with current timestamp and expiration
 * @param codeVerifier - PKCE code verifier
 * @param codeChallenge - PKCE code challenge
 * @param csrfToken - CSRF token
 * @param expirationMinutes - Expiration time in minutes (default: 10)
 * @returns New state object
 */
export function createStateObject(
  codeVerifier: string,
  codeChallenge: string,
  csrfToken: string,
  expirationMinutes: number = 10
): OAuthState {
  const now = Date.now();
  return {
    codeVerifier,
    codeChallenge,
    csrfToken,
    timestamp: now,
    expiresAt: now + expirationMinutes * 60 * 1000,
  };
}

/**
 * Encode state object directly from individual parameters
 * @param codeVerifier - PKCE code verifier
 * @param codeChallenge - PKCE code challenge
 * @param csrfToken - CSRF token
 * @param expirationMinutes - Expiration time in minutes (default: 10)
 * @returns Base64url encoded state string
 */
export function createEncodedState(
  codeVerifier: string,
  codeChallenge: string,
  csrfToken: string,
  expirationMinutes: number = 10
): string {
  const stateObject = createStateObject(
    codeVerifier,
    codeChallenge,
    csrfToken,
    expirationMinutes
  );
  return encodeState(stateObject);
}

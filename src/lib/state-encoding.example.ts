/**
 * Example usage of state encoding utilities
 * This file demonstrates how to use the state encoding functions
 */

import {
  createEncodedState,
  decodeState,
  validateState,
  createStateObject,
  encodeState,
} from "./state-encoding.utils";

// Example 1: Create encoded state directly
export function createTwitterOAuthState() {
  const codeVerifier = "example_code_verifier_123";
  const codeChallenge = "example_code_challenge_456";
  const csrfToken = "example_csrf_token_789";

  // Create encoded state in one step
  const encodedState = createEncodedState(
    codeVerifier,
    codeChallenge,
    csrfToken,
    10
  );
  console.log("Encoded state:", encodedState);

  return encodedState;
}

// Example 2: Decode and validate state
export function processOAuthCallback(encodedState: string) {
  try {
    // Decode the state
    const decodedState = decodeState(encodedState);
    console.log("Decoded state:", decodedState);

    // Validate the state
    if (validateState(decodedState)) {
      console.log("State is valid and not expired");
      return decodedState;
    } else {
      console.log("State is invalid or expired");
      return null;
    }
  } catch (error) {
    console.error("Error processing state:", error);
    return null;
  }
}

// Example 3: Manual state object creation
export function createCustomState() {
  const stateObject = createStateObject(
    "custom_verifier",
    "custom_challenge",
    "custom_csrf",
    15 // 15 minutes expiration
  );

  console.log("State object:", stateObject);

  // Encode it
  const encoded = encodeState(stateObject);
  console.log("Encoded:", encoded);

  return encoded;
}

// Example 4: URL parameter usage
export function buildOAuthUrl(
  baseUrl: string,
  clientId: string,
  redirectUri: string
) {
  const state = createTwitterOAuthState();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    // ... other OAuth parameters
  });

  return `${baseUrl}?${params.toString()}`;
}

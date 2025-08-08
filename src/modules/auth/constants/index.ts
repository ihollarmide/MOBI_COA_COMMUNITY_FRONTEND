// Define session max age in seconds (1 day)
export const SESSION_MAX_AGE: number = 30 * 24 * 60 * 30;

export const AUTH_ACTIONS = {
  CREATE_SESSION: "create-session",
} as const;

export const AUTH_TOAST_ID = "auth-toast";

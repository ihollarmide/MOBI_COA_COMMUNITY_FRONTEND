export const API_ENDPOINTS = {
  // AUTH
  AUTH: {
    INITIATE_USER_AUTHENTICATION: "/user/auth/initiate-login",
    COMPLETE_SIGNATURE_VERIFICATION: "/user/auth/verify-signature",
    COMPLETE_USER_AUTHENTICATION: "/api/auth/login",
    STATUS: "/user/status",
  },

  VMCC: {
    GET_BY_COA_USER_ID: "/user/profile/get-vmcc-public",
  },

  PREPARE_CLAIM: "/user/prepare-claim",

  VERIFY: {
    INSTAGRAM: "/user/auth/verify/instagram",
    TWITTER: "/user/verify/twitter",
    TELEGRAM: "/user/auth/verify/telegram",
    TWEET: "/user/verify/tweet",

    REQUEST_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
  },

  LOG_TWITTER_HANDLE: "/user/log-twitter-handle",
};

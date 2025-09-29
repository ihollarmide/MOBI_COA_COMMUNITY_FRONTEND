export const API_ENDPOINTS = {
  // AUTH
  AUTH: {
    INITIATE_USER_AUTHENTICATION: "/user/auth/initiate-login",
    COMPLETE_SIGNATURE_VERIFICATION: "/user/auth/verify-signature",
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
    ADD_TELEGRAM_USERNAME: "/user/auth/add/telegram",
    TELEGRAM_BOT_INFO: "/user/auth/bot-info",
    TWEET: "/user/verify/tweet",

    REQUEST_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
  },

  LOG_TWITTER_HANDLE: "/user/log-twitter-handle",
};

export const API_ENDPOINTS = {
  // AUTH
  AUTH: {
    INITIATE_USER_AUTHENTICATION: "/user/auth/initiate-login",
    COMPLETE_USER_AUTHENTICATION: "/user/auth/verify-signature",
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
  },

  LOG_TWITTER_HANDLE: "/user/log-twitter-handle",
};

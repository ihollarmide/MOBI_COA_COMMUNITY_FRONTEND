declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_ENVIRONMENT: "local" | "production" | "development";
    AUTH_TRUST_HOST: "true";
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_COA_API_URL: string;
    NEXT_PUBLIC_APP_URL: string;
    AUTH_URL: string;
    AUTH_SECRET: string;
    BASE_SEPOLIA_RPC_URL: string;
    BSC_RPC_URL: string;
    BASE_SEPOLIA_FALLBACK_RPC_URL: string;
    BSC_FALLBACK_RPC_URL: string;
  }
}

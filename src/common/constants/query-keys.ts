import { Address } from "viem";

/**
 * Creates a set of query keys for React Query caching.
 *
 * @param baseKey - The base key for the query set.
 * @returns An object with methods to generate various query keys.
 *
 * @example
 * const keys = createQueryKeys("users");
 * keys.all // => [orgId, "admin", "users"]
 * keys.list({ page: 1 }) // => [orgId, "admin", "users", "list", { page: 1 }]
 * keys.detail("123") // => [orgId, "admin", "users", "detail", "123"]
 */
const createQueryKeys = <T extends Record<string, unknown>>(
  baseKey: string
) => {
  const keys = {
    all: ["coa-community", baseKey] as const,
    lists: () => [...keys.all, "list"] as const,
    list: (params?: T) =>
      [
        ...keys.lists(),
        Object.fromEntries(
          Object.entries(params ?? {})
            .map(([k, v]) => [
              k,
              k === "filters" && typeof v === "object" ? JSON.stringify(v) : v,
            ])
            .filter(([, v]) => v != null)
        ),
      ] as const,
    details: () => [...keys.all, "detail"] as const,
    detail: (id: string | number) => [...keys.details(), id] as const,
  };

  return keys;
};

export const QUERY_KEYS = {
  AUTH_STATUS: createQueryKeys("auth-status"),
  CLAIM_PARAMETERS: createQueryKeys("claim-parameters"),
  VMCC_DETAILS: createQueryKeys("vmcc-details"),
  IS_CLAIMED_KEY: createQueryKeys<{ address?: Address }>("is-claimed-key"),
  UPLINE_ID: createQueryKeys<{ address?: Address }>("upline-id"),
};

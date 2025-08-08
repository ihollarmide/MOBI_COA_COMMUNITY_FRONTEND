import { QUERY_KEYS } from "@/common/constants/query-keys";
import { AuthUser, GetAuthStatusResponse } from "../types";
import { QueryClient } from "@tanstack/react-query";

export const updateAuthStatusQuery = ({
  queryClient,
  payload,
}: {
  queryClient: QueryClient;
  payload: Partial<AuthUser>;
}) => {
  const existingQuery: GetAuthStatusResponse | undefined =
    queryClient.getQueryData(QUERY_KEYS.AUTH_STATUS.list());

  if (existingQuery) {
    queryClient.setQueryData(QUERY_KEYS.AUTH_STATUS.list(), {
      ...existingQuery,
      data: {
        ...existingQuery.data,
        ...payload,
      },
    });
  }
};

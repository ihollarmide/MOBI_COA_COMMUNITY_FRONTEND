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

  console.log(existingQuery);

  if (existingQuery) {
    queryClient.setQueryData(QUERY_KEYS.AUTH_STATUS.list(), {
      ...existingQuery,
      data: {
        ...existingQuery.data,
        ...payload,
      },
    });
  }

  console.log(queryClient.getQueryData(QUERY_KEYS.AUTH_STATUS.list()));
};

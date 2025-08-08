import { QueryKey, useQueryClient } from "@tanstack/react-query";

export function useGetQuery({ queryKey }: { queryKey: QueryKey }) {
  const queryClient = useQueryClient();
  const res = queryClient.getQueryData(queryKey);
  return res;
}

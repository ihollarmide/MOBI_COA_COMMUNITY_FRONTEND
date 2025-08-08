import {
  QueryClient,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export async function invalidateQueries({
  queryKeys,
  queryClient,
  exact = false,
}: {
  queryKeys: QueryKey[];
  queryClient: QueryClient;
  exact?: boolean;
}) {
  try {
    await Promise.all([
      queryKeys.map((queryKey) =>
        queryClient.invalidateQueries({
          queryKey,
          exact,
          refetchType: "all",
        })
      ),
    ]);
  } catch (error) {
    console.error("Failed to invalidate queries:", error);
  }
}

export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      queryKeys,
      exact,
    }: {
      queryKeys: QueryKey[];
      exact?: boolean;
    }) => invalidateQueries({ queryKeys, queryClient, exact }),
  });
  return mutation.mutate;
};

export const useInvalidateAllQueries = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => queryClient.invalidateQueries(),
  });
  return mutation.mutate;
};

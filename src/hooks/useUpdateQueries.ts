import {
  QueryClient,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export async function updateQueries({
  data,
  queryClient,
}: {
  data: {
    queryKey: QueryKey;
    payload: unknown;
  }[];
  queryClient: QueryClient;
}) {
  try {
    for (const { queryKey, payload } of data) {
      await queryClient.setQueryData(queryKey, payload);
    }
  } catch (error) {
    console.error("Failed to update queries:", error);
  }
}

export const useUpdateQueries = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      data,
    }: {
      data: { queryKey: QueryKey; payload: unknown }[];
    }) => updateQueries({ data, queryClient }),
  });
  return mutation.mutate;
};

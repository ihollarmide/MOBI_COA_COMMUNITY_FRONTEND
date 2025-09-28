import { QUERY_KEYS } from "@/common/constants/query-keys";
import { get } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetAuthStatusResponse } from "@/modules/auth/types";
import { updateAuthStatusQuery } from "@/modules/auth/lib/update-auth-query.lib";

export const getAuthStatus = async () => {
  try {
    const data = await get<GetAuthStatusResponse>({
      url: API_ENDPOINTS.AUTH.STATUS,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Get auth status error:`, error);
    const message =
      error instanceof Error ? error.message : `Get auth status failed`;
    throw new Error(message);
  }
};

export const useGetAuthStatus = ({
  isEnabled = true,
}: {
  isEnabled?: boolean;
} = {}) => {
  const res = useQuery({
    queryKey: QUERY_KEYS.AUTH_STATUS.list(),
    queryFn: getAuthStatus,
    enabled: isEnabled,
  });

  return res;
};

export const useRetrieveAuthStatus = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: getAuthStatus,
    onSuccess: (data) => {
      updateAuthStatusQuery({
        queryClient,
        payload: data.data,
      });
    },
  });

  return res;
};

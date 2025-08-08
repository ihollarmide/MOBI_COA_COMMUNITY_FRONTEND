import { QUERY_KEYS } from "@/common/constants/query-keys";
import { get } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { GetVmccDetailsByCoaUserIdResponse } from "@/modules/auth/types";

export const getVmccDetailsByCoaUserId = async (coaUserId: string) => {
  try {
    const data = await get<GetVmccDetailsByCoaUserIdResponse>({
      url: API_ENDPOINTS.VMCC.GET_BY_COA_USER_ID,
      isProtected: false,
      config: {
        baseURL: process.env.NEXT_PUBLIC_COA_API_URL,
        params: {
          coaUserId,
        },
      },
    });
    return data;
  } catch (error: unknown) {
    console.error(`Get auth status error:`, error);
    const message =
      error instanceof Error ? error.message : `Get auth status failed`;
    throw new Error(message);
  }
};

export const useGetVmccDetailsByCoaUserId = ({
  coaUserId,
  enabled = true,
}: {
  coaUserId: string | number;
  enabled?: boolean;
}) => {
  const res = useQuery({
    queryKey: QUERY_KEYS.VMCC_DETAILS.list({ coaUserId }),
    queryFn:
      !!coaUserId && !!enabled
        ? () => getVmccDetailsByCoaUserId(coaUserId.toString())
        : skipToken,
  });

  return res;
};

export const useRetrieveVmccDetailsByCoaUserId = () => {
  const res = useMutation({
    mutationFn: getVmccDetailsByCoaUserId,
  });

  return res;
};

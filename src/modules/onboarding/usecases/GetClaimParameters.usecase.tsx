import { QUERY_KEYS } from "@/common/constants/query-keys";
import { get } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetClaimParametersResponse } from "../types";

export const getClaimParameters = async () => {
  try {
    const data = await get<GetClaimParametersResponse>({
      url: API_ENDPOINTS.PREPARE_CLAIM,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Get claim parameters error:`, error);
    const message =
      error instanceof Error ? error.message : `Get claim parameters failed`;
    throw new Error(message);
  }
};

export const useFetchClaimParameters = () => {
  const res = useQuery({
    queryKey: QUERY_KEYS.CLAIM_PARAMETERS.all,
    queryFn: getClaimParameters,
  });

  return res;
};

export const useRetrieveClaimParameters = () => {
  const res = useMutation({
    mutationFn: getClaimParameters,
  });

  return res;
};

import { post } from "@/lib/api-client";
import { VerifySocialPayload } from "../types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { useInvalidateQueries } from "@/hooks/useInvalidateQueries";

export const logTwitterHandle = async (payload: VerifySocialPayload) => {
  try {
    const data = await post<unknown, VerifySocialPayload>({
      url: API_ENDPOINTS.VERIFY.INSTAGRAM,
      payload: payload,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Log Twitter handle error:`, error);
    const message =
      error instanceof Error ? error.message : `Log Twitter handle failed`;
    throw new Error(message);
  }
};

const TOAST_ID = "log-twitter-handle";

export const useLogTwitterHandle = () => {
  const invalidateQueries = useInvalidateQueries();
  const mutation = useMutation({
    mutationFn: logTwitterHandle,
    onMutate: () => {
      toast.loading("Verifying your Twitter account...", {
        id: TOAST_ID,
      });
    },
    onSuccess: () => {
      toast.success("Your Twitter account has been verified successfully", {
        id: TOAST_ID,
      });
      invalidateQueries({
        queryKeys: [QUERY_KEYS.AUTH_STATUS.all],
      });
    },
    onError: () => {
      toast.error("Failed to verify your Twitter account", {
        id: TOAST_ID,
      });
    },
  });

  return mutation;
};

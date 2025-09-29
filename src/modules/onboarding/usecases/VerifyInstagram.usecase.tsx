import { post } from "@/lib/api-client";
import { AddUsernamePayload, VerifySocialResponse } from "../types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/useInvalidateQueries";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { updateAuthStatusQuery } from "@/modules/auth/lib/update-auth-query.lib";

export const verifyInstagram = async (payload: AddUsernamePayload) => {
  try {
    const data = await post<VerifySocialResponse, AddUsernamePayload>({
      url: API_ENDPOINTS.VERIFY.INSTAGRAM,
      payload: payload,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Verify Instagram error:`, error);
    const message =
      error instanceof Error ? error.message : `Verify Instagram failed`;
    throw new Error(message);
  }
};

const TOAST_ID = "verify-instagram";

export const useVerifyInstagram = () => {
  const queryClient = useQueryClient();
  const invalidateQueries = useInvalidateQueries();
  const mutation = useMutation({
    mutationFn: verifyInstagram,
    onMutate: () => {
      toast.loading("Verifying your Instagram account...", {
        id: TOAST_ID,
      });
    },
    onSuccess: (data, variables) => {
      if (data.data.success) {
        toast.success("Your Instagram account has been verified successfully", {
          id: TOAST_ID,
        });
        updateAuthStatusQuery({
          queryClient,
          payload: {
            instagramFollowed: true,
            instagramUsername: variables.username,
          },
        });
      } else {
        toast.error("Failed to verify your Instagram account", {
          id: TOAST_ID,
        });
      }
      invalidateQueries({
        queryKeys: [QUERY_KEYS.AUTH_STATUS.all],
      });
    },
    onError: () => {
      toast.error("Failed to verify your Instagram account", {
        id: TOAST_ID,
      });
    },
  });

  return mutation;
};

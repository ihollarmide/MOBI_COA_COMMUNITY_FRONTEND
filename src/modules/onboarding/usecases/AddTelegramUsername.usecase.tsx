import { post } from "@/lib/api-client";
import { AddUsernamePayload, VerifySocialResponse } from "../types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/useInvalidateQueries";
import { QUERY_KEYS } from "@/common/constants/query-keys";
import { updateAuthStatusQuery } from "@/modules/auth/lib/update-auth-query.lib";
import { useSession } from "next-auth/react";

export const addTelegramUsername = async (payload: AddUsernamePayload) => {
  try {
    const data = await post<VerifySocialResponse, AddUsernamePayload>({
      url: API_ENDPOINTS.VERIFY.ADD_TELEGRAM_USERNAME,
      payload: {
        username: payload.username,
      },
    });
    return data;
  } catch (error: unknown) {
    console.error(`Add Telegram username error:`, error);
    const message =
      error instanceof Error ? error.message : `Add Telegram username failed`;
    throw new Error(message);
  }
};

const TOAST_ID = "add-telegram-username";

export const useAddTelegramUsername = () => {
  const invalidateQueries = useInvalidateQueries();
  const { data: session } = useSession();
  const { update } = useSession();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: addTelegramUsername,
    onMutate: () => {
      toast.loading("Adding your Telegram username...", {
        id: TOAST_ID,
      });
    },
    onSuccess: (data, payload) => {
      if (data.data.success) {
        toast.success("Your Telegram username has been added successfully", {
          description: "",
          id: TOAST_ID,
        });
        updateAuthStatusQuery({
          queryClient,
          payload: {
            telegramUsername: payload.username,
          },
        });
        update({
          ...session,
          user: {
            ...session?.user,
            telegramUsername: payload.username,
          },
        });
      } else {
        toast.error("Failed to add your Telegram username", {
          description: "",
          id: TOAST_ID,
        });
      }
      invalidateQueries({
        queryKeys: [QUERY_KEYS.AUTH_STATUS.all],
      });
    },
    onError: () => {
      toast.error("Failed to add your Telegram username", {
        description: "",
        id: TOAST_ID,
      });
    },
  });

  return mutation;
};

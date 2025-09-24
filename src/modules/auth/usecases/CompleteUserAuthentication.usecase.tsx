import { API_ENDPOINTS } from "@/lib/api-endpoints";
import {
  BaseCompleteAuthenticationPayload,
  CompleteSignatureVerificationBody,
  CompleteUserAuthenticationResponse,
} from "@/modules/auth/types";
import { post } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { AUTH_TOAST_ID } from "@/modules/auth/constants";
import { toast } from "sonner";
import { getUplineId } from "@/modules/onboarding/usecases/GetUplineId.usecase";
import { getIsClaimedKey } from "@/modules/onboarding/usecases/GetIsClaimedKey.usecase";
import { signIn } from "next-auth/react";
import {
  getCompleteSignPayloadFromAuthResponse,
  getRedirectRouteOnSignin,
} from "../lib/session";
import { useEffect } from "react";

export const completeUserAuthentication = async (
  payload: BaseCompleteAuthenticationPayload
) => {
  try {
    const uplineId = await getUplineId({
      address: payload.body.walletAddress,
      chainId: payload.body.chainId,
    });

    const isGenesisClaimed = await getIsClaimedKey({
      address: payload.body.walletAddress,
      chainId: payload.body.chainId,
    });

    const response = await post<
      CompleteUserAuthenticationResponse,
      CompleteSignatureVerificationBody
    >({
      url: API_ENDPOINTS.AUTH.COMPLETE_SIGNATURE_VERIFICATION,
      payload: payload.body,
      isProtected: false,
      config: {
        headers: {
          ...payload.xApiHeaders,
        },
      },
    });

    const restructuredResponse = {
      ...response,
      data: {
        ...response.data,
        user: {
          ...response.data.user,
          uplineId,
          genesisClaimed: isGenesisClaimed,
        },
      },
    };

    return restructuredResponse;
  } catch (error: unknown) {
    console.error(`Complete user authentication error:`, error);
    const message =
      error instanceof Error
        ? error.message
        : `Complete user authentication failed`;
    throw new Error(message);
  }
};

export const useCompleteSignin = () => {
  const mutation = useMutation({
    mutationFn: (payload: CompleteUserAuthenticationResponse) => {
      console.log(getRedirectRouteOnSignin(payload));
      return signIn("credentials", {
        payload: JSON.stringify(
          getCompleteSignPayloadFromAuthResponse(payload)
        ),
        redirectTo: getRedirectRouteOnSignin(payload),
      });
    },
    onMutate: () => {
      toast.loading("Completing User Authentication", {
        description: "",
        id: AUTH_TOAST_ID,
      });
    },
    onSuccess() {
      toast.success("Authentication successful", {
        description: "",
        id: AUTH_TOAST_ID,
      });
    },
    onError: (error) => {
      toast.error("Error completing authentication", {
        id: AUTH_TOAST_ID,
      });
      console.error("Complete user authentication error:", error);
    },
  });

  return mutation;
};

export const useCompleteUserAuthentication = () => {
  const { mutate: completeSignin, isPending: isCompletingSignin } =
    useCompleteSignin();
  const mutation = useMutation({
    mutationFn: (payload: BaseCompleteAuthenticationPayload) =>
      completeUserAuthentication({
        ...payload,
      }),
    onMutate: () => {
      toast.loading("Completing User Authentication", {
        description: "",
        id: AUTH_TOAST_ID,
      });
    },
    onSuccess: (data) => {
      completeSignin(data);
    },
    onError: (error) => {
      toast.error("Error completing authentication", {
        id: AUTH_TOAST_ID,
      });
      console.error("Complete user authentication error:", error);
    },
  });

  return {
    ...mutation,
    isPending: isCompletingSignin || mutation.isPending,
  };
};

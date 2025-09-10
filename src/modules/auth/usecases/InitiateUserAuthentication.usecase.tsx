import { post } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import {
  InitiateUserAuthenticationPayload,
  InitiateUserAuthenticationResponse,
} from "../types";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { useCompleteUserAuthentication } from "./CompleteUserAuthentication.usecase";
import { toast } from "sonner";
import { AUTH_TOAST_ID } from "@/modules/auth/constants";

export const initiateUserAuthentication = async (
  payload: InitiateUserAuthenticationPayload
) => {
  try {
    const data = await post<
      InitiateUserAuthenticationResponse,
      InitiateUserAuthenticationPayload
    >({
      url: API_ENDPOINTS.AUTH.INITIATE_USER_AUTHENTICATION,
      payload,
      isProtected: false,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Initiate user authentication error:`, error);
    const message =
      error instanceof Error
        ? error.message
        : `Initiate user authentication failed`;
    throw new Error(message);
  }
};

export const useInitiateUserAuthentication = ({
  fingerPrintId,
  ipAddress,
}: {
  fingerPrintId: string;
  ipAddress: string;
}) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const {
    mutate: completeUserAuthentication,
    isPending: isCompletingUserAuthentication,
  } = useCompleteUserAuthentication();
  const { signMessage, isPending: isSigninMessage } = useSignMessage({
    mutation: {
      onMutate: () => {
        toast.loading("Signing message", {
          description: "",
          id: AUTH_TOAST_ID,
        });
      },
      onSuccess: (signature) => {
        if (!address) {
          toast.error("Unable to get wallet address. Please reload", {
            description: "",
            id: AUTH_TOAST_ID,
          });
          return;
        }

        toast.success("Authentication message successfully signed", {
          description: "",
          id: AUTH_TOAST_ID,
        });
        completeUserAuthentication({
          body: {
            walletAddress: address,
            signature: signature,
            chainId: chainId,
          },
          xApiHeaders: {
            "x-api-fingerprint": fingerPrintId,
            "x-forwarded-for": ipAddress,
            "x-api-useragent": navigator.userAgent,
          },
        });
      },
      onError: (error) => {
        toast.error("Signing message failed", {
          description: error.message,
          id: AUTH_TOAST_ID,
        });
      },
    },
  });

  const mutation = useMutation({
    mutationFn: initiateUserAuthentication,
    onMutate: () => {
      toast.loading("Initiating User Authentication", {
        id: AUTH_TOAST_ID,
      });
    },
    onSuccess: (data) => {
      toast.loading("Signing user authentication message", {
        id: AUTH_TOAST_ID,
      });
      signMessage({
        message: data.data.messageToSign,
      });
    },
    onError: (error) => {
      toast.error("Initiate user authentication failed", {
        description: error instanceof Error ? error.message : "Unknown error",
        id: AUTH_TOAST_ID,
      });
      console.error("Initiate user authentication error:", error);
    },
  });

  return {
    ...mutation,
    isPending:
      isSigninMessage || isCompletingUserAuthentication || mutation.isPending,
    isSigninMessage,
    isCompletingUserAuthentication,
    isInitiatingUserAuthentication: mutation.isPending,
  };
};

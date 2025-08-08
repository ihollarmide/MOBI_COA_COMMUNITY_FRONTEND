import { post } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { InitiateLoginPayload, InitiateLoginResponse } from "../types";
import { useMutation } from "@tanstack/react-query";
import { useChainId, useSignMessage } from "wagmi";
import { useCompleteLogin } from "./CompleteLogin.usecase";
import { toast } from "sonner";
import { AUTH_TOAST_ID } from "../constants";

export const initiateLogin = async (payload: InitiateLoginPayload) => {
  try {
    const data = await post<InitiateLoginResponse, InitiateLoginPayload>({
      url: API_ENDPOINTS.AUTH.INITIATE_USER_AUTHENTICATION,
      payload: payload,
      isProtected: false,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Initiate login error:`, error);
    const message =
      error instanceof Error ? error.message : `Initiate login failed`;
    throw new Error(message);
  }
};

export const useInitiateLogin = () => {
  const chainId = useChainId();
  const { signMessage, isPending: isSigninMessage } = useSignMessage();
  const { mutate: completeLogin, isPending: isCompletingLogin } =
    useCompleteLogin();
  const mutation = useMutation({
    mutationFn: initiateLogin,
    onMutate: () => {
      toast.loading("Initiating Authentication", {
        id: AUTH_TOAST_ID,
      });
    },
    onSuccess: (data, variables) => {
      toast.loading("Signing message", {
        id: AUTH_TOAST_ID,
      });
      signMessage(
        {
          message: data.data.messageToSign,
        },
        {
          onSuccess: (signature) => {
            toast.loading("Completing Authentication", {
              id: AUTH_TOAST_ID,
            });
            completeLogin({
              walletAddress: variables.walletAddress,
              signature: signature,
              chainId: chainId,
            });
          },
          onError: () => {
            toast.error("Signing message failed", {
              id: AUTH_TOAST_ID,
            });
          },
        }
      );
    },
    onError: (error) => {
      toast.dismiss(AUTH_TOAST_ID);
      console.error("Initiate login error:", error);
    },
  });

  return {
    ...mutation,
    isPending: isSigninMessage || isCompletingLogin || mutation.isPending,
    isSigninMessage,
    isCompletingLogin,
    isInitiating: mutation.isPending,
  };
};

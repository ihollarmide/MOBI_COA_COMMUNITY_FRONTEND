import { post } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { InitiateLoginPayload, InitiateLoginResponse } from "../types";
import { useMutation } from "@tanstack/react-query";
import { useChainId, useSignMessage } from "wagmi";
import { useCompleteLogin } from "./CompleteLogin.usecase";

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
  const { signMessage } = useSignMessage();
  const { mutate: completeLogin } = useCompleteLogin();
  const mutation = useMutation({
    mutationFn: initiateLogin,
    onSuccess: (data, variables) => {
      signMessage(
        {
          message: data.data.messageToSign,
        },
        {
          onSuccess: (signature) => {
            completeLogin({
              walletAddress: variables.walletAddress,
              signature: signature,
              chainId: chainId,
            });
          },
        }
      );
    },
    onError: (error) => {
      console.error("Initiate login error:", error);
    },
  });

  return mutation;
};

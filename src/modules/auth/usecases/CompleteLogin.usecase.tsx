import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { CompleteLoginPayload, CompleteLoginResponse } from "../types";
import { post } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { AUTH_ACTIONS, AUTH_TOAST_ID } from "../constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { serializeOnboardingUrlStates } from "@/modules/onboarding/hooks/useOnboardingUrlStates";
import { useGetUplineId } from "@/modules/onboarding/usecases/GetUplineId.usecase";

export const createUserSession = async (payload: CompleteLoginResponse) => {
  try {
    const result = await signIn(AUTH_ACTIONS.CREATE_SESSION, {
      token: payload.data.token,
      user: JSON.stringify({
        ...payload.data.user,
        id: payload.data.user.id.toString(),
      }),
      redirect: false,
      redirectTo: "/onboarding",
    });

    if (result?.error) {
      console.log(result.error);
      throw new Error(result.error);
    }

    if (result?.ok) {
      return result;
    }

    throw new Error(`Logging User In Failed. Please try again.`);
  } catch (error: unknown) {
    console.error(`Logging User In Failed:`, error);
    throw error;
  }
};

export const completeLogin = async (payload: CompleteLoginPayload) => {
  try {
    const data = await post<CompleteLoginResponse, CompleteLoginPayload>({
      url: API_ENDPOINTS.AUTH.COMPLETE_USER_AUTHENTICATION,
      payload: payload,
      isProtected: false,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Complete login error:`, error);
    const message =
      error instanceof Error ? error.message : `Complete login failed`;
    throw new Error(message);
  }
};

export const useCompleteLogin = () => {
  const { mutate: createUserSessionMutate, isPending: isCreatingSession } =
    useCreateUserSession();
  const mutation = useMutation({
    mutationFn: completeLogin,
    onSuccess: (data) => {
      createUserSessionMutate(data);
    },
    onError: (error) => {
      toast.error("Error completing authentication", {
        id: AUTH_TOAST_ID,
      });
      console.error("Complete login error:", error);
    },
  });

  return {
    ...mutation,
    isPending: mutation.isPending || isCreatingSession,
  };
};

export const useCreateUserSession = () => {
  const { data: uplineId } = useGetUplineId();
  const router = useRouter();
  const res = useMutation({
    mutationFn: (payload: CompleteLoginResponse) => createUserSession(payload),
    onMutate: () => {
      toast.loading(`Redirecting ...`, {
        description: "",
        id: AUTH_TOAST_ID,
      });
    },
    onSuccess: (data, variables) => {
      if (data?.ok) {
        toast.success(`Redirected Successfully`, {
          description: "",
          id: AUTH_TOAST_ID,
        });
        const onboardingRoute = "/onboarding";

        if (variables.data.user.genesisClaimed) {
          router.replace(
            onboardingRoute +
              serializeOnboardingUrlStates({
                step: "join-vmcc-dao",
              })
          );
        } else if (variables.data.user.uplineId || !!uplineId) {
          router.replace(
            onboardingRoute +
              serializeOnboardingUrlStates({
                step: "claim-genesis-key",
              })
          );
        } else if (
          variables.data.user.twitterFollowed ||
          variables.data.user.instagramFollowed
        ) {
          router.replace(
            onboardingRoute +
              serializeOnboardingUrlStates({
                step: "enter-referral-code",
              })
          );
        } else if (variables.data.user.telegramJoined) {
          router.replace(
            onboardingRoute +
              serializeOnboardingUrlStates({
                step: "follow-us",
              })
          );
        } else {
          router.replace(onboardingRoute);
        }
      } else if (data?.error) {
        toast.error(`Unable to Log In`, {
          description:
            typeof data.error === "string" ? data.error : "Unknown error",
          id: AUTH_TOAST_ID,
        });
      }
    },
    onError: (error) => {
      toast.error("Unable to Log In", {
        description:
          typeof error === "string" ? error : error?.message || "Unknown error",
        id: AUTH_TOAST_ID,
      });
    },
  });

  return res;
};

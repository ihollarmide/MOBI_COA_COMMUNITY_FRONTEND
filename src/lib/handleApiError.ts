// utils/handleApiError.ts
import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/common/types";

export const handleApiError = (
  error: unknown,
  fallbackMessage = "Something went wrong"
): Error => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const apiError = error as AxiosError<ApiErrorResponse>;
    const message = apiError.response?.data?.message;

    if (typeof message === "string") {
      return new Error(message);
    }

    if (typeof apiError.response?.data?.data === "string") {
      return new Error(apiError.response?.data?.data);
    }

    return new Error(fallbackMessage);
  }

  return new Error(fallbackMessage);
};

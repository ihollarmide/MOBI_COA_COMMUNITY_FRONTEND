// utils/handleApiError.ts
import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/common/types";

export const handleApiError = (
  error: unknown,
  fallbackMessage = "Something went wrong"
): Error => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const apiError = error as AxiosError<ApiErrorResponse>;
    console.log(apiError);
    const message = apiError.response?.data?.data;

    if (message) {
      return new Error(message);
    }

    if (apiError.response?.data?.message) {
      return new Error(apiError.response?.data?.message);
    }

    return new Error(fallbackMessage);
  }

  return new Error(fallbackMessage);
};

import { protectedClient, publicClient } from "@/axios-instance";
import { AxiosError, AxiosRequestConfig, AxiosInstance } from "axios";
import { handleApiError } from "./handleApiError";

export type ErrorData = {
  message: string;
};

export type AxiosErrorData = AxiosError<ErrorData>;

// Create two instances - one with auth and one without
const protectedApi = protectedClient();
const publicApi = publicClient();

// Helper function to get the appropriate API instance
const getApiInstance = (isProtected: boolean): AxiosInstance => {
  return isProtected ? protectedApi : publicApi;
};

export const get = async <T>(params: {
  url: string;
  isProtected?: boolean;
  config?: AxiosRequestConfig;
}) => {
  const api = getApiInstance(params.isProtected ?? true);
  try {
    const { data } = await api.get<T>(params.url, params.config);
    return data;
  } catch (error) {
    throw handleApiError(error, "GET request failed");
  }
};

export const post = async <T, P>(params: {
  url: string;
  payload: P;
  isProtected?: boolean;
  config?: AxiosRequestConfig;
}) => {
  const api = getApiInstance(params.isProtected ?? true);
  try {
    const { data } = await api.post<T>(
      params.url,
      params.payload,
      params.config
    );
    return data;
  } catch (error) {
    throw handleApiError(error, "POST request failed");
  }
};

export const patch = async <T, P>(params: {
  url: string;
  payload: P;
  isProtected?: boolean;
  config?: AxiosRequestConfig;
}) => {
  const api = getApiInstance(params.isProtected ?? true);
  const config = params.config ?? {};
  try {
    const { data } = await api.patch<T>(params.url, params.payload, config);
    return data;
  } catch (error) {
    throw handleApiError(error, "PATCH request failed");
  }
};

export const put = async <T, P>(params: {
  url: string;
  payload: P;
  isProtected?: boolean;
}) => {
  const api = getApiInstance(params.isProtected ?? true);
  try {
    const { data } = await api.put<T>(params.url, params.payload);
    return data;
  } catch (error) {
    throw handleApiError(error, "PUT request failed");
  }
};

export const del = async <T, P>(params: {
  url: string;
  payload?: P;
  isProtected?: boolean;
}) => {
  const api = getApiInstance(params.isProtected ?? true);
  try {
    const { data } = await api.delete<T>(
      params.url,
      params?.payload
        ? {
            params: params.payload,
          }
        : undefined
    );
    return data;
  } catch (error) {
    throw handleApiError(error, "DELETE request failed");
  }
};

export { protectedApi, publicApi };
export default protectedApi;

import axios, { AxiosInstance, AxiosError } from "axios";
import { toast } from "sonner";
import { disconnect } from "@wagmi/core";
import { wagmiSSRConfig } from "./config/wagmi-ssr-config";
import {
  destroySessionInStorage,
  getSessionFromStorage,
} from "./modules/auth/lib/session.client";
import { getSecretKey } from "./modules/auth/store/secret.store";

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Base axios instance
export default axios.create({
  baseURL: API_BASE_URL,
});

// Helper function to create base instance with common config
const createBaseInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
  });
};

export const publicClient = (): AxiosInstance => {
  const instance = createBaseInstance();

  instance.interceptors.request.use(
    async (request) => request,
    (error: AxiosError) => Promise.reject(error)
  );

  // Add response interceptor for common error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 500) {
        toast.error("Server error occurred", { id: "server-error" });
      }
      if (error.response?.status === 401) {
        toast.error("Unauthorized request", {
          id: "unauthorized",
        });
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const protectedClient = (): AxiosInstance => {
  const instance = createBaseInstance();

  instance.interceptors.request.use(
    async (request) => {
      try {
        const sessionSecret = getSecretKey();

        if (!sessionSecret) {
          toast.error("No session secret available", { id: "no-secret" });
          return Promise.reject(new Error("No session secret available"));
        }

        const res = await getSessionFromStorage({
          sessionSecret: sessionSecret,
        });

        if (res?.accessToken) {
          request.headers.Authorization = `Bearer ${res.accessToken}`;
        } else {
          request.headers.Authorization = undefined;
          toast.error("You have no active session, please re-authenticate", {
            id: "no-session",
          });
        }
        return request;
      } catch (error) {
        toast.error("Authentication error occurred", { id: "auth-error" });
        return Promise.reject(error);
      }
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Add response interceptor for auth-specific error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        await destroySessionInStorage();
        await disconnect(wagmiSSRConfig);
        window.location.href = "/welcome";
        toast.error("Session expired, please re-authenticate", {
          id: "session-expired",
        });
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

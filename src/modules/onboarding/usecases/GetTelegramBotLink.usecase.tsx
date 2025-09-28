import { QUERY_KEYS } from "@/common/constants/query-keys";
import { get } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetTelegramBotLinkResponse } from "../types";

export const getTelegramBotLink = async () => {
  try {
    const data = await get<GetTelegramBotLinkResponse>({
      url: API_ENDPOINTS.VERIFY.TELEGRAM_BOT_INFO,
    });
    return data;
  } catch (error: unknown) {
    console.error(`Get telegram bot link error:`, error);
    const message =
      error instanceof Error ? error.message : `Get telegram bot link failed`;
    throw new Error(message);
  }
};

export const useGetTelegramBotLink = () => {
  const res = useQuery({
    queryKey: QUERY_KEYS.GET_TELEGRAM_BOT_LINK.all,
    queryFn: getTelegramBotLink,
  });

  return res;
};

export const useRetrieveTelegramBotLink = () => {
  const res = useMutation({
    mutationFn: getTelegramBotLink,
  });

  return res;
};

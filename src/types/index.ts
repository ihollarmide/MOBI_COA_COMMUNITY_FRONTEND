// Telegram Widget API types
export interface TelegramWidget {
  Login: {
    auth: (
      options: TelegramAuthOptions,
      callback: (response: TelegramResponseData | false | null) => void
    ) => void;
  };
}

export interface TelegramAuthOptions {
  bot_id: string;
  request_access: boolean;
}

export interface TelegramResponseData {
  auth_date: number;
  first_name: string;
  hash?: string;
  id: number;
  last_name?: string | null | undefined;
  photo_url?: string | null | undefined;
  username?: string | null | undefined;
}

export interface TelegramAuthResponse {
  auth_date: number;
  first_name: string;
  id: number;
  last_name?: string | null | undefined;
  photo_url?: string | null | undefined;
  username?: string | null | undefined;
}

export interface TelegramAuthApiResponse {
  success: boolean;
  user: TelegramAuthResponse;
}

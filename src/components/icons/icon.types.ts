import { SVGProps } from "react";

export enum IconsNames {
  GLASS_1 = "glass-1",
  GLASS_2 = "glass-2",
  X_SOCIAL = "x-social",
  TELEGRAM = "telegram",
  INSTAGRAM = "instagram",
  WALLET_1 = "wallet-1",
  USERS_3 = "users-3",
  THUMBS_UP = "thumbs-up",
  PASSCODE = "passcode",
  KEY_1 = "key-1",
  CHECK = "check",
  SUCCESS = "success",
  DIRECTIONS = "directions",
  TELECAST = "telecast",
  PADLOCK = "padlock",
  PHONE = "phone",
}

export interface IconProps extends SVGProps<SVGSVGElement> {
  width: number;
  height: number;
  name: IconsNames;
}

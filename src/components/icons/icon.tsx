import { IconProps, IconsNames } from "./icon.types";

import {
  Glass1,
  Glass2,
  XSocial,
  Telegram,
  Instagram,
  Wallet1,
  Users3,
  ThumbsUp,
  Passcode,
  Key1,
  Check,
  Success,
} from "./icons";

export function Icon(props: IconProps) {
  const { name, ...rest } = props;

  switch (name) {
    case IconsNames.GLASS_1:
      return <Glass1 {...rest} />;
    case IconsNames.GLASS_2:
      return <Glass2 {...rest} />;
    case IconsNames.X_SOCIAL:
      return <XSocial {...rest} />;
    case IconsNames.TELEGRAM:
      return <Telegram {...rest} />;
    case IconsNames.INSTAGRAM:
      return <Instagram {...rest} />;
    case IconsNames.WALLET_1:
      return <Wallet1 {...rest} />;
    case IconsNames.USERS_3:
      return <Users3 {...rest} />;
    case IconsNames.THUMBS_UP:
      return <ThumbsUp {...rest} />;
    case IconsNames.PASSCODE:
      return <Passcode {...rest} />;
    case IconsNames.KEY_1:
      return <Key1 {...rest} />;
    case IconsNames.CHECK:
      return <Check {...rest} />;
    case IconsNames.SUCCESS:
      return <Success {...rest} />;
    default:
      return null;
  }
}

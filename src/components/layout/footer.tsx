import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { IconsNames } from "../icons/icon.types";
import { Icon } from "../icons/icon";
import {
  INSTAGRAM_LINK,
  TWITTER_LINK,
  VMCC_DAO_LINK,
} from "@/common/constants";

const socialLinks = [
  {
    name: "X",
    href: TWITTER_LINK,
    icon: IconsNames.X_SOCIAL,
  },
  {
    name: "Telegram",
    href: VMCC_DAO_LINK,
    icon: IconsNames.TELEGRAM,
  },
  {
    name: "Instagram",
    href: INSTAGRAM_LINK,
    icon: IconsNames.INSTAGRAM,
  },
];

const resources: {
  title: string;
  links: {
    title: string;
    isInternal: boolean;
    href: string;
  }[];
}[] = [
  {
    title: "Resources",
    links: [
      {
        title: "COA Blackpaper",
        isInternal: false,
        href: "https://www.atlantus.com/coa-blackpaper",
      },
      {
        title: "COA Support",
        isInternal: false,
        href: "https://www.atlantus.com/coa-whitepaper",
      },
      {
        title: "Network State (Book)",
        isInternal: false,
        href: "https://www.atlantus.com/coa-whitepaper",
      },
    ],
  },
  {
    title: "Legal & Compliance",
    links: [
      {
        title: "Terms of Service",
        isInternal: true,
        href: "/terms-of-service",
      },
      {
        title: "Privacy Policy",
        isInternal: true,
        href: "/privacy-policy",
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full @container">
      <div className="flex @2xl:flex-row gap-6 @2xl:gap-0 flex-col items-start justify-between">
        <div className="flex flex-col gap-y-5">
          <Link href="/">
            <Image
              src="/vectors/vmcc-footer-logo.svg"
              alt="VMCC"
              width={260}
              height={50}
              className="max-w-[146px] @sm:max-w-[180px] @lg:max-w-[260px] w-full h-auto"
            />
          </Link>
          <div className="flex items-center justify-start gap-x-4">
            {socialLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-white/75">
                <Icon
                  name={link.icon}
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-end gap-x-[52px]">
          {resources.map((resource) => (
            <div key={resource.title} className="flex flex-col gap-y-2.5">
              <h3 className="font-montserrat text-sm leading-[1.4] text-white font-bold uppercase">
                {resource.title}
              </h3>
              <div className="flex flex-col gap-y-3">
                {resource.links.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    target={link.isInternal ? undefined : "_blank"}
                    rel={link.isInternal ? undefined : "noopener noreferrer"}
                    className="font-montserrat text-sm leading-[1.4] text-white/80"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Separator className="my-6" />
      <div className="font-montserrat text-xs leading-[1.4] text-white flex flex-wrap gap-x-2">
        <p>Copyright&copy;City of atlantus. All rights reserved</p>|
        <p>Designed and developed by MOBI AUTOMATION</p>
      </div>
    </footer>
  );
}

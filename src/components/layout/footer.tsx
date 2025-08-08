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
    disabled?: boolean;
  }[];
}[] = [
  {
    title: "Resources",
    links: [
      {
        title: "COA Blackpaper",
        isInternal: false,
        href: "https://acrobat.adobe.com/id/urn:aaid:sc:VA6C2:23cc7c72-d7c1-4e3a-8e08-3b4acc136892",
      },
      {
        title: "COA Support",
        isInternal: false,
        disabled: true,
        href: "https://www.atlantus.com/coa-whitepaper",
      },
      {
        title: "Network State (Book)",
        disabled: false,
        isInternal: false,
        href: "https://thenetworkstate.com",
      },
    ],
  },
  {
    title: "Legal & Compliance",
    links: [
      {
        title: "Terms of Service",
        disabled: true,
        isInternal: true,
        href: "/terms-of-service",
      },
      {
        title: "Privacy Policy",
        disabled: true,
        isInternal: true,
        href: "/privacy-policy",
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full @container py-6 lg:py-10">
      <div className="flex @2xl:flex-row gap-6 @2xl:gap-0 flex-col items-start justify-between">
        <div className="flex flex-col gap-y-5">
          <a
            href="https://www.vmcc.build/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vectors/vmcc-footer-logo.svg"
              alt="VMCC"
              width={260}
              height={50}
              className="max-w-[146px] @sm:max-w-[180px] @lg:max-w-[260px] w-full h-auto"
            />
          </a>
          <div className="flex items-center justify-start gap-x-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/75"
              >
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
                {resource.links.map((link) => {
                  if (link.disabled) {
                    return (
                      <p
                        key={link.title}
                        className="font-montserrat text-sm leading-[1.4] text-white/80 flex items-center gap-x-1"
                      >
                        <Icon
                          name={IconsNames.PADLOCK}
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        {link.title}
                      </p>
                    );
                  }

                  return (
                    <Link
                      key={link.title}
                      href={link.href}
                      target={link.isInternal ? undefined : "_blank"}
                      rel={link.isInternal ? undefined : "noopener noreferrer"}
                      className="font-montserrat text-sm leading-[1.4] text-white/80"
                    >
                      {link.title}
                    </Link>
                  );
                })}
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

"use client";

import { useWalletConnectionStatus } from "@/hooks/useWalletConnectionStatus";
import { useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, LoaderIcon, PowerIcon } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletIconWithAvatar } from "@/hooks/useWalletIconWithAvatar";
import { useHandleSignout } from "@/modules/auth/hooks/useHandleSignout";
import { useSession } from "next-auth/react";

export function Header() {
  const { status: sessionStatus } = useSession();
  const { handleSignout } = useHandleSignout();
  const chainId = useChainId();
  const { address, status } = useWalletConnectionStatus();

  const { avatarUrl } = useWalletIconWithAvatar({
    walletAddress: address,
  });

  const explorerUrl =
    chainId === 84532
      ? `https://sepolia.basescan.org/address/${address}`
      : `https://bscscan.com/address/${address}`;

  if (sessionStatus !== "authenticated") {
    return null;
  }

  return (
    <header className="w-full @container h-16 py-3 bg-transparent flex items-center justify-end">
      {status === "connected" && !!address ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="backdrop-blur-xl">
              {!!avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              {truncateAddress(address ?? "")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-glass-gradient border border-white/10 backdrop-blur-xl"
          >
            <DropdownMenuItem
              asChild
              className="w-full focus:bg-transparent focus:border-none focus:outline-none flex items-center justify-start gap-x-[6px] px-4 py-[11px] text-[13px] leading-normal tracking-brand"
            >
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="size-4 text-white/80" />
                <span className="text-white">View on Explorer</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignout}
              className="w-full focus:bg-transparent focus:border-none focus:outline-none flex items-center justify-start gap-x-[6px] px-4 py-[11px] text-[13px] leading-normal tracking-brand bg-disconnect text-[#F43131]"
            >
              <PowerIcon className="size-4 text-[#F43131]" />
              <span className="text-[#F43131]">Disconnect Wallet</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <LoaderIcon className="animate-spin" size={20} />
      )}
    </header>
  );
}

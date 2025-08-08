import { ZERO_ADDRESS } from "@/common/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Address } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string): string {
  if (!address) return "";
  const start = address.slice(0, 6);
  const end = address.slice(-4);
  return `${start}...${end}`;
}

export function isZeroAddress(address: Address): boolean {
  return address.toLowerCase() === ZERO_ADDRESS.toLowerCase();
}

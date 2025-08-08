import { Abi, Address } from "viem";
import { airdropContract } from "./airdropContract";
import { referralContract } from "./referralContract";

export const CONTRACTS: Record<string, { address: Address; abi: Abi }> = {
  AIRDROP: {
    address: airdropContract.address,
    abi: airdropContract.abi,
  },
  REFERRAL: {
    address: referralContract.address,
    abi: referralContract.abi,
  },
} as const;

export const YARD_CONTRACT_ADDRESS: Address =
  "0x38b26E496edED8023Cefba7F8EcF25be68fEB898";

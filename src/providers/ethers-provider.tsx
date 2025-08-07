import { ethers } from "ethers";

export const provider = new ethers.JsonRpcProvider(
  `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_SEPOLIA_ID}`
);

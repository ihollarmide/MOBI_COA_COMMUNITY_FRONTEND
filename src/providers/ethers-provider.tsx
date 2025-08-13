import { ethers } from "ethers";

export const provider = new ethers.JsonRpcProvider(
  // process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
  //   ? "https://bnb-mainnet.g.alchemy.com/v2/TCAngl9Gxs-7GF9JFRcJJaiY-Le3vdhK"
  //   : "https://base-sepolia.g.alchemy.com/v2/VZp21oJ4tRhkRpONwkRGs"
  process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? "https://bsc-rpc.publicnode.com"
    : "https://sepolia.base.org"
);

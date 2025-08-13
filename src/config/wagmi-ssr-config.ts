import { createConfig, createStorage, http } from "wagmi";
import { baseSepolia, bsc } from "wagmi/chains";

export const wagmiSSRConfig = createConfig({
  chains: [bsc, baseSepolia],
  transports: {
    // [bsc.id]: http(
    //   "https://bnb-mainnet.g.alchemy.com/v2/TCAngl9Gxs-7GF9JFRcJJaiY-Le3vdhK"
    // ),
    // [baseSepolia.id]: http(
    //   "https://base-sepolia.g.alchemy.com/v2/VZp21oJ4tRhkRpONwkRGs"
    // ),
    [bsc.id]: http("https://bsc-rpc.publicnode.com"),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
  ssr: true,
  syncConnectedChain: true,
  storage: createStorage({
    storage:
      typeof window !== "undefined"
        ? window.localStorage
        : {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          },
  }),
});

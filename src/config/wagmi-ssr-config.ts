import { createConfig, createStorage, http } from "wagmi";
import { baseSepolia, bsc } from "wagmi/chains";

export const wagmiSSRConfig = createConfig({
  chains: [bsc, baseSepolia],
  transports: {
    // [bsc.id]: http(`${process.env.NEXT_PUBLIC_APP_URL}/api/rpc/bsc`),
    // [baseSepolia.id]: http(
    //   `${process.env.NEXT_PUBLIC_APP_URL}/api/rpc/base-sepolia`
    // ),
    [baseSepolia.id]: http(
      "https://base-sepolia.g.alchemy.com/v2/ovLFyNjSpw-IizOBzpITg"
    ),
    [bsc.id]: http(
      "https://bnb-mainnet.g.alchemy.com/v2/VZp21oJ4tRhkRpONwkRGs"
    ),
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

import { createConfig, createStorage, http } from "wagmi";
import { baseSepolia, bsc } from "wagmi/chains";

export const wagmiSSRConfig = createConfig({
  chains: [bsc, baseSepolia],
  transports: {
    [bsc.id]: http("/api/rpc/bsc"),
    [baseSepolia.id]: http("/api/rpc/base-sepolia"),
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

import { createConfig, createStorage, http } from "wagmi";
import { baseSepolia, bsc } from "wagmi/chains";

export const wagmiSSRConfig = createConfig({
  chains: [bsc, baseSepolia],
  transports: {
    [bsc.id]: http("https://bsc-dataseed3.defibit.io"),
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

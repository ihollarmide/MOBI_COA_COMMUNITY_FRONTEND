import { getDefaultConfig } from "connectkit";
import { createConfig, createStorage, http } from "wagmi";
import { arbitrum, baseSepolia, mainnet, polygon } from "wagmi/chains";

export const config = createConfig(
  getDefaultConfig({
    enableFamily: false,
    appName: "COA Community",
    walletConnectProjectId: "261725cb90fd1175d00f4e121e2fea37",
    chains: [baseSepolia, mainnet, polygon, arbitrum],
    transports: {
      [baseSepolia.id]: http(
        `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_SEPOLIA_ID}`
      ),
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [arbitrum.id]: http(),
    },
    ssr: true,
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
  })
);

import { getDefaultConfig } from "connectkit";
import { createConfig, createStorage, http } from "wagmi";
import { baseSepolia, bsc } from "wagmi/chains";

export const config = createConfig(
  getDefaultConfig({
    enableFamily: false,
    appName: "COA Community",
    walletConnectProjectId: "261725cb90fd1175d00f4e121e2fea37",
    chains: [bsc, baseSepolia],
    transports: {
      // [bsc.id]: http("/api/rpc/bsc"),
      // [baseSepolia.id]: http("/api/rpc/base-sepolia"),
      [bsc.id]: http(
        "https://bnb-mainnet.g.alchemy.com/v2/VZp21oJ4tRhkRpONwkRGs"
      ),
      [baseSepolia.id]: http(
        "https://base-sepolia.g.alchemy.com/v2/ovLFyNjSpw-IizOBzpITg"
      ),
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

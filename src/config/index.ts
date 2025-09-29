import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { baseSepolia, bsc } from "@reown/appkit/networks";

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [baseSepolia, bsc];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [bsc.id]: http(
      "https://bnb-mainnet.g.alchemy.com/v2/VZp21oJ4tRhkRpONwkRGs"
    ),
    [baseSepolia.id]: http(
      "https://base-sepolia.g.alchemy.com/v2/ovLFyNjSpw-IizOBzpITg"
    ),
  },
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

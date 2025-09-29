import { type Config, getClient } from "@wagmi/core";
import { FallbackProvider, JsonRpcProvider } from "ethers";
import type { Client, Chain, Transport } from "viem";

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  // Helper function to convert relative URLs to absolute URLs
  const getAbsoluteUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // If it's a relative URL, make it absolute
    if (typeof window !== "undefined") {
      // Client-side: use current origin
      return `${window.location.origin}${url}`;
    } else {
      // Server-side: use environment variable or default
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return `${baseUrl}${url}`;
    }
  };

  if (transport.type === "fallback") {
    const providers = (transport.transports as ReturnType<Transport>[]).map(
      ({ value }) =>
        new JsonRpcProvider(getAbsoluteUrl(value?.url || ""), network)
    );
    if (providers.length === 1) return providers[0];
    return new FallbackProvider(providers);
  }
  return new JsonRpcProvider(getAbsoluteUrl(transport.url), network);
}

/** Action to convert a viem Client to an ethers.js Provider. */
export function getEthersProvider(
  config: Config,
  { chainId }: { chainId?: number } = {}
) {
  const client = getClient(config, { chainId });
  if (!client) return;
  return clientToProvider(client);
}

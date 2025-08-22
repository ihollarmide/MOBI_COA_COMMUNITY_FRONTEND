import { useState, useCallback } from "react";
import {
  Abi,
  BaseError,
  Block,
  ContractFunctionRevertedError,
  TransactionReceipt,
  WriteContractReturnType,
} from "viem";
import {
  useWriteContract,
  useConfig,
  useChainId,
  useWalletClient,
} from "wagmi";
import {
  waitForTransactionReceipt,
  getBlock,
  type Config,
  simulateContract,
} from "@wagmi/core";
import { type WriteContractVariables } from "wagmi/query";
import { ethers } from "ethers";

// Define a simpler, more powerful callback and state structure
export type SequentialWriteState = {
  status:
    | "idle"
    | "writing"
    | "confirming"
    | "fetchingBlock"
    | "success"
    | "error";
  data: {
    hash?: WriteContractReturnType;
    transactionReceipt?: TransactionReceipt;
    block?: Block;
  } | null;
  error: string | null;
};

export type SequentialWriteOptions = {
  onInProgress?: () => void;
  onSuccess?: (data: {
    hash: WriteContractReturnType;
    transactionReceipt: TransactionReceipt;
    block?: Block;
  }) => void;
  onError?: (error: string) => void;
  onSettled?: () => void; // Called on success or error
  fetchBlock?: boolean; // Whether to fetch block info after transaction receipt
  blockFetchRetries?: number; // Number of retries for block fetching (default: 3)
  blockFetchDelay?: number; // Initial delay in ms between retries (default: 1000)
};

/**
 * A robust hook for writing to a contract and sequentially waiting for the transaction
 * receipt and block information. It prevents race conditions and provides a clean state model.
 */
export function useSequentialContractWrite({
  onInProgress,
  onSuccess,
  onError,
  onSettled,
  fetchBlock = true, // Default to true for backward compatibility
  blockFetchRetries = 3, // Default to 3 retries
  blockFetchDelay = 1000, // Default to 1 second initial delay
}: SequentialWriteOptions) {
  const [state, setState] = useState<SequentialWriteState>({
    status: "idle",
    data: null,
    error: null,
  });

  // Get the wagmi config for use with core actions
  const config = useConfig();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  // We still use useWriteContract to get the async write function
  const { writeContractAsync } = useWriteContract();

  // Helper function to fetch block with retries
  const fetchBlockWithRetries = useCallback(
    async (blockHash: `0x${string}`): Promise<Block | undefined> => {
      for (let attempt = 0; attempt <= blockFetchRetries; attempt++) {
        try {
          const block = await getBlock(config, { blockHash });
          return block;
        } catch (error) {
          // If this is the last attempt, return undefined instead of throwing
          if (attempt === blockFetchRetries) {
            console.warn(
              `Failed to fetch block after ${blockFetchRetries + 1} attempts:`,
              error
            );
            return undefined;
          }

          // Calculate delay with exponential backoff (1s, 2s, 4s, etc.)
          const delay = blockFetchDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      return undefined;
    },
    [config, blockFetchRetries, blockFetchDelay]
  );

  const write = useCallback(
    async (
      variables: WriteContractVariables<
        Abi,
        string,
        readonly unknown[],
        Config,
        Config["chains"][number]["id"]
      >
    ) => {
      setState({ status: "writing", data: null, error: null });
      onInProgress?.();

      try {
        await simulateContract(config, {
          abi: variables.abi,
          address: variables.address,
          functionName: variables.functionName,
          args: variables.args,
          value: variables.value,
          account: walletClient?.account,
          chainId: chainId,
        });
        // Step 1: Send the transaction
        const hash = await writeContractAsync(variables);
        setState((prev) => ({ ...prev, status: "confirming", data: { hash } }));

        // Step 2: Wait for the transaction receipt
        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash,
        });

        if (fetchBlock) {
          // Step 3: Fetch the block information with retries (conditional)
          setState((prev) => ({
            ...prev,
            status: "fetchingBlock",
            data: { ...prev.data, transactionReceipt },
          }));

          const block = await fetchBlockWithRetries(
            transactionReceipt.blockHash
          );

          setState((prev) => ({
            ...prev,
            status: "success",
            data: { ...prev.data, block },
          }));

          // Success with block info (or undefined if block fetch failed)
          if (transactionReceipt.status === "success") {
            onSuccess?.({ hash, transactionReceipt, block });
          } else {
            const alchemyProvider = new ethers.JsonRpcProvider(
              chainId === 84532 ? `/api/rpc/base-sepolia` : `/api/rpc/bsc`
            );
            let errorMessage = "Transaction reverted on-chain";

            try {
              const trace = await alchemyProvider.send(
                "debug_traceTransaction",
                [transactionReceipt.transactionHash, { tracer: "callTracer" }]
              );

              if (trace?.result?.error) {
                errorMessage = `Reverted: ${trace.result.error}`;
              }
            } catch (err) {
              errorMessage = "Transaction reverted on-chain";
              // If tracing fails, keep the generic message
            }
            throw new Error(errorMessage);
          }
        } else {
          // Success without block info
          setState((prev) => ({
            ...prev,
            status: "success",
            data: { ...prev.data, transactionReceipt },
          }));

          onSuccess?.({ hash, transactionReceipt, block: undefined });
        }
      } catch (err) {
        let message = "Transaction failed";

        if (err instanceof ContractFunctionRevertedError) {
          if (err.data) {
            message = `Reverted: ${err.data.errorName}(${err.data.args?.join(", ")})`;
          } else {
            message = "Transaction reverted (no reason)";
          }
        } else if (err instanceof BaseError) {
          message = err.shortMessage ?? err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }

        setState((prev) => ({ ...prev, status: "error", error: message }));
        onError?.(message);
      } finally {
        onSettled?.();
      }
    },
    // Dependencies for the useCallback
    [
      config,
      writeContractAsync,
      simulateContract,
      chainId,
      walletClient,
      onSuccess,
      onInProgress,
      onError,
      onSettled,
      fetchBlock,
      fetchBlockWithRetries,
    ]
  );

  // A helper function to reset the state
  const reset = useCallback(() => {
    setState({
      status: "idle",
      data: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    write,
    reset,
    isLoading:
      state.status === "writing" ||
      state.status === "confirming" ||
      (fetchBlock && state.status === "fetchingBlock"),
  };
}

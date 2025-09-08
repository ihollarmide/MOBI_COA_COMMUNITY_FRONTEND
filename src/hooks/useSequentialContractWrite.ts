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

async function traceTransactionReceiptError({
  transactionReceipt,
  chainId,
  onError,
  setState,
}: {
  transactionReceipt: TransactionReceipt;
  chainId: number;
  onError?: (error: string) => void;
  setState: React.Dispatch<React.SetStateAction<SequentialWriteState>>;
}) {
  const alchemyProvider = new ethers.JsonRpcProvider(
    chainId === 84532 ? `/api/rpc/base-sepolia` : `/api/rpc/bsc`
  );
  let errorMessage = "Transaction reverted on-chain";

  try {
    const trace = await alchemyProvider.send("debug_traceTransaction", [
      transactionReceipt.transactionHash,
      { tracer: "callTracer" },
    ]);

    if (trace?.result?.error) {
      errorMessage = `Reverted: ${trace.result.error}`;
    }
  } catch (err) {
    console.error("Error tracing transaction:", err);
    errorMessage = "Transaction reverted on-chain";
    throw new Error(errorMessage);
    // If tracing fails, keep the generic message
  }
  onError?.(errorMessage);
  setState((prev) => ({ ...prev, status: "error", error: errorMessage }));
}

export type SequentialWriteOptions = {
  onInProgress?: () => void;
  onSuccess?: (data: {
    hash: WriteContractReturnType;
    transactionReceipt: TransactionReceipt;
    block?: Block;
  }) => void;
  onError?: (error: string) => void;
  onSettled?: () => void; // Called after on success or error
  fetchBlock?: boolean; // Whether to fetch block info after transaction receipt
  blockFetchRetries?: number; // Number of retries for block fetching (default: 3)
  blockFetchDelay?: number; // Initial delay in ms between retries (default: 1000)
};

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

        const hash = await writeContractAsync(variables);
        setState((prev) => ({ ...prev, status: "confirming", data: { hash } }));

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

          // Success with block info (or undefined if block fetch failed)
          if (transactionReceipt.status === "success") {
            onSuccess?.({ hash, transactionReceipt, block });
            setState((prev) => ({
              ...prev,
              status: "success",
              data: { ...prev.data, block },
            }));
          } else {
            traceTransactionReceiptError({
              transactionReceipt,
              chainId,
              onError,
              setState,
            });
          }
        } else {
          if (transactionReceipt.status === "success") {
            setState((prev) => ({
              ...prev,
              status: "success",
              data: { ...prev.data, transactionReceipt },
            }));

            onSuccess?.({ hash, transactionReceipt, block: undefined });
          } else {
            traceTransactionReceiptError({
              transactionReceipt,
              chainId,
              onError,
              setState,
            });
          }
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

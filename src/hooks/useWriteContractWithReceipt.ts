import { useEffect, useRef } from "react";
import { Block, TransactionReceipt, WriteContractReturnType, Abi } from "viem";
import {
  useBlock,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import type {
  GetBlockErrorType,
  WaitForTransactionReceiptErrorType,
  WriteContractErrorType,
  Config,
} from "@wagmi/core";
import { WriteContractVariables } from "wagmi/query";

export type ContractWriteWithTracking = {
  onInProgress?: (data: WriteContractReturnType) => void;

  onWriteContractError?: (error: WriteContractErrorType) => void;
  onCompleted?: (data: TransactionReceipt | undefined) => void;
  onCompletedWithBlockInfo?: ({
    block,
    transactionReceipt,
  }: {
    block: Block | undefined;
    transactionReceipt: TransactionReceipt | undefined;
  }) => void;
  onTransactionReceiptError?: (
    error: WaitForTransactionReceiptErrorType | null
  ) => void;
  onBlockError?: (error: GetBlockErrorType | null) => void;

  onMutate?: (
    variables: WriteContractVariables<
      Abi,
      string,
      readonly unknown[],
      Config,
      Config["chains"][number]["id"]
    >
  ) => void;
  onWritingContract?: () => void;
  onGettingReceipt?: () => void;
  onGettingBlock?: () => void;
  onWriteContractSettled?: () => void;

  isReceiptCheckEnabled?: boolean;
  isBlockCheckEnabled?: boolean;
};

export function useWriteContractWithReceipt({
  onInProgress,
  onCompleted,
  onCompletedWithBlockInfo,
  onWriteContractError,
  onTransactionReceiptError,
  onBlockError,
  onWritingContract,
  onGettingReceipt,
  onGettingBlock,
  onWriteContractSettled,
  isReceiptCheckEnabled = true,
  isBlockCheckEnabled = true,
  onMutate,
}: ContractWriteWithTracking) {
  const transactionReceiptErrorRef = useRef(false);
  const blockErrorRef = useRef(false);
  const completedRef = useRef(false);
  const completedWithBlockInfoRef = useRef(false);

  const {
    data: hash,
    writeContract,
    writeContractAsync,
    isPending,
    error: writeContractError,
  } = useWriteContract({
    mutation: {
      onMutate: (
        variables: WriteContractVariables<
          Abi,
          string,
          readonly unknown[],
          Config,
          Config["chains"][number]["id"]
        >
      ) => {
        onMutate?.(variables);
        onWritingContract?.();
      },
      onSuccess: (data) => {
        onInProgress?.(data);
      },
      onError: (error) => {
        onWriteContractError?.(error);
      },
      onSettled: () => {
        onWriteContractSettled?.();
      },
    },
  });

  const {
    data: transactionReceipt,
    isLoading: isWaitingForTransactionReceipt,
    error: transactionReceiptError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: isReceiptCheckEnabled && !!hash,
    },
  });

  const {
    data: block,
    isLoading: isWaitingForBlock,
    error: blockError,
  } = useBlock({
    blockHash: transactionReceipt?.blockHash,
    watch: false,
    query: {
      enabled: isBlockCheckEnabled && !!transactionReceipt?.blockHash,
    },
  });

  useEffect(() => {
    if (transactionReceipt && !completedRef.current) {
      completedRef.current = true;
      onCompleted?.(transactionReceipt);
    }
  }, [transactionReceipt, onCompleted]);

  useEffect(() => {
    if (block && !completedWithBlockInfoRef.current) {
      completedWithBlockInfoRef.current = true;
      onCompletedWithBlockInfo?.({
        block,
        transactionReceipt,
      });
    }
  }, [block, onCompletedWithBlockInfo, transactionReceipt]);

  useEffect(() => {
    if (transactionReceiptError && !transactionReceiptErrorRef.current) {
      transactionReceiptErrorRef.current = true;
      onTransactionReceiptError?.(transactionReceiptError);
    }
  }, [transactionReceiptError, onTransactionReceiptError]);

  useEffect(() => {
    if (blockError && !blockErrorRef.current) {
      blockErrorRef.current = true;
      onBlockError?.(blockError);
    }
  }, [blockError, onBlockError]);

  useEffect(() => {
    if (isWaitingForTransactionReceipt) {
      onGettingReceipt?.();
    }
  }, [isWaitingForTransactionReceipt, onGettingReceipt]);

  useEffect(() => {
    if (isWaitingForBlock) {
      onGettingBlock?.();
    }
  }, [isWaitingForBlock, onGettingBlock]);

  return {
    writeContract,
    writeContractAsync,
    writeContractError,
    txHash: hash,
    transactionReceipt,
    transactionReceiptError,
    isWaitingForTransactionReceipt,
    isWaitingForBlock,
    block,
    blockError,
    isWritingContractWithReceipt: isPending || isWaitingForTransactionReceipt,
  };
}

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

type CompositeCursor = {
  blockTimestamp: string;
  id: string;
};

type ManageGenesisKeyStore = {
  cursors: Array<{
    pageIndex: number;
    cursor: CompositeCursor | null;
  }>;
  setCursors: (
    cursors:
      | Array<{ pageIndex: number; cursor: CompositeCursor | null }>
      | ((
          prev: Array<{ pageIndex: number; cursor: CompositeCursor | null }>
        ) => Array<{ pageIndex: number; cursor: CompositeCursor | null }>)
  ) => void;
};

const manageGenesisKeyStore = create<ManageGenesisKeyStore>()(
  devtools(
    persist(
      (set) => ({
        cursors: [
          {
            pageIndex: 0,
            cursor: {
              blockTimestamp: (Math.pow(2, 64) - 1).toString(),
              id: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            },
          },
        ],
        setCursors: (
          cursors:
            | Array<{ pageIndex: number; cursor: CompositeCursor | null }>
            | ((
                prev: Array<{
                  pageIndex: number;
                  cursor: CompositeCursor | null;
                }>
              ) => Array<{ pageIndex: number; cursor: CompositeCursor | null }>)
        ) => {
          set((state) => ({
            cursors:
              typeof cursors === "function" ? cursors(state.cursors) : cursors,
          }));
        },
      }),
      {
        name: "manage-genesis-key",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);

export const useManageGenesisKeyStore = manageGenesisKeyStore;

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

type XData = {
  id: string | number;
  username: string;
};

type XStore = {
  xData: XData | null;
  setXData: (xData: XData | null) => void;
};

const xStore = create<XStore>()(
  devtools(
    persist(
      (set) => ({
        xData: null,
        setXData: (xData: XData | null) => {
          set({ xData });
        },
      }),
      {
        name: "x-store",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export const useXStore = xStore;

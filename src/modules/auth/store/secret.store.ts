import { create } from "zustand";

interface SecretStore {
  secretKey: string | null;
  setSecretKey: (secretKey: string | null) => void;
  getSecretKey: () => string | null;
  clearSecretKey: () => void;
}

export const useSecretStore = create<SecretStore>((set, get) => ({
  secretKey: null,
  setSecretKey: (secretKey: string | null) => set({ secretKey }),
  getSecretKey: () => get().secretKey,
  clearSecretKey: () => set({ secretKey: null }),
}));

// Export a function to get the secret key from outside React components
export const getSecretKey = (): string | null => {
  return useSecretStore.getState().getSecretKey();
};

// Export a function to set the secret key from outside React components
export const setSecretKey = (secretKey: string | null): void => {
  useSecretStore.getState().setSecretKey(secretKey);
};

// Export a function to clear the secret key from memory
export const clearSecretKey = (): void => {
  useSecretStore.getState().clearSecretKey();
};

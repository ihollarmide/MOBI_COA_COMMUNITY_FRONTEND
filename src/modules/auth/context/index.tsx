import { createContext, JSX, useContext, useEffect } from "react";
import { setSecretKey } from "@/modules/auth/store/secret.store";

interface SecretContext {
  secretKey: string | null;
}

const defaultSecretContext: SecretContext = {
  secretKey: null,
};

const SecretContext = createContext<SecretContext>(defaultSecretContext);

export const useSecretContext = () => {
  const context = useContext(SecretContext);
  if (!context) {
    throw new Error("useSecretContext must be used within a SecretProvider");
  }
  return context;
};

interface SecretProviderProps {
  children: React.ReactNode;
  secretKey: string | null;
}

const SecretProvider = ({
  children,
  secretKey = null,
}: SecretProviderProps): JSX.Element => {
  // Sync the secret key with the global store
  useEffect(() => {
    setSecretKey(secretKey);
  }, [secretKey]);

  return (
    <SecretContext.Provider
      value={{
        secretKey,
      }}
    >
      {children}
    </SecretContext.Provider>
  );
};

export default SecretContext;

export { SecretProvider };

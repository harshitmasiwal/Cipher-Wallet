import { createContext, useContext, useState } from "react";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [isWalletLocked, setIsWalletLocked] = useState(true);
  const [walletData, setWalletData] = useState(null);

  return (
    <WalletContext.Provider
      value={{ isWalletLocked, setIsWalletLocked, walletData, setWalletData }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
};

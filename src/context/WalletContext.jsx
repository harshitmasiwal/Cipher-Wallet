import { createContext, useContext, useState, useMemo } from "react";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [isWalletLocked, setIsWalletLocked] = useState(true);
  const [walletData, setWalletData] = useState(null);

  // Memoize the value to prevent unnecessary re-renders in consumers
  const value = useMemo(() => ({
    isWalletLocked, 
    setIsWalletLocked, 
    walletData, 
    setWalletData
  }), [isWalletLocked, walletData]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
};
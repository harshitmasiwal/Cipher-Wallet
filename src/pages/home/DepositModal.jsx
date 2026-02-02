import React, { useState } from "react";
import { X, ExternalLink } from "lucide-react";
// 1. Import your custom icons
import { BitcoinIcon, EthereumIcon, SolanaIcon } from "./icons"; 

const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200">
      <div className="flex justify-between items-center p-6 border-b border-zinc-100">
        <h3 className="text-xl font-bold">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <X size={20} className="text-black" /> 
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

// 2. Updated NetworkTabs to use the Icons
const NetworkTabs = ({ selected, onSelect }) => {
  const networks = [
    { id: 'BTC', label: 'Bitcoin', Icon: BitcoinIcon },
    { id: 'ETH', label: 'Ethereum', Icon: EthereumIcon },
    { id: 'SOL', label: 'Solana', Icon: SolanaIcon },
  ];

  return (
    <div className="flex bg-zinc-100 p-1 rounded-xl mb-6">
      {networks.map(({ id, Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            selected === id 
              ? 'bg-black text-white shadow-sm' 
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          {/* Scale the icon slightly to fit better with text */}
          <div className="scale-75">
             <Icon />
          </div>
          <span>{id}</span>
        </button>
      ))}
    </div>
  );
};

export default function DepositModal({ onClose, walletData }) {
  const [chain, setChain] = useState('BTC');

  const handleDeposit = () => {
    let address = "";
    if (chain === 'BTC') address = walletData.bitcoinMain.address;
    if (chain === 'ETH') address = walletData.ethereum.address;
    if (chain === 'SOL') address = walletData.solana.address;

    const url = `https://buy.moonpay.com?walletAddress=${address}&currencyCode=${chain.toLowerCase()}`;
    window.open(url, '_blank');
  };

  // Helper to get active icon for the button text (optional visual flair)
  const getActiveIcon = () => {
    switch(chain) {
        case 'BTC': return BitcoinIcon;
        case 'ETH': return EthereumIcon;
        case 'SOL': return SolanaIcon;
        default: return BitcoinIcon;
    }
  };
  const ActiveIcon = getActiveIcon();

  return (
    <ModalWrapper title="Deposit (Buy Crypto)" onClose={onClose}>
      <NetworkTabs selected={chain} onSelect={setChain} />
      
      <div className="text-center space-y-6">
        <div className="bg-zinc-50 h-50 flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-100">
             <p className="text text-zinc-700 mb-2">You are about to buy <strong className="text-black">{chain}</strong> via external provider.</p>
             <p className="text-xs text-zinc-700">The assets will be deposited to your Mainnet address automatically.</p>
        </div>

        <button 
            onClick={handleDeposit}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 flex items-center justify-center gap-2"
        >
            <div className="scale-110 mr-2"><ActiveIcon /></div>
            Buy {chain} Now 
            <ExternalLink size={18} className="ml-1" />
        </button>
      </div>
    </ModalWrapper>
  );
}
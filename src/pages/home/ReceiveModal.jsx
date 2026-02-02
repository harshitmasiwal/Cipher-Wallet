import React, { useState } from "react";
import QRCode from "react-qr-code";
import { Check, Copy, X } from "lucide-react";
// 1. Import your custom icons
import { BitcoinIcon, EthereumIcon, SolanaIcon } from "./icons"; 

const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200">
      <div className="flex justify-between items-center p-6 border-b border-zinc-100">
        <h3 className="text-xl font-bold">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <X size={20} className="text-zinc-500" />
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
              ? 'bg-white text-black shadow-sm' 
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          {/* Scale the icon slightly to fit nicely with text */}
          <div className="scale-75">
             <Icon />
          </div>
          <span>{id}</span>
        </button>
      ))}
    </div>
  );
};

export default function ReceiveModal({ onClose, isDevnet, walletData }) {
  const [chain, setChain] = useState('BTC');
  const [copied, setCopied] = useState(false);

  const getAddress = () => {
    if(!walletData) return "";
    if (chain === 'BTC') return isDevnet ? walletData.bitcoinTest.address : walletData.bitcoinMain.address;
    if (chain === 'ETH') return walletData.ethereum.address; 
    if (chain === 'SOL') return walletData.solana.address; 
    return "";
  };

  const address = getAddress();
  const networkName = isDevnet 
    ? (chain === 'BTC' ? 'Bitcoin Testnet' : chain === 'ETH' ? 'Sepolia' : 'Devnet') 
    : (chain === 'BTC' ? 'Bitcoin' : chain === 'ETH' ? 'Ethereum' : 'Solana');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to get active icon for the footer text
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
    <ModalWrapper title="Receive Crypto" onClose={onClose}>
      <NetworkTabs selected={chain} onSelect={setChain} />
      
      <div className="flex flex-col items-center gap-6">
        {/* Real QR Code */}
        <div className="bg-white border-2 border-zinc-100 rounded-2xl p-4 shadow-sm relative group">
             <QRCode 
                value={address || "Loading..."} 
                size={180}
                viewBox={`0 0 256 256`}
             />
             {/* Optional: Overlay Icon in center of QR code for style */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <div className="scale-100"><ActiveIcon /></div>
                </div>
             </div>
        </div>

        <div className="w-full">
            <div 
                onClick={copyToClipboard}
                className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-4 rounded-xl cursor-pointer hover:border-black transition-colors group"
            >
                <p className="font-mono text-xs text-zinc-600 truncate mr-4">{address}</p>
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-zinc-400 group-hover:text-black" />}
            </div>
            
            <p className="text-center text-xs text-zinc-400 mt-4 flex items-center justify-center gap-1">
                Only send <span className="font-bold text-black">{networkName}</span> assets to this address.
            </p>
        </div>
      </div>
    </ModalWrapper>
  );
}
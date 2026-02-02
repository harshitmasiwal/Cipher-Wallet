import React, { useState } from "react";
import { Send, ArrowDownToLine, RefreshCw, History, Activity, ExternalLink } from "lucide-react";
// 1. Import your custom icons
import { BitcoinIcon, EthereumIcon, SolanaIcon } from "./icons";

export default function TransactionHistory({ transactions, loading, onRefresh }) {
  const [activeTab, setActiveTab] = useState("BTC"); 

  // Define tabs with their corresponding icons
  const tabs = [
    { id: 'BTC', label: 'BTC', Icon: BitcoinIcon },
    { id: 'ETH', label: 'ETH', Icon: EthereumIcon },
    { id: 'SOL', label: 'SOL', Icon: SolanaIcon },
  ];

  // Filter logic
  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === "BTC") return tx.symbol.includes("BTC");
    if (activeTab === "ETH") return tx.symbol.includes("ETH");
    if (activeTab === "SOL") return tx.symbol.includes("SOL");
    return false;
  });

  return (
    <div className="h-full bg-white w-full rounded-[24px] md:rounded-[32px] p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
      
      {/* Header with Refresh */}
      <div className="flex justify-between items-center mb-3 md:mb-4 shrink-0">
        <h3 className="font-bold text-zinc-900">Recent Transactions</h3>
        <button 
          onClick={onRefresh}
          className="p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-400 hover:text-black group active:scale-90"
          title="Refresh History"
        >
          <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tabs with Icons */}
      <div className="flex gap-2 mb-3 md:mb-4 overflow-x-auto pb-2 scrollbar-hide shrink-0">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 md:px-5 py-2 rounded-[18px] text-xs font-bold transition-all whitespace-nowrap border active:scale-95 flex items-center gap-2 ${
              activeTab === id 
                ? 'bg-black text-white border-black shadow-md' 
                : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-800'
            }`}
          >
            <div className="scale-75">
                <Icon />
            </div>
            {label}
          </button>
        ))}
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar space-y-2">
        {loading && filteredTransactions.length === 0 ? (
           <div className="h-full flex items-center justify-center">
             <RefreshCw className="animate-spin text-zinc-300" size={24} />
           </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
             <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                <History size={20} className="text-zinc-400" />
             </div>
             <p className="text-zinc-500 font-medium text-sm">No transactions found for {activeTab}</p>
          </div>
        ) : (
          filteredTransactions.map((tx, idx) => (
            <TransactionRow key={tx.id || idx} tx={tx} />
          ))
        )}
      </div>
    </div>
  );
}

const TransactionRow = ({ tx }) => {
  // Check if it's a generic Solana Devnet interaction (data unavailable)
  const isSolanaGeneric = tx.network === "Solana Devnet" || tx.type === "TX";

  if (isSolanaGeneric) {
    return (
      <div className="flex items-center justify-between p-3 md:p-4 rounded-4xl md:rounded-[24px] border border-transparent bg-zinc-50/50 hover:bg-white hover:border-zinc-200 hover:shadow-sm transition-all group active:scale-[0.98]">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-zinc-100 border-zinc-200 text-zinc-500 shrink-0">
            <Activity size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-zinc-900 truncate">Interaction</p>
                <span className="hidden xs:inline-block text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded font-medium border border-zinc-200 shrink-0">
                    Devnet
                </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5 truncate">{tx.date}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
            <a href={tx.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                View <ExternalLink size={12} />
            </a>
        </div>
      </div>
    );
  }

  // Standard Render (BTC/ETH/Mainnet)
  return (
    <div className="flex items-center justify-between p-3 md:p-4 rounded-4xl md:rounded-[24px] border border-zinc-300 bg-zinc-50 hover:bg-white hover:border-zinc-200 hover:shadow-sm transition-all group active:scale-[0.98]">
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${
            tx.type === 'SENT' 
            ? 'bg-red-50 text-red-500 border-red-100' 
            : 'bg-emerald-50 text-emerald-500 border-emerald-100'
        }`}>
          {tx.type === 'SENT' ? <Send size={16} /> : <ArrowDownToLine size={16} />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-zinc-900 truncate">
                  {tx.type === 'SENT' ? 'Sent' : 'Received'} {tx.symbol}
              </p>
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5 truncate">{tx.date}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
          <p className={`font-mono font-bold text-sm ${tx.type === 'RECEIVED' ? 'text-emerald-600' : 'text-zinc-900'}`}>
              {tx.type === 'SENT' ? '-' : '+'}{tx.amount}
          </p>
          <a href={tx.url} target="_blank" rel="noreferrer" className="flex items-center justify-end gap-1 text-xs text-zinc-400 group-hover:text-blue-500 transition-colors font-medium">
              Explorer <ExternalLink size={10} />
          </a>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Wallet,
  QrCode,
  Fuel,
  ArrowRight,
} from "lucide-react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

// Ensure these paths match your project structure
import { BitcoinIcon, EthereumIcon, SolanaIcon } from "./icons";
import { 
    sendEth, sendSol, sendBtc, 
    getEthFeeEstimate, getSolFeeEstimate, getBtcFeeEstimate 
} from "../../core/api/transactionService";

/* --- COMPONENT: QR Scanner Modal (Mobile Optimized) --- */
const QRScannerModal = ({ onScan, onClose }) => {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm aspect-square bg-zinc-900 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
        <div className="w-full h-full object-cover">
          <BarcodeScannerComponent
            width="100%"
            height="100%"
            onUpdate={(err, result) => {
              if (result) {
                onScan(result.text);
                onClose();
              }
            }}
          />
        </div>
        <div className="absolute inset-0 border-40 border-black/50 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white/50 rounded-xl relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1"></div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all z-10"
        >
          <X size={24} />
        </button>
        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <p className="text-white text-sm font-medium bg-black/60 backdrop-blur-sm inline-block px-4 py-2 rounded-full border border-white/10">
            Align QR Code within the frame
          </p>
        </div>
      </div>
    </div>
  );
};


/* --- COMPONENT: Modal Wrapper --- */
const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm md:max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 flex flex-col max-h-[90vh]">
      <div className="flex justify-between items-center p-5 border-b border-zinc-100 bg-white z-10">
        <h3 className="text-lg md:text-xl font-bold text-gray-900">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors active:scale-95"
        >
          <X size={20} className="text-zinc-500" />
        </button>
      </div>
      <div className="p-5 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  </div>
);

/* --- COMPONENT: Network Tabs --- */
const NetworkTabs = ({ selected, onSelect, disabled }) => {
  const networks = [
    { id: "BTC", label: "Bitcoin", Icon: BitcoinIcon },
    { id: "ETH", label: "Ethereum", Icon: EthereumIcon },
    { id: "SOL", label: "Solana", Icon: SolanaIcon },
  ];

  return (
    <div className="flex bg-zinc-100 p-1 rounded-xl mb-6">
      {networks.map(({ id, Icon }) => (
        <button
          key={id}
          onClick={() => !disabled && onSelect(id)}
          disabled={disabled}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            selected === id
              ? "bg-white text-black shadow-sm scale-[1.02]"
              : "text-zinc-400 hover:text-zinc-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="scale-75">
            <Icon />
          </div>
          <span>{id}</span>
        </button>
      ))}
    </div>
  );
};

/* --- MAIN EXPORT: SendModal --- */
export default function SendModal({
  onClose,
  isDevnet,
  walletData,
  onTxSuccess,
  balances,
  prices 
}) {
  const [chain, setChain] = useState("BTC");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  // Fee States
  const [estimatedFee, setEstimatedFee] = useState("0.00");
  const [isFeeLoading, setIsFeeLoading] = useState(false);

  const [status, setStatus] = useState("idle");
  const [txResult, setTxResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const getActiveIcon = () => {
    switch (chain) {
      case "BTC": return BitcoinIcon;
      case "ETH": return EthereumIcon;
      case "SOL": return SolanaIcon;
      default: return BitcoinIcon;
    }
  };
  const ActiveIcon = getActiveIcon();

  // --- HELPERS: USD CALCULATIONS ---

  const getPrice = () => {
      if (!prices) return 0;
      if(chain === 'BTC') return prices.btc;
      if(chain === 'ETH') return prices.eth;
      if(chain === 'SOL') return prices.sol;
      return 0;
  }

  const getFeeInUsd = () => {
      if(estimatedFee === "0.00") return "$0.00";
      const feeNum = parseFloat(estimatedFee);
      const price = getPrice();
      const val = feeNum * price;
      if (val < 0.01) return "< $0.01";
      return `$${val.toFixed(2)}`;
  };

  const getTotalUsd = () => {
      if(!amount) return "$0.00";
      const amtNum = parseFloat(amount);
      const feeNum = parseFloat(estimatedFee) || 0;
      if(isNaN(amtNum)) return "$0.00";
      
      const totalCrypto = amtNum + feeNum;
      const price = getPrice();
      const totalUsd = totalCrypto * price;

      return `$${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // --- FEE ESTIMATION EFFECT ---
  useEffect(() => {
    const fetchFee = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setEstimatedFee("0.00");
            return;
        }

        setIsFeeLoading(true);
        let fee = "0.00";

        try {
            if (chain === "ETH" && walletData?.ethereum) {
                fee = await getEthFeeEstimate(recipient, amount, isDevnet);
            } 
            else if (chain === "SOL" && walletData?.solana) {
                fee = await getSolFeeEstimate(recipient, amount, isDevnet);
            } 
            else if (chain === "BTC") {
                const btcData = isDevnet ? walletData?.bitcoinTest : walletData?.bitcoinMain;
                if (btcData) {
                    fee = await getBtcFeeEstimate(btcData.address, recipient, amount, isDevnet);
                }
            }
        } catch (e) {
            console.error(e);
        }

        setEstimatedFee(fee);
        setIsFeeLoading(false);
    };

    const timeoutId = setTimeout(() => {
        fetchFee();
    }, 600);

    return () => clearTimeout(timeoutId);

  }, [amount, recipient, chain, isDevnet, walletData]);


  if (!walletData) {
    return (
      <ModalWrapper title="Loading..." onClose={onClose}>
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-zinc-400" />
        </div>
      </ModalWrapper>
    );
  }

  const getCurrentBalance = () => {
    if (!balances) return "0.00";
    if (chain === "BTC") return isDevnet ? balances.btcTest : balances.btcMain;
    if (chain === "ETH") return isDevnet ? balances.ethSepolia : balances.ethMain;
    if (chain === "SOL") return isDevnet ? balances.solDevnet : balances.solMain;
    return "0.00";
  };
  const currentBalance = getCurrentBalance();

  const handleMaxClick = () => {
    setAmount(currentBalance);
  };

  const handleScan = (data) => {
    let cleanAddress = data;
    if (data.includes(":")) {
      cleanAddress = data.split(":")[1];
    }
    setRecipient(cleanAddress);
  };

  const handleSend = async () => {
    setStatus("sending");
    setErrorMsg("");

    try {
      let result;
      if (chain === "ETH") {
        if (!walletData.ethereum) throw new Error("Ethereum wallet data missing");
        result = await sendEth(walletData.ethereum.privateKey, recipient, amount, isDevnet);
      } else if (chain === "SOL") {
        if (!walletData.solana) throw new Error("Solana wallet data missing");
        result = await sendSol(walletData.solana.privateKey, recipient, amount, isDevnet);
      } else if (chain === "BTC") {
        const btcData = isDevnet ? walletData.bitcoinTest : walletData.bitcoinMain;
        if (!btcData) throw new Error("Bitcoin wallet data missing");
        result = await sendBtc(btcData.privateKey, btcData.address, recipient, amount, isDevnet);
      }

      if (result.success) {
        setTxResult(result);
        setStatus("success");
        if (onTxSuccess) onTxSuccess();
      } else {
        throw new Error(result.error || "Transaction failed");
      }
    } catch (err) {
      console.error(err);
      
      let userMsg = "Transaction failed. Please check details.";
      const m = err.message?.toLowerCase() || "";

      // --- CUSTOM ERROR MAPPING FOR USER ---
      if (m.includes("non-base58 character")) {
          userMsg = "Invalid Solana address format.";
      } 
      else if (m.includes("attempt to debit") || m.includes("no record of a prior credit")) {
          userMsg = "Insufficient funds. Your wallet is empty.";
      }
      else if (m.includes("wallet empty") || m.includes("no utxos")) {
          userMsg = "Insufficient Bitcoin balance (No UTXOs).";
      }
      else if (m.includes("insufficient") || m.includes("balance") || m.includes("fund")) {
        userMsg = "Insufficient balance for amount + gas fees.";
      } 
      else if (m.includes("invalid") || m.includes("address")) {
        userMsg = "Invalid recipient address.";
      }
      
      setErrorMsg(userMsg);
      setStatus("error");
    }
  };

  // --- VIEW: SENDING ---
  if (status === "sending") {
    return (
      <ModalWrapper title="Broadcasting..." onClose={() => {}}>
        <style>{`
            @keyframes coinRun {
              0%, 100% { transform: translateY(0) rotate(5deg); }
              50% { transform: translateY(-6px) rotate(12deg); }
            }
            @keyframes speedLine {
              0% { transform: translateX(100%); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: translateX(-200%); opacity: 0; }
            }
        `}</style>

        <div className="flex flex-col items-center justify-center py-8 space-y-6 overflow-hidden">
          <div className="relative w-full h-32 rounded-2xl overflow-hidden flex items-center justify-center group">
            <div className="absolute inset-0 flex flex-col justify-center gap-2 opacity-40">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 bg-linear-to-l from-zinc-400 to-transparent rounded-full"
                  style={{
                    width: `${Math.random() * 40 + 20}%`, 
                    marginLeft: `${Math.random() * 50}%`,
                    animation: `speedLine ${0.5 + Math.random() * 0.5}s linear infinite`,
                    animationDelay: `${Math.random() * 1}s`,
                    opacity: Math.random() * 0.5 + 0.2,
                  }}
                />
              ))}
            </div>
            <div className="absolute bottom-4 w-full flex justify-end overflow-hidden opacity-50">
              <div className="w-24 h-0.5 bg-zinc-400 rounded-full animate-[speedLine_0.4s_linear_infinite]" />
            </div>
            <div className="relative z-10" style={{ animation: "coinRun 0.6s ease-in-out infinite" }}>
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center shadow-[4px_10px_20px_rgba(0,0,0,0.25)] border-2 border-white/10">
                <div className="scale-75 text-white"><ActiveIcon /></div>
              </div>
            </div>
          </div>
          <div className="text-center space-y-2 relative z-20">
            <h3 className="text-lg font-bold text-gray-900">Sending {amount} {chain}</h3>
            <p className="text-sm text-gray-500 animate-pulse">Confirming on blockchain...</p>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  // --- VIEW: SUCCESS ---
  if (status === "success") {
    return (
      <ModalWrapper title="Sent Successfully" onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 size={48} className="text-green-600 animate-in fade-in zoom-in duration-500" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Transaction Sent!</h2>
            <p className="text-sm text-gray-500 max-w-50 truncate mx-auto px-4">{txResult?.hash}</p>
          </div>
          <div className="flex flex-col w-full gap-3 pt-4">
            <a href={txResult?.explorerUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-100 text-black font-bold rounded-xl hover:bg-zinc-200 transition-all">
              View on Explorer <ExternalLink size={16} />
            </a>
            <button onClick={onClose} className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg">Done</button>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  // --- VIEW: FORM ---
  return (
    <>
      {isScannerOpen && (
        <QRScannerModal onScan={handleScan} onClose={() => setIsScannerOpen(false)} />
      )}

      <ModalWrapper title="Send Crypto" onClose={onClose}>
        <NetworkTabs selected={chain} onSelect={setChain} disabled={status === "sending"} />

        <div className="space-y-4 md:space-y-2">
          {status === "error" && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Address Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 ml-1">Recipient Address</label>
            <div className="relative group">
              <input
                type="text"
                placeholder={`Enter ${chain} Address`}
                className="w-full p-4 pr-12 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-mono text-sm text-gray-900 placeholder:text-gray-400"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={status === "sending"}
              />
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all"
                title="Scan QR Code"
              >
                <QrCode size={20} />
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-zinc-500">Amount</label>
              <div
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity"
                onClick={handleMaxClick}
              >
                <Wallet size={12} className="text-zinc-400" />
                <span className="text-xs text-zinc-500">Bal:</span>
                <span className="text-xs font-bold text-gray-900 truncate max-w-20">{currentBalance}</span>
                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded ml-1">MAX</span>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                className="w-full p-4 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-mono text-sm text-gray-900 placeholder:text-gray-400"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={status === "sending"}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs mr-4 font-bold text-zinc-400 flex items-center gap-1">
                <div><ActiveIcon /></div>
              </span>
            </div>
          </div>

          {/* --- GAS FEE PREVIEW WITH USD --- */}
          <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 flex justify-between items-center">
             <div className="flex items-center gap-2 text-zinc-500">
                <Fuel size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Network Fee</span>
             </div>
             
             <div className="text-sm font-mono font-medium text-zinc-800 text-right">
                {isFeeLoading ? (
                    <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> ...
                    </span>
                ) : (
                    <div className="flex flex-col items-end leading-tight">
                        {/* TRUNCATED FEE to prevent overflow */}
                        <span>~{parseFloat(estimatedFee).toFixed(8).substring(0,10)} {chain}</span>
                        {estimatedFee !== "0.00" && prices && (
                             <span className="text-zinc-400 text-[10px] font-bold">
                                {getFeeInUsd()}
                             </span>
                        )}
                    </div>
                )}
             </div>
          </div>
          
          {/* --- NEW SECTION: TOTAL SPEND --- */}
          {amount && !isNaN(amount) && (
             <div className="flex justify-between items-center px-1 pt-1 pb-2 border-t border-dashed border-gray-100 mt-2">
               <span className="text-sm font-bold text-zinc-400">Total Spend</span>
               <div className="flex items-center gap-2">
                 <span className="text-lg font-extrabold text-zinc-900 tracking-tight">
                    {getTotalUsd()}
                 </span>
                 <span className="text-xs font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">USD</span>
               </div>
             </div>
          )}

          <div className="pt-0">
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-50 transition-colors">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-zinc-300 text-black focus:ring-black accent-black"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={status === "sending"}
              />
              <span className="text-sm text-zinc-600 select-none">
                I confirm the transaction details
              </span>
            </label>
          </div>

          <button
            disabled={!confirmed || !amount || !recipient || status === "sending"}
            onClick={handleSend}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all mt-2 shadow-lg shadow-zinc-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {status === "sending" ? (
              <>Processing <Loader2 className="animate-spin" size={20} /></>
            ) : (
              <>
                <div className="scale-120 mr-2"><ActiveIcon /></div>
                Send {chain} <ArrowRight size={18} className="opacity-60" />
              </>
            )}
          </button>
        </div>
      </ModalWrapper>
    </>
  );
}
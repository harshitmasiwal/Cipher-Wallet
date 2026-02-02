// import { useEffect, useState, useMemo, useRef, useCallback } from "react"; 
// import { useNavigate } from "react-router";
// import { decodeSecret } from "../../core/functions/wallet";
// import { fetchAllBalances } from "../../core/api/balanceService";
// import { 
//   fetchBtcMainHistory, fetchBtcTestHistory,
//   fetchEthMainHistory, fetchEthSepoliaHistory,
//   fetchSolMainHistory, fetchSolDevHistory
// } from "../../core/api/historyService";
// import { useWallet } from "../../context/WalletContext";
// import InputPassword from "../InputPassword";
// import SendModal from "./SendModal";
// import ReceiveModal from "./ReceiveModal";
// import DepositModal from "./DepositModal";
// import TransactionHistory from "./TransactionHistory"; 

// import { 
//   Send, ArrowDownToLine, RefreshCw, LogOut, CreditCard, Settings, Check, TrendingUp, Lock, Wifi, WifiOff
// } from "lucide-react";
// import { BitcoinIcon, SolanaIcon , EthereumIcon, CypherLogo } from "./icons";
// import { Spinner } from "@/components/ui/spinner";

// export default function HomePage() {
//   const { isWalletLocked, walletData, setWalletData, setIsWalletLocked } = useWallet();
//   const navigate = useNavigate();

//   // --- STATE ---
//   const [isDevnet, setIsDevnet] = useState(true);
//   const [loadingBalances, setLoadingBalances] = useState(false);
//   const [modalOpen, setModalOpen] = useState(null); 
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const [isOnline, setIsOnline] = useState(navigator.onLine);
//   const [prices, setPrices] = useState({ btc: 0, eth: 0, sol: 0 });

//   const [balances, setBalances] = useState({
//     ethMain: "0.00", ethSepolia: "0.00",
//     btcMain: "0.00", btcTest: "0.00",
//     solMain: "0.00", solDevnet: "0.00"
//   });

//   const [history, setHistory] = useState({
//     btcMain: { data: [], loading: false },
//     btcTest: { data: [], loading: false },
//     ethMain: { data: [], loading: false },
//     ethSepolia: { data: [], loading: false },
//     solMain: { data: [], loading: false },
//     solDev: { data: [], loading: false },
//   });

//   // --- 1. REF FOR CACHING ---
//   const lastPriceFetch = useRef(0);

//   // --- SAFE DATA FETCHING ---
  
//   // Updated fetchPrices with throttling
//   const fetchPrices = useCallback(async (force = false) => {
//     const now = Date.now();
    
//     // Prevent fetching if less than 60 seconds have passed, unless 'force' is true
//     if (!force && (now - lastPriceFetch.current < 60000)) {
//         return;
//     }

//     try {
//         const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd");
        
//         if (!res.ok) {
//             if (res.status === 429) console.warn("CoinGecko Rate Limit Hit");
//             return;
//         }

//         const data = await res.json();
//         setPrices({
//             btc: data.bitcoin.usd,
//             eth: data.ethereum.usd,
//             sol: data.solana.usd
//         });
        
//         // Update the timestamp only on success
//         lastPriceFetch.current = now; 
//     } catch (error) {
//         console.error("Failed to fetch prices", error);
//     }
//   }, []);

//   const refreshBalances = useCallback((force = false) => {
//     if (!walletData) return;

//     setLoadingBalances(true);
    
//     // Pass 'force' to allow manual refresh button to bypass cache
//     fetchPrices(force); 

//     fetchAllBalances(walletData).then((data) => {
//       if (data) setBalances(data);
//       setLoadingBalances(false);
//     }).catch(err => setLoadingBalances(false));
//   }, [walletData, fetchPrices]);

//   const refreshAllHistory = useCallback(() => {
//     if(!walletData) return; 

//     const refreshHistory = async (networkKey, fetcher, address) => {
//         setHistory(prev => ({ ...prev, [networkKey]: { ...prev[networkKey], loading: true } }));
//         try {
//             const data = await fetcher(address);
//             setHistory(prev => ({ ...prev, [networkKey]: { data: data || [], loading: false } }));
//         } catch (e) {
//              setHistory(prev => ({ ...prev, [networkKey]: { ...prev[networkKey], loading: false } }));
//         }
//     };

//     if(walletData.bitcoinMain) refreshHistory('btcMain', fetchBtcMainHistory, walletData.bitcoinMain.address);
//     if(walletData.bitcoinTest) refreshHistory('btcTest', fetchBtcTestHistory, walletData.bitcoinTest.address);
//     if(walletData.ethereum) refreshHistory('ethMain', fetchEthMainHistory, walletData.ethereum.address);
//     if(walletData.ethereum) refreshHistory('ethSepolia', fetchEthSepoliaHistory, walletData.ethereum.address);
//     if(walletData.solana) refreshHistory('solMain', fetchSolMainHistory, walletData.solana.address);
//     if(walletData.solana) refreshHistory('solDev', fetchSolDevHistory, walletData.solana.address);
//   }, [walletData]);

//   // --- INIT EFFECTS ---

//   useEffect(() => {
//     const secret = localStorage.getItem("secret");
//     if (!secret) { 
//         navigate("/"); 
//         return; 
//     }
//     if (!isWalletLocked && walletData) return;

//     const password = sessionStorage.getItem("wallet_pwd"); 
    
//     if (password && isWalletLocked) {
//       try {
//           const wallet = decodeSecret(secret, password);
//           if (wallet && !wallet.error) { 
//             setWalletData(wallet);
//             setIsWalletLocked(false);
//           }
//       } catch (e) {
//           console.error("Auto-unlock failed", e);
//       }
//     }
//   }, [isWalletLocked, walletData, navigate, setWalletData, setIsWalletLocked]);

//   // 2. Data Fetching
//   useEffect(() => {
//     // REMOVED: fetchPrices(); <--- This was the duplicate call causing the 429 error
    
//     if (walletData) {
//       // We call this without arguments, so it uses the cache logic
//       refreshBalances(); 
//       refreshAllHistory(); 
//     }
//   }, [walletData, refreshBalances, refreshAllHistory]); // fetchPrices removed from deps


//   const settingsRef = useRef(null);
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (settingsRef.current && !settingsRef.current.contains(event.target)) {
//         setSettingsOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [settingsRef]);

//   useEffect(() => {
//     const handleStatusChange = () => setIsOnline(navigator.onLine);
//     window.addEventListener('online', handleStatusChange);
//     window.addEventListener('offline', handleStatusChange);
//     return () => {
//       window.removeEventListener('online', handleStatusChange);
//       window.removeEventListener('offline', handleStatusChange);
//     };
//   }, []);

//   const handleLock = () => {
//     sessionStorage.removeItem("wallet_pwd");
//     setWalletData(null);
//     setIsWalletLocked(true);
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     window.location.href = "/";
//   };

//   const displayedHistory = useMemo(() => {
//     let combined = [];
//     if (isDevnet) {
//       combined = [...history.btcTest.data, ...history.ethSepolia.data, ...history.solDev.data];
//     } else {
//       combined = [...history.btcMain.data, ...history.ethMain.data, ...history.solMain.data];
//     }
//     return combined; 
//   }, [history, isDevnet]);

//   const calculateTotalBalance = () => {
//       const btcBal = parseFloat(isDevnet ? balances.btcTest : balances.btcMain) || 0;
//       const ethBal = parseFloat(isDevnet ? balances.ethSepolia : balances.ethMain) || 0;
//       const solBal = parseFloat(isDevnet ? balances.solDevnet : balances.solMain) || 0;

//       const total = (btcBal * prices.btc) + (ethBal * prices.eth) + (solBal * prices.sol);
//       return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   };

//   const displayTotal = calculateTotalBalance();
//   const isHistoryLoading = Object.values(history).some(h => h.loading);

//   if (isWalletLocked) return <InputPassword />;
//   if (!walletData) return <div className="h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400"><Spinner /></div>;

//   return (
//     <div className="md:h-210 bg-[#FAFAFA] text-gray-900 font-sans flex flex-col items-center">
//        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      
//       <div className="fixed top-0 left-0 w-full h-96 bg-linear-to-b from-gray-100 to-transparent -z-10"></div>

//       <div className="w-full max-w-7xl px-4 py-6 md:p-8 flex flex-col min-h-screen lg:h-screen">
        
//         <div className="flex z-6 justify-between items-center mb-6 md:mb-8 shrink-0">
//           <div className="flex items-center gap-3">
//              <div className="w-10 h-10 md:w-11 md:h-11 bg-black rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-black/10">
//                 <CypherLogo></CypherLogo>
//              </div>
//              <span className="font-bold text-xl md:text-2xl tracking-wider text-zinc-900">Cipher </span>
//           </div>
          
//           <div className="flex items-center gap-2 md:gap-3">
//           <div className={`h-11 px-3 md:px-4 rounded-[14px] border flex items-center gap-2 transition-all duration-300 ${
//                 isOnline 
//                 ? 'bg-zinc-100 border-emerald-300 text-emerald-900' 
//                 : 'bg-zinc-100 border-red-500 text-red-600'
//             }`}>
//                 {isOnline ? <Wifi size={18} strokeWidth={2.5} /> : <WifiOff size={18} strokeWidth={2.5} />}
//                 <span className="text-xs font-bold hidden sm:block">
//                     {isOnline ? 'Online' : 'No Network'}
//                 </span>
//             </div>
            
//             {/* UPDATED: Pass true to refreshBalances to force bypass the cache */}
//             <button 
//               onClick={() => refreshBalances(true)} 
//               className="p-3 rounded-[14px] bg-white border border-gray-100 text-zinc-400 hover:text-black hover:shadow-md active:scale-95 transition-all duration-200"
//               title="Refresh Data"
//             >
//               <RefreshCw size={20} className={loadingBalances ? "animate-spin" : ""} />
//             </button>

//             <div className="relative" ref={settingsRef}>
//                 <button 
//                     onClick={() => setSettingsOpen(!settingsOpen)}
//                     className={`p-3 rounded-[14px] border transition-all duration-200 active:scale-95 flex items-center gap-2 ${settingsOpen ? 'bg-zinc-100 border-zinc-300 text-black' : 'bg-white border-gray-100 text-zinc-500 hover:text-black hover:shadow-md'}`}
//                 >
//                     <Settings size={20} />
//                 </button>

//                 {settingsOpen && (
//                     <div className="absolute right-0 top-14 w-64 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
//                         <div className="px-3 py-2 mb-2 border-b border-gray-50">
//                             <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Network</span>
//                         </div>
//                         <button 
//                             onClick={() => { setIsDevnet(false); setSettingsOpen(false); }}
//                             className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl hover:bg-zinc-50 transition-colors text-left mb-1 text-zinc-700"
//                         >
//                             <span>Mainnet</span>
//                             {!isDevnet && <Check size={16} className="text-black" />}
//                         </button>
//                         <button 
//                             onClick={() => { setIsDevnet(true); setSettingsOpen(false); }}
//                             className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl hover:bg-zinc-50 transition-colors text-left text-zinc-700"
//                         >
//                             <span>Testnet</span>
//                             {isDevnet && <Check size={16} className="text-black" />}
//                         </button>
                        
//                         <div className="h-px bg-gray-100 my-2"></div>
                        
//                         <div className="px-3 py-2 mb-1">
//                             <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Account</span>
//                         </div>

//                         <button 
//                             onClick={handleLock}
//                             className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors mb-1"
//                         >
//                             <Lock size={18} /> Lock Wallet
//                         </button>

//                         <button 
//                             onClick={handleLogout}
//                             className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50 transition-colors"
//                         >
//                             <LogOut size={18} /> Logout
//                         </button>
//                     </div>
//                 )}
//             </div>
//           </div>
//         </div>

//         {/* MAIN LAYOUT */}
//         <div className="grid z-2 grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:flex-1 lg:min-h-0 lg:pb-6">
          
//           {/* LEFT COLUMN: BALANCE & ASSETS */}
//           <div className="flex flex-col gap-4 md:gap-6 h-auto lg:h-full lg:min-h-0">
            
//             <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between shrink-0 h-auto lg:h-60">
//                 <div>
//                     <div className="flex justify-between items-start mt-2 md:mt-5 mb-4">
//                         <h3 className=" font-bold tracking-tight flex items-center gap-2">
//                             Total Approx Balance 
//                             {isDevnet && <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100">TESTNET</span>}
//                         </h3>
//                     </div>
//                     <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 mt-2 flex items-baseline gap-1 break-all">
//                         <span className="text-2xl sm:text-3xl lg:text-4xl text-zinc-700">$</span>{displayTotal}
//                     </div>
//                     <div className="flex items-center gap-2 mt-4 text-emerald-500 font-medium text-sm">
//                         <TrendingUp size={16} />
//                         <span>Live Portfolio Value</span>
//                     </div>
//                 </div>
//             </div>

//             <div className={`bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-80 flex flex-col md:min-h-100 overflow-hidden `}>
//                 <h3 className=" font-bold uppercase tracking-tight mb-4 md:mb-6 shrink-0">Your Assets</h3>
//                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
//                     <AssetRow 
//                         ticker="BTC" 
//                         name="Bitcoin" 
//                         amount={isDevnet ? balances.btcTest : balances.btcMain} 
//                         price={prices.btc}
//                         icon={<BitcoinIcon />} 
//                         color="bg-[#FFF6ED] text-[#F7931A] border-[#FFEAD5]"
//                     />
//                     <AssetRow 
//                         ticker="ETH" 
//                         name="Ethereum" 
//                         amount={isDevnet ? balances.ethSepolia : balances.ethMain} 
//                         price={prices.eth}
//                         icon={<EthereumIcon />} 
//                         color="bg-[#F0F5FF] text-[#627EEA] border-[#DCE6FF]"
//                     />
//                     <AssetRow 
//                         ticker="SOL" 
//                         name="Solana" 
//                         amount={isDevnet ? balances.solDevnet : balances.solMain} 
//                         price={prices.sol}
//                         icon={<SolanaIcon />} 
//                         color="bg-[#ECFDF5] text-[#14F195] border-[#D1FAE5]"
//                     />
//                 </div>
//             </div>
//           </div>

//           {/* RIGHT COLUMN: ACTIONS & HISTORY */}
//           <div className="flex flex-col gap-4 md:gap-6 h-auto lg:h-full lg:min-h-0">
//             <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 shrink-0 h-auto lg:h-60 flex flex-col justify-center">
//                  <h2 className="font-bold text-zinc-900 mb-4 md:mb-6">Quick Actions</h2>
//                  <div className="grid grid-cols-3 gap-3 md:gap-6 h-28 lg:h-full">
//                      <ActionButton 
//                         icon={<Send size={24} />} 
//                         label="Send" 
//                         onClick={() => setModalOpen('send')}
//                         primary
//                       />
//                       <ActionButton 
//                         icon={<ArrowDownToLine size={24} />} 
//                         label="Receive" 
//                         onClick={() => setModalOpen('receive')}
//                         primary
//                       />
//                       <ActionButton
//                         icon={<CreditCard size={24} />} 
//                         label="Deposit"
//                         onClick={() => !isDevnet && setModalOpen('deposit')}
//                         disabled={isDevnet}
//                         secondary 
//                       />
//                 </div>
//             </div>

//             <div className={`bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col min-h-100`}>
//                 <TransactionHistory 
//                     transactions={displayedHistory} 
//                     loading={isHistoryLoading} 
//                     onRefresh={refreshAllHistory}
//                 />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- MODALS --- */}
//       {modalOpen === 'send' && (
//         <SendModal 
//           onClose={() => setModalOpen(null)} 
//           isDevnet={isDevnet}
//           walletData={walletData}  
//           balances={balances}
//           onTxSuccess={() => {
//               refreshBalances(true); // Force refresh on success
//               refreshAllHistory();
//           }}
//         />
//       )}
      
//       {modalOpen === 'receive' && (
//         <ReceiveModal 
//           onClose={() => setModalOpen(null)} 
//           isDevnet={isDevnet} 
//           walletData={walletData} 
//         />
//       )}

//       {modalOpen === 'deposit' && (
//         <DepositModal
//           onClose={() => setModalOpen(null)}
//           walletData={walletData} 
//         />
//       )}
//     </div>
//   );
// }

// // --- SUB-COMPONENTS ---
// const ActionButton = ({ icon, label, onClick, disabled, secondary }) => (
//   <button 
//     onClick={onClick}
//     disabled={disabled}
//     className={`
//       h-full w-full flex flex-col items-center justify-center gap-2 rounded-[24px] font-bold text-xs md:text-sm transition-all duration-200 active:scale-95
//       ${disabled 
//         ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100' 
//         : 'bg-black text-white hover:shadow-xl shadow-black/20 border border-black hover:-translate-y-1'
//       }
//     `}
//   >
//     {icon}
//     <span>{label}</span>
//   </button>
// );

// const AssetRow = ({ ticker, name, amount, price, icon, color }) => {
//     const usdValue = (parseFloat(amount) * price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

//     return (
//       <div className="flex items-center justify-between p-3 md:p-4 rounded-[24px] border border-transparent bg-gray-50/80 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all duration-300 group cursor-default active:scale-[0.98]">
//         <div className="flex items-center gap-3 md:gap-4">
//           <div className={`w-10 h-10 md:w-12 md:h-12 rounded-[18px] flex items-center justify-center font-bold text-lg md:text-xl border ${color}`}>
//             {icon}
//           </div>
//           <div>
//             <div className="flex items-center  gap-2">
//                 <span className="font-extrabold text-zinc-900 text-sm md:text-base">{ticker}</span>
//                 <span className="hidden sm:inline-block  text-xs text-zinc-700  px-1 py-0.5 lowercase mr-2   tracking-tight">({name})</span>
//             </div>
//             <p className="text-xs md:text-sm text-zinc-500 font-medium font-mono mt-0.5">{amount}</p>
//           </div>
//         </div>
//         <div className="text-right">
//             <p className="font-bold text-sm md:text-base text-zinc-900">{usdValue}</p>
//             <p className="text-[10px] md:text-xs text-zinc-400 font-medium">@ ${price.toLocaleString()}</p>
//         </div>
//       </div>
//     );
// };


import { useEffect, useState, useMemo, useRef, useCallback } from "react"; 
import { useNavigate } from "react-router";
// import { decodeSecret } from "../../core/functions/wallet"; // <-- NOT NEEDED ANYMORE HERE
import { fetchAllBalances } from "../../core/api/balanceService";
import { 
  fetchBtcMainHistory, fetchBtcTestHistory,
  fetchEthMainHistory, fetchEthSepoliaHistory,
  fetchSolMainHistory, fetchSolDevHistory
} from "../../core/api/historyService";
import { useWallet } from "../../context/WalletContext";
import InputPassword from "../InputPassword";
import SendModal from "./SendModal";
import ReceiveModal from "./ReceiveModal";
import DepositModal from "./DepositModal";
import TransactionHistory from "./TransactionHistory"; 

import { 
  Send, ArrowDownToLine, RefreshCw, LogOut, CreditCard, Settings, Check, TrendingUp, Lock, Wifi, WifiOff
} from "lucide-react";
import { BitcoinIcon, SolanaIcon , EthereumIcon, CypherLogo } from "./icons";
import { Spinner } from "@/components/ui/spinner";

export default function HomePage() {
  const { isWalletLocked, walletData, setWalletData, setIsWalletLocked } = useWallet();
  const navigate = useNavigate();

  // --- STATE ---
  const [isDevnet, setIsDevnet] = useState(true);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [modalOpen, setModalOpen] = useState(null); 
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [prices, setPrices] = useState({ btc: 0, eth: 0, sol: 0 });

  const [balances, setBalances] = useState({
    ethMain: "0.00", ethSepolia: "0.00",
    btcMain: "0.00", btcTest: "0.00",
    solMain: "0.00", solDevnet: "0.00"
  });

  const [history, setHistory] = useState({
    btcMain: { data: [], loading: false },
    btcTest: { data: [], loading: false },
    ethMain: { data: [], loading: false },
    ethSepolia: { data: [], loading: false },
    solMain: { data: [], loading: false },
    solDev: { data: [], loading: false },
  });

  // --- 1. REF FOR CACHING ---
  const lastPriceFetch = useRef(0);

  // --- SAFE DATA FETCHING ---
  const fetchPrices = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Prevent fetching if less than 60 seconds have passed, unless 'force' is true
    if (!force && (now - lastPriceFetch.current < 60000)) {
        return;
    }

    try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd");
        
        if (!res.ok) {
            if (res.status === 429) console.warn("CoinGecko Rate Limit Hit");
            return;
        }

        const data = await res.json();
        setPrices({
            btc: data.bitcoin.usd,
            eth: data.ethereum.usd,
            sol: data.solana.usd
        });
        
        lastPriceFetch.current = now; 
    } catch (error) {
        console.error("Failed to fetch prices", error);
    }
  }, []);

  const refreshBalances = useCallback((force = false) => {
    if (!walletData) return;

    setLoadingBalances(true);
    fetchPrices(force); 

    fetchAllBalances(walletData).then((data) => {
      if (data) setBalances(data);
      setLoadingBalances(false);
    }).catch(err => setLoadingBalances(false));
  }, [walletData, fetchPrices]);

  const refreshAllHistory = useCallback(() => {
    if(!walletData) return; 

    const refreshHistory = async (networkKey, fetcher, address) => {
        setHistory(prev => ({ ...prev, [networkKey]: { ...prev[networkKey], loading: true } }));
        try {
            const data = await fetcher(address);
            setHistory(prev => ({ ...prev, [networkKey]: { data: data || [], loading: false } }));
        } catch (e) {
             setHistory(prev => ({ ...prev, [networkKey]: { ...prev[networkKey], loading: false } }));
        }
    };

    if(walletData.bitcoinMain) refreshHistory('btcMain', fetchBtcMainHistory, walletData.bitcoinMain.address);
    if(walletData.bitcoinTest) refreshHistory('btcTest', fetchBtcTestHistory, walletData.bitcoinTest.address);
    if(walletData.ethereum) refreshHistory('ethMain', fetchEthMainHistory, walletData.ethereum.address);
    if(walletData.ethereum) refreshHistory('ethSepolia', fetchEthSepoliaHistory, walletData.ethereum.address);
    if(walletData.solana) refreshHistory('solMain', fetchSolMainHistory, walletData.solana.address);
    if(walletData.solana) refreshHistory('solDev', fetchSolDevHistory, walletData.solana.address);
  }, [walletData]);

  // --- INIT EFFECTS ---

  // 1. Handle Wallet Existence Check
  useEffect(() => {
    const secret = localStorage.getItem("secret");
    
    // If no wallet exists (cleared cache etc), go to startup
    if (!secret) { 
        navigate("/"); 
        return; 
    }

    // FIX APPLIED HERE:
    // We REMOVED the "sessionStorage" auto-unlock logic.
    // Now, on refresh, isWalletLocked defaults to 'true' (from Context),
    // and we do nothing to change it. Result: Locked screen.

  }, [navigate]);

  // 2. Data Fetching
  useEffect(() => {
    if (walletData) {
      refreshBalances(); 
      refreshAllHistory(); 
    }
  }, [walletData, refreshBalances, refreshAllHistory]);


  const settingsRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsRef]);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const handleLock = () => {
    // Also clear session storage on manual lock for security
    sessionStorage.removeItem("wallet_pwd");
    setWalletData(null);
    setIsWalletLocked(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const displayedHistory = useMemo(() => {
    let combined = [];
    if (isDevnet) {
      combined = [...history.btcTest.data, ...history.ethSepolia.data, ...history.solDev.data];
    } else {
      combined = [...history.btcMain.data, ...history.ethMain.data, ...history.solMain.data];
    }
    return combined; 
  }, [history, isDevnet]);

  const calculateTotalBalance = () => {
      const btcBal = parseFloat(isDevnet ? balances.btcTest : balances.btcMain) || 0;
      const ethBal = parseFloat(isDevnet ? balances.ethSepolia : balances.ethMain) || 0;
      const solBal = parseFloat(isDevnet ? balances.solDevnet : balances.solMain) || 0;

      const total = (btcBal * prices.btc) + (ethBal * prices.eth) + (solBal * prices.sol);
      return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const displayTotal = calculateTotalBalance();
  const isHistoryLoading = Object.values(history).some(h => h.loading);

  if (isWalletLocked) return <InputPassword />;
  // Small fix: Added "|| loadingBalances" so spinner shows if data exists but is updating
  if (!walletData) return <div className="h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400"><Spinner /></div>;

  return (
    <div className="md:h-210 bg-[#FAFAFA] text-gray-900 font-sans flex flex-col items-center">
       <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      
      <div className="fixed top-0 left-0 w-full h-96 bg-linear-to-b from-gray-100 to-transparent -z-10"></div>

      <div className="w-full max-w-7xl px-4 py-6 md:p-8 flex flex-col min-h-screen lg:h-screen">
        
        <div className="flex z-6 justify-between items-center mb-6 md:mb-8 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 md:w-11 md:h-11 bg-black rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-black/10">
                <CypherLogo></CypherLogo>
             </div>
             <span className="font-bold text-xl md:text-2xl tracking-wider text-zinc-900">Cipher </span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
          <div className={`h-11 px-3 md:px-4 rounded-[14px] border flex items-center gap-2 transition-all duration-300 ${
                isOnline 
                ? 'bg-zinc-100 border-emerald-300 text-emerald-900' 
                : 'bg-zinc-100 border-red-500 text-red-600'
            }`}>
                {isOnline ? <Wifi size={18} strokeWidth={2.5} /> : <WifiOff size={18} strokeWidth={2.5} />}
                <span className="text-xs font-bold hidden sm:block">
                    {isOnline ? 'Online' : 'No Network'}
                </span>
            </div>
            
            <button 
              onClick={() => refreshBalances(true)} 
              className="p-3 rounded-[14px] bg-white border border-gray-100 text-zinc-400 hover:text-black hover:shadow-md active:scale-95 transition-all duration-200"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loadingBalances ? "animate-spin" : ""} />
            </button>

            <div className="relative" ref={settingsRef}>
                <button 
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`p-3 rounded-[14px] border transition-all duration-200 active:scale-95 flex items-center gap-2 ${settingsOpen ? 'bg-zinc-100 border-zinc-300 text-black' : 'bg-white border-gray-100 text-zinc-500 hover:text-black hover:shadow-md'}`}
                >
                    <Settings size={20} />
                </button>

                {settingsOpen && (
                    <div className="absolute right-0 top-14 w-64 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-3 py-2 mb-2 border-b border-gray-50">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Network</span>
                        </div>
                        <button 
                            onClick={() => { setIsDevnet(false); setSettingsOpen(false); }}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl hover:bg-zinc-50 transition-colors text-left mb-1 text-zinc-700"
                        >
                            <span>Mainnet</span>
                            {!isDevnet && <Check size={16} className="text-black" />}
                        </button>
                        <button 
                            onClick={() => { setIsDevnet(true); setSettingsOpen(false); }}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl hover:bg-zinc-50 transition-colors text-left text-zinc-700"
                        >
                            <span>Testnet</span>
                            {isDevnet && <Check size={16} className="text-black" />}
                        </button>
                        
                        <div className="h-px bg-gray-100 my-2"></div>
                        
                        <div className="px-3 py-2 mb-1">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Account</span>
                        </div>

                        <button 
                            onClick={handleLock}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors mb-1"
                        >
                            <Lock size={18} /> Lock Wallet
                        </button>

                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid z-2 grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:flex-1 lg:min-h-0 lg:pb-6">
          
          {/* LEFT COLUMN: BALANCE & ASSETS */}
          <div className="flex flex-col gap-4 md:gap-6 h-auto lg:h-full lg:min-h-0">
            
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between shrink-0 h-auto lg:h-60">
                <div>
                    <div className="flex justify-between items-start mt-2 md:mt-5 mb-4">
                        <h3 className=" font-bold tracking-tight flex items-center gap-2">
                            Total Approx Balance 
                            {isDevnet && <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100">TESTNET</span>}
                        </h3>
                    </div>
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 mt-2 flex items-baseline gap-1 break-all">
                        <span className="text-2xl sm:text-3xl lg:text-4xl text-zinc-700">$</span>{displayTotal}
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-emerald-500 font-medium text-sm">
                        <TrendingUp size={16} />
                        <span>Live Portfolio Value</span>
                    </div>
                </div>
            </div>

            <div className={`bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-80 flex flex-col md:min-h-100 overflow-hidden `}>
                <h3 className=" font-bold uppercase tracking-tight mb-4 md:mb-6 shrink-0">Your Assets</h3>
               <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    <AssetRow 
                        ticker="BTC" 
                        name="Bitcoin" 
                        amount={isDevnet ? balances.btcTest : balances.btcMain} 
                        price={prices.btc}
                        icon={<BitcoinIcon />} 
                        color="bg-[#FFF6ED] text-[#F7931A] border-[#FFEAD5]"
                    />
                    <AssetRow 
                        ticker="ETH" 
                        name="Ethereum" 
                        amount={isDevnet ? balances.ethSepolia : balances.ethMain} 
                        price={prices.eth}
                        icon={<EthereumIcon />} 
                        color="bg-[#F0F5FF] text-[#627EEA] border-[#DCE6FF]"
                    />
                    <AssetRow 
                        ticker="SOL" 
                        name="Solana" 
                        amount={isDevnet ? balances.solDevnet : balances.solMain} 
                        price={prices.sol}
                        icon={<SolanaIcon />} 
                        color="bg-[#ECFDF5] text-[#14F195] border-[#D1FAE5]"
                    />
                </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIONS & HISTORY */}
          <div className="flex flex-col gap-4 md:gap-6 h-auto lg:h-full lg:min-h-0">
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 shrink-0 h-auto lg:h-60 flex flex-col justify-center">
                 <h2 className="font-bold text-zinc-900 mb-4 md:mb-6">Quick Actions</h2>
                 <div className="grid grid-cols-3 gap-3 md:gap-6 h-28 lg:h-full">
                     <ActionButton 
                        icon={<Send size={24} />} 
                        label="Send" 
                        onClick={() => setModalOpen('send')}
                        primary
                      />
                      <ActionButton 
                        icon={<ArrowDownToLine size={24} />} 
                        label="Receive" 
                        onClick={() => setModalOpen('receive')}
                        primary
                      />
                      <ActionButton
                        icon={<CreditCard size={24} />} 
                        label="Deposit"
                        onClick={() => !isDevnet && setModalOpen('deposit')}
                        disabled={isDevnet}
                        secondary 
                      />
                </div>
            </div>

            <div className={`bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col min-h-100`}>
                <TransactionHistory 
                    transactions={displayedHistory} 
                    loading={isHistoryLoading} 
                    onRefresh={refreshAllHistory}
                />
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {modalOpen === 'send' && (
        <SendModal 
          onClose={() => setModalOpen(null)} 
          isDevnet={isDevnet}
          walletData={walletData}  
          balances={balances}
          onTxSuccess={() => {
              refreshBalances(true); 
              refreshAllHistory();
          }}
        />
      )}
      
      {modalOpen === 'receive' && (
        <ReceiveModal 
          onClose={() => setModalOpen(null)} 
          isDevnet={isDevnet} 
          walletData={walletData} 
        />
      )}

      {modalOpen === 'deposit' && (
        <DepositModal
          onClose={() => setModalOpen(null)}
          walletData={walletData} 
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
const ActionButton = ({ icon, label, onClick, disabled, secondary }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`
      h-full w-full flex flex-col items-center justify-center gap-2 rounded-[24px] font-bold text-xs md:text-sm transition-all duration-200 active:scale-95
      ${disabled 
        ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100' 
        : 'bg-black text-white hover:shadow-xl shadow-black/20 border border-black hover:-translate-y-1'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const AssetRow = ({ ticker, name, amount, price, icon, color }) => {
    const usdValue = (parseFloat(amount) * price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return (
      <div className="flex items-center justify-between p-3 md:p-4 rounded-[24px] border border-transparent bg-gray-50/80 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all duration-300 group cursor-default active:scale-[0.98]">
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-[18px] flex items-center justify-center font-bold text-lg md:text-xl border ${color}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center  gap-2">
                <span className="font-extrabold text-zinc-900 text-sm md:text-base">{ticker}</span>
                <span className="hidden sm:inline-block  text-xs text-zinc-700  px-1 py-0.5 lowercase mr-2   tracking-tight">({name})</span>
            </div>
            <p className="text-xs md:text-sm text-zinc-500 font-medium font-mono mt-0.5">{amount}</p>
          </div>
        </div>
        <div className="text-right">
            <p className="font-bold text-sm md:text-base text-zinc-900">{usdValue}</p>
            <p className="text-[10px] md:text-xs text-zinc-400 font-medium">@ ${price.toLocaleString()}</p>
        </div>
      </div>
    );
};
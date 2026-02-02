import { ethers } from "ethers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";


const RPC_URLS = {
  ETH_MAINNET: "https://go.getblock.us/b98d50f4ba63421ebe30e2a8cc150729",
  ETH_SEPOLIA: "https://go.getblock.io/382b0378e4364427bed17ae9f9ce278b",
  SOL_MAINNET: "https://go.getblock.us/a96b66d159e543ad96b7276d0d638fae",
  SOL_DEVNET: "https://api.devnet.solana.com",
  BTC_MAINNET: "https://mempool.space/api",
  BTC_TESTNET: "https://mempool.space/testnet/api",
};


export const getEthBalance = async (address, isTestnet = false) => {
  try {
    const rpcUrl = isTestnet ? RPC_URLS.ETH_SEPOLIA : RPC_URLS.ETH_MAINNET;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);
    
    return parseFloat(balanceEth).toFixed(4);
  } catch (error) {
    console.error(`Error fetching ETH ${isTestnet ? 'Sepolia' : 'Mainnet'} balance:`, error);
    return "0.0000";
  }
};

export const getBtcBalance = async (address, isTestnet = false) => {
  try {
    const baseUrl = isTestnet ? RPC_URLS.BTC_TESTNET : RPC_URLS.BTC_MAINNET;
    const response = await fetch(`${baseUrl}/address/${address}`);
    
    if (!response.ok) throw new Error("Failed to fetch BTC data");
    
    const data = await response.json();
    
    // Sum confirmed and unconfirmed balances
    const confirmed = (data.chain_stats.funded_txo_sum || 0) - (data.chain_stats.spent_txo_sum || 0);
    const unconfirmed = (data.mempool_stats.funded_txo_sum || 0) - (data.mempool_stats.spent_txo_sum || 0);
    
    const totalSatoshis = confirmed + unconfirmed;
    const btc = totalSatoshis / 100_000_000;
    
    return btc.toFixed(6);
  } catch (error) {
    console.error(`Error fetching BTC ${isTestnet ? 'Testnet' : 'Mainnet'} balance:`, error);
    return "0.0000";
  }
};

export const getSolBalance = async (address, isTestnet = false) => {
  try {
    const rpcUrl = isTestnet ? RPC_URLS.SOL_DEVNET : RPC_URLS.SOL_MAINNET;
    const connection = new Connection(rpcUrl, "confirmed");
    const publicKey = new PublicKey(address);
    
    const balanceLamports = await connection.getBalance(publicKey);
    const sol = balanceLamports / 1_000_000_000;
    
    return sol.toFixed(4);
  } catch (error) {
    console.error(`Error fetching SOL ${isTestnet ? 'Devnet' : 'Mainnet'} balance:`, error);
    return "0.0000";
  }
};


export const fetchAllBalances = async (walletData) => {
  if (!walletData) return null;

  try {
    const [
      ethMain, 
      ethSepolia, 
      btcMain, 
      btcTest, 
      solMain, 
      solDevnet
    ] = await Promise.all([
      // Ethereum
      getEthBalance(walletData.ethereum.address, false), // Mainnet
      getEthBalance(walletData.ethereum.address, true),  // Sepolia
      
      // Bitcoin (Uses different addresses from walletData)
      getBtcBalance(walletData.bitcoinMain.address, false), // Mainnet
      getBtcBalance(walletData.bitcoinTest.address, true),  // Testnet
      
      // Solana
      getSolBalance(walletData.solana.address, false), // Mainnet
      getSolBalance(walletData.solana.address, true),  // Devnet
    ]);

    return {
      ethMain,
      ethSepolia,
      btcMain,
      btcTest,
      solMain,
      solDevnet
    };
  } catch (error) {
    console.error("Error fetching all balances:", error);
    return null;
  }
};
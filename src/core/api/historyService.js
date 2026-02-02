import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
import axios from "axios";

const API_KEYS = {
  ETHERSCAN: "CYFWTZ8KQ13HWRJADU898AEVXX6XT7E22A",
};

const ENDPOINTS = {
  BTC_MAIN: "https://mempool.space/api",
  BTC_TEST: "https://mempool.space/testnet/api",
  ETH_V2: "https://api.etherscan.io/v2/api",
  SOL_MAIN: "https://go.getblock.us/92646167da414647bf38a3ec91601917",
  SOL_DEV: "https://api.devnet.solana.com",
};

const CHAIN_IDS = {
  ETH_MAIN: "1",
  ETH_SEPOLIA: "11155111",
};

const getBtcHistory = async (address, isTestnet) => {
  try {
    const base = isTestnet ? ENDPOINTS.BTC_TEST : ENDPOINTS.BTC_MAIN;
    const { data } = await axios.get(`${base}/address/${address}/txs`);

    return data.slice(0, 5).map((tx) => {
      // Determine if sent or received
      const sent = tx.vin.some(
        (v) => v.prevout?.scriptpubkey_address === address
      );

      // Calculate value based on direction
      const value = sent
        ? tx.vout.reduce(
            (a, o) =>
              o.scriptpubkey_address !== address ? a + o.value : a,
            0
          )
        : tx.vout.reduce(
            (a, o) =>
              o.scriptpubkey_address === address ? a + o.value : a,
            0
          );

      return {
        id: tx.txid,
        // FIX: Check if block_time exists. If not, it's unconfirmed/pending.
        date: tx.status.block_time
          ? new Date(tx.status.block_time * 1000).toLocaleDateString()
          : "Pending", 
        type: sent ? "SENT" : "RECEIVED",
        amount: (value / 1e8).toFixed(6),
        symbol: isTestnet ? "tBTC" : "BTC",
        url: `${isTestnet ? "https://mempool.space/testnet/tx" : "https://mempool.space/tx"}/${tx.txid}`,
        network: isTestnet ? "Bitcoin Testnet" : "Bitcoin Mainnet",
      };
    });
  } catch (error) {
    console.error("BTC History Error:", error);
    return [];
  }
};
export const fetchBtcMainHistory = (a) => getBtcHistory(a, false);
export const fetchBtcTestHistory = (a) => getBtcHistory(a, true);

const getEthHistory = async (address, isTestnet) => {
  try {
    const chainId = isTestnet
      ? CHAIN_IDS.ETH_SEPOLIA
      : CHAIN_IDS.ETH_MAIN;

    const { data } = await axios.get(ENDPOINTS.ETH_V2, {
      params: {
        chainid: chainId,
        module: "account",
        action: "txlist",
        address,
        page: 1,
        offset: 5,
        sort: "desc",
        apikey: API_KEYS.ETHERSCAN,
      },
    });

    if (data.status !== "1") return [];

    return data.result.map((tx) => ({
      id: tx.hash,
      date: new Date(tx.timeStamp * 1000).toLocaleDateString(),
      type:
        tx.from.toLowerCase() === address.toLowerCase()
          ? "SENT"
          : "RECEIVED",
      amount: ethers.formatEther(tx.value || "0"),
      symbol: isTestnet ? "SepETH" : "ETH",
      url: `${isTestnet ? "https://sepolia.etherscan.io" : "https://etherscan.io"}/tx/${tx.hash}`,
      network: isTestnet ? "Ethereum Sepolia" : "Ethereum Mainnet",
    }));
  } catch {
    return [];
  }
};

export const fetchEthMainHistory = (a) => getEthHistory(a, false);
export const fetchEthSepoliaHistory = (a) => getEthHistory(a, true);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const extractSolAmount = (tx, address) => {
  if (!tx || !tx.meta) {
    return { direction: "TX", amount: "—" };
  }

  const keys = tx.transaction.message.accountKeys.map((k) =>
    k.pubkey ? k.pubkey.toBase58() : k
  );

  const idx = keys.indexOf(address);
  if (idx === -1) {
    return { direction: "TX", amount: "—" };
  }

  const pre = tx.meta.preBalances[idx];
  const post = tx.meta.postBalances[idx];
  const fee = tx.meta.fee || 0;
  const diff = post - pre;

  if (diff > 0) {
    return {
      direction: "RECEIVED",
      amount: ((diff + fee) / 1e9).toFixed(5),
    };
  }

  if (diff < 0) {
    return {
      direction: "SENT",
      amount: (Math.abs(diff) / 1e9).toFixed(5),
    };
  }

  return { direction: "TX", amount: "—" };
};

const getSolHistory = async (address, isTestnet) => {
  try {
    const rpc = isTestnet ? ENDPOINTS.SOL_DEV : ENDPOINTS.SOL_MAIN;

    const connection = new Connection(rpc, {
      commitment: "confirmed",
      disableRetryOnRateLimit: true,
    });

    const pubKey = new PublicKey(address);

    const signatures = await connection.getSignaturesForAddress(pubKey, {
      limit: 5,
    });

    const results = [];

    for (const sig of signatures) {
      let tx = null;

      try {
        tx = await connection.getTransaction(sig.signature, {
          encoding: "jsonParsed",
          maxSupportedTransactionVersion: 0,
        });
      } catch {}

      const extracted = extractSolAmount(tx, address);

      results.push({
        id: sig.signature,
        date: sig.blockTime
          ? new Date(sig.blockTime * 1000).toLocaleDateString()
          : "Unknown",
        type: extracted.direction,
        amount: extracted.amount,
        symbol: isTestnet ? "DevSOL" : "SOL",
        url: `https://explorer.solana.com/tx/${sig.signature}?cluster=${isTestnet ? "devnet" : "mainnet-beta"}`,
        network: isTestnet ? "Solana Devnet" : "Solana Mainnet",
      });

      await sleep(350);
    }

    return results;
  } catch {
    return [];
  }
};

export const fetchSolMainHistory = (a) => getSolHistory(a, false);
export const fetchSolDevHistory = (a) => getSolHistory(a, true);

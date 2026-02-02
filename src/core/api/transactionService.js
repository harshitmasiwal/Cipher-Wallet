import { ethers } from "ethers";
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";
import { networks, Psbt } from "bitcoinjs-lib"; 
import { ECPairFactory } from "ecpair";
import * as ecc from "tiny-secp256k1";
import bs58 from "bs58";
import axios from "axios";
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

const ECPair = ECPairFactory(ecc);


const RPC_URLS = {
  ETH_MAINNET: "https://eth.llamarpc.com",
  ETH_SEPOLIA: "https://ethereum-sepolia-rpc.publicnode.com",
  SOL_MAINNET: "https://api.mainnet-beta.solana.com",
  SOL_DEVNET: "https://api.devnet.solana.com",
  BTC_MAINNET: "https://mempool.space/api",
  BTC_TESTNET: "https://mempool.space/testnet/api",
};


export const sendEth = async (privateKey, toAddress, amount, isTestnet = false) => {
  try {
    const cleanAddress = toAddress.trim();
    const rpcUrl = isTestnet ? RPC_URLS.ETH_SEPOLIA : RPC_URLS.ETH_MAINNET;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const tx = {
      to: cleanAddress,
      value: ethers.parseEther(amount.toString()),
    };

    console.log(`Sending ${amount} ETH to ${cleanAddress}...`);
    const transactionResponse = await wallet.sendTransaction(tx);
    
    await transactionResponse.wait();

    const explorerUrl = isTestnet 
      ? `https://sepolia.etherscan.io/tx/${transactionResponse.hash}`
      : `https://etherscan.io/tx/${transactionResponse.hash}`;

    return { success: true, hash: transactionResponse.hash, explorerUrl };
  } catch (error) {
    console.error("ETH Send Error:", error);
    return { success: false, error: error.message };
  }
};

export const sendSol = async (privateKeyString, toAddress, amount, isTestnet = false) => {
  try {
    const cleanAddress = toAddress.trim();
    const rpcUrl = isTestnet ? RPC_URLS.SOL_DEVNET : RPC_URLS.SOL_MAINNET;
    const connection = new Connection(rpcUrl, "confirmed");

    const secretKey = bs58.decode(privateKeyString);
    const fromWallet = Keypair.fromSecretKey(secretKey);
    const toPublicKey = new PublicKey(cleanAddress);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: toPublicKey,
        lamports: Math.floor(amount * 1_000_000_000),
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);

    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${isTestnet ? 'devnet' : 'mainnet-beta'}`;

    return { success: true, hash: signature, explorerUrl };
  } catch (error) {
    console.error("SOL Send Error:", error);
    return { success: false, error: error.message };
  }
};


export const sendBtc = async (privateKeyWIF, fromAddress, toAddress, amount, isTestnet = false) => {
  try {
    // 1. SELECT NETWORK (Crucial Fix: Ensure network object exists)
    const network = isTestnet ? networks.testnet : networks.bitcoin;
    const apiUrl = isTestnet ? RPC_URLS.BTC_TESTNET : RPC_URLS.BTC_MAINNET;

    // 2. INPUT SANITIZATION
    const cleanRecipient = toAddress.trim();
    const cleanFromAddress = fromAddress.trim();
    const satoshisToSend = Math.floor(Number(amount) * 100_000_000);

    // 3. VALIDATION
    if (isNaN(satoshisToSend) || satoshisToSend <= 0) {
        throw new Error("Invalid Amount");
    }

    // 4. KEYPAIR
    let keyPair;
    try {
        keyPair = ECPair.fromWIF(privateKeyWIF, network);
    } catch (e) {
        throw new Error(`Invalid Private Key. Are you using a ${isTestnet ? 'Mainnet' : 'Testnet'} key on ${isTestnet ? 'Testnet' : 'Mainnet'}?`);
    }

    // 5. FETCH UTXOS
    const { data: utxos } = await axios.get(`${apiUrl}/address/${cleanFromAddress}/utxo`);

    if (!utxos || utxos.length === 0) {
      throw new Error("Wallet Empty! No UTXOs found. (Wait for confirmation if you just funded it).");
    }

    // 6. BUILD TRANSACTION
    // ⚠️ PASS NETWORK HERE (Fixes 'Error adding output')
    const psbt = new Psbt({ network });
    let totalInput = 0;

    // -- Add Inputs --
    for (const utxo of utxos) {
      const { data: txHex } = await axios.get(`${apiUrl}/tx/${utxo.txid}/hex`);
      
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        nonWitnessUtxo: Buffer.from(txHex, 'hex'),
      });

      totalInput += utxo.value;
      if (totalInput >= satoshisToSend + 5000) break; // Buffer for fees
    }

    if (totalInput < satoshisToSend) {
        throw new Error(`Insufficient Balance. Have: ${totalInput/1e8}, Need: ${amount}`);
    }

    const fee = 3000; // Satoshis
    const change = totalInput - satoshisToSend - fee;

    if (change < 0) throw new Error("Insufficient funds to cover gas fee.");

  
    console.log(`Adding Output: ${cleanRecipient} (${satoshisToSend} sats) on ${isTestnet ? 'Testnet' : 'Mainnet'}`);
    
    try {
        psbt.addOutput({ address: cleanRecipient, value: satoshisToSend });
    } catch (err) {
        // This catch block catches the specific "Script mismatch" error
        throw new Error(`Address Mismatch: The address "${cleanRecipient}" does not belong to ${isTestnet ? 'Testnet' : 'Mainnet'}. Check your network settings.`);
    }

    // -- Add Change Output --
    if (change > 546) { // Dust limit
      psbt.addOutput({ address: cleanFromAddress, value: change });
    }

    // 9. SIGN & BROADCAST
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    
    const rawTx = psbt.extractTransaction().toHex();
    const pushRes = await axios.post(`${apiUrl}/tx`, rawTx);
    
    return {
      success: true,
      hash: pushRes.data,
      explorerUrl: isTestnet 
        ? `https://mempool.space/testnet/tx/${pushRes.data}`
        : `https://mempool.space/tx/${pushRes.data}`
    };

  } catch (error) {
    console.error("BTC Send Critical Error:", error);
    const msg = error.response?.data ? "API Error: " + error.response.data : error.message; 
    return { success: false, error: msg };
  }
};
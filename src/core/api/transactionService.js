import { ethers } from "ethers";
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";
import { payments, networks, Psbt } from "bitcoinjs-lib"; 
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
  ETH_MAINNET: "https://go.getblock.us/b98d50f4ba63421ebe30e2a8cc150729",
  ETH_SEPOLIA: "https://go.getblock.io/382b0378e4364427bed17ae9f9ce278b",
  SOL_MAINNET: "https://go.getblock.us/a96b66d159e543ad96b7276d0d638fae",
  SOL_DEVNET: "https://api.devnet.solana.com",
  BTC_MAINNET: "https://mempool.space/api",
  // CHANGE THIS LINE: Use mempool.space for testnet to support /v1/fees/recommended
  BTC_TESTNET: "https://mempool.space/testnet/api", 
};


// --- FEE ESTIMATION FUNCTIONS ---

export const getEthFeeEstimate = async (toAddress, amount, isTestnet = false) => {
  try {
    const rpcUrl = isTestnet ? RPC_URLS.ETH_SEPOLIA : RPC_URLS.ETH_MAINNET;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Fallback to dummy address if input is invalid/empty to prevent crashes
    let targetAddress = "0x0000000000000000000000000000000000000000";
    if (toAddress && ethers.isAddress(toAddress)) {
        targetAddress = toAddress;
    }

    const tx = {
      to: targetAddress,
      value: ethers.parseEther(amount && !isNaN(amount) ? amount.toString() : "0")
    };

    const gasLimit = await provider.estimateGas(tx);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    const totalFeeWei = gasLimit * gasPrice;
    return ethers.formatEther(totalFeeWei); 
  } catch (error) {
    // console.error("ETH Fee Error", error);
    return "0.00";
  }
};

export const getSolFeeEstimate = async (toAddress, amount, isTestnet = false) => {
  try {
    const rpcUrl = isTestnet ? RPC_URLS.SOL_DEVNET : RPC_URLS.SOL_MAINNET;
    const connection = new Connection(rpcUrl, "confirmed");
    
    const fakePayer = Keypair.generate();
    
    // Validate address or use dummy
    let toPubkey;
    try {
        toPubkey = new PublicKey(toAddress);
    } catch {
        toPubkey = Keypair.generate().publicKey;
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fakePayer.publicKey,
        toPubkey: toPubkey,
        lamports: 1000, 
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fakePayer.publicKey;

    const message = transaction.compileMessage();
    const feeObj = await connection.getFeeForMessage(message);

    const feeLamports = feeObj.value || 5000;
    return (feeLamports / 1_000_000_000).toString();
  } catch (error) {
    return "0.000005"; 
  }
};

export const getBtcFeeEstimate = async (fromAddress, toAddress, amount, isTestnet = false) => {
  try {
    const apiUrl = isTestnet ? RPC_URLS.BTC_TESTNET : RPC_URLS.BTC_MAINNET;
    
    // 1. Get Fee Rate (Fastest)
    const { data: feeRates } = await axios.get(`${apiUrl}/v1/fees/recommended`);
    const feeRate = feeRates.fastestFee; 

    // 2. Fetch UTXOs (to calculate exact size)
    let utxos = [];
    try {
        const res = await axios.get(`${apiUrl}/address/${fromAddress}/utxo`);
        utxos = res.data || [];
    } catch (e) {
        // Ignore error if address fetch fails, we will use fallback size
    }

    let estimatedVBytes = 141; // Fallback: Standard 1 Input, 2 Outputs (Segwit)

    // 3. If we have UTXOs and a valid Amount, calculate EXACT size
    if (utxos.length > 0 && amount > 0) {
        let totalInput = 0;
        let inputCount = 0;
        const amountSats = Number(amount) * 100_000_000;

        for (const utxo of utxos) {
            inputCount++;
            totalInput += utxo.value;
            if (totalInput >= amountSats) break;
        }
        
        // If we found enough inputs, calculate size
        if (totalInput >= amountSats) {
            // Formula: (Inputs * 148) + (Outputs * 34) + 10 overhead
            const outputCount = 2; // Recipient + Change
            estimatedVBytes = (inputCount * 148) + (outputCount * 34) + 10;
        }
    }

    const feeSats = estimatedVBytes * feeRate;
    return (feeSats / 100_000_000).toFixed(8); 

  } catch (error) {
    console.error("BTC Fee Error", error);
    return "0.00001000"; // Fallback safety number
  }
};

// --- TRANSACTION FUNCTIONS ---

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
    const network = isTestnet ? networks.testnet : networks.bitcoin;
    const apiUrl = isTestnet ? RPC_URLS.BTC_TESTNET : RPC_URLS.BTC_MAINNET;

    const cleanRecipient = toAddress.trim();
    const cleanFromAddress = fromAddress.trim();
    
    // Calculate amount in Satoshis
    const satoshisToSend = Math.floor(Number(amount) * 100_000_000);

    if (isNaN(satoshisToSend) || satoshisToSend <= 0) {
        throw new Error("Invalid Amount");
    }

    let keyPair;
    try {
        keyPair = ECPair.fromWIF(privateKeyWIF, network);
    } catch (e) {
        throw new Error(`Invalid Private Key. Network mismatch?`);
    }

    // --- SEGWIT PREPARATION ---
    // We generate the P2WPKH script to prove ownership for witnessUtxo
    const p2wpkh = payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: network,
    });

    // Fetch UTXOs
    const { data: utxos } = await axios.get(`${apiUrl}/address/${cleanFromAddress}/utxo`);

    if (!utxos || utxos.length === 0) {
      throw new Error("Wallet Empty! No UTXOs found.");
    }

    // --- DYNAMIC FEE CALCULATION ---
    const { data: feeRates } = await axios.get(`${apiUrl}/v1/fees/recommended`);
    const feeRate = feeRates.fastestFee; 

    const psbt = new Psbt({ network });
    let totalInput = 0;
    let inputCount = 0;

    // --- INPUT SELECTION ---
    for (const utxo of utxos) {
      // FIX: Use witnessUtxo (SegWit) logic.
      // This allows us to skip fetching the full transaction Hex.
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: p2wpkh.output, 
          value: BigInt(utxo.value), // FIX: BigInt required for newer lib versions
        },
      });

      totalInput += utxo.value;
      inputCount++;
      
      // Fee Calc: (Inputs * 148) + (2 Outputs * 34) + 10 overhead
      // Note: 148 is a conservative estimate for SegWit (which is usually smaller), 
      // but we keep it to ensure your tx confirms quickly as requested.
      const currentSize = (inputCount * 148) + (2 * 34) + 10;
      const currentFee = currentSize * feeRate;
      
      // Stop adding inputs if we have enough to cover amount + fee
      if (totalInput >= satoshisToSend + currentFee) break; 
    }

    // Final Fee Recalculation based on exact input count
    const finalSize = (inputCount * 148) + (2 * 34) + 10;
    const calculatedFee = finalSize * feeRate;

    if (totalInput < satoshisToSend + calculatedFee) {
        throw new Error(`Insufficient Balance. Need ${amount} + Fee.`);
    }

    const change = totalInput - satoshisToSend - calculatedFee;

    // --- OUTPUTS ---
    try {
        psbt.addOutput({ 
            address: cleanRecipient, 
            value: BigInt(satoshisToSend) // FIX: Cast to BigInt
        });
    } catch (err) {
        throw new Error(`Address Mismatch. Ensure you are sending to a ${isTestnet ? 'Testnet' : 'Mainnet'} address.`);
    }

    // Change Output
    if (change > 546) { // Dust limit
      psbt.addOutput({ 
          address: cleanFromAddress, 
          value: BigInt(change) // FIX: Cast to BigInt
      });
    }

    // --- SIGN & BROADCAST ---
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
    console.error("BTC Send Error:", error);
    const msg = error.response?.data ? "API Error: " + error.response.data : error.message; 
    return { success: false, error: msg };
  }
};
import * as bip39 from "bip39";
import { ethers } from "ethers";
import * as bitcoin from "bitcoinjs-lib";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import bs58 from "bs58";
import cryptoUtils from "../helpers/cryptoUtils.js";

const bip32 = BIP32Factory(ecc);

export function generateMnemonic() {
  return bip39.generateMnemonic();
}

function deriveEthereum(seed) {
  const path = "m/44'/60'/0'/0/0";
  const node = ethers.HDNodeWallet.fromSeed(seed).derivePath(path);
  return {
    path,
    privateKey: node.privateKey,
    publicKey: node.publicKey,
    address: node.address,
  };
}

function deriveSolana(seed) {
  const path = "m/44'/501'/0'/0'";
  const derived = derivePath(path, seed).key;
  const kp = Keypair.fromSeed(derived);

  return {
    path,
    privateKey: bs58.encode(kp.secretKey),
    publicKey: kp.publicKey.toBase58(),
    address: kp.publicKey.toBase58(),
  };
}

function deriveBitcoin(seed, network, path) {
  const root = bip32.fromSeed(seed, network);
  const node = root.derivePath(path);

  const address = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(node.publicKey),
    network,
  }).address;

  return {
    path,
    privateKey: node.toWIF(),
    publicKey: node.publicKey.toString("hex"),
    address,
  };
}

export async function createWalletFromMnemonic(mnemonic) {
  const seed = await bip39.mnemonicToSeed(mnemonic);

  return {
    ethereum: deriveEthereum(seed),
    bitcoinMain: deriveBitcoin(seed, bitcoin.networks.bitcoin, "m/44'/0'/0'/0/0"),
    bitcoinTest: deriveBitcoin(seed, bitcoin.networks.testnet, "m/84'/1'/0'/0/0"),
    solana: deriveSolana(seed),
  };
}

export async function walletSetup(password, mnemonic) {
  const wallet = await createWalletFromMnemonic(mnemonic);
  return JSON.stringify(cryptoUtils.encryptMessage(JSON.stringify(wallet), password));
}

export function decodeSecret(secret, password) {
  return cryptoUtils.safeDecrypt(JSON.parse(secret), password);
}

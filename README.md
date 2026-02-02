# 🔐 Cipher Wallet

> **A Secure, Non-Custodial, Multi-Chain Crypto Wallet**

Cipher Wallet is a modern, web-based cryptocurrency wallet built for speed, privacy, and full user ownership. It supports **Bitcoin (BTC)**, **Ethereum (ETH)**, and **Solana (SOL)**, allowing users to manage assets across multiple blockchains in a single, intuitive interface.

Built with **React 19**, **Vite**, and **Tailwind CSS**, Cipher ensures a blazing-fast experience with a sleek, responsive design.

---

## 🛡️ Security & Privacy First (No Backend)

**Your keys, your crypto.**

Cipher Wallet is architected as a completely **client-side application**. This means:

* **No Backend Server:** We do not have a database. We do not store your data.
* **Local Encryption:** Your private keys and seed phrases are encrypted and stored **only** locally on your device (using secure browser storage).
* **Non-Custodial:** You have full control. If you lose your recovery phrase, we cannot recover your funds. This ensures that **no one**—not even us—can access your assets.

---

## ✨ Features

* **Multi-Chain Support:** Seamless management of Bitcoin, Ethereum, and Solana addresses.
* **Create & Import:** Generate a new 12-word mnemonic seed phrase or import an existing wallet securely.
* **Real-time Balances:** View up-to-date balances for all supported chains (Devnet/Testnet supported).
* **Send & Receive:** Easy-to-use interface for sending assets and generating QR codes for receiving.
* **Transaction History:** View your recent on-chain activity.
* **Dark & Light Mode:** A beautiful UI that adapts to your preference (defaulting to a sleek dark theme).
* **QR Scanner:** Integrated camera support to scan addresses instantly.

---

## 🛠️ Tech Stack

Cipher Wallet leverages the latest in modern web development and cryptography libraries:

* **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
* **Blockchain Integration:**
    * `@solana/web3.js` (Solana)
    * `ethers` (Ethereum)
    * `bitcoinjs-lib` (Bitcoin)
    * `bip39` & `bip32` (Mnemonic & HD Wallet derivation)
* **Utilities:** `lucide-react` (Icons), `react-router` (Navigation), `axios` (API requests), `react-qr-barcode-scanner` (QR Scanning).

---

## 🚀 Getting Started

Follow these steps to run Cipher Wallet locally on your machine.

### Prerequisites

* [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/cipher-wallet.git](https://github.com/your-username/cipher-wallet.git)
    cd cipher-wallet
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Fix Polyfills (Important):**
    Since Vite handles Node.js modules differently in the browser, we use `vite-plugin-node-polyfills`. Ensure this is configured in your `vite.config.ts` (it should be already set up if you cloned the repo).

### Running the App

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  **Open your browser:**
    Navigate to `http://localhost:5173` to view the app.

---

## 🧪 Testing

This wallet is configured to work with **Testnets/Devnets** by default for safety during development.

* **Bitcoin:** Testnet
* **Ethereum:** Sepolia Testnet
* **Solana:** Devnet

You can toggle between Mainnet and Testnet in the settings menu.

---

## ⚠️ Disclaimer

This project is for educational and portfolio purposes. While it uses standard cryptographic libraries (`bitcoinjs-lib`, `ethers`, etc.) to secure keys, **always exercise caution** when using real funds with any web-based wallet. Ensure your device is free from malware before entering private keys.


---

### Architected by [Harshit Masiwal](https://www.linkedin.com/in/harshit-masiwal/)
# LexChain: Verifiable By Design

A comprehensive enterprise Web3 platform designed to ingest legal documents, apply cryptographic hashing—specifically SHA-256—and anchor proofs to the Polygon blockchain to drastically reduce fraud while mathematically preserving document integrity and auditability. This project utilizes React, standard Web3 libraries, and a Spring Boot architecture to simulate real-world legal routing and immutable verification workflows.

## 💡 Overview

Real-world legal systems operate under strict security and authorization constraints. This project automates the foundational cryptographic workflow of decentralized document management. It reads standard file uploads, strictly generates local SHA-256 hashes to prevent data leakage, uploads the encrypted payload to IPFS, and executes smart contract functions on the Polygon Amoy testnet. This proves that massive institutional trust can be achieved with zero-knowledge architectural principles and immutable ledger technology.

## ✨ Features

* **Rigorous Cryptographic Anchoring:** Safely processes document blobs locally to extract strictly unique SHA-256 hashes before any network transmission occurs, ensuring sensitive legal data is never exposed during the on-chain anchoring process.
* **On-Chain Role-Based Access Control (RBAC):** Enforces strict `isGovernor` and `isLawyer` mapping checks at the smart contract level. This bypasses the vulnerabilities of traditional centralized databases, preventing catastrophic unauthorized uploads or forged verifications.
* **Targeted Signatory Routing:** Reconstructs the workflow loop by dynamically filtering MongoDB document records against the actively connected MetaMask `msg.sender`, effectively generating a secure, isolated inbox for specific required signatories.
* **Objective Verification:** Queries the blockchain state directly via RPC nodes to calculate the exact signature count and timestamp execution to factually ground the legal status of any provided document hash.
* **Enterprise-Grade Architecture:** Enforces a strict desktop-only environment to guarantee Web3 wallet stability, wrapped in a highly precise, custom "Seal Crimson" dark-mode UI that visually communicates legal authority and trust.

## 🛠️ Prerequisites

* Node.js (v18 or higher) and npm/yarn
* A standard IDE (VS Code, WebStorm)
* MetaMask Extension installed in a Chromium-based browser
* Polygon Amoy Testnet configuration (with test MATIC for gas fees)
* Java 17+ and Spring Boot (for the local API sync server)

## 🚀 Deployment & Execution Architecture

To replicate the enterprise-grade execution environment locally, you must strictly configure the off-chain database, decentralized storage gateways, and on-chain deployment parameters before initialization.

### Step 1: Off-Chain Indexing (MongoDB Atlas)
1. Provision a free-tier cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Configure network access to whitelist your current IP address (or `0.0.0.0/0` for testing).
3. Create a database user with read/write privileges and retrieve your connection URI.
4. Update your Java backend configuration (`application.properties` or `application.yml`) to establish the connection:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster0.mongodb.net/lexchain?retryWrites=true&w=majority
   ```

### Step 2: Decentralized Storage Gateway (Pinata IPFS)
1. Register a developer account at [Pinata](https://pinata.cloud/).
2. Navigate to the API Keys section and generate a new key.
3. Securely copy the generated **JWT (JSON Web Token)**. This is required to bypass public gateway rate limits and ensure immediate cryptographic pinning of your document uploads.

### Step 3: Smart Contract Deployment (Polygon Amoy)
1. Open the core smart contract (`LexChain.sol`) in your preferred Web3 IDE (e.g., Remix).
2. Compile the contract using a stable Solidity compiler (e.g., `^0.8.20`).
3. Inject your Web3 provider (MetaMask) and ensure you are connected to the **Polygon Amoy Testnet** with sufficient test MATIC.
4. Execute the deployment transaction. 
5. Carefully copy the resulting **Contract Address** and export the compiled **ABI** to your frontend utility folder (e.g., `frontend/src/utils/LexChainABI.json`).

### Step 4: Frontend Environment Configuration
Maintain strict environmental separation by keeping your contract address and JWT out of the source code. Create a `.env` file in the root of your `frontend` directory:

```env
# /frontend/.env
VITE_PINATA_JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_CONTRACT_ADDRESS="0xYourDeployedContractAddressHere"
VITE_AMOY_RPC_URL="https://rpc-amoy.polygon.technology/"
```

### Step 5: System Initialization
Once the environmental variables are actively synchronized across the stack:

1. **Boot the Backend:** Start your Java server to initialize the off-chain indexing and metadata routing endpoints on `localhost:5000`.
2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Launch the Application:**
   ```bash
   npm run dev
   ```
4. **Access the Portal:** Open the local host URL in a Chromium browser equipped with MetaMask to interact with the immutable ledger.

## 📊 Expected Output

Upon successful execution and wallet connection, the platform will process cryptographic transactions and output fact-grounded UI metrics alongside blockchain visualizations, including:

1. **Cryptographic Diagnostics:** Dynamic UI updates verifying the IPFS CID (Content Identifier), the generated SHA-256 hash, and the resulting transaction block confirmations to ensure correct ledger factorization.
2. **Objective Metrics:** Real-time inbox rendering stating the exact calculated signature ratios (e.g., 1/3 Collected) and immutable execution timestamps pulled directly from the Polygon network.
3. **Admin Verification Dashboard:** A secure, partitioned dashboard displaying pending off-chain metadata synchronized flawlessly with on-chain signature states for centralized oversight of decentralized actions.

## 🧩 How It Works (Under the Hood)

This platform serves as a practical application of applied cryptography and decentralized state management:

1. **File I/O & Preprocessing:** The application loads a raw file blob via the HTML5 File API. It transforms this data into a hexadecimal string using local SHA-256 algorithms, completely independent of the backend server.
2. **Decentralized Storage:** The raw file is securely pinned to the InterPlanetary File System (IPFS) via the Pinata Gateway, returning an immutable CID that acts as the permanent digital fingerprint of the file's location.
3. **Smart Contract Factorization:** `ethers.js` communicates with the Polygon RPC to invoke state-changing functions on the deployed Solidity contract. The contract strictly validates the caller's role mapping and writes the `docHash`, `ipfsHash`, and `requiredSigners` arrays to the blockchain.
4. **Synthesis:** The React context provider constantly calculates the exact state of the connected Ethereum provider (`window.ethereum`). It synchronizes the immutable on-chain data with the rapid off-chain MongoDB indexing to render a human-readable, highly responsive legal inbox.
# Filethetic

Filethetic is a decentralized marketplace for synthetic datasets, built on Filecoin and Ethereum. It enables users to generate, verify, and trade AI-generated datasets with on-chain verification.

## Features

### 1. Dataset Generation
- Generate synthetic datasets using various AI models (OpenAI, Atoma, Anthropic)
- Customizable templates for different data types
- Upload to decentralized storage (IPFS via Web3.Storage and Lighthouse)

### 2. Verification System
- On-chain verification of dataset quality and authenticity
- Verification dashboard to track verification status
- Verification form for submitting datasets for verification

### 3. Dataset Visualization
- Interactive dataset preview with tabular and JSON views
- JSON schema validation for structured data
- Download and exploration capabilities

### 4. User Experience
- User profiles with dataset management
- Marketplace analytics dashboard
- Dark/light mode support
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum, Filecoin, Hardhat
- **Wallet Integration**: RainbowKit, wagmi
- **Storage**: IPFS (Web3.Storage, Lighthouse)
- **AI Models**: OpenAI, Atoma, Anthropic
- **Data Visualization**: Recharts, JSON viewers
- **Form Handling**: React Hook Form, Zod

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MetaMask or another Ethereum wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/filethetic.git
cd filethetic
```

2. Install dependencies:
```bash
# Install app dependencies
cd app
npm install

# Install contract dependencies
cd ../contracts
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the `app` directory with the following variables:
```
# Web3 Storage
NEXT_PUBLIC_WEB3_STORAGE_API_KEY=your_web3_storage_api_key

# Lighthouse Storage
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key

# AI Model Providers
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_ATOMA_API_KEY=your_atoma_api_key
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_api_key

# Contract Addresses
NEXT_PUBLIC_DATASET_NFT_ADDRESS=your_deployed_nft_contract_address
NEXT_PUBLIC_VERIFIER_ADDRESS=your_deployed_verifier_contract_address
```

4. Deploy contracts (if needed):
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

5. Run the development server:
```bash
cd ../app
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
filethetic/
├── app/                   # Next.js frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── app/           # Next.js app router pages
│       ├── components/    # React components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utility functions and types
│       └── styles/        # Global styles
├── contracts/             # Solidity smart contracts
│   ├── src/               # Contract source files
│   └── scripts/           # Deployment scripts
└── README.md              # Project documentation
```

## Key Components

### Smart Contracts
- `FilethethicDatasetNFT.sol`: ERC721 contract for dataset NFTs
- `FilethethicVerifier.sol`: Contract for dataset verification

### Frontend Pages
- `/`: Landing page
- `/datasets`: Dataset marketplace
- `/generate`: Dataset generation workflow
- `/verify`: Dataset verification
- `/verify/dashboard`: Verification dashboard
- `/profile`: User profile and datasets
- `/analytics`: Marketplace analytics

## License

This project is licensed under the MIT License - see the LICENSE file for details.

// We require the Hardhat Runtime Environment explicitly here
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy a mock USDFC token for testing
  console.log("Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("MockUSDC deployed to:", mockUSDCAddress);
  
  // Deploy Filethetic contract
  console.log("Deploying Filethetic...");
  const treasury = deployer.address; // In production, set this to a multisig or dedicated treasury address
  const Filethetic = await ethers.getContractFactory("Filethetic");
  const filethetic = await Filethetic.deploy(mockUSDCAddress, treasury);
  await filethetic.waitForDeployment();
  const filetheticAddress = await filethetic.getAddress();
  console.log("Filethetic deployed to:", filetheticAddress);
  
  // Deploy FilethethicDatasetNFT contract
  console.log("Deploying FilethethicDatasetNFT...");
  const FilethethicDatasetNFT = await ethers.getContractFactory("FilethethicDatasetNFT");
  const filethethicDatasetNFT = await FilethethicDatasetNFT.deploy(filetheticAddress);
  await filethethicDatasetNFT.waitForDeployment();
  const filethethicDatasetNFTAddress = await filethethicDatasetNFT.getAddress();
  console.log("FilethethicDatasetNFT deployed to:", filethethicDatasetNFTAddress);
  
  // Deploy FilethethicVerifier contract
  console.log("Deploying FilethethicVerifier...");
  const FilethethicVerifier = await ethers.getContractFactory("FilethethicVerifier");
  const filethethicVerifier = await FilethethicVerifier.deploy(filetheticAddress);
  await filethethicVerifier.waitForDeployment();
  const filethethicVerifierAddress = await filethethicVerifier.getAddress();
  console.log("FilethethicVerifier deployed to:", filethethicVerifierAddress);
  
  console.log("Deployment completed!");
  
  // Write deployment info to a file for the frontend to use
  const fs = require("fs");
  const deploymentInfo = {
    mockUSDC: mockUSDCAddress,
    filethetic: filetheticAddress,
    filethethicDatasetNFT: filethethicDatasetNFTAddress,
    filethethicVerifier: filethethicVerifierAddress,
    chainId: network.config.chainId
  };
  
  // Create the directory if it doesn't exist
  const deploymentDir = "../app/src/deployments";
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const networkName = network.name === "hardhat" ? "localhost" : network.name;
  fs.writeFileSync(
    `${deploymentDir}/${networkName}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`Deployment info written to ${deploymentDir}/${networkName}.json`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

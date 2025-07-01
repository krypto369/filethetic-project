// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FilethethicVerifier
 * @dev Contract for verifying the authenticity of LLM-generated datasets
 */
contract FilethethicVerifier is Ownable {
    // ECDSA is used for signature verification
    
    // Main Filethetic contract address
    address public filethetic;
    
    // Mapping of authorized verifier addresses
    mapping(address => bool) public verifiers;
    
    // Mapping of dataset hashes to verification status
    mapping(bytes32 => bool) public verifiedDatasets;
    
    // Events
    event VerifierAdded(address verifier);
    event VerifierRemoved(address verifier);
    event DatasetVerified(uint256 datasetId, bytes32 datasetHash, address verifier);
    
    // Errors
    error NotAuthorizedVerifier();
    error AlreadyVerified();
    error InvalidSignature();

    /**
     * @dev Constructor
     * @param _filethetic Address of the main Filethetic contract
     */
    constructor(address _filethetic) Ownable(msg.sender) {
        filethetic = _filethetic;
        // Add deployer as the first verifier
        verifiers[msg.sender] = true;
        emit VerifierAdded(msg.sender);
    }
    
    /**
     * @dev Add a new authorized verifier
     * @param verifier Address of the new verifier
     */
    function addVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }
    
    /**
     * @dev Remove an authorized verifier
     * @param verifier Address of the verifier to remove
     */
    function removeVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }
    
    /**
     * @dev Verify a dataset using cryptographic signature
     * @param datasetId ID of the dataset
     * @param datasetHash Hash of the dataset content
     * @param signature Cryptographic signature of the dataset hash
     * @param signerAddress Address that signed the hash
     */
    function verifyDataset(
        uint256 datasetId,
        bytes32 datasetHash,
        bytes calldata signature,
        address signerAddress
    ) external {
        // Check if caller is an authorized verifier
        if (!verifiers[msg.sender]) revert NotAuthorizedVerifier();
        
        // Check if dataset is already verified
        if (verifiedDatasets[datasetHash]) revert AlreadyVerified();
        
        // Verify the signature
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(datasetHash);
        address recoveredSigner = ECDSA.recover(ethSignedMessageHash, signature);
        if (recoveredSigner != signerAddress) revert InvalidSignature();
        
        // Mark dataset as verified
        verifiedDatasets[datasetHash] = true;
        
        // Emit event
        emit DatasetVerified(datasetId, datasetHash, msg.sender);
    }
    
    /**
     * @dev Check if a dataset is verified
     * @param datasetHash Hash of the dataset content
     * @return Whether the dataset is verified
     */
    function isVerified(bytes32 datasetHash) external view returns (bool) {
        return verifiedDatasets[datasetHash];
    }
    
    /**
     * @dev Update the Filethetic contract address (only owner)
     * @param _filethetic New Filethetic contract address
     */
    function setFilethetic(address _filethetic) external onlyOwner {
        filethetic = _filethetic;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title Filethetic
 * @dev Main contract for the Filethetic protocol - A platform for generating synthetic data with
 * verifiable LLMs on EVM blockchains, using Filecoin & IPFS for storage
 */
contract Filethetic is Ownable {
    using ECDSA for bytes32;

    // USDFC token contract address
    IERC20 public usdcToken;

    // Protocol treasury
    address public treasury;
    
    // Fee percentage (in basis points, e.g. 250 = 2.5%)
    uint256 public protocolFeePercentage = 250;

    // Dataset struct to store all relevant metadata
    struct Dataset {
        uint256 id;
        uint256 version;
        address owner;
        string name;
        string description;
        uint256 price;
        bool isPublic;
        string cid; // IPFS Content Identifier
        uint256 numRows;
        uint256 numTokens;
        string modelName;
        uint256 taskId;
        uint256 nodeId;
        uint256 computeUnitsPrice;
        uint256 maxComputeUnits;
        uint256 numDownloads;
    }

    // Mapping from datasetId to Dataset
    mapping(uint256 => Dataset) public datasets;
    
    // Mapping from datasetId to a list of addresses that have access
    mapping(uint256 => mapping(address => bool)) public allowlist;
    
    // Dataset counter
    uint256 private _datasetIdCounter;

    // Events
    event DatasetCreated(uint256 indexed datasetId, address indexed owner, string name);
    event DatasetLocked(uint256 indexed datasetId, uint256 version, string cid);
    event DatasetPurchased(uint256 indexed datasetId, address indexed buyer);
    
    // Errors
    error NotDatasetOwner();
    error DatasetNotPublic();
    error IncorrectPaymentAmount();
    error DatasetAlreadyLocked();
    error NoAccessToDataset();

    /**
     * @dev Constructor to set up the Filethetic contract
     * @param _usdcToken Address of the USDFC token contract
     * @param _treasury Address of the treasury/vault
     */
    constructor(address _usdcToken, address _treasury) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        treasury = _treasury;
    }

    /**
     * @dev Create a new dataset with metadata
     * @param name Name of the dataset
     * @param description Description of the dataset
     * @param price Price in USDFC tokens
     * @param isPublic Whether the dataset is public (sellable)
     * @param modelName Name of the LLM used
     * @param taskId Task identifier
     * @param nodeId Node identifier
     * @param computeUnitsPrice Price per one million compute units
     * @param maxComputeUnits Maximum number of compute units
     * @return datasetId The ID of the newly created dataset
     */
    function createDataset(
        string calldata name,
        string calldata description,
        uint256 price,
        bool isPublic,
        string calldata modelName,
        uint256 taskId,
        uint256 nodeId,
        uint256 computeUnitsPrice,
        uint256 maxComputeUnits
    ) external returns (uint256) {
        uint256 datasetId = _datasetIdCounter++;
        
        datasets[datasetId] = Dataset({
            id: datasetId,
            version: 0, // Not locked yet
            owner: msg.sender,
            name: name,
            description: description,
            price: price,
            isPublic: isPublic,
            cid: "",
            numRows: 0,
            numTokens: 0,
            modelName: modelName,
            taskId: taskId,
            nodeId: nodeId,
            computeUnitsPrice: computeUnitsPrice,
            maxComputeUnits: maxComputeUnits,
            numDownloads: 0
        });
        
        // Owner always has access
        allowlist[datasetId][msg.sender] = true;
        
        emit DatasetCreated(datasetId, msg.sender, name);
        
        return datasetId;
    }

    /**
     * @dev Lock a dataset with its IPFS CID and metadata
     * @param datasetId ID of the dataset
     * @param cid IPFS Content Identifier where the dataset is stored
     * @param numRows Number of rows in the dataset
     * @param numTokens Number of tokens in the dataset
     */
    function lockDataset(
        uint256 datasetId,
        string calldata cid,
        uint256 numRows,
        uint256 numTokens
    ) external {
        Dataset storage dataset = datasets[datasetId];
        
        if (dataset.owner != msg.sender) revert NotDatasetOwner();
        if (dataset.version != 0) revert DatasetAlreadyLocked();
        
        dataset.cid = cid;
        dataset.numRows = numRows;
        dataset.numTokens = numTokens;
        dataset.version = 1; // Now locked
        
        emit DatasetLocked(datasetId, dataset.version, cid);
    }

    /**
     * @dev Purchase access to a dataset
     * @param datasetId ID of the dataset to purchase
     */
    function purchaseDataset(uint256 datasetId) external {
        Dataset storage dataset = datasets[datasetId];
        
        if (!dataset.isPublic) revert DatasetNotPublic();
        
        // Transfer USDFC from buyer to contract
        bool success = usdcToken.transferFrom(msg.sender, address(this), dataset.price);
        if (!success) revert IncorrectPaymentAmount();
        
        // Calculate protocol fee
        uint256 protocolFee = (dataset.price * protocolFeePercentage) / 10000;
        uint256 ownerPayment = dataset.price - protocolFee;
        
        // Transfer protocol fee to treasury
        usdcToken.transfer(treasury, protocolFee);
        
        // Transfer remaining amount to dataset owner
        usdcToken.transfer(dataset.owner, ownerPayment);
        
        // Grant access to buyer
        allowlist[datasetId][msg.sender] = true;
        
        // Increment download counter
        dataset.numDownloads++;
        
        emit DatasetPurchased(datasetId, msg.sender);
    }

    /**
     * @dev Verify if an address has access to a dataset
     * @param datasetId ID of the dataset
     * @param user Address of the user to check
     * @return true if the user has access, false otherwise
     */
    function hasAccess(uint256 datasetId, address user) public view returns (bool) {
        return datasets[datasetId].owner == user || allowlist[datasetId][user];
    }

    /**
     * @dev Update dataset metadata (only owner)
     * @param datasetId ID of the dataset
     * @param name New name
     * @param description New description
     * @param price New price
     */
    function updateDataset(
        uint256 datasetId,
        string calldata name,
        string calldata description,
        uint256 price
    ) external {
        Dataset storage dataset = datasets[datasetId];
        
        if (dataset.owner != msg.sender) revert NotDatasetOwner();
        
        dataset.name = name;
        dataset.description = description;
        dataset.price = price;
    }

    /**
     * @dev Get dataset details
     * @param datasetId ID of the dataset
     * @return The Dataset struct
     */
        /**
     * @dev Get the total number of datasets
     * @return The total number of datasets
     */
    function getDatasetCount() external view returns (uint256) {
        return _datasetIdCounter;
    }

    /**
     * @dev Get dataset details
     * @param datasetId ID of the dataset
     * @return The Dataset struct
     */
    function getDataset(uint256 datasetId) external view returns (Dataset memory) {
        return datasets[datasetId];
    }

    /**
     * @dev Change the protocol fee percentage (only owner)
     * @param newFeePercentage New fee percentage in basis points
     */
    function setProtocolFeePercentage(uint256 newFeePercentage) external onlyOwner {
        protocolFeePercentage = newFeePercentage;
    }

    /**
     * @dev Change the treasury address (only owner)
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        treasury = newTreasury;
    }
}

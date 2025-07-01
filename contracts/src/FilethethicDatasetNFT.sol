// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title FilethethicDatasetNFT
 * @dev NFT contract for representing ownership and access to datasets
 */
contract FilethethicDatasetNFT is ERC721URIStorage, Ownable {
    // Main Filethetic contract address
    address public filethetic;
    
    // Mapping from token ID to dataset ID
    mapping(uint256 => uint256) public datasetId;
    
    // Events
    event DatasetNFTMinted(uint256 indexed tokenId, uint256 indexed datasetId, address owner);
    
    // Errors
    error OnlyFilethetic();
    error DatasetNFTAlreadyExists();

    /**
     * @dev Modifier to restrict function calls to the Filethetic contract
     */
    modifier onlyFilethetic() {
        if (msg.sender != filethetic) revert OnlyFilethetic();
        _;
    }

    /**
     * @dev Constructor
     * @param _filethetic Address of the main Filethetic contract
     */
    constructor(address _filethetic) ERC721("Filethetic Dataset", "FDSET") Ownable(msg.sender) {
        filethetic = _filethetic;
    }

    /**
     * @dev Mint a new dataset NFT (can only be called by the Filethetic contract)
     * @param to Address to mint the NFT to
     * @param _datasetId ID of the dataset this NFT represents
     * @param metadataURI URI for the NFT metadata
     * @return tokenId ID of the newly minted NFT
     */
    function mintDatasetNFT(
        address to,
        uint256 _datasetId,
        string calldata metadataURI
    ) external onlyFilethetic returns (uint256) {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_datasetId, to, block.timestamp)));
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        datasetId[tokenId] = _datasetId;
        
        emit DatasetNFTMinted(tokenId, _datasetId, to);
        
        return tokenId;
    }

    /**
     * @dev Get the dataset ID associated with an NFT
     * @param tokenId ID of the NFT
     * @return Dataset ID
     */
    function getDatasetId(uint256 tokenId) external view returns (uint256) {
        return datasetId[tokenId];
    }

    /**
     * @dev Update the Filethetic contract address (only owner)
     * @param _filethetic New Filethetic contract address
     */
    function setFilethetic(address _filethetic) external onlyOwner {
        filethetic = _filethetic;
    }
}

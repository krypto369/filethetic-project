// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDFC token for testing purposes
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals = 6; // USDFC has 6 decimals
    
    /**
     * @dev Constructor
     */
    constructor() ERC20("USD Coin", "USDFC") Ownable(msg.sender) {
        // Mint 1 million USDFC to deployer for testing
        _mint(msg.sender, 1_000_000 * 10**_decimals);
    }
    
    /**
     * @dev Returns the number of decimals used for token
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mints tokens to an address (for testing only)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

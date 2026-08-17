// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * GOLD — the holder reward token.
 *
 * Deliberately NOT the same thing as $MINE. $MINE is the operational currency
 * of the game (salaries, crafting, repairs) and is spent back into the sinks.
 * GOLD only ever comes into existence one way: a holder claims what their
 * business NFTs produced while they held them.
 *
 * There is no owner mint, no premine, and no treasury allocation. The single
 * mint path is `minter`, which is set once to the GoldRewards contract. That
 * is the whole supply story, and it is verifiable on-chain.
 */
contract GoldToken is ERC20, Ownable {
    /// The only address allowed to mint. Set to the GoldRewards contract.
    address public minter;

    event MinterUpdated(address indexed previousMinter, address indexed newMinter);

    error NotMinter(address caller);
    error ZeroAddress();

    constructor(address initialOwner) ERC20("MinerFi Gold", "GOLD") Ownable(initialOwner) {}

    /**
     * Points minting at the rewards contract. Kept updatable so the accrual
     * logic can be migrated without reissuing the token, which would otherwise
     * strand every holder's balance.
     */
    function setMinter(address newMinter) external onlyOwner {
        if (newMinter == address(0)) revert ZeroAddress();
        emit MinterUpdated(minter, newMinter);
        minter = newMinter;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != minter) revert NotMinter(msg.sender);
        _mint(to, amount);
    }
}

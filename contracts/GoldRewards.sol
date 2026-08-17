// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMinerFiNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function balanceOf(address owner) external view returns (uint256);
    function tokensOfOwner(address owner) external view returns (uint256[] memory);
    function goldPerDayOf(uint256 tokenId) external view returns (uint256);
    function tierOf(uint256 tokenId) external view returns (uint8);
    function totalMinted() external view returns (uint256);
}

interface IGoldToken {
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

/**
 * GoldRewards — turns "I hold a business NFT" into claimable GOLD.
 *
 * No staking. Locking the deed in a vault would be the conventional design, but
 * it makes the NFT untradeable while it earns and forces two extra transactions
 * on the holder before they see a single token. Here the deed stays in the
 * holder's wallet, stays listable, and earns the entire time.
 *
 * Accrual is per token and purely a function of elapsed time:
 *
 *     pending(tokenId) = (now - lastAccrual[tokenId]) * goldPerDay / 1 day
 *
 * There is no reward pool to run dry and no snapshot to game by borrowing NFTs
 * before a distribution — GOLD is minted at claim time for exactly the seconds
 * that were actually held.
 */
contract GoldRewards {
    IMinerFiNFT public immutable nft;
    IGoldToken public immutable gold;

    /// Fallback clock start for tokens minted before this contract was wired in.
    uint256 public immutable genesis;

    /// Per-token clock. Reset on every transfer and every claim.
    mapping(uint256 tokenId => uint256 timestamp) public lastAccrual;

    /// GOLD settled to an address on transfer but not yet minted out.
    mapping(address holder => uint256 amount) public credited;

    mapping(address holder => uint256 amount) public totalClaimedBy;
    uint256 public totalClaimed;

    event Claimed(address indexed holder, uint256 amount, uint256 tokenCount);
    event Settled(uint256 indexed tokenId, address indexed holder, uint256 amount);

    error OnlyNft(address caller);
    error NotHolder(uint256 tokenId, address caller);
    error NothingToClaim();
    error ZeroAddress();

    constructor(address nft_, address gold_) {
        if (nft_ == address(0) || gold_ == address(0)) revert ZeroAddress();
        nft = IMinerFiNFT(nft_);
        gold = IGoldToken(gold_);
        genesis = block.timestamp;
    }

    /* ------------------------------------------------------------- accrual -- */

    /// GOLD a single token has produced since its clock was last reset.
    function pendingOf(uint256 tokenId) public view returns (uint256) {
        uint256 goldPerDay = nft.goldPerDayOf(tokenId);
        if (goldPerDay == 0) return 0;

        uint256 last = lastAccrual[tokenId];
        if (last == 0) last = genesis;
        if (block.timestamp <= last) return 0;

        return ((block.timestamp - last) * goldPerDay) / 1 days;
    }

    function pendingOfBatch(uint256[] calldata tokenIds)
        external
        view
        returns (uint256[] memory out)
    {
        out = new uint256[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            out[i] = pendingOf(tokenIds[i]);
        }
    }

    /// Everything `holder` could claim right now: settled credit plus live accrual.
    function claimableOf(address holder) public view returns (uint256 total) {
        total = credited[holder];
        uint256[] memory ids = nft.tokensOfOwner(holder);
        for (uint256 i = 0; i < ids.length; i++) {
            total += pendingOf(ids[i]);
        }
    }

    /// Combined production rate of everything `holder` owns, in GOLD per day.
    function goldPerDayOf(address holder) public view returns (uint256 total) {
        uint256[] memory ids = nft.tokensOfOwner(holder);
        for (uint256 i = 0; i < ids.length; i++) {
            total += nft.goldPerDayOf(ids[i]);
        }
    }

    /**
     * One call for the whole dashboard — otherwise the header alone costs four
     * round-trips and the numbers tear as they land at different times.
     */
    function holderStats(address holder)
        external
        view
        returns (
            uint256 nftCount,
            uint256 goldPerDay,
            uint256 claimable,
            uint256 claimedToDate,
            uint256 goldBalance
        )
    {
        uint256[] memory ids = nft.tokensOfOwner(holder);
        nftCount = ids.length;
        claimable = credited[holder];

        for (uint256 i = 0; i < ids.length; i++) {
            goldPerDay += nft.goldPerDayOf(ids[i]);
            claimable += pendingOf(ids[i]);
        }

        claimedToDate = totalClaimedBy[holder];
        goldBalance = gold.balanceOf(holder);
    }

    /**
     * The holder's entire portfolio in one call.
     *
     * The alternative is the frontend fetching ids and then fanning out four
     * reads per token, which either needs a Multicall3 deployment on every
     * target chain or turns a ten-business portfolio into forty RPC round-trips
     * that land at different times and visibly tear on screen.
     */
    function portfolioOf(address holder)
        external
        view
        returns (
            uint256[] memory ids,
            uint8[] memory tiers,
            uint256[] memory goldPerDay,
            uint256[] memory pending,
            uint256[] memory producingSince
        )
    {
        ids = nft.tokensOfOwner(holder);

        tiers = new uint8[](ids.length);
        goldPerDay = new uint256[](ids.length);
        pending = new uint256[](ids.length);
        producingSince = new uint256[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = ids[i];
            tiers[i] = nft.tierOf(tokenId);
            goldPerDay[i] = nft.goldPerDayOf(tokenId);
            pending[i] = pendingOf(tokenId);
            producingSince[i] = lastAccrual[tokenId] == 0 ? genesis : lastAccrual[tokenId];
        }
    }

    /// Protocol-wide numbers for the dashboard header.
    function protocolStats()
        external
        view
        returns (uint256 goldSupply, uint256 claimedToDate, uint256 businessesMinted)
    {
        goldSupply = gold.totalSupply();
        claimedToDate = totalClaimed;
        businessesMinted = nft.totalMinted();
    }

    /* ------------------------------------------------------------ settling -- */

    /**
     * Called by the NFT inside its transfer hook.
     *
     * Banks whatever the token produced under its previous owner, then restarts
     * the clock. This is what stops a buyer from inheriting the seller's unclaimed
     * rewards, and equally what stops a seller from losing them.
     */
    function settle(uint256 tokenId, address previousOwner) external {
        if (msg.sender != address(nft)) revert OnlyNft(msg.sender);

        // previousOwner is the zero address on mint: nothing earned yet, just
        // start the clock.
        if (previousOwner != address(0)) {
            uint256 amount = pendingOf(tokenId);
            if (amount > 0) {
                credited[previousOwner] += amount;
                emit Settled(tokenId, previousOwner, amount);
            }
        }

        lastAccrual[tokenId] = block.timestamp;
    }

    /* ------------------------------------------------------------ claiming -- */

    /// Claims every business the caller holds, plus any credit from past sales.
    function claim() external returns (uint256 amount) {
        uint256[] memory ids = nft.tokensOfOwner(msg.sender);

        amount = credited[msg.sender];
        credited[msg.sender] = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            amount += pendingOf(ids[i]);
            lastAccrual[ids[i]] = block.timestamp;
        }

        _payout(amount, ids.length);
    }

    /// Claims specific businesses. Credit from past sales rides along.
    function claimTokens(uint256[] calldata tokenIds) external returns (uint256 amount) {
        amount = credited[msg.sender];
        credited[msg.sender] = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            if (nft.ownerOf(tokenId) != msg.sender) revert NotHolder(tokenId, msg.sender);
            amount += pendingOf(tokenId);
            lastAccrual[tokenId] = block.timestamp;
        }

        _payout(amount, tokenIds.length);
    }

    function _payout(uint256 amount, uint256 tokenCount) private {
        if (amount == 0) revert NothingToClaim();

        totalClaimed += amount;
        totalClaimedBy[msg.sender] += amount;

        emit Claimed(msg.sender, amount, tokenCount);
        gold.mint(msg.sender, amount);
    }
}

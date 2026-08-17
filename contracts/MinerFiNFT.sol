// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

interface IGoldRewards {
    function settle(uint256 tokenId, address previousOwner) external;
}

/**
 * MinerFiNFT — the business deed.
 *
 * Every token is a running business at one of five tiers, and the tier is what
 * decides how much GOLD it produces per day. That is the "utility" claim on the
 * landing page made literal: the token is not a picture of a shop, it is the
 * thing the rewards contract reads to decide what you are owed.
 *
 * Enumerable is deliberate. Without it, listing "the NFTs this wallet owns"
 * needs an off-chain indexer, and the whole holder flow would depend on a
 * service that has to be paid for and can go down. `tokenOfOwnerByIndex` costs
 * more gas at mint and buys a frontend and a claim function that only ever
 * need an RPC node.
 */
contract MinerFiNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    struct Tier {
        string name;
        uint256 price; // wei charged per mint
        uint256 goldPerDay; // GOLD (18 decimals) produced per day
        uint256 maxSupply;
        uint256 minted;
    }

    uint8 public constant TIER_COUNT = 5;
    uint256 public constant MAX_PER_TX = 10;

    /// Tiers are 1-indexed to match the game copy ("Tier 1 Coffee Shop").
    mapping(uint8 tier => Tier) private _tiers;
    mapping(uint256 tokenId => uint8 tier) public tierOf;

    IGoldRewards public rewards;

    uint256 private _nextTokenId = 1;

    event Minted(address indexed to, uint256 indexed tokenId, uint8 indexed tier, uint256 pricePaid);
    event TierUpdated(uint8 indexed tier, uint256 price, uint256 goldPerDay, uint256 maxSupply);
    event RewardsUpdated(address indexed previousRewards, address indexed newRewards);
    event Withdrawn(address indexed to, uint256 amount);

    error InvalidTier(uint8 tier);
    error InvalidQuantity(uint256 quantity);
    error SoldOut(uint8 tier);
    error WrongPrice(uint256 sent, uint256 required);
    error ZeroAddress();
    error WithdrawFailed();

    constructor(
        address initialOwner,
        uint256[TIER_COUNT] memory prices,
        uint256[TIER_COUNT] memory goldPerDay,
        uint256[TIER_COUNT] memory maxSupplies
    ) ERC721("MinerFi Business", "MFB") Ownable(initialOwner) {
        string[TIER_COUNT] memory names =
            ["Coffee Shop", "Restaurant", "Hotel", "Corporation", "Global Empire"];

        for (uint8 i = 0; i < TIER_COUNT; i++) {
            uint8 tier = i + 1;
            _tiers[tier] = Tier({
                name: names[i],
                price: prices[i],
                goldPerDay: goldPerDay[i],
                maxSupply: maxSupplies[i],
                minted: 0
            });
            emit TierUpdated(tier, prices[i], goldPerDay[i], maxSupplies[i]);
        }
    }

    /* ------------------------------------------------------------ minting -- */

    /**
     * Buys `quantity` businesses at `tier`. This is the investor's entry point:
     * pay ETH, receive deeds that start producing GOLD the same block.
     */
    function mint(uint8 tier, uint256 quantity) external payable {
        if (tier == 0 || tier > TIER_COUNT) revert InvalidTier(tier);
        if (quantity == 0 || quantity > MAX_PER_TX) revert InvalidQuantity(quantity);

        Tier storage t = _tiers[tier];
        if (t.minted + quantity > t.maxSupply) revert SoldOut(tier);

        uint256 required = t.price * quantity;
        // Exact payment only. Accepting overpayment and refunding the excess is
        // the other valid option, but it turns every mint into a value-bearing
        // callback to an arbitrary address.
        if (msg.value != required) revert WrongPrice(msg.value, required);

        t.minted += quantity;

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            tierOf[tokenId] = tier;
            _safeMint(msg.sender, tokenId);
            emit Minted(msg.sender, tokenId, tier, t.price);
        }
    }

    /* -------------------------------------------------------------- views -- */

    function tierInfo(uint8 tier) external view returns (Tier memory) {
        if (tier == 0 || tier > TIER_COUNT) revert InvalidTier(tier);
        return _tiers[tier];
    }

    /// Every tier in one call, so the mint page is a single RPC round-trip.
    function allTiers() external view returns (Tier[TIER_COUNT] memory out) {
        for (uint8 i = 0; i < TIER_COUNT; i++) {
            out[i] = _tiers[i + 1];
        }
    }

    /**
     * GOLD per day for a token — the number GoldRewards prices accrual from.
     *
     * Intentionally does not revert on an unknown token: `settle` runs inside
     * the transfer hook, and a burn would call this after the token is already
     * gone. An unknown token has tier 0, which reads back a zero rate.
     */
    function goldPerDayOf(uint256 tokenId) public view returns (uint256) {
        return _tiers[tierOf[tokenId]].goldPerDay;
    }

    /// Token ids held by `owner`. Saves the frontend an N+1 of index lookups.
    function tokensOfOwner(address owner) external view returns (uint256[] memory ids) {
        uint256 count = balanceOf(owner);
        ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = tokenOfOwnerByIndex(owner, i);
        }
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /* --------------------------------------------------------------- admin -- */

    function setRewards(address newRewards) external onlyOwner {
        if (newRewards == address(0)) revert ZeroAddress();
        emit RewardsUpdated(address(rewards), newRewards);
        rewards = IGoldRewards(newRewards);
    }

    /**
     * Tuning knob for price and emission. `minted` is untouched on purpose —
     * lowering maxSupply below what is already out would corrupt the counter.
     */
    function setTier(uint8 tier, uint256 price, uint256 goldPerDay, uint256 maxSupply)
        external
        onlyOwner
    {
        if (tier == 0 || tier > TIER_COUNT) revert InvalidTier(tier);
        Tier storage t = _tiers[tier];
        if (maxSupply < t.minted) revert SoldOut(tier);

        t.price = price;
        t.goldPerDay = goldPerDay;
        t.maxSupply = maxSupply;
        emit TierUpdated(tier, price, goldPerDay, maxSupply);
    }

    function withdraw(address payable to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        uint256 amount = address(this).balance;
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert WithdrawFailed();
        emit Withdrawn(to, amount);
    }

    /* ------------------------------------------------------------- hooks --- */

    /**
     * Settles rewards before ownership moves.
     *
     * Without this, selling a business would hand the buyer everything the
     * seller earned since their last claim. `settle` credits the pending GOLD
     * to `from` and restarts the token's clock, so a deed's production always
     * belongs to whoever was actually holding it at the time.
     *
     * On mint `from` is the zero address and settle simply starts the clock.
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);
        if (address(rewards) != address(0)) {
            rewards.settle(tokenId, from);
        }
        return from;
    }

    /* ---------------------------------------------------------- metadata --- */

    /**
     * Metadata is generated on-chain. A hosted tokenURI would mean the NFT in
     * an investor's wallet renders only for as long as somebody keeps paying
     * for the server; this way the deed is legible from the chain alone.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        uint8 tier = tierOf[tokenId];
        Tier storage t = _tiers[tier];
        string memory goldPerDayWhole = (t.goldPerDay / 1e18).toString();

        string memory json = string.concat(
            '{"name":"',
            t.name,
            " #",
            tokenId.toString(),
            '","description":"A MinerFi business deed. Tier ',
            uint256(tier).toString(),
            " - produces ",
            goldPerDayWhole,
            ' GOLD per day for whoever holds it.","image":"data:image/svg+xml;base64,',
            Base64.encode(bytes(_svg(tokenId, tier, t.name, goldPerDayWhole))),
            '","attributes":[{"trait_type":"Tier","value":',
            uint256(tier).toString(),
            '},{"trait_type":"Business","value":"',
            t.name,
            '"},{"trait_type":"Gold per day","value":',
            goldPerDayWhole,
            "}]}"
        );

        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    /// Brand colours from the site: paper #FBF8F1, ink #101A13, green #00C805.
    function _svg(uint256 tokenId, uint8 tier, string memory name, string memory goldPerDay)
        private
        pure
        returns (string memory)
    {
        return string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">',
            '<rect width="500" height="500" fill="#FBF8F1"/>',
            '<rect x="24" y="24" width="452" height="452" rx="24" fill="#FFFFFF" stroke="#101A13" stroke-width="6"/>',
            '<rect x="40" y="40" width="452" height="452" rx="24" fill="none" stroke="#101A13" stroke-width="0"/>',
            '<circle cx="410" cy="118" r="46" fill="#00C805" stroke="#101A13" stroke-width="6"/>',
            '<text x="410" y="133" font-family="monospace" font-size="38" font-weight="bold" fill="#0A120C" text-anchor="middle">',
            uint256(tier).toString(),
            "</text>",
            '<text x="60" y="120" font-family="monospace" font-size="17" letter-spacing="4" fill="#4B5A51">MINERFI BUSINESS</text>',
            '<text x="60" y="205" font-family="sans-serif" font-size="44" font-weight="bold" fill="#101A13">',
            name,
            "</text>",
            '<text x="60" y="252" font-family="monospace" font-size="24" fill="#4B5A51">#',
            tokenId.toString(),
            "</text>",
            '<rect x="60" y="300" width="380" height="112" rx="14" fill="#F2EFE4" stroke="#101A13" stroke-width="5"/>',
            '<text x="84" y="340" font-family="monospace" font-size="15" letter-spacing="3" fill="#4B5A51">PRODUCES</text>',
            '<text x="84" y="390" font-family="monospace" font-size="40" font-weight="bold" fill="#0B6B33">',
            goldPerDay,
            ' <tspan font-size="22" fill="#4B5A51">GOLD / DAY</tspan></text>',
            "</svg>"
        );
    }
}

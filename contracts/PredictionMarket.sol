// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PredictionMarket
 * @notice Binary prediction market on Celo using USDm (18 decimals).
 *         Betters place YES/NO wagers; winners share the losing pool
 *         proportionally. 2% protocol fee on every bet.
 */
contract PredictionMarket is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Constants ────────────────────────────────────────────────────────
    uint256 public constant FEE_BPS = 200; // 2%
    uint256 public constant MIN_BET = 0.1e18; // 0.1 USDm

    // ─── State ────────────────────────────────────────────────────────────
    IERC20 public immutable token; // USDm on Celo mainnet
    uint256 public accumulatedFees;
    uint256 public marketCount;

    struct Market {
        string question;
        string imageUrl;
        uint256 endTime;
        address resolver;
        bool resolved;
        bool outcome; // true = YES wins
        uint256 yesPool;
        uint256 noPool;
    }

    struct Position {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }

    mapping(uint256 => Market) private _markets;
    mapping(uint256 => mapping(address => Position)) private _positions;

    // ─── Events ───────────────────────────────────────────────────────────
    event MarketCreated(
        uint256 indexed id,
        string question,
        uint256 endTime,
        address indexed resolver,
        address indexed creator
    );
    event BetPlaced(
        uint256 indexed id,
        address indexed user,
        bool side,
        uint256 netAmount
    );
    event MarketResolved(uint256 indexed id, bool outcome);
    event WinningsClaimed(uint256 indexed id, address indexed user, uint256 amount);
    event FeesWithdrawn(uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────
    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Zero token");
        token = IERC20(_token);
    }

    // ─── Market Creation ─────────────────────────────────────────────────
    /**
     * @notice Create a new prediction market. Anyone can create.
     * @param question  Human-readable question, e.g. "Will BTC hit $100k by Dec 2025?"
     * @param imageUrl  Optional IPFS/HTTPS image URL (empty string = none)
     * @param endTime   Unix timestamp after which no more bets are accepted
     * @param resolver  Address allowed to call resolveMarket (use your own address or a multisig)
     */
    function createMarket(
        string calldata question,
        string calldata imageUrl,
        uint256 endTime,
        address resolver
    ) external returns (uint256 id) {
        require(bytes(question).length > 0, "Empty question");
        require(endTime > block.timestamp, "End time in past");
        require(resolver != address(0), "Zero resolver");

        id = marketCount++;
        _markets[id] = Market({
            question: question,
            imageUrl: imageUrl,
            endTime: endTime,
            resolver: resolver,
            resolved: false,
            outcome: false,
            yesPool: 0,
            noPool: 0
        });

        emit MarketCreated(id, question, endTime, resolver, msg.sender);
    }

    // ─── Betting ─────────────────────────────────────────────────────────
    /**
     * @notice Place a bet on a market.
     * @param id     Market ID
     * @param side   true = YES, false = NO
     * @param amount Gross USDm amount (18 decimals). 2% fee deducted internally.
     */
    function placeBet(uint256 id, bool side, uint256 amount) external nonReentrant {
        Market storage m = _markets[id];
        require(block.timestamp < m.endTime, "Market closed");
        require(!m.resolved, "Already resolved");
        require(amount >= MIN_BET, "Below minimum bet");

        uint256 fee = (amount * FEE_BPS) / 10_000;
        uint256 net = amount - fee;

        token.safeTransferFrom(msg.sender, address(this), amount);
        accumulatedFees += fee;

        Position storage pos = _positions[id][msg.sender];
        if (side) {
            m.yesPool += net;
            pos.yesAmount += net;
        } else {
            m.noPool += net;
            pos.noAmount += net;
        }

        emit BetPlaced(id, msg.sender, side, net);
    }

    // ─── Resolution ───────────────────────────────────────────────────────
    /**
     * @notice Resolve a market after it has ended.
     *         Only callable by the designated resolver or the contract owner.
     */
    function resolveMarket(uint256 id, bool outcome) external {
        Market storage m = _markets[id];
        require(
            msg.sender == m.resolver || msg.sender == owner(),
            "Not authorized"
        );
        require(block.timestamp >= m.endTime, "Market not ended");
        require(!m.resolved, "Already resolved");

        m.resolved = true;
        m.outcome = outcome;

        emit MarketResolved(id, outcome);
    }

    // ─── Claiming ─────────────────────────────────────────────────────────
    /**
     * @notice Claim winnings for a resolved market.
     *         If the losing side has zero bets, the winner gets a full refund.
     */
    function claimWinnings(uint256 id) external nonReentrant {
        Market storage m = _markets[id];
        Position storage pos = _positions[id][msg.sender];

        require(m.resolved, "Not yet resolved");
        require(!pos.claimed, "Already claimed");

        uint256 payout = _computePayout(m, pos);
        require(payout > 0, "Nothing to claim");

        pos.claimed = true;
        token.safeTransfer(msg.sender, payout);

        emit WinningsClaimed(id, msg.sender, payout);
    }

    // ─── Views ────────────────────────────────────────────────────────────
    function getMarket(uint256 id) external view returns (Market memory) {
        return _markets[id];
    }

    function getPosition(uint256 id, address user) external view returns (Position memory) {
        return _positions[id][user];
    }

    /**
     * @notice Paginated market list. Pass from=0, count=20 to get first 20.
     */
    function getMarkets(uint256 from, uint256 count)
        external
        view
        returns (Market[] memory result, uint256 total)
    {
        total = marketCount;
        if (from >= total) return (new Market[](0), total);
        uint256 end = from + count > total ? total : from + count;
        result = new Market[](end - from);
        for (uint256 i = from; i < end; i++) {
            result[i - from] = _markets[i];
        }
    }

    /**
     * @notice Preview how much a user would receive if they claimed now.
     */
    function previewPayout(uint256 id, address user) external view returns (uint256) {
        Market storage m = _markets[id];
        Position storage pos = _positions[id][user];
        if (!m.resolved || pos.claimed) return 0;
        return _computePayout(m, pos);
    }

    /**
     * @notice Simulate placing a bet and return potential payout.
     * @return potentialPayout  Estimated return if your side wins (including your stake)
     * @return impliedOdds      Your stake's share of the current pool (1e18 = 100%)
     */
    function previewPotentialWin(
        uint256 id,
        bool side,
        uint256 betAmount
    ) external view returns (uint256 potentialPayout, uint256 impliedOdds) {
        Market storage m = _markets[id];
        require(!m.resolved, "Market resolved");
        require(betAmount >= MIN_BET, "Below minimum");

        uint256 net = betAmount - (betAmount * FEE_BPS) / 10_000;

        uint256 myPool = (side ? m.yesPool : m.noPool) + net;
        uint256 otherPool = side ? m.noPool : m.yesPool;

        uint256 share = otherPool > 0 ? (net * otherPool) / myPool : 0;
        potentialPayout = net + share;
        impliedOdds = myPool > 0 ? (net * 1e18) / myPool : 1e18;
    }

    // ─── Admin ────────────────────────────────────────────────────────────
    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        require(amount > 0, "No fees");
        accumulatedFees = 0;
        token.safeTransfer(owner(), amount);
        emit FeesWithdrawn(amount);
    }

    // ─── Internal ─────────────────────────────────────────────────────────
    function _computePayout(
        Market storage m,
        Position storage pos
    ) internal view returns (uint256) {
        uint256 stake = m.outcome ? pos.yesAmount : pos.noAmount;
        if (stake == 0) return 0;

        uint256 winPool = m.outcome ? m.yesPool : m.noPool;
        uint256 losePool = m.outcome ? m.noPool : m.yesPool;

        // If no one bet on the losing side, return stake (full refund)
        if (losePool == 0) return stake;

        return stake + (stake * losePool) / winPool;
    }
}

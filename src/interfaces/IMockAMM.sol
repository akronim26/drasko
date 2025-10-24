// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title Mock AMM Interface
/// @notice Interface for the mock AMM that handles swaps between ETH and ERC20 tokens
interface IMockAMM {

    /// @notice Structure to hold pool information
    /// @param token The ERC20 token address
    /// @param ethReserve Amount of ETH in the pool
    /// @param tokenReserve Amount of tokens in the pool
    /// @param totalSupply Total supply of LP tokens
    struct Pool {
        address token;
        uint256 ethReserve;
        uint256 tokenReserve;
        uint256 totalSupply;
    }

    /// @notice Emitted when a swap occurs
    /// @param user The address performing the swap
    /// @param tokenIn The input token address
    /// @param tokenOut The output token address
    /// @param amountIn The amount of input tokens
    /// @param amountOut The amount of output tokens
    event MockAMM__Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    /// @notice Emitted when liquidity is added
    /// @param user The address adding liquidity
    /// @param token The token address
    /// @param ethAmount Amount of ETH added
    /// @param tokenAmount Amount of tokens added
    /// @param lpTokens Amount of LP tokens minted
    event MockAMM__LiquidityAdded(
        address indexed user,
        address indexed token,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 lpTokens
    );

    /// @notice Emitted when liquidity is removed
    /// @param user The address removing liquidity
    /// @param token The token address
    /// @param ethAmount Amount of ETH returned
    /// @param tokenAmount Amount of tokens returned
    /// @param lpTokens Amount of LP tokens burned
    event MockAMM__LiquidityRemoved(
        address indexed user,
        address indexed token,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 lpTokens
    );

    /// @notice Swaps ETH for tokens
    /// @param tokenOut The address of the token to receive
    /// @param minAmountOut Minimum amount of tokens to receive
    /// @return amountOut The amount of tokens received
    function swapETHForTokens(
        address tokenOut,
        uint256 minAmountOut
    ) external payable returns (uint256 amountOut);

    /// @notice Swaps tokens for ETH
    /// @param tokenIn The address of the token to swap
    /// @param amountIn The amount of tokens to swap
    /// @param minAmountOut Minimum amount of ETH to receive
    /// @return amountOut The amount of ETH received
    function swapTokensForETH(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external returns (uint256 amountOut);

    /// @notice Adds liquidity to a pool
    /// @param token The token address
    /// @param tokenAmount The amount of tokens to add
    /// @return lpTokens The amount of LP tokens minted
    function addLiquidity(
        address token,
        uint256 tokenAmount
    ) external payable returns (uint256 lpTokens);

    /// @notice Gets the amount of tokens that would be received for a given ETH amount
    /// @param tokenOut The token address
    /// @param ethAmount The amount of ETH
    /// @return amountOut The amount of tokens that would be received
    function getAmountOut(
        address tokenOut,
        uint256 ethAmount
    ) external view returns (uint256 amountOut);

    /// @notice Gets pool information for a token
    /// @param token The token address
    /// @return pool The pool information
    function getPool(address token) external view returns (Pool memory pool);

    /// @notice Removes liquidity from a pool
    /// @param token The token address
    /// @param lpTokens The amount of LP tokens to burn
    /// @return ethAmount The amount of ETH returned
    /// @return tokenAmount The amount of tokens returned
    function removeLiquidity(
        address token,
        uint256 lpTokens
    ) external returns (uint256 ethAmount, uint256 tokenAmount);
}
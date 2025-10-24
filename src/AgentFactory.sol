// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Agent} from "./Agent.sol";
import {Platform} from "./Platform.sol";

/// @title AgentFactory
/// @notice Factory contract for creating and managing trading agents
/// @dev Deploys Agent contracts and keeps a registry of all created agents
contract AgentFactory {

    error Factory__NoTokenPresent();
    error Factory__PlatformNotAvailable();
    error Factory__AmountIsZero();

    /// @notice Structure to store information about created agents
    /// @param agentAddress The address of the created agent contract
    /// @param owner The address of the agent owner
    /// @param tokens Array of token addresses supported by the agent
    /// @param amountInvested Initial investment amount in wei
    /// @param platformType The platform type associated with the agent
    struct AgentInfo {
        address agentAddress;
        address owner;
        address[] tokens;
        uint256 amountInvested;
        Platform platformType;
    }

    mapping(address user => AgentInfo[]) public userToAgents;

    /// @notice Emitted when a new agent is created
    /// @param agentAddress The address of the newly created agent
    /// @param platform The platform type associated with the agent
    /// @param tokens The array of supported token addresses
    event Factory__AgentCreated(
        address indexed agentAddress,
        Platform indexed platform,
        address[] indexed tokens
    );

    /// @notice Creates a new trading agent
    /// @param _tokens Array of token addresses that the agent will support
    /// @param _platformType The platform type for the agent (Twitter, Telegram, or Discord)
    /// @param authorizedSigner Address that will be authorized to execute trades
    /// @param _mockAMM The address of the MockAMM contract
    /// @return agent The address of the newly created Agent contract
    function createAgent(
        address[] memory _tokens,
        Platform _platformType,
        address authorizedSigner,
        address _mockAMM
    ) external payable returns (Agent) {
        if (_tokens.length == 0) {
            revert Factory__NoTokenPresent();
        }
        if (!isValidPlatform(_platformType)) {
            revert Factory__PlatformNotAvailable();
        }
        if (msg.value <= 0) {
            revert Factory__AmountIsZero();
        }

        Agent agent = new Agent{value: msg.value}(
            _tokens,
            _platformType,
            authorizedSigner,
            msg.sender,
            _mockAMM
        );

        AgentInfo memory info = AgentInfo({
            agentAddress: address(agent),
            owner: msg.sender,
            tokens: _tokens,
            amountInvested: msg.value,
            platformType: _platformType
        });

        userToAgents[msg.sender].push(info);
        emit Factory__AgentCreated(address(agent), _platformType, _tokens);
        return agent;
    }

    /// @notice Checks if the provided platform is a valid supported platform.
    /// @dev Valid platforms are Telegram, Twitter, and Discord.
    /// @param platform The platform type to check.
    /// @return True if the platform is valid, false otherwise.
    function isValidPlatform(Platform platform) internal pure returns (bool) {
        return (platform == Platform.Telegram ||
            platform == Platform.Twitter ||
            platform == Platform.Discord);
    }

    /// @notice Returns information about a user's agent by index
    /// @param user The address of the user
    /// @param index The index of the agent
    /// @return AgentInfo struct with agent details
    function getAgentInfo(
        address user,
        uint256 index
    ) external view returns (AgentInfo memory) {
        AgentInfo storage info = userToAgents[user][index];
        return
            AgentInfo(
                info.agentAddress,
                info.owner,
                info.tokens,
                info.amountInvested,
                info.platformType
            );
    }
}
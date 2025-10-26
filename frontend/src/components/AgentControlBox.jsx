import React, { useState } from "react";
import { pauseAgent, resumeAgent, addFundsToAgent, withdrawFundsFromAgent, deleteAgent } from "../utils/AgentInteractions.js";
import { useWalletConnection } from "../hooks/useWalletConnection.js";
import TransactionProcessingModal from "./TransactionProcessingModal";
import { toast } from "react-toastify";

const AgentControlBox = ({ agent, onClose, onAgentUpdate, onAgentSuspended, onZeroAgentDisplay, setShowProcessing }) => {
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { signer } = useWalletConnection();

    const isSuspended = agent.paused || agent.currentFunds === "0";

    const handlePauseResume = async () => {
        if (!signer) return;
        setIsLoading(true);
        setShowProcessing && setShowProcessing(true);
        try {
            if (agent.paused) {
                await resumeAgent(agent.address, signer);
            } else {
                await pauseAgent(agent.address, signer);
            }
            onAgentUpdate();
        } catch (error) {
            console.error("Error toggling agent state:", error);
        } finally {
            setIsLoading(false);
            setShowProcessing && setShowProcessing(false);
        }
    };

    const handleAddFunds = async () => {
        if (!signer || !amount || parseFloat(amount) <= 0) return;
        setIsLoading(true);
        setShowProcessing && setShowProcessing(true);
        try {
            await addFundsToAgent(agent.address, parseFloat(amount), signer);
            setAmount("");
            onAgentUpdate();
        } catch (error) {
            console.error("Error adding funds:", error);
        } finally {
            setIsLoading(false);
            setShowProcessing && setShowProcessing(false);
        }
    };

    const handleWithdrawFunds = async () => {
        if (!signer) return;
        setIsLoading(true);
        setShowProcessing && setShowProcessing(true);
        try {
            await withdrawFundsFromAgent(agent.address, signer);
            onAgentUpdate();
        } catch (error) {
            console.error("Error withdrawing funds:", error);
        } finally {
            setIsLoading(false);
            setShowProcessing && setShowProcessing(false);
        }
    };

    const handleSuspendAgent = async () => {
        if (!signer) return;

        // Check if agent has tokens
        const hasTokens = agent.tokenDetails && agent.tokenDetails.some(token =>
            token.balance && parseFloat(token.balance) > 0
        );

        if (hasTokens) {
            toast.error("Cannot suspend agent with token balances. Execute trades to withdraw tokens first.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to suspend "${agent.name}"? This will withdraw all ETH to your wallet and cannot be undone.`
        );

        if (!confirmed) return;

        setIsLoading(true);
        setShowProcessing && setShowProcessing(true);
        // Optimistically remove agent from UI
        onAgentSuspended && onAgentSuspended(agent.address);
        try {
            const result = await deleteAgent(agent.address, agent, signer);

            if (result.hasTokens) {
                // This shouldn't happen due to the check above, but handle it just in case
                toast.error("Agent has tokens. Cannot suspend.");
                return;
            }

            // Set display to zero (if modal is still open)
            onZeroAgentDisplay && onZeroAgentDisplay(agent.address);
            onClose(); // Close the popup
            onAgentUpdate(); // Refresh the agent list
        } catch (error) {
            console.error("Error suspending agent:", error);
        } finally {
            setIsLoading(false);
            setShowProcessing && setShowProcessing(false);
        }
    };

    return (
        <>
            {isLoading && <TransactionProcessingModal />}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">Manage Agent</h2>
                        <button
                            onClick={onClose}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-white font-medium mb-2">{agent.name}</h3>
                            <p className="text-white/70 text-sm mb-2">{agent.description}</p>
                            <div className="text-lg font-bold text-green-400">
                                {agent.currentFunds} ETH
                            </div>
                            <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${agent.paused
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-green-500/20 text-green-300 border border-green-500/30'
                                }`}>
                                {agent.paused ? 'Paused' : 'Active'}
                            </div>
                        </div>

                        {/* Supported Tokens Section */}
                        <div className="bg-white/5 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-2">Supported Tokens</h4>
                            <div className="flex flex-wrap gap-2">
                                {agent.tokenDetails && agent.tokenDetails.length > 0 ? (
                                    agent.tokenDetails.map((token, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-md border border-purple-500/30"
                                        >
                                            {token.symbol}: {token.balance}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-white/40 text-sm">No tokens</span>
                                )}
                            </div>
                        </div>

                        {/* Agent Management Section */}
                        <div className="space-y-3">
                            {isSuspended ? (
                                <div className="text-center text-red-400 font-semibold py-4">
                                    This agent is suspended. No actions are available.
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handlePauseResume}
                                        disabled={isLoading || isSuspended}
                                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${agent.paused
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isLoading ? "Processing..." : agent.paused ? "Resume Agent" : "Pause Agent"}
                                    </button>

                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Amount in ETH"
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                                            disabled={isLoading || isSuspended}
                                        />
                                        <button
                                            onClick={handleAddFunds}
                                            disabled={isLoading || !amount || parseFloat(amount) <= 0 || isSuspended}
                                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? "Processing..." : "Add Funds"}
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleWithdrawFunds}
                                        disabled={isLoading || parseFloat(agent.currentFunds) <= 0 || isSuspended}
                                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "Processing..." : "Withdraw All Funds"}
                                    </button>

                                    <button
                                        onClick={handleSuspendAgent}
                                        disabled={isLoading || isSuspended}
                                        className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "Processing..." : "Suspend Agent"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AgentControlBox; 
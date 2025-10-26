import React, { useState } from "react";
import { addFundsToAgent, withdrawFundsFromAgent } from "../utils/AgentInteractions.js";
import { useWalletConnection } from "../hooks/useWalletConnection.js";
import { toast } from "react-toastify";

const AgentControlBox = ({ agent, onClose, onTogglePause, onRefresh }) => {
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { signer } = useWalletConnection();

  const handleAddFunds = async () => {
    if (!addAmount || addAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (agent.paused) {
      toast.error("Cannot add funds to a paused agent");
      return;
    }

    try {
      setLoading(true);
      await addFundsToAgent(agent.address, addAmount, signer);
      toast.success("Funds added successfully");
      setAddAmount("");
      if (onRefresh) {
        await onRefresh();
      }
      onClose();
    } catch (error) {
      console.error("Error adding funds:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Failed to add funds");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFunds = async () => {
    if (agent.paused) {
      toast.error("Cannot withdraw funds from a paused agent");
      return;
    }

    try {
      setLoading(true);
      await withdrawFundsFromAgent(agent.address, signer);
      toast.success("Funds withdrawn successfully");
      if (onRefresh) {
        await onRefresh();
      }
      onClose();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Failed to withdraw funds");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPlatformName = (platformType) => {
    switch (platformType) {
      case 0: return "Telegram";
      case 1: return "Twitter";
      case 2: return "Discord";
      default: return "Unknown";
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[200px] transition-all duration-300"
        onClick={onClose}
      />

      <div className="relative z-10 w-[90%] max-w-2xl bg-[#070311]/80 border border-white/30 backdrop-blur-[32px] text-white p-8 rounded-2xl shadow-2xl animate-slideInBottom max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[28px] font-bold">{agent.name}</h2>
          <button onClick={onClose} className="text-white hover:text-red-400 text-[24px]">&times;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Agent Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Platform:</span>
                  <span className="text-white">{getPlatformName(agent.platformType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Status:</span>
                  <span className={`${agent.paused ? 'text-red-400' : 'text-green-400'}`}>
                    {agent.paused ? 'Paused' : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Current Funds:</span>
                  <span className="text-green-400 font-bold">{agent.currentFunds} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Initial Investment:</span>
                  <span className="text-white">{agent.amountInvested} ETH</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Supported Tokens</h3>
              <div className="flex flex-wrap gap-2">
                {agent.tokenDetails && agent.tokenDetails.length > 0 ? (
                  agent.tokenDetails.map((token, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-purple-500/20 text-purple-300 text-sm rounded-lg border border-purple-500/30"
                    >
                      {token.symbol}
                    </span>
                  ))
                ) : (
                  <p className="text-white/50 text-sm">No tokens supported</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-4">Agent Controls</h3>

              <div className="flex items-center justify-between mb-6">
                <span className="text-white">Agent Status:</span>
                <div
                  onClick={() => onTogglePause(agent.id)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${agent.paused ? "bg-red-500" : "bg-green-500"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${agent.paused ? "" : "translate-x-7"}`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm block mb-2 text-white/70">Add Funds (ETH)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className={`w-full px-4 py-2 mb-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 ${agent.paused ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    disabled={loading || agent.paused}
                  />
                  <button
                    onClick={handleAddFunds}
                    disabled={loading || agent.paused}
                    className={`w-full py-2 rounded-lg transition ${agent.paused ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-purple-600 hover:bg-purple-700'}`}
                  >
                    {loading ? "Adding..." : agent.paused ? "Agent Paused" : "Add Funds"}
                  </button>
                </div>

                <div>
                  <label className="text-sm block mb-2 text-white/70">Withdraw All Funds</label>
                  <button
                    onClick={handleWithdrawFunds}
                    disabled={loading || agent.paused}
                    className={`w-full py-2 rounded-lg transition ${agent.paused ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {loading ? "Withdrawing..." : agent.paused ? "Agent Paused" : "Withdraw All Funds"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-white/50 text-sm">
            Agent Address: {agent.address}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentControlBox;
import React from "react";
import { toast } from "react-toastify";

const AgentCard = ({ agent, onClick }) => {
  const isSuspended = agent.paused || agent.currentFunds === "0";

  const handleClick = () => {
    if (isSuspended) {
      toast.success("This agent is suspended and cannot be managed.");
      return;
    }
    onClick(agent);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 cursor-pointer hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 cursor-pointer hover:text-purple-300 transition-colors">
            {agent.name}
          </h3>
          <p className="text-white/70 text-sm mb-2">{agent.description}</p>
          <div className="text-lg font-bold text-green-400">
            {agent.currentFunds} ETH
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${agent.paused
          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
          : 'bg-green-500/20 text-green-300 border border-green-500/30'
          }`}>
          {agent.paused ? 'Paused' : 'Active'}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-white/50 text-sm mb-1">Supported Tokens</p>
          <div className="flex flex-wrap gap-2">
            {agent.tokenDetails && agent.tokenDetails.length > 0 ? (
              agent.tokenDetails.map((token, index) => (
                <span
                  key={index}
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

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/50">Address</p>
            <p className="text-white font-mono text-xs">{agent.address ? `${agent.address.slice(0, 6)}...${agent.address.slice(-4)}` : 'N/A'}</p>
            {agent.address && (
              <a
                href={`https://etherscan.io/address/${agent.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 text-xs underline hover:text-purple-300 mt-1 block"
                onClick={e => e.stopPropagation()}
              >
                View on Etherscan ↗
              </a>
            )}
          </div>
          <div>
            <p className="text-white/50">Initial Investment</p>
            <p className="text-white">{agent.amountInvested} ETH</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-white/60 text-xs text-center">
          Click to manage agent
        </p>
      </div>
    </div>
  );
};

export default AgentCard;
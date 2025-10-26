import React from "react";

const HelpBox = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-purple/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div
        className="bg-[#11143f]/30 border border-white/40 backdrop-blur-xxxl p-12 rounded-xl max-w-lg w-1200 text-white shadow-2xl transition opacity-0 animate-slideInBottom delay-[400ms] relative max-h-[80vh] overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #22223b' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-white hover:text-gray-300 text-4xl z-10"
          aria-label="Close help"
        >
          &times;
        </button>
        <div className="flex justify-between items-center mb-4 pr-10">
          <h2 className="text-[48px] font-semibold">How This App Works</h2>
        </div>
        <div className="text-[22px] leading-relaxed space-y-4">
          <p>
            <b>Welcome!</b> This platform lets you create, manage, and monitor AI-powered trading agents on the blockchain.
          </p>
          <ul className="list-disc text-[20px] list-inside text-white/80 space-y-2">
            <li>
              <b>Create Agents:</b> Deploy your own AI trading agent by choosing a data source (Twitter available, Telegram/Discord coming soon), naming your agent, and setting your investment and liquidity.
            </li>
            <li>
              <b>Manage Agents:</b> View your agents, add or withdraw funds, pause/resume, or suspend them entirely. Suspended agents cannot be managed further.
            </li>
            <li>
              <b>Wallet Integration:</b> Connect your wallet to interact with the platform. All actions are secured and require your confirmation.
            </li>
          </ul>
          <p>
            <b>Tip:</b> For the best experience, use the latest version of MetaMask and ensure you have test ETH for deploying and managing agents.
          </p>
          <p className="text-purple-200">Need more help? Reach out to our team or check the documentation (coming soon).</p>
        </div>
      </div>
    </div>
  );
};

export default HelpBox;